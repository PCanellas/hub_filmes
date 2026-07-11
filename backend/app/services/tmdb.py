"""Cliente da API do TMDB com cache em memória.

O frontend nunca fala direto com o TMDB: tudo passa por aqui.
Isso protege a chave da API e permite cachear respostas repetidas
(bônus "Implementação de Cache") — buscas iguais dentro do TTL
não geram nova chamada externa.
"""

import httpx
from cachetools import TTLCache
from fastapi import HTTPException

from app.core.config import settings

# Até 512 respostas em cache, expiram após o TTL configurado (padrão: 10 min)
_cache: TTLCache = TTLCache(maxsize=512, ttl=settings.tmdb_cache_ttl)


def _auth() -> tuple[dict, dict]:
    """Suporta os dois formatos de credencial do TMDB:
    - Read Access Token (v4, longo, formato JWT) -> header Authorization
    - API Key (v3, curta) -> query param api_key
    """
    key = settings.tmdb_api_key
    if key.startswith("eyJ"):
        return {"Authorization": f"Bearer {key}"}, {}
    return {}, {"api_key": key}


async def _get(path: str, params: dict | None = None) -> dict:
    params = {k: v for k, v in (params or {}).items() if v is not None}
    params["language"] = settings.tmdb_language

    cache_key = (path, tuple(sorted(params.items())))
    if cache_key in _cache:
        return _cache[cache_key]

    headers, auth_params = _auth()
    params |= auth_params
    async with httpx.AsyncClient(base_url=settings.tmdb_base_url, headers=headers) as client:
        try:
            response = await client.get(path, params=params, timeout=10)
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Erro ao comunicar com o TMDB")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    if response.status_code == 401:
        raise HTTPException(status_code=502, detail="Chave da API do TMDB inválida")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro inesperado do TMDB")

    data = response.json()
    _cache[cache_key] = data
    return data


async def search_movies(query: str, page: int = 1) -> dict:
    return await _get("/search/movie", {"query": query, "page": page})


async def discover_movies(page: int = 1, genre_id: int | None = None, year: int | None = None) -> dict:
    """Lista filmes populares, com filtros opcionais de gênero e ano."""
    return await _get(
        "/discover/movie",
        {
            "page": page,
            "with_genres": genre_id,
            "primary_release_year": year,
            "sort_by": "popularity.desc",
        },
    )


async def get_movie_details(movie_id: int) -> dict:
    # append_to_response=credits traz o elenco na mesma chamada (1 request em vez de 2)
    return await _get(f"/movie/{movie_id}", {"append_to_response": "credits"})


async def get_genres() -> dict:
    return await _get("/genre/movie/list")

from fastapi import APIRouter, Query

from app.schemas.movie import Genre, MovieDetails, MovieListResponse
from app.services import tmdb

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=MovieListResponse)
async def search_movies(query: str = Query(min_length=1), page: int = Query(1, ge=1)):
    return await tmdb.search_movies(query=query, page=page)


@router.get("/discover", response_model=MovieListResponse)
async def discover_movies(
    page: int = Query(1, ge=1),
    genre_id: int | None = None,
    year: int | None = Query(None, ge=1874),  # primeiro filme da história :)
):
    """Filmes populares, com filtros opcionais por gênero e ano."""
    return await tmdb.discover_movies(page=page, genre_id=genre_id, year=year)


@router.get("/genres", response_model=list[Genre])
async def list_genres():
    data = await tmdb.get_genres()
    return data["genres"]


@router.get("/{movie_id}", response_model=MovieDetails)
async def movie_details(movie_id: int):
    data = await tmdb.get_movie_details(movie_id)
    # O elenco vem aninhado em credits.cast; limitamos aos 12 principais
    data["cast"] = data.get("credits", {}).get("cast", [])[:12]
    return data

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação, lidas de variáveis de ambiente."""

    tmdb_api_key: str
    tmdb_base_url: str = "https://api.themoviedb.org/3"
    tmdb_language: str = "pt-BR"

    database_url: str = "postgresql://app:app_password@db:5432/movies"

    jwt_secret: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 horas

    # Tempo de vida do cache de respostas do TMDB, em segundos
    tmdb_cache_ttl: int = 60 * 10  # 10 minutos


settings = Settings()

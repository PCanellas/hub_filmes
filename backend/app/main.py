import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

import app.models  # noqa: F401 — registra os modelos no metadata
from app.core.database import Base, engine
from app.routers import auth, movies, ratings


def create_tables_with_retry(attempts: int = 10, delay: float = 2.0):
    """No docker-compose o Postgres pode ainda estar subindo quando a API inicia."""
    for attempt in range(attempts):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == attempts - 1:
                raise
            time.sleep(delay)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables_with_retry()
    yield


app = FastAPI(
    title="Movies API — Pixel Breeders",
    description="Backend do teste: busca de filmes via TMDB + avaliações de usuários",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(ratings.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

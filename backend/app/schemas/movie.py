from pydantic import BaseModel


class MovieListItem(BaseModel):
    id: int
    title: str
    poster_path: str | None = None
    release_date: str | None = None
    vote_average: float | None = None


class MovieListResponse(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MovieListItem]


class CastMember(BaseModel):
    name: str
    character: str | None = None
    profile_path: str | None = None


class Genre(BaseModel):
    id: int
    name: str


class MovieDetails(BaseModel):
    id: int
    title: str
    overview: str | None = None
    poster_path: str | None = None
    backdrop_path: str | None = None
    release_date: str | None = None
    runtime: int | None = None
    vote_average: float | None = None
    genres: list[Genre] = []
    cast: list[CastMember] = []

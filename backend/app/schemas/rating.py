from datetime import datetime

from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    movie_id: int
    score: int = Field(ge=1, le=5, description="Nota de 1 a 5")
    movie_title: str
    movie_poster_path: str | None = None


class RatingUpdate(BaseModel):
    score: int = Field(ge=1, le=5, description="Nota de 1 a 5")


class RatingOut(BaseModel):
    movie_id: int
    score: int
    movie_title: str
    movie_poster_path: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}

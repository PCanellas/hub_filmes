from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.rating import Rating
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingOut, RatingUpdate

router = APIRouter(prefix="/ratings", tags=["ratings"])


def _find(db: Session, user_id: int, movie_id: int) -> Rating | None:
    return db.scalar(select(Rating).where(Rating.user_id == user_id, Rating.movie_id == movie_id))


@router.get("", response_model=list[RatingOut])
def list_my_ratings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Todos os filmes avaliados pelo usuário logado (página "Filmes Avaliados")."""
    return db.scalars(
        select(Rating).where(Rating.user_id == user.id).order_by(Rating.updated_at.desc())
    ).all()


@router.post("", response_model=RatingOut, status_code=status.HTTP_201_CREATED)
def create_rating(
    body: RatingCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if _find(db, user.id, body.movie_id):
        raise HTTPException(status_code=409, detail="Filme já avaliado — use a edição")

    rating = Rating(user_id=user.id, **body.model_dump())
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


@router.put("/{movie_id}", response_model=RatingOut)
def update_rating(
    movie_id: int,
    body: RatingUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rating = _find(db, user.id, movie_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")

    rating.score = body.score
    db.commit()
    db.refresh(rating)
    return rating


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rating(
    movie_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    rating = _find(db, user.id, movie_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")

    db.delete(rating)
    db.commit()

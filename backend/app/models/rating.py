from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Rating(Base):
    """Avaliação (1 a 5) de um filme do TMDB feita por um usuário.

    Guardamos título e pôster junto para a página "Filmes Avaliados"
    não precisar consultar o TMDB a cada filme listado.
    """

    __tablename__ = "ratings"
    __table_args__ = (
        # Um usuário só pode ter UMA avaliação por filme (editar, não duplicar)
        UniqueConstraint("user_id", "movie_id", name="uq_user_movie"),
        # Garante a regra de negócio também no banco, não só na API
        CheckConstraint("score >= 1 AND score <= 5", name="ck_score_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    movie_id: Mapped[int] = mapped_column(index=True)  # id do filme no TMDB
    score: Mapped[int]
    movie_title: Mapped[str] = mapped_column(String(300))
    movie_poster_path: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="ratings")

# Importa todos os modelos para que o SQLAlchemy registre as tabelas
from app.models.rating import Rating
from app.models.user import User

__all__ = ["User", "Rating"]

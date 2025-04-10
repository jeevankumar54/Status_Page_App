import logging
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.services.auth import get_user_by_email, create_user
from app.schemas.user import UserCreate


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    """
    Initialize database with first superuser and basic data.
    """
    db = SessionLocal()
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    create_first_superuser(db)
    
    db.close()


def create_first_superuser(db: Session) -> None:
    """
    Create the first superuser if it doesn't exist.
    """
    user = get_user_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            is_active=True,
        )
        user = create_user(db, user_in=user_in)
        logger.info(f"Created first superuser: {user.email}")
    else:
        logger.info(f"First superuser already exists: {user.email}")


if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
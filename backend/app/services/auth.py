from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import verify_password, get_password_hash


def authenticate_user(db: Session, *, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def register_new_user(db: Session, *, user_in: UserCreate) -> User:
    """
    Register a new user.
    """
    # Check if user with this email already exists
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise ValueError("Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
        organization_id=user_in.organization_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, *, email: str) -> Optional[User]:
    """
    Get a user by email.
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, *, user_in: UserCreate) -> User:
    """
    Create a new user.
    """
    return register_new_user(db, user_in=user_in)
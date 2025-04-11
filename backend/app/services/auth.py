from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import verify_password, get_password_hash
from app.schemas.organization import OrganizationCreate


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
    
    # Set organization_id to None by default
    organization_id = None
    
    # Create organization if provided in the request
    if hasattr(user_in, 'organization') and user_in.organization:
        from app.services.organization import create_organization
        from app.schemas.organization import OrganizationCreate
        
        org_data = OrganizationCreate(
            name=user_in.organization.get("name"),
            slug=user_in.organization.get("slug")
        )
        
        org = create_organization(db, obj_in=org_data)
        organization_id = org.id
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=user_in.is_active if user_in.is_active is not None else True,
        is_superuser=user_in.is_superuser if user_in.is_superuser is not None else False,
        organization_id=organization_id
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
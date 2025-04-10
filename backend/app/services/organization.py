from typing import List, Optional, Any, Dict, Union

from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


def get_organization_by_id(db: Session, *, id: int) -> Optional[Organization]:
    """
    Get an organization by ID.
    """
    return db.query(Organization).filter(Organization.id == id).first()


def get_organization_by_slug(db: Session, *, slug: str) -> Optional[Organization]:
    """
    Get an organization by slug.
    """
    return db.query(Organization).filter(Organization.slug == slug).first()


def get_organizations(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[Organization]:
    """
    Get multiple organizations.
    """
    return db.query(Organization).offset(skip).limit(limit).all()


def create_organization(
    db: Session, *, obj_in: OrganizationCreate, user: User = None
) -> Organization:
    """
    Create a new organization.
    """
    # Check if slug already exists
    db_org = db.query(Organization).filter(Organization.slug == obj_in.slug).first()
    if db_org:
        raise ValueError("Organization with this slug already exists")
    
    # Create organization
    db_obj = Organization(
        name=obj_in.name,
        slug=obj_in.slug,
        logo_url=obj_in.logo_url,
        website=obj_in.website,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # If user provided, associate it with the new organization
    if user and not user.organization_id:
        user.organization_id = db_obj.id
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return db_obj


def update_organization(
    db: Session, *, db_obj: Organization, obj_in: Union[OrganizationUpdate, Dict[str, Any]]
) -> Organization:
    """
    Update an organization.
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    
    # If slug is being updated, check if it already exists
    if "slug" in update_data and update_data["slug"] != db_obj.slug:
        existing = db.query(Organization).filter(Organization.slug == update_data["slug"]).first()
        if existing:
            raise ValueError("Organization with this slug already exists")
    
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_organization(db: Session, *, id: int) -> Organization:
    """
    Delete an organization.
    """
    obj = db.query(Organization).get(id)
    if not obj:
        raise ValueError("Organization not found")
    
    db.delete(obj)
    db.commit()
    return obj
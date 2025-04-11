from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, get_current_active_superuser
from app.db.session import get_db
from app.schemas.organization import Organization, OrganizationCreate, OrganizationUpdate
from app.services.organization import (
    get_organization_by_id,
    get_organizations,
    create_organization,
    update_organization,
    delete_organization,
)
from app.schemas.user import User

router = APIRouter()


@router.get("/", response_model=List[Organization])
def read_organizations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve organizations.
    """
    organizations = get_organizations(db, skip=skip, limit=limit)
    return organizations


@router.post("/", response_model=Organization)
def create_new_organization(
    *,
    db: Session = Depends(get_db),
    organization_in: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new organization.
    """
    # Superusers can always create organizations
    if not current_user.is_superuser and current_user.organization_id:
        raise HTTPException(
            status_code=400,
            detail="User already belongs to an organization",
        )
    
    # Create the organization and associate the user with it
    organization = create_organization(db, obj_in=organization_in, user=current_user)
    return organization


@router.get("/{organization_id}", response_model=Organization)
def read_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get organization by ID.
    """
    organization = get_organization_by_id(db, id=organization_id)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    # Users can only access their own organization unless they're superusers
    if not current_user.is_superuser and current_user.organization_id != organization.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    return organization


@router.put("/{organization_id}", response_model=Organization)
def update_organization_details(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    organization_in: OrganizationUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an organization.
    """
    organization = get_organization_by_id(db, id=organization_id)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    # Users can only update their own organization unless they're superusers
    if not current_user.is_superuser and current_user.organization_id != organization.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    organization = update_organization(
        db, db_obj=organization, obj_in=organization_in
    )
    return organization


@router.delete("/{organization_id}", response_model=Organization)
def delete_organization_by_id(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete an organization.
    """
    organization = get_organization_by_id(db, id=organization_id)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    organization = delete_organization(db, id=organization_id)
    return organization
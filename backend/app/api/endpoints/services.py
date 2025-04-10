from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, get_user_organization_id
from app.db.session import get_db
from app.schemas.service import Service, ServiceCreate, ServiceUpdate, ServiceStatusUpdate
from app.services.service import (
    get_service_by_id,
    get_services_by_organization,
    create_service,
    update_service,
    update_service_status,
    delete_service,
)
from app.schemas.user import User
from app.websockets.manager import manager

router = APIRouter()


@router.get("/", response_model=List[Service])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve services for the current user's organization.
    """
    organization_id = get_user_organization_id(current_user)
    services = get_services_by_organization(
        db, organization_id=organization_id, skip=skip, limit=limit
    )
    return services


@router.post("/", response_model=Service)
def create_new_service(
    *,
    db: Session = Depends(get_db),
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new service.
    """
    organization_id = get_user_organization_id(current_user)
    # Ensure the service belongs to the user's organization
    if service_in.organization_id != organization_id:
        service_in.organization_id = organization_id
    
    service = create_service(db, obj_in=service_in)
    
    # Notify connected clients about the new service
    manager.broadcast_organization(
        organization_id,
        {
            "type": "service_created",
            "data": {
                "id": service.id,
                "name": service.name,
                "status": service.status,
            }
        }
    )
    
    return service


@router.get("/{service_id}", response_model=Service)
def read_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get service by ID.
    """
    organization_id = get_user_organization_id(current_user)
    service = get_service_by_id(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )
    
    # Check if service belongs to user's organization
    if service.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    return service


@router.put("/{service_id}", response_model=Service)
def update_service_details(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    service_in: ServiceUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a service.
    """
    organization_id = get_user_organization_id(current_user)
    service = get_service_by_id(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )
    
    # Check if service belongs to user's organization
    if service.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    service = update_service(db, db_obj=service, obj_in=service_in)
    
    # Notify connected clients about the service update
    manager.broadcast_organization(
        organization_id,
        {
            "type": "service_updated",
            "data": {
                "id": service.id,
                "name": service.name,
                "status": service.status,
            }
        }
    )
    
    return service


@router.patch("/{service_id}/status", response_model=Service)
def update_status(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    status_in: ServiceStatusUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update service status.
    """
    organization_id = get_user_organization_id(current_user)
    service = get_service_by_id(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )
    
    # Check if service belongs to user's organization
    if service.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    service = update_service_status(db, db_obj=service, status=status_in.status)
    
    # Notify connected clients about the status change
    manager.broadcast_organization(
        organization_id,
        {
            "type": "service_status_changed",
            "data": {
                "id": service.id,
                "name": service.name,
                "status": service.status,
            }
        }
    )
    
    # Also broadcast to public channel
    manager.broadcast_public(
        organization_id,
        {
            "type": "service_status_changed",
            "data": {
                "id": service.id,
                "name": service.name,
                "status": service.status,
            }
        }
    )
    
    return service


@router.delete("/{service_id}", response_model=Service)
def delete_service_by_id(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a service.
    """
    organization_id = get_user_organization_id(current_user)
    service = get_service_by_id(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )
    
    # Check if service belongs to user's organization
    if service.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    service = delete_service(db, id=service_id)
    
    # Notify connected clients about the service deletion
    manager.broadcast_organization(
        organization_id,
        {
            "type": "service_deleted",
            "data": {
                "id": service.id
            }
        }
    )
    
    return service
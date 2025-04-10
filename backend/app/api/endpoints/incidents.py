from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, get_user_organization_id
from app.db.session import get_db
from app.schemas.incident import (
    Incident, 
    IncidentCreate, 
    IncidentUpdate, 
    IncidentStatusUpdate, 
    IncidentUpdateCreate,
    IncidentWithDetails
)
from app.services.incident import (
    get_incident_by_id,
    get_incidents_by_organization,
    create_incident,
    update_incident,
    update_incident_status,
    delete_incident,
    add_incident_update,
    get_active_incidents_by_organization,
)
from app.schemas.user import User
from app.websockets.manager import manager

router = APIRouter()


@router.get("/", response_model=List[Incident])
def read_incidents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve incidents for the current user's organization.
    """
    organization_id = get_user_organization_id(current_user)
    
    if active_only:
        incidents = get_active_incidents_by_organization(
            db, organization_id=organization_id, skip=skip, limit=limit
        )
    else:
        incidents = get_incidents_by_organization(
            db, organization_id=organization_id, skip=skip, limit=limit
        )
    
    return incidents


@router.post("/", response_model=Incident)
def create_new_incident(
    *,
    db: Session = Depends(get_db),
    incident_in: IncidentCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new incident.
    """
    organization_id = get_user_organization_id(current_user)
    
    # Ensure the incident belongs to the user's organization
    if incident_in.organization_id != organization_id:
        incident_in.organization_id = organization_id
    
    incident = create_incident(
        db, 
        obj_in=incident_in, 
        user_id=current_user.id
    )
    
    # Notify connected clients about the new incident
    manager.broadcast_organization(
        organization_id,
        {
            "type": "incident_created",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
                "impact": incident.impact,
            }
        }
    )
    
    # Also broadcast to public channel
    manager.broadcast_public(
        organization_id,
        {
            "type": "incident_created",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
                "impact": incident.impact,
            }
        }
    )
    
    return incident


@router.get("/{incident_id}", response_model=IncidentWithDetails)
def read_incident(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get incident by ID with all details.
    """
    organization_id = get_user_organization_id(current_user)
    incident = get_incident_by_id(db, id=incident_id)
    
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    # Check if incident belongs to user's organization
    if incident.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    return incident


@router.put("/{incident_id}", response_model=Incident)
def update_incident_details(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    incident_in: IncidentUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an incident.
    """
    organization_id = get_user_organization_id(current_user)
    incident = get_incident_by_id(db, id=incident_id)
    
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    # Check if incident belongs to user's organization
    if incident.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    incident = update_incident(db, db_obj=incident, obj_in=incident_in)
    
    # Notify connected clients about the incident update
    manager.broadcast_organization(
        organization_id,
        {
            "type": "incident_updated",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
                "impact": incident.impact,
            }
        }
    )
    
    # Also broadcast to public channel
    manager.broadcast_public(
        organization_id,
        {
            "type": "incident_updated",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
                "impact": incident.impact,
            }
        }
    )
    
    return incident


@router.patch("/{incident_id}/status", response_model=Incident)
def update_status(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    status_in: IncidentStatusUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update incident status.
    """
    organization_id = get_user_organization_id(current_user)
    incident = get_incident_by_id(db, id=incident_id)
    
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    # Check if incident belongs to user's organization
    if incident.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    # If status is changing to RESOLVED, set resolved_at time
    resolved_at = None
    if status_in.status == "resolved" and incident.status != "resolved":
        resolved_at = datetime.now()
    
    incident = update_incident_status(
        db, 
        db_obj=incident, 
        status=status_in.status,
        resolved_at=resolved_at
    )
    
    # Notify connected clients about the status change
    manager.broadcast_organization(
        organization_id,
        {
            "type": "incident_status_changed",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
            }
        }
    )
    
    # Also broadcast to public channel
    manager.broadcast_public(
        organization_id,
        {
            "type": "incident_status_changed",
            "data": {
                "id": incident.id,
                "title": incident.title,
                "status": incident.status,
            }
        }
    )
    
    return incident


@router.post("/{incident_id}/updates", response_model=IncidentWithDetails)
def create_incident_update(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    update_in: IncidentUpdateCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Add an update to an incident.
    """
    organization_id = get_user_organization_id(current_user)
    incident = get_incident_by_id(db, id=incident_id)
    
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    # Check if incident belongs to user's organization
    if incident.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    # Ensure the update is for the correct incident
    if update_in.incident_id != incident_id:
        update_in.incident_id = incident_id
    
    # Add the update and potentially update incident status
    incident = add_incident_update(
        db, 
        incident=incident, 
        update_in=update_in, 
        user_id=current_user.id
    )
    
    # Notify connected clients about the new update
    manager.broadcast_organization(
        organization_id,
        {
            "type": "incident_update_added",
            "data": {
                "incident_id": incident.id,
                "incident_status": incident.status,
                "update_message": update_in.message,
                "update_status": update_in.status,
            }
        }
    )
    
    # Also broadcast to public channel if the update is public
    if update_in.is_public:
        manager.broadcast_public(
            organization_id,
            {
                "type": "incident_update_added",
                "data": {
                    "incident_id": incident.id,
                    "incident_status": incident.status,
                    "update_message": update_in.message,
                    "update_status": update_in.status,
                }
            }
        )
    
    return incident


@router.delete("/{incident_id}", response_model=Incident)
def delete_incident_by_id(
    *,
    db: Session = Depends(get_db),
    incident_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete an incident.
    """
    organization_id = get_user_organization_id(current_user)
    incident = get_incident_by_id(db, id=incident_id)
    
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    # Check if incident belongs to user's organization
    if incident.organization_id != organization_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    incident = delete_incident(db, id=incident_id)
    
    # Notify connected clients about the incident deletion
    manager.broadcast_organization(
        organization_id,
        {
            "type": "incident_deleted",
            "data": {
                "id": incident.id
            }
        }
    )
    
    return incident
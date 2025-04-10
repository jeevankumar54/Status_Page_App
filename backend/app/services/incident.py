from typing import List, Optional, Any, Dict, Union
from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.incident import Incident, IncidentUpdate, IncidentStatus
from app.models.service import Service
from app.models.organization import Organization
from app.schemas.incident import IncidentCreate, IncidentUpdate as IncidentUpdateSchema
from app.schemas.incident import IncidentUpdateCreate


def get_incident_by_id(db: Session, *, id: int) -> Optional[Incident]:
    """
    Get an incident by ID with all related data.
    """
    return (
        db.query(Incident)
        .filter(Incident.id == id)
        .options(
            joinedload(Incident.services),
            joinedload(Incident.updates),
            joinedload(Incident.created_by)
        )
        .first()
    )


def get_incident_by_id_public(
    db: Session, *, id: int, organization_id: int
) -> Optional[Incident]:
    """
    Get an incident by ID for public view (only includes public updates).
    """
    incident = (
        db.query(Incident)
        .filter(Incident.id == id, Incident.organization_id == organization_id)
        .options(
            joinedload(Incident.services),
        )
        .first()
    )
    
    if incident:
        # Only get public updates
        incident.updates = (
            db.query(IncidentUpdate)
            .filter(
                IncidentUpdate.incident_id == incident.id,
                IncidentUpdate.is_public == True
            )
            .order_by(IncidentUpdate.created_at.desc())
            .all()
        )
    
    return incident


def get_incidents_by_organization(
    db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
) -> List[Incident]:
    """
    Get all incidents for a specific organization.
    """
    return (
        db.query(Incident)
        .filter(Incident.organization_id == organization_id)
        .order_by(Incident.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_active_incidents_by_organization(
    db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
) -> List[Incident]:
    """
    Get active (non-resolved) incidents for a specific organization.
    """
    return (
        db.query(Incident)
        .filter(
            Incident.organization_id == organization_id,
            Incident.status != IncidentStatus.RESOLVED
        )
        .order_by(Incident.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_active_incidents_by_organization_slug(
    db: Session, *, org_slug: str, skip: int = 0, limit: int = 100
) -> List[Incident]:
    """
    Get active (non-resolved) incidents for a specific organization by slug.
    """
    return (
        db.query(Incident)
        .join(Organization)
        .filter(
            Organization.slug == org_slug,
            Incident.status != IncidentStatus.RESOLVED
        )
        .order_by(Incident.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_recent_incidents_by_organization_slug(
    db: Session, *, org_slug: str, limit: int = 10
) -> List[Incident]:
    """
    Get recent incidents (including resolved) for a specific organization by slug.
    """
    return (
        db.query(Incident)
        .join(Organization)
        .filter(Organization.slug == org_slug)
        .order_by(Incident.started_at.desc())
        .limit(limit)
        .all()
    )


def create_incident(
    db: Session, *, obj_in: IncidentCreate, user_id: int
) -> Incident:
    """
    Create a new incident.
    """
    db_obj = Incident(
        title=obj_in.title,
        status=obj_in.status or IncidentStatus.INVESTIGATING,
        impact=obj_in.impact,
        type=obj_in.type,
        organization_id=obj_in.organization_id,
        created_by_id=user_id,
        scheduled_start_time=obj_in.scheduled_start_time,
        scheduled_end_time=obj_in.scheduled_end_time,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Add services to the incident
    if obj_in.service_ids:
        services = (
            db.query(Service)
            .filter(
                Service.id.in_(obj_in.service_ids), 
                Service.organization_id == obj_in.organization_id
            )
            .all()
        )
        db_obj.services = services
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
    
    # Create initial update
    initial_update = IncidentUpdate(
        message=f"Investigation started for {db_obj.title}",
        status=db_obj.status,
        incident_id=db_obj.id,
        created_by_id=user_id,
        is_public=True,
    )
    db.add(initial_update)
    db.commit()
    
    return db_obj


def update_incident(
    db: Session, *, db_obj: Incident, obj_in: Union[IncidentUpdateSchema, Dict[str, Any]]
) -> Incident:
    """
    Update an incident.
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    
    # Handle service_ids separately
    service_ids = update_data.pop("service_ids", None)
    
    # Update fields
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    # Update services if provided
    if service_ids is not None:
        services = (
            db.query(Service)
            .filter(
                Service.id.in_(service_ids), 
                Service.organization_id == db_obj.organization_id
            )
            .all()
        )
        db_obj.services = services
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_incident_status(
    db: Session, *, db_obj: Incident, status: IncidentStatus, resolved_at: Optional[datetime] = None
) -> Incident:
    """
    Update just the status of an incident.
    """
    db_obj.status = status
    
    # If status is changing to RESOLVED, set resolved_at time
    if status == IncidentStatus.RESOLVED and resolved_at:
        db_obj.resolved_at = resolved_at
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def add_incident_update(
    db: Session, *, incident: Incident, update_in: IncidentUpdateCreate, user_id: int
) -> Incident:
    """
    Add an update to an incident and optionally update the incident status.
    """
    # Create the update
    incident_update = IncidentUpdate(
        message=update_in.message,
        status=update_in.status,
        incident_id=incident.id,
        created_by_id=user_id,
        is_public=update_in.is_public,
    )
    db.add(incident_update)
    
    # Update the incident status if it's changing
    if update_in.status != incident.status:
        incident.status = update_in.status
        
        # If status is changing to RESOLVED, set resolved_at time
        if update_in.status == IncidentStatus.RESOLVED and not incident.resolved_at:
            incident.resolved_at = datetime.now()
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Re-fetch the incident with all details
    return get_incident_by_id(db, id=incident.id)


def delete_incident(db: Session, *, id: int) -> Incident:
    """
    Delete an incident.
    """
    obj = db.query(Incident).get(id)
    if not obj:
        raise ValueError("Incident not found")
    
    db.delete(obj)
    db.commit()
    return obj
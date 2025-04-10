from typing import List, Optional, Any, Dict, Union

from sqlalchemy.orm import Session

from app.models.service import Service, ServiceStatus
from app.models.organization import Organization
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_service_by_id(db: Session, *, id: int) -> Optional[Service]:
    """
    Get a service by ID.
    """
    return db.query(Service).filter(Service.id == id).first()


def get_services_by_organization(
    db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
) -> List[Service]:
    """
    Get multiple services for a specific organization.
    """
    return (
        db.query(Service)
        .filter(Service.organization_id == organization_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_services_by_organization_slug(
    db: Session, *, org_slug: str, skip: int = 0, limit: int = 100
) -> List[Service]:
    """
    Get multiple services for a specific organization by slug.
    """
    return (
        db.query(Service)
        .join(Organization)
        .filter(Organization.slug == org_slug)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_service(db: Session, *, obj_in: ServiceCreate) -> Service:
    """
    Create a new service.
    """
    db_obj = Service(
        name=obj_in.name,
        description=obj_in.description,
        status=obj_in.status or ServiceStatus.OPERATIONAL,
        organization_id=obj_in.organization_id,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_service(
    db: Session, *, db_obj: Service, obj_in: Union[ServiceUpdate, Dict[str, Any]]
) -> Service:
    """
    Update a service.
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    
    # Update fields
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_service_status(
    db: Session, *, db_obj: Service, status: ServiceStatus
) -> Service:
    """
    Update just the status of a service.
    """
    db_obj.status = status
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_service(db: Session, *, id: int) -> Service:
    """
    Delete a service.
    """
    obj = db.query(Service).get(id)
    if not obj:
        raise ValueError("Service not found")
    
    db.delete(obj)
    db.commit()
    return obj
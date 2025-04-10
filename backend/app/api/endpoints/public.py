from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.service import Service
from app.schemas.incident import IncidentPublic, IncidentWithUpdatesPublic
from app.services.service import get_services_by_organization_slug
from app.services.incident import (
    get_active_incidents_by_organization_slug,
    get_incident_by_id_public,
    get_recent_incidents_by_organization_slug,
)
from app.services.organization import get_organization_by_slug

router = APIRouter()


@router.get("/{org_slug}/status", response_model=dict)
def get_organization_status(
    *,
    db: Session = Depends(get_db),
    org_slug: str,
) -> Any:
    """
    Get the overall status for an organization.
    """
    organization = get_organization_by_slug(db, slug=org_slug)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    
    # Get all services for this organization
    services = get_services_by_organization_slug(db, org_slug=org_slug)
    
    # Get active incidents
    active_incidents = get_active_incidents_by_organization_slug(db, org_slug=org_slug)
    
    # Determine overall status based on services
    status = "operational"
    
    # Iterate through services to find the most severe status
    for service in services:
        if service.status == "major_outage":
            status = "major_outage"
            break
        elif service.status == "partial_outage" and status != "major_outage":
            status = "partial_outage"
        elif service.status == "degraded_performance" and status not in ["major_outage", "partial_outage"]:
            status = "degraded_performance"
        elif service.status == "maintenance" and status == "operational":
            status = "maintenance"
    
    return {
        "organization": {
            "name": organization.name,
            "slug": organization.slug,
            "logo_url": organization.logo_url,
            "website": organization.website,
        },
        "status": status,
        "active_incidents_count": len(active_incidents),
    }


@router.get("/{org_slug}/services", response_model=List[Service])
def get_services(
    *,
    db: Session = Depends(get_db),
    org_slug: str,
) -> Any:
    """
    Get all services for a specific organization by slug.
    """
    organization = get_organization_by_slug(db, slug=org_slug)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    
    services = get_services_by_organization_slug(db, org_slug=org_slug)
    return services


@router.get("/{org_slug}/incidents/active", response_model=List[IncidentPublic])
def get_active_incidents(
    *,
    db: Session = Depends(get_db),
    org_slug: str,
) -> Any:
    """
    Get all active incidents for a specific organization by slug.
    """
    organization = get_organization_by_slug(db, slug=org_slug)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    
    incidents = get_active_incidents_by_organization_slug(db, org_slug=org_slug)
    return incidents


@router.get("/{org_slug}/incidents/recent", response_model=List[IncidentPublic])
def get_recent_incidents(
    *,
    db: Session = Depends(get_db),
    org_slug: str,
    limit: int = 10,
) -> Any:
    """
    Get recent incidents for a specific organization by slug.
    """
    organization = get_organization_by_slug(db, slug=org_slug)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    
    incidents = get_recent_incidents_by_organization_slug(
        db, org_slug=org_slug, limit=limit
    )
    return incidents


@router.get("/{org_slug}/incidents/{incident_id}", response_model=IncidentWithUpdatesPublic)
def get_incident_details(
    *,
    db: Session = Depends(get_db),
    org_slug: str,
    incident_id: int,
) -> Any:
    """
    Get details for a specific incident.
    """
    organization = get_organization_by_slug(db, slug=org_slug)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )
    
    incident = get_incident_by_id_public(db, id=incident_id, organization_id=organization.id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )
    
    return incident
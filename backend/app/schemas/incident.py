from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.incident import IncidentStatus, IncidentImpact, IncidentType


# IncidentUpdate schemas
class IncidentUpdateBase(BaseModel):
    message: Optional[str] = None
    status: Optional[IncidentStatus] = None
    is_public: Optional[bool] = True


class IncidentUpdateCreate(IncidentUpdateBase):
    message: str
    status: IncidentStatus
    incident_id: int


class IncidentUpdateInDBBase(IncidentUpdateBase):
    id: int
    incident_id: int
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class IncidentUpdate(IncidentUpdateInDBBase):
    pass


# Incident schemas
class IncidentBase(BaseModel):
    title: Optional[str] = None
    status: Optional[IncidentStatus] = IncidentStatus.INVESTIGATING
    impact: Optional[IncidentImpact] = IncidentImpact.MINOR
    type: Optional[IncidentType] = IncidentType.INCIDENT
    scheduled_start_time: Optional[datetime] = None
    scheduled_end_time: Optional[datetime] = None
    organization_id: Optional[int] = None


class IncidentCreate(IncidentBase):
    title: str
    organization_id: int
    service_ids: List[int]


# Properties to receive via API on update
class IncidentUpdate(IncidentBase):
    service_ids: Optional[List[int]] = None


# Properties for updating just the status
class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus


# Properties shared by models stored in DB
class IncidentInDBBase(IncidentBase):
    id: int
    title: str
    organization_id: int
    created_by_id: int
    started_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return via API
class Incident(IncidentInDBBase):
    pass


# Incident with services and updates
class IncidentWithDetails(Incident):
    services: List["Service"] = []
    updates: List[IncidentUpdate] = []
    created_by: Optional["User"] = None


# Incident with only basic info for public page
class IncidentPublic(BaseModel):
    id: int
    title: str
    status: IncidentStatus
    impact: IncidentImpact
    type: IncidentType
    started_at: datetime
    resolved_at: Optional[datetime] = None
    scheduled_start_time: Optional[datetime] = None
    scheduled_end_time: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Incident update for public page
class IncidentUpdatePublic(BaseModel):
    id: int
    message: str
    status: IncidentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


# Incident with updates for public page
class IncidentWithUpdatesPublic(IncidentPublic):
    updates: List[IncidentUpdatePublic] = []
    services: List[int] = []


from app.schemas.service import Service
from app.schemas.user import User
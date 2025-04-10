from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.service import ServiceStatus


# Shared properties
class ServiceBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ServiceStatus] = ServiceStatus.OPERATIONAL
    organization_id: Optional[int] = None


# Properties to receive via API on creation
class ServiceCreate(ServiceBase):
    name: str
    organization_id: int


# Properties to receive via API on update
class ServiceUpdate(ServiceBase):
    pass


# Properties for updating just the status
class ServiceStatusUpdate(BaseModel):
    status: ServiceStatus


# Properties shared by models stored in DB
class ServiceInDBBase(ServiceBase):
    id: int
    name: str
    organization_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return via API
class Service(ServiceInDBBase):
    pass


# Additional properties stored in DB but not returned by API
class ServiceInDB(ServiceInDBBase):
    pass
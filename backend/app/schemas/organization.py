from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Shared properties
class OrganizationBase(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None


# Properties to receive via API on creation
class OrganizationCreate(OrganizationBase):
    name: str
    slug: str


# Properties to receive via API on update
class OrganizationUpdate(OrganizationBase):
    pass


# Properties shared by models stored in DB
class OrganizationInDBBase(OrganizationBase):
    id: int
    name: str
    slug: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return via API
class Organization(OrganizationInDBBase):
    pass


# Additional properties stored in DB but not returned by API
class OrganizationInDB(OrganizationInDBBase):
    pass
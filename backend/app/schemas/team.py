from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


# Shared properties
class TeamBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    organization_id: Optional[int] = None


# Properties to receive via API on creation
class TeamCreate(TeamBase):
    name: str
    organization_id: int


# Properties to receive via API on update
class TeamUpdate(TeamBase):
    pass


# Properties shared by models stored in DB
class TeamInDBBase(TeamBase):
    id: int
    name: str
    organization_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return via API
class Team(TeamInDBBase):
    pass


# Additional properties stored in DB but not returned by API
class TeamInDB(TeamInDBBase):
    pass


# Team with users
class TeamWithUsers(Team):
    users: List["User"] = []


# For adding/removing users from teams
class TeamUserUpdate(BaseModel):
    user_id: int
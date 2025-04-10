from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Table, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class IncidentStatus(str, enum.Enum):
    INVESTIGATING = "investigating"
    IDENTIFIED = "identified"
    MONITORING = "monitoring"
    RESOLVED = "resolved"


class IncidentImpact(str, enum.Enum):
    MINOR = "minor"
    MAJOR = "major"
    CRITICAL = "critical"


class IncidentType(str, enum.Enum):
    INCIDENT = "incident"
    MAINTENANCE = "maintenance"


# Association table for many-to-many relationship between incidents and services
incident_service = Table(
    "incident_service",
    Base.metadata,
    Column("incident_id", Integer, ForeignKey("incident.id"), primary_key=True),
    Column("service_id", Integer, ForeignKey("service.id"), primary_key=True),
)


class Incident(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    status = Column(
        Enum(IncidentStatus), 
        default=IncidentStatus.INVESTIGATING, 
        nullable=False
    )
    impact = Column(
        Enum(IncidentImpact), 
        default=IncidentImpact.MINOR, 
        nullable=False
    )
    type = Column(
        Enum(IncidentType), 
        default=IncidentType.INCIDENT, 
        nullable=False
    )
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # For scheduled maintenance
    scheduled_start_time = Column(DateTime(timezone=True), nullable=True)
    scheduled_end_time = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey("organization.id"))
    created_by_id = Column(Integer, ForeignKey("user.id"))
    
    # Relationships
    organization = relationship("Organization", back_populates="incidents")
    services = relationship("Service", secondary=incident_service)
    updates = relationship("IncidentUpdate", back_populates="incident", cascade="all, delete-orphan")
    created_by = relationship("User")


class IncidentUpdate(Base):
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(IncidentStatus), nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    incident_id = Column(Integer, ForeignKey("incident.id"))
    created_by_id = Column(Integer, ForeignKey("user.id"))
    
    # Relationships
    incident = relationship("Incident", back_populates="updates")
    created_by = relationship("User")
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class ServiceStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    DEGRADED_PERFORMANCE = "degraded_performance"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"


class Service(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(
        Enum(ServiceStatus), 
        default=ServiceStatus.OPERATIONAL, 
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey("organization.id"))
    
    # Relationships
    organization = relationship("Organization", back_populates="services")
    incidents = relationship("Incident", secondary="incident_service")
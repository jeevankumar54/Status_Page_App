from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.user import user_team


class Team(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey("organization.id"))
    
    # Relationships
    organization = relationship("Organization", back_populates="teams")
    users = relationship("User", secondary=user_team, back_populates="teams")
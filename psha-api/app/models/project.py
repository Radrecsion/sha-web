from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="projects")

    datasources = relationship("DataSource", back_populates="project", cascade="all, delete-orphan")
    site_params = relationship("SiteParameter", back_populates="project", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="project", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

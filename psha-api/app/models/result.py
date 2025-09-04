from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # hasil analisis disimpan JSON (hazard curve, UHS, deagg, dll)
    output = Column(JSON, nullable=False)

    project = relationship("Project", back_populates="results")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

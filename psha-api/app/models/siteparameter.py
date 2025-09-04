from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func, String
from sqlalchemy.orm import relationship
from app.models.base import Base


class SiteParameter(Base):
    __tablename__ = "site_parameters"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    vs30 = Column(Float, nullable=True)   # kecepatan gelombang geser di 30m
    z1p0 = Column(Float, nullable=True)   # depth to Vs=1.0 km/s
    z2p5 = Column(Float, nullable=True)   # depth to Vs=2.5 km/s

    # opsional tambahan kalau mau analisis multi-site
    site_name = Column(String, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="site_params")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base  # import Base dari base.py

class GMPEModel(Base):
    __tablename__ = "gmpe_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    year = Column(Integer, default=0)
    region = Column(String, default="Global")
    site_type = Column(String, default="Unknown")   # NEW
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    coeffs = relationship("GMPECoefficient", back_populates="gmpe", cascade="all, delete-orphan")


class GMPECoefficient(Base):
    __tablename__ = "gmpe_coeffs"

    id = Column(Integer, primary_key=True, index=True)
    gmpe_id = Column(Integer, ForeignKey("gmpe_models.id", ondelete="CASCADE"))
    period = Column(Float, nullable=False)
    coeffs = Column(JSONB, nullable=False)  # semua kolom tabel disimpan fleksibel

    gmpe = relationship("GMPEModel", back_populates="coeffs")

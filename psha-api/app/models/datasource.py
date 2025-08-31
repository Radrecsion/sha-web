from sqlalchemy import Column, Integer, String, Float, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class DataSource(Base):
    __tablename__ = "datasources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mechanism = Column(String, nullable=False)
    min_mag = Column(Float)
    max_mag = Column(Float)
    coords_up = Column(JSON, nullable=False)   # simpan array JSON
    coords_down = Column(JSON, nullable=False) # simpan array JSON

    gr_beta = Column(Float, nullable=True)
    gr_rate = Column(Float, nullable=True)
    gr_weight = Column(Float, nullable=True)

    # Menambahkan kolom untuk sudut kemiringan dan strike angle
    dip_angle = Column(Float, nullable=True)
    strike_angle = Column(Float, nullable=True)

    gmpe_weights = relationship(
        "DataSourceGMPE",
        back_populates="datasource",
        cascade="all, delete-orphan"
    )
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DataSourceGMPE(Base):
    __tablename__ = "datasource_gmpe"

    id = Column(Integer, primary_key=True, index=True)
    datasource_id = Column(Integer, ForeignKey("datasources.id"))
    gmpe_name = Column(String, nullable=False)   # ✅ simpan nama GMPE
    weight = Column(Float, nullable=False)

    datasource = relationship("DataSource", back_populates="gmpe_weights")

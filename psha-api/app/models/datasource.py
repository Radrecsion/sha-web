from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class DataSource(Base):
    __tablename__ = "datasources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mechanism = Column(String, nullable=False)

    # range magnitudo
    min_mag = Column(Float, nullable=True)
    max_mag = Column(Float, nullable=True)

    # koordinat (disimpan JSON list of dict)
    coords_up = Column(JSON, default=[])
    coords_down = Column(JSON, default=[])

    # Gutenberg-Richter parameters
    gr_beta = Column(Float, nullable=True)
    gr_rate = Column(Float, nullable=True)
    gr_weight = Column(Float, nullable=True)

    # fault geometry
    dip_angle = Column(Float, nullable=True)
    strike_angle = Column(Float, nullable=True)

    # relasi GMPE weights
    gmpe_weights = relationship("DataSourceGMPE", back_populates="datasource", cascade="all, delete-orphan")


class DataSourceGMPE(Base):
    __tablename__ = "datasource_gmpe"

    id = Column(Integer, primary_key=True, index=True)
    datasource_id = Column(Integer, ForeignKey("datasources.id", ondelete="CASCADE"))

    gmpe_name = Column(String, nullable=False)  # langsung nama GMPE
    weight = Column(Float, nullable=False)

    datasource = relationship("DataSource", back_populates="gmpe_weights")

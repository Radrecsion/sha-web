from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

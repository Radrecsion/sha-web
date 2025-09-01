from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base  # import dari base.py, jangan dari models lain

DATABASE_URL = "postgresql+psycopg2://postgres:PIjMWkSHXZzFGcwprGpoUUcmdKRXKQwA@shortline.proxy.rlwy.net:48540/railway"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

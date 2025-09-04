# app/core/config.py
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# 1️⃣ Tentukan env file dulu
env_mode = os.environ.get("ENVIRONMENT", "development").lower()
env_file_map = {
    "production": ".env.production",
    "test": ".env.test",
    "development": ".env.development"
}
env_file = env_file_map.get(env_mode, ".env.development")

# 2️⃣ Load .env
load_dotenv(env_file)

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str  # tidak ada default, wajib ada di .env

    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # OAuth Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None

    class Config:
        env_file = None  # disable karena sudah load manual
        env_file_encoding = "utf-8"

# 3️⃣ Buat instance, override pakai os.getenv
settings = Settings()


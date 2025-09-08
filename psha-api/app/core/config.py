# app/core/config.py
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# 1️⃣ Tentukan environment dan load .env
env_mode = os.environ.get("ENVIRONMENT", "development").lower()
env_file_map = {
    "production": ".env.production",
    "test": ".env.test",
    "development": ".env.development"
}
env_file = env_file_map.get(env_mode, ".env.development")
load_dotenv(env_file)

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str

    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    ENVIRONMENT: str = env_mode
    DEBUG: bool = True

    # OAuth Google
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # Frontend URL
    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173" if env_mode == "development" else "https://radrecsion.github.io/sha-web/"
    )

    @property
    def FRONTEND_ORIGIN(self) -> str:
        """Ambil origin tanpa path untuk CORS"""
        parsed = urlparse(self.FRONTEND_URL)
        return f"{parsed.scheme}://{parsed.netloc}"

    class Config:
        env_file = None  # sudah load manual
        env_file_encoding = "utf-8"

# 3️⃣ Instance
settings = Settings()

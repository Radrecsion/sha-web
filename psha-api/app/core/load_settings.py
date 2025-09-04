import os
from dotenv import load_dotenv
from app.core.config import Settings

# Tentukan ENVIRONMENT
env_mode = os.environ.get("ENVIRONMENT", "development").lower()

# Pilih file .env sesuai ENVIRONMENT
env_file_map = {
    "production": ".env.production",
    "test": ".env.test",
    "development": ".env.development"
}
env_file = env_file_map.get(env_mode, ".env.development")

# Load env file
load_dotenv(env_file)

# Buat instance Settings dengan DATABASE_URL dari env
settings = Settings(
    DATABASE_URL=os.environ.get("DATABASE_URL"),
    SECRET_KEY=os.environ.get("SECRET_KEY", "super-secret-key"),
    ALGORITHM=os.environ.get("ALGORITHM", "HS256"),
    ACCESS_TOKEN_EXPIRE_MINUTES=int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60)),
    APP_HOST=os.environ.get("APP_HOST", "0.0.0.0"),
    APP_PORT=int(os.environ.get("APP_PORT", 8000)),
    ENVIRONMENT=env_mode,
    DEBUG=os.environ.get("DEBUG", "False").lower() in ["true", "1"]
)

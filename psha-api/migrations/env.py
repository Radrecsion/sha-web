import sys
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context
from dotenv import load_dotenv

# Tambahkan root project ke sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Paksa load .env.production
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.production'))

# Import Settings dan Base
from app.core.config import Settings
from app.models.base import Base

# Buat instance Settings langsung dari env vars
settings = Settings(
    DATABASE_URL=os.environ['DATABASE_URL'],
    SECRET_KEY=os.environ.get('SECRET_KEY', 'super-secret-key'),
    ALGORITHM=os.environ.get('ALGORITHM', 'HS256'),
    ACCESS_TOKEN_EXPIRE_MINUTES=int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 60)),
    APP_HOST=os.environ.get('APP_HOST', '0.0.0.0'),
    APP_PORT=int(os.environ.get('APP_PORT', 8000)),
    ENVIRONMENT='production',
    DEBUG=False
)

# Alembic Config
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"}
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    from sqlalchemy import engine_from_config, pool
    from alembic import context
    from logging.config import fileConfig

    config = context.config

    # optional: config file logging
    fileConfig(config.config_file_name)

    # 1️⃣ Ambil DATABASE_URL dari env variable
    url = os.getenv("DATABASE_URL")  # atau settings.DATABASE_URL
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

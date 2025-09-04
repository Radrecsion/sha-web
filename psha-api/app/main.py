from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from app.routers import gmpe, datasource, analysis, hazard, mechanism, meta, auth, projects
from app.database import Base

# ======= Setup DB dengan retry =======
DATABASE_URL = "postgresql+psycopg2://postgres:PIjMWkSHXZzFGcwprGpoUUcmdKRXKQwA@shortline.proxy.rlwy.net:48540/railway"
max_retries = 10

for i in range(max_retries):
    try:
        engine = create_engine(DATABASE_URL)
        # coba connect
        conn = engine.connect()
        conn.close()
        print("✅ Database connected")
        break
    except OperationalError:
        print(f"⚠️ DB not ready, retry {i+1}/{max_retries}")
        time.sleep(5)
else:
    raise RuntimeError("❌ Could not connect to database after several retries")

# Buat tabel di DB jika belum ada
Base.metadata.create_all(bind=engine)

# ======= FastAPI app =======
app = FastAPI(title="PSHA API", version="1.0.0")

# Supaya React bisa akses API tanpa error CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # untuk dev, bisa diganti ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(datasource.router, prefix="/api/v1", tags=["datasource"])
app.include_router(gmpe.router, prefix="/api/v1", tags=["gmpe"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
app.include_router(hazard.router, prefix="/api/v1", tags=["hazard"])
app.include_router(mechanism.router, prefix="/api/v1", tags=["mechanism"])
app.include_router(meta.router, prefix="/api/v1", tags=["meta"])

# sistem login + project (router baru)
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(projects.router, prefix="/api/v1", tags=["projects"])

@app.get("/")
def read_root():
    return {"message": "PSHA API is running"}

@app.get("/run-psha")
def run_psha(lat: float, lon: float, rp: int = 475):
    periods = [0.1, 0.2, 0.5, 1.0, 2.0]
    values = list(np.exp(-np.array(periods) / (rp/500)))

    return {
        "lat": lat,
        "lon": lon,
        "return_period": rp,
        "hazardCurve": {"periods": periods, "values": values},
        "resultTable": [
            {"period": p, "iml": round(v, 3)} for p, v in zip(periods, values)
        ],
    }

from app.middleware.https_redirect import ProxyHTTPSRedirectMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import numpy as np
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from urllib.parse import urlparse
from app.routers import gmpe, datasource, analysis, hazard, mechanism, meta, auth, projects
from app.database import Base
from app.core.config import settings


# ======= Setup DB dengan retry =======
DATABASE_URL = settings.DATABASE_URL
max_retries = 10

for i in range(max_retries):
    try:
        engine = create_engine(DATABASE_URL)
        conn = engine.connect()
        conn.close()
        print("✅ Database connected")
        break
    except OperationalError:
        print(f"⚠️ DB not ready, retry {i+1}/{max_retries}")
        time.sleep(5)
else:
    raise RuntimeError("❌ Could not connect to database after several retries")

Base.metadata.create_all(bind=engine)

# ======= FastAPI app =======
app = FastAPI(title="PSHA API", version="1.0.0")

# 🔒 Enforce HTTPS via X-Forwarded-Proto (portable)
# app.add_middleware(ProxyHTTPSRedirectMiddleware)

# 🌍 Ambil origin dari FRONTEND_URL
frontend_url = settings.FRONTEND_URL
parsed = urlparse(frontend_url)
frontend_origin = f"{parsed.scheme}://{parsed.netloc}"
print(f"🔗 FRONTEND_ORIGIN = {frontend_origin}")

# ----- Session Middleware -----
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="lax",
    https_only=True
)

# ======= CORS Setup =======
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_origin,  # GitHub Pages
        "https://sha-web-production.up.railway.app",  # API sendiri
        "http://localhost:5173",  # dev lokal
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======= Routers =======
app.include_router(datasource.router, prefix="/api/v1", tags=["datasource"])
app.include_router(gmpe.router, prefix="/api/v1", tags=["gmpe"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
app.include_router(hazard.router, prefix="/api/v1", tags=["hazard"])
app.include_router(mechanism.router, prefix="/api/v1", tags=["mechanism"])
app.include_router(meta.router, prefix="/api/v1", tags=["meta"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(projects.router, prefix="/api/v1", tags=["projects"])

@app.get("/")
def read_root():
    return {"message": "PSHA API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

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

from pydantic import BaseModel


class MetaResponse(BaseModel):
    """
    Schema untuk endpoint metadata aplikasi.
    Misalnya versi API, nama aplikasi, author, dsb.
    """
    name: str = "PSHA API"
    version: str = "1.0.0"
    description: str = "Probabilistic Seismic Hazard Analysis API using FastAPI"

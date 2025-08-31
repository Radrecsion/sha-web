from typing import Optional
from fastapi import APIRouter, Query
from app.services.mechanism_service import list_mechanisms
from app.services.gmpe_service import gmpe_metadata


router = APIRouter(prefix="/mechanism", tags=["Mechanism"])

@router.get("/")
def get_mechanisms():
    return list_mechanisms()

@router.get("/gmpe")
def get_gmpes(mechanism: Optional[str] = Query(None, description="Filter by mechanism")):
    return gmpe_metadata(mechanism)

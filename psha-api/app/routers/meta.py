from fastapi import APIRouter

router = APIRouter(prefix="/meta", tags=["Meta"])


@router.get("/health")
def health_check():
    """
    Endpoint health check API
    """
    return {"status": "ok"}


@router.get("/version")
def get_version():
    """
    Info versi API
    """
    return {"name": "PSHA API", "version": "1.0.0"}

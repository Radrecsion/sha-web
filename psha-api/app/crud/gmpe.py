from sqlalchemy.orm import Session
from app.models.gmpe import GmpeModel, GmpeCoefficient

def get_all_gmpe(db: Session):
    return db.query(GmpeModel).all()

def get_coeff_by_gmpe(db: Session, gmpe_id: int):
    return db.query(GmpeCoefficient).filter(GmpeCoefficient.gmpe_id == gmpe_id).all()

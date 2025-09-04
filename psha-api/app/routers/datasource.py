from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import datasource as models
from app.schemas import DataSourceCreate, DataSourceOut
from app.database import SessionLocal

router = APIRouter(prefix="/datasource", tags=["DataSource"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE
@router.post("/", response_model=DataSourceOut)
def create_datasource(ds: DataSourceCreate, db: Session = Depends(get_db)):
    new_ds = models.DataSource(
        name=ds.name,
        mechanism=ds.mechanism,
        min_mag=ds.min_mag,
        max_mag=ds.max_mag,
        coords_up=[p.dict() for p in ds.coords_up],
        coords_down=[p.dict() for p in ds.coords_down],
        gr_beta=ds.gr_beta,
        gr_rate=ds.gr_rate,
        gr_weight=ds.gr_weight,
        dip_angle=ds.dip_angle,
        strike_angle=ds.strike_angle,
    )
    db.add(new_ds)
    db.commit()
    db.refresh(new_ds)

    for w in ds.gmpe_weights:
        gmpe_assoc = models.DataSourceGMPE(
            datasource_id=new_ds.id,
            gmpe_name=w.gmpe_name,  # pakai nama, bukan id
            weight=w.weight,
        )
        db.add(gmpe_assoc)

    db.commit()
    db.refresh(new_ds)
    return new_ds


# READ ALL
@router.get("/", response_model=list[DataSourceOut])
def list_datasource(db: Session = Depends(get_db)):
    return db.query(models.DataSource).all()


# READ ONE
@router.get("/{id}", response_model=DataSourceOut)
def get_datasource(id: int, db: Session = Depends(get_db)):
    ds = db.query(models.DataSource).filter(models.DataSource.id == id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Datasource not found")
    return ds


# UPDATE
@router.put("/{id}", response_model=DataSourceOut)
def update_datasource(id: int, ds: DataSourceCreate, db: Session = Depends(get_db)):
    datasource = db.query(models.DataSource).filter(models.DataSource.id == id).first()
    if not datasource:
        raise HTTPException(status_code=404, detail="Datasource not found")

    datasource.name = ds.name
    datasource.mechanism = ds.mechanism
    datasource.min_mag = ds.min_mag
    datasource.max_mag = ds.max_mag
    datasource.coords_up = [p.dict() for p in ds.coords_up]
    datasource.coords_down = [p.dict() for p in ds.coords_down]
    datasource.gr_beta = ds.gr_beta
    datasource.gr_rate = ds.gr_rate
    datasource.gr_weight = ds.gr_weight
    datasource.dip_angle = ds.dip_angle
    datasource.strike_angle = ds.strike_angle

    # replace gmpe_weights
    db.query(models.DataSourceGMPE).filter(
        models.DataSourceGMPE.datasource_id == id
    ).delete()

    for w in ds.gmpe_weights:
        gmpe_assoc = models.DataSourceGMPE(
            datasource_id=id,
            gmpe_name=w.gmpe_name,
            weight=w.weight,
        )
        db.add(gmpe_assoc)

    db.commit()
    db.refresh(datasource)
    return datasource


# DELETE
@router.delete("/{id}", response_model=dict)
def delete_datasource(id: int, db: Session = Depends(get_db)):
    datasource = db.query(models.DataSource).filter(models.DataSource.id == id).first()
    if not datasource:
        raise HTTPException(status_code=404, detail="Datasource not found")

    db.query(models.DataSourceGMPE).filter(
        models.DataSourceGMPE.datasource_id == id
    ).delete()

    db.delete(datasource)
    db.commit()

    return {"detail": "Deleted successfully"}

# psha-api/app/routes/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.models.datasource import DataSource
from app.models.siteparameter import SiteParameter

router = APIRouter(prefix="/projects", tags=["projects"])

# auth config (sementara, pindah ke config/.env)
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Ambil user dari JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/")
def create_project(name: str, description: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Buat project baru untuk user login"""
    new_project = Project(name=name, description=description, user_id=current_user.id)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {"msg": "Project created", "project_id": new_project.id}


@router.get("/")
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil semua project milik user login"""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects


@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil detail 1 project (termasuk datasource & siteparameter)"""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    datasources = db.query(DataSource).filter(DataSource.project_id == project.id).all()
    siteparams = db.query(SiteParameter).filter(SiteParameter.project_id == project.id).all()

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "datasources": datasources,
        "siteparameters": siteparams,
        "created_at": project.created_at,
    }

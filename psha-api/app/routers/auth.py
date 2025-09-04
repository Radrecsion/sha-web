import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from starlette.requests import Request

from app.database import get_db, SessionLocal
from app.models.user import User
from app.core.deps import get_current_user
from app.core.security import pwd_context, create_access_token
from app.core.config import settings

from authlib.integrations.starlette_client import OAuth

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------
# OAUTH GOOGLE
# ---------------------------
# Pastikan logging aktif
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/google")
async def login_via_google(request: Request):
    """Redirect ke Google untuk login"""
    try:
        redirect_uri = settings.GOOGLE_REDIRECT_URI
        logger.info(f"[GOOGLE LOGIN] Redirect URI: {redirect_uri}")
        logger.info(f"[GOOGLE LOGIN] Client ID: {settings.GOOGLE_CLIENT_ID}")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logger.error(f"[GOOGLE LOGIN ERROR] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Google OAuth redirect error: {e}")

@router.get("/google/callback")
async def auth_google_callback(request: Request):
    """Callback Google OAuth"""
    try:
        token = await oauth.google.authorize_access_token(request)
        logger.info(f"[GOOGLE CALLBACK] Token received: {token}")

        user_info = token.get("userinfo")
        if not user_info:
            logger.warning("[GOOGLE CALLBACK] No userinfo in token")
            raise HTTPException(status_code=400, detail="Google login failed")

        db = SessionLocal()
        user = db.query(User).filter(User.email == user_info["email"]).first()
        if not user:
            user = User(
                username=user_info["email"].split("@")[0],
                email=user_info["email"],
                hashed_password="google_oauth",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        jwt_token = create_access_token({"sub": str(user.id)})
        return {"access_token": jwt_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"[GOOGLE CALLBACK ERROR] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Google OAuth callback error: {e}")

# ---------------------------
# REGISTER MANUAL
# ---------------------------
@router.post("/register", status_code=201)
def register_user(email: str, password: str, db: Session = Depends(get_db)):
    """Register akun baru dengan email & password"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(password)
    new_user = User(email=email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "User created", "user_id": new_user.id}

# ---------------------------
# LOGIN MANUAL
# ---------------------------
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login dengan email & password, return JWT token"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------
# GET CURRENT USER
# ---------------------------
@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    """Endpoint cek profil user"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

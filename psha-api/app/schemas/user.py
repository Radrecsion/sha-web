from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ----------- Base Schema -----------
class UserBase(BaseModel):
    username: str
    email: EmailStr


# ----------- Create (Register) -----------
class UserCreate(UserBase):
    password: str   # plain password saat registrasi


# ----------- Update -----------
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


# ----------- Output (tanpa password) -----------
class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # ganti orm_mode di Pydantic v2


# ----------- Internal (DB) -----------
class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime

    class Config:
        from_attributes = True

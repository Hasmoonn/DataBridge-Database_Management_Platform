from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    password2: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    date_joined: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    access: str
    refresh: str
    user: UserOut


class LoginResponse(BaseModel):
    success: bool
    message: str
    data: TokenData


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user: UserOut


class LogoutRequest(BaseModel):
    refresh: str


class RefreshRequest(BaseModel):
    refresh: str


class RefreshResponse(BaseModel):
    success: bool
    access: str


class ProfileResponse(BaseModel):
    success: bool
    data: UserOut


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
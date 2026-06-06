import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.auth.schemas import (
    RegisterRequest, RegisterResponse,
    LoginRequest, LoginResponse,
    LogoutRequest, RefreshRequest, RefreshResponse,
    ProfileResponse, ProfileUpdateRequest, UserOut,
)
from app.auth import service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register/", response_model=RegisterResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = service.register_user(db, data)
    return {
        "success": True,
        "message": "User registered successfully.",
        "user": user,
    }


@router.post("/login/", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = service.login_user(db, data)
    return {
        "success": True,
        "message": "Login successful.",
        "data": {
            "access": result["access"],
            "refresh": result["refresh"],
            "user": result["user"],
        },
    }


@router.post("/logout/")
def logout(
    data: LogoutRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auth_header = request.headers.get("Authorization", "")
    access_token = auth_header.replace("Bearer ", "") if "Bearer " in auth_header else ""

    service.logout_user(db, access_token, data.refresh)
    return {"success": True, "message": "Logout successful."}


@router.post("/token/refresh/", response_model=RefreshResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    new_access = service.refresh_access_token(db, data.refresh)
    return {"success": True, "access": new_access}


@router.get("/profile/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": current_user}


@router.put("/profile/")
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = service.update_user_profile(
        db, current_user, data.model_dump(exclude_none=True)
    )
    return {
        "success": True,
        "message": "Profile updated.",
        "data": UserOut.model_validate(updated),
    }
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.auth.models import User, BlacklistedAccessToken
from app.auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.schemas import RegisterRequest, LoginRequest

logger = logging.getLogger(__name__)


def register_user(db: Session, data: RegisterRequest) -> User:
    # Password match check
    if data.password != data.password2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    # Minimum length
    if len(data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters.",
        )

    # bcrypt max is 72 bytes - warn user instead of silent truncation
    if len(data.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too long. Maximum 72 characters allowed.",
        )

    # Check email uniqueness
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    # Check username uniqueness
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken.",
        )

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"New user registered: {user.email}")
    return user


def login_user(db: Session, data: LoginRequest) -> dict:
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    access_token, _ = create_access_token(user.id, user.email)
    refresh_token, _ = create_refresh_token(user.id)

    logger.info(f"User logged in: {user.email}")
    return {
        "access": access_token,
        "refresh": refresh_token,
        "user": user,
    }


def logout_user(db: Session, access_token: str, refresh_token: str):
    """Blacklist both access and refresh tokens."""

    # Blacklist access token
    if access_token:
        access_payload = decode_token(access_token)
        if access_payload and access_payload.get("jti"):
            jti = access_payload["jti"]
            already = db.query(BlacklistedAccessToken).filter(
                BlacklistedAccessToken.jti == jti
            ).first()
            if not already:
                exp = datetime.fromtimestamp(
                    access_payload["exp"], tz=timezone.utc
                )
                db.add(BlacklistedAccessToken(jti=jti, expires_at=exp))

    # Blacklist refresh token
    if refresh_token:
        refresh_payload = decode_token(refresh_token)
        if refresh_payload and refresh_payload.get("jti"):
            jti = refresh_payload["jti"]
            already = db.query(BlacklistedAccessToken).filter(
                BlacklistedAccessToken.jti == jti
            ).first()
            if not already:
                exp = datetime.fromtimestamp(
                    refresh_payload["exp"], tz=timezone.utc
                )
                db.add(BlacklistedAccessToken(jti=jti, expires_at=exp))

    db.commit()
    logger.info("Tokens blacklisted on logout.")


def refresh_access_token(db: Session, refresh_token: str) -> str:
    """Generate new access token from refresh token."""
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    jti = payload.get("jti")
    if jti and db.query(BlacklistedAccessToken).filter(
        BlacklistedAccessToken.jti == jti
    ).first():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked. Please log in again.",
        )

    user_id = int(payload.get("sub", 0))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    new_access_token, _ = create_access_token(user.id, user.email)
    return new_access_token


def update_user_profile(db: Session, user: User, data: dict) -> User:
    """Update allowed profile fields."""
    allowed_fields = {"username", "email"}
    for field, value in data.items():
        if field in allowed_fields and value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
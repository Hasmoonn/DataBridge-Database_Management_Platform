import warnings
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings
import uuid

# Suppress passlib bcrypt version warning (cosmetic issue only)
logging.getLogger("passlib").setLevel(logging.ERROR)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    bcrypt has a 72-byte limit - we truncate safely before hashing.
    """
    # bcrypt silently truncates at 72 bytes - we do it explicitly to avoid errors
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        password = password_bytes.decode("utf-8", errors="ignore")

    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a hashed one."""
    # Apply same truncation for consistent verification
    password_bytes = plain.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        plain = password_bytes.decode("utf-8", errors="ignore")

    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, email: str) -> tuple[str, str]:
    """Create JWT access token. Returns (token, jti)."""
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "email": email,
        "jti": jti,
        "exp": expire,
        "type": "access",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    return token, jti


def create_refresh_token(user_id: int) -> tuple[str, str]:
    """Create JWT refresh token. Returns (token, jti)."""
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "exp": expire,
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    return token, jti


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Returns empty dict if invalid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {}
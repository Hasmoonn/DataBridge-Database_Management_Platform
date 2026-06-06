import base64
import logging
from cryptography.fernet import Fernet
from app.config import settings

logger = logging.getLogger(__name__)


def _get_cipher() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if not key:
        import hashlib
        key_bytes = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        key = base64.urlsafe_b64encode(key_bytes).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_password(plain: str) -> str:
    try:
        return _get_cipher().encrypt(plain.encode()).decode()
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        raise ValueError("Failed to encrypt password.")


def decrypt_password(encrypted: str) -> str:
    try:
        return _get_cipher().decrypt(encrypted.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        raise ValueError("Failed to decrypt password.")
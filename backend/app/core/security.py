from datetime import datetime, timedelta, timezone
from typing import Any
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
import hashlib
import hmac
import jwt

from app.core.config import settings

# Se usa para encriptar y desencriptar contraseñas.
pwd_context = PasswordHash((BcryptHasher(),))

# Esta funcion se usa para verificar si la contraseña ingresada por el usuario es igual a la que esta en la base de datos
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Esta funcion se usa para encriptar la contraseña del usuario antes de guardarla en la base de datos
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Esta funcion se usa para crear un token de acceso para el usuario, que se va a usar para autenticarlo en las rutas protegidas
def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(subject: str | Any) -> str:
    # El refresh token dura 7 días en lugar de minutos
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# Huella corta del hash actual: cuando la contraseña cambia, la huella cambia y el token de reseteo deja de servir (un solo uso).
def _password_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode()).hexdigest()[:16]

def create_password_reset_token(user) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {
        "exp": expire,
        "sub": str(user.id),
        "type": "reset",
        "pwd": _password_fingerprint(user.password_hash),
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# Devuelve el usuario si el token es de reseteo, vigente y no fue usado; si no, lanza jwt.PyJWTError.
def verify_password_reset_token(token: str, user_loader):
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("type") != "reset" or not payload.get("sub"):
        raise jwt.InvalidTokenError("Token inválido")

    user = user_loader(int(payload["sub"]))
    if not user or not hmac.compare_digest(payload.get("pwd", ""), _password_fingerprint(user.password_hash)):
        raise jwt.InvalidTokenError("Token inválido")
    return user

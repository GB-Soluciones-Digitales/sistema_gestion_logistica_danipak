from datetime import datetime, timedelta, timezone
from typing import Any
from passlib.context import CryptContext
import jwt
from app.core.config import settings

# Se usa para encriptar y desencriptar contraseñas.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
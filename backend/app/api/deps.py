from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.models import Usuario
from app.core.config import settings
from app.crud.crud_usuario import get_usuario_by_id

# Lauti leelo a esto
# Aca definimos la ruta a la que se va a hacer el login, para que el frontend pueda obtener el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login") 

# Cucha creamos una sesion de la base de datos, la abrimos y la cerramos al terminar, siempre abrir y cerrar para limpiar.
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esta funcion es la que se va a usar para obtener el usuario actual a partir del token
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> Usuario:
    # Esto es solo una excepcion
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Se desencripta el token y se obtiene el id del usuario
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # Buscamos el usuario en la base de datos, si no existe, lanzamos una excepcion
    user = get_usuario_by_id(db, user_id=int(user_id))

    if user is None:
        raise credentials_exception
    if not user.estado:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    return user
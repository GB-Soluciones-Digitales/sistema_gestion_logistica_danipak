from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import Token
from backend.app.api.deps import get_db
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.crud.crud_usuario import get_usuario_by_username

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):

    # Obtenemos el usuario de la bd
    user = get_usuario_by_username(db, username=form_data.username)

    # Verificamos si el usuario existe y si la contraseña es correcta
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})

    if not user.estado:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo", headers={"WWW-Authenticate": "Bearer"})

    # Creamos el token de acceso
    access_token = create_access_token(subject=user.id)

    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

# Se va a implementar cuando se tenga el servicio de correo, mientras queda en pausa.
@router.post("/recuperar-password")
def recuperar_password():
    return {"mensaje": "Si el correo existe, se ha enviado un enlace de recuperación."}
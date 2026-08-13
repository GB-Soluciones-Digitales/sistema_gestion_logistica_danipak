import jwt
from datetime import timedelta
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import RecuperarPassword, ResetearPassword, Token
from app.api.deps import get_db
from app.crud.crud_usuario import get_usuario_by_email, get_usuario_by_id, get_usuario_by_username, update_usuario
from app.schemas.usuario import UsuarioUpdate
from app.services.email import enviar_email_recuperacion

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
@router.post("/olvide-password")
def solicitar_recuperacion(datos: RecuperarPassword, db: Session = Depends(get_db)):
    # Obtenemos el usuario por email
    user = get_usuario_by_email(db, email=datos.email)

    # Si el usuario existe, se enviará un correo de recuperación.
    if user:
        expiracion = timedelta(minutes=15)
        token_recuperacion = create_access_token(
            subject=user.id, 
            expires_delta=expiracion
        )

        enviar_email_recuperacion(email_destino=user.email, token=token_recuperacion)
    
    return {"mensaje": "Si el correo está registrado, recibirás un enlace de recuperación."}

@router.post("/reset-password")
def restablecer_password(datos: ResetearPassword, db: Session = Depends(get_db)):
    try:
        # Decodificamos el token para obtener el id del usuario y verificamos que no haya caducado
        payload = jwt.decode(datos.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Token inválido")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="El enlace de recuperación ha expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Token inválido")

    # Buscamos el usuario en la bd y actualizamos su contraseña
    user = get_usuario_by_id(db, user_id=int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # la Hasheamos y actualizamos la contraseña
    update_data = UsuarioUpdate(password=datos.nueva_password)
    update_usuario(db=db, db_usuario=user, usuario_in=update_data)
    
    return {"mensaje": "Contraseña actualizada exitosamente"}
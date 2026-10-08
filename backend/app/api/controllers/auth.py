from fastapi.responses import JSONResponse
import jwt
from datetime import timedelta
from fastapi import APIRouter, Depends, status, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_refresh_token, get_password_hash, verify_password, create_access_token
from app.schemas.auth import RecuperarPassword, ResetearPassword, Token
from app.api.deps import get_db, get_current_user
from app.crud.crud_usuario import get_usuario_by_email, get_usuario_by_id, get_usuario_by_username, update_usuario
from app.schemas.usuario import UsuarioUpdate, PasswordChange
from app.services.email import enviar_email_recuperacion
from app.core.limiter import limiter
from app.models import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.put("/me/password", status_code=status.HTTP_200_OK)
def change_password(data: PasswordChange, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # 1. Verificar que la contraseña actual sea correcta
    if not verify_password(data.password_actual, current_user.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    # 2. Verificar que la nueva no sea igual a la vieja
    if data.password_actual == data.password_nueva:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe ser distinta a la actual")

    # 3. Validar longitud mínima
    if len(data.password_nueva) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

    # 4. Encriptar y guardar (usando tu método existente update_usuario)
    update_data = UsuarioUpdate(password=data.password_nueva)
    update_usuario(db=db, db_usuario=current_user, usuario_in=update_data)
    
    return {"mensaje": "Contraseña actualizada exitosamente"}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):

    # Obtenemos el usuario de la bd
    user = get_usuario_by_username(db, username=form_data.username)

    # Verificamos si el usuario existe y si la contraseña es correcta
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos")

    if not user.estado:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    # Creamos el token de acceso
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True, 
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    return response

@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    # Leemos la cookie que el navegador envía automáticamente
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Sesión expirada")

    user = get_usuario_by_id(db, int(user_id))
    if not user or not user.estado:
        raise HTTPException(status_code=401, detail="Usuario inactivo")

    # Emitimos un nuevo Access Token fresco
    new_access_token = create_access_token(subject=user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}

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
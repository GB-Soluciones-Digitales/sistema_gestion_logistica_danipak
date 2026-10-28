from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import crud_usuario
from app.schemas.usuario import PerfilUpdate, UsuarioCreate, UsuarioPaginatedResponse, UsuarioUpdate, UsuarioResponse
from app.models.Usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(usuario_in: UsuarioCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Validar email duplicado
    if crud_usuario.get_usuario_by_email(db, email=usuario_in.email):
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    # Validar username duplicado
    if crud_usuario.get_usuario_by_username(db, username=usuario_in.username):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
    
    return crud_usuario.create_usuario(db=db, usuario=usuario_in, usuario_id=current_user.id) 

@router.get("/", response_model=UsuarioPaginatedResponse)
def get_usuarios(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_usuario.get_usuarios(db=db, skip=skip, limit=limit, search=search)

@router.get("/me", response_model=UsuarioResponse)
def get_mi_perfil(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UsuarioResponse)
def update_mi_perfil(perfil_in: PerfilUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    nuevo_email = perfil_in.email.strip()

    if nuevo_email != current_user.email:
        if crud_usuario.get_usuario_by_email(db, email=nuevo_email):
            raise HTTPException(status_code=400, detail="El correo ya está registrado.")

    # Solo se permite tocar el email: el schema PerfilUpdate no admite otros campos.
    return crud_usuario.update_usuario(
        db=db,
        db_usuario=current_user,
        usuario_in=UsuarioUpdate(email=nuevo_email),
        usuario_id=current_user.id,
    )

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def get_usuario(usuario_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    usuario = crud_usuario.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(usuario_id: int, usuario_in: UsuarioUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_usuario = crud_usuario.get_usuario_by_id(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    # Si el usuario intenta cambiar su email o username, deberíamos validar que no elija uno de otro usuario
    if usuario_in.email and usuario_in.email != db_usuario.email:
        if crud_usuario.get_usuario_by_email(db, email=usuario_in.email):
            raise HTTPException(status_code=400, detail="El correo ya está registrado.")
            
    if usuario_in.username and usuario_in.username != db_usuario.username:
        if crud_usuario.get_usuario_by_username(db, username=usuario_in.username):
            raise HTTPException(status_code=400, detail="El nuevo nombre de usuario ya está en uso.")
    
    return crud_usuario.update_usuario(db=db, db_usuario=db_usuario, usuario_in=usuario_in, usuario_id=current_user.id)
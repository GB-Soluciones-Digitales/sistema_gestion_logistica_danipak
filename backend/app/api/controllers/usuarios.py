from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import crud_usuario
from app.schemas.usuario import UsuarioCreate, UsuarioPaginatedResponse, UsuarioUpdate, UsuarioResponse

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(usuario_in: UsuarioCreate, db: Session = Depends(get_db)):
    # Validar email duplicado
    if crud_usuario.get_usuario_by_email(db, email=usuario_in.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado en el sistema.")
    
    # Validar username duplicado
    if crud_usuario.get_usuario_by_username(db, username=usuario_in.username):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
    
    return crud_usuario.create_usuario(db=db, usuario=usuario_in)

@router.get("/", response_model=UsuarioPaginatedResponse)
def get_usuarios(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud_usuario.get_usuarios(db=db, skip=skip, limit=limit, search=search)

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def get_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = crud_usuario.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(usuario_id: int, usuario_in: UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario_by_id(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    # Si el usuario intenta cambiar su email o username, deberíamos validar que no elija uno de otro usuario
    if usuario_in.email and usuario_in.email != db_usuario.email:
        if crud_usuario.get_usuario_by_email(db, email=usuario_in.email):
            raise HTTPException(status_code=400, detail="El nuevo email ya está en uso por otro usuario.")
            
    if usuario_in.username and usuario_in.username != db_usuario.username:
        if crud_usuario.get_usuario_by_username(db, username=usuario_in.username):
            raise HTTPException(status_code=400, detail="El nuevo nombre de usuario ya está en uso.")
    
    return crud_usuario.update_usuario(db=db, db_usuario=db_usuario, usuario_in=usuario_in)
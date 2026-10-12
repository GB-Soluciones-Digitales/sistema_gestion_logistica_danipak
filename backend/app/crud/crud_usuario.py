from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.Usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash
from app.crud.crud_auditoria import create_auditoria_log
from app.schemas.auditoria import AuditoriaCreate

def get_usuario_by_id(db: Session, usuario_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.username == username).first()

def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100, search: str = None) -> dict:
    query = db.query(Usuario)
    
    if search:
        query = query.filter(
            or_(
                Usuario.username.ilike(f"%{search}%"),
                Usuario.email.ilike(f"%{search}%")
            )
        )
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_usuario(db: Session, usuario: UsuarioCreate, usuario_id: int) -> Usuario:
    try:
        usuario_data = usuario.model_dump(exclude={"password"})
        hashed_password = get_password_hash(usuario.password)
        
        db_usuario = Usuario(**usuario_data, password_hash=hashed_password)
        db.add(db_usuario)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="usuarios",
            registro_id=db_usuario.id,
            detalles_cambio=usuario_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)
        
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_usuario): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear el usuario.")

def update_usuario(db: Session, db_usuario: Usuario, usuario_in: UsuarioUpdate, usuario_id: int) -> Usuario:
    try:
        update_data = usuario_in.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password

        for key, value in update_data.items():
            setattr(db_usuario, key, value)
            
        db.add(db_usuario)
        db.commit()
        db.flush()

        log_details = {k: v for k, v in update_data.items() if k != "password_hash"}
        if "password" in usuario_in.model_dump(exclude_unset=True):
            log_details["password_changed"] = True

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="usuarios",
            registro_id=db_usuario.id,
            detalles_cambio=log_details,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.refresh(db_usuario)
        return db_usuario
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_usuario): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar el usuario.")
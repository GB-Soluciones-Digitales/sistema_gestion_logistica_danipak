from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Localidad import Localidad
from app.schemas.localidad import LocalidadCreate, LocalidadUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def create_localidad(db: Session, localidad: LocalidadCreate, usuario_id: int) -> Localidad:
    localidad_data = localidad.model_dump()
    
    try:
        db_localidad = Localidad(**localidad_data)
        db.add(db_localidad)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="localidades",
            registro_id=db_localidad.id,
            detalles_cambio=localidad_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_localidad)
        return db_localidad
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_localidad): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear la localidad.")

def get_localidad_by_id(db: Session, localidad_id: int) -> Localidad | None:
    return db.query(Localidad).filter(Localidad.id == localidad_id).first()

def get_localidades(db: Session, skip: int = 0, limit: int = 10, search: str = None):
    query = db.query(Localidad)

    if search:
        query = query.filter(Localidad.nombre.ilike(f"%{search}%"))

    total = query.count()

    items = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

def update_localidad(db: Session, db_localidad: Localidad, localidad_in: LocalidadUpdate, usuario_id: int) -> Localidad:
    update_data = localidad_in.model_dump(exclude_unset=True)
    
    try:
        for key, value in update_data.items():
            setattr(db_localidad, key, value)
            
        db.add(db_localidad)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="localidades",
            registro_id=db_localidad.id,
            detalles_cambio=update_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_localidad)
        return db_localidad
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_localidad): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar la localidad.")
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Empresa import Empresa 
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def create_empresa(db: Session, empresa: EmpresaCreate) -> Empresa:
    try:
        db_empresa = Empresa(**empresa.model_dump())
        db.add(db_empresa)
        db.flush()
        db.commit()
        db.refresh(db_empresa)
        return db_empresa
    except Exception as e:
        db.rollback()
        print(f"Error en BD: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno")

def get_empresa_by_id(db: Session, empresa_id: int) -> Empresa | None:
    return db.query(Empresa).filter(Empresa.id == empresa_id).first()

def get_primera_empresa(db: Session) -> Empresa | None:
    return db.query(Empresa).first()

def update_empresa(db: Session, db_empresa: Empresa, empresa_in: EmpresaUpdate, usuario_id: int) -> Empresa | None:
    update_data = empresa_in.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(db_empresa, key, value)

        db.add(db_empresa)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="empresas",
            registro_id=db_empresa.id,
            detalles_cambio=update_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_empresa)
        return db_empresa

    except Exception as e:
        db.rollback()
        print(f"Error en BD: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar un dato")
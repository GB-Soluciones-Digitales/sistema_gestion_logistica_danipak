from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Comprobante import Comprobante
from app.schemas.comprobante import ComprobanteCreate, ComprobanteUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def create_comprobante(db: Session, comprobante: ComprobanteCreate, usuario_id: int) -> Comprobante:
    comprobante_data = comprobante.model_dump()
    db_comprobante = Comprobante(**comprobante_data, usuario_creador_id=usuario_id)

    db.add(db_comprobante)
    db.commit()
    db.refresh(db_comprobante)

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="INSERT",
        tabla_afectada="comprobantes",
        registro_id=db_comprobante.id,
        detalles_cambio=comprobante_data,
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    return db_comprobante

def get_comprobante_by_id(db: Session, comprobante_id: int) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

def get_comprobantes(db: Session, skip: int = 0, limit: int = 100) -> list[Comprobante]:
    return db.query(Comprobante).offset(skip).limit(limit).all()

def get_comprobante_by_numero(db: Session, numero_comprobante: str) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.numero_comprobante == numero_comprobante).first()

def update_comprobante_estado(db: Session, db_comprobante: Comprobante, comprobante_in: ComprobanteUpdate, usuario_id: int) -> Comprobante | None:
    update_data = comprobante_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_comprobante, key, value)
        
    db.add(db_comprobante)
    db.commit()
    db.refresh(db_comprobante)

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="UPDATE",
        tabla_afectada="comprobantes",
        registro_id=db_comprobante.id,
        detalles_cambio=update_data,
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    return db_comprobante
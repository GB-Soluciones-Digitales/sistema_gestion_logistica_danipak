from sqlalchemy import extract, or_
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

def get_comprobantes(db: Session, skip: int = 0, limit: int = 10, search: str = None, localidad_id: int = None, mes: int = None, cliente_id: int = None, tipo: str = None) -> dict:
    query = db.query(Comprobante)
    
    if search:
        query = query.filter(
            or_(
                Comprobante.numero_comprobante.ilike(f"%{search}%"),
                Comprobante.nombre_destinatario.ilike(f"%{search}%")
            )
        )
        
    if tipo:
        query = query.filter(Comprobante.tipo == tipo)
        
    if cliente_id:
        query = query.filter(Comprobante.cliente_remitente_id == cliente_id)
        
    if localidad_id:
        query = query.filter(
            or_(
                Comprobante.localidad_remitente_id == localidad_id,
                Comprobante.localidad_destinatario_id == localidad_id
            )
        )
        
    if mes:
        query = query.filter(extract('month', Comprobante.fecha_emision) == mes)
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

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
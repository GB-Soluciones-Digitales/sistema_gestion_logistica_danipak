from fastapi import HTTPException
from sqlalchemy import desc, extract, or_
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.models.Comprobante import Comprobante
from app.schemas.comprobante import ComprobanteCreate, ComprobanteUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def get_ultimo_numero_envio(db: Session) -> str:
    ultimo = db.query(Comprobante)\
        .filter(Comprobante.tipo == "Comprobante de Envío")\
        .order_by(desc(Comprobante.id))\
        .first()
        
    if not ultimo or not ultimo.numero_comprobante:
        return "0001-00000000"
        
    return ultimo.numero_comprobante

def create_comprobante(db: Session, comprobante: ComprobanteCreate, usuario_id: int) -> Comprobante:
    comprobante_data = comprobante.model_dump()
    numero_entrante = comprobante_data.get("numero_comprobante")

    if not numero_entrante:
        raise HTTPException(status_code=400, detail="El número de comprobante es obligatorio.")

    comprobante_existente = db.query(Comprobante).filter(
        Comprobante.numero_comprobante == numero_entrante,
        Comprobante.tipo == comprobante_data["tipo"]
    ).first()

    if comprobante_existente:
        raise HTTPException(
            status_code=409, 
            detail=f"El número {numero_entrante} ya está registrado. Sincronice y vuelva a intentar."
        )
    
    db_comprobante = Comprobante(**comprobante_data, usuario_creador_id=usuario_id)

    db.add(db_comprobante)
    db.flush()

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="INSERT",
        tabla_afectada="comprobantes",
        registro_id=db_comprobante.id,
        detalles_cambio=comprobante.model_dump(mode="json"),
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    db.commit()
    db.refresh(db_comprobante)
    
    return db_comprobante

def get_comprobante_by_id(db: Session, comprobante_id: int) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

def get_comprobantes(db: Session, skip: int = 0, limit: int = 10, search: str = None, localidad_id: int = None, cliente_id: int = None, tipo: str = None, fecha_desde: date = None, fecha_hasta: date = None, estado: str = None) -> dict:
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
    if estado:
        query = query.filter(Comprobante.estado == estado)
    if fecha_desde:
        query = query.filter(Comprobante.fecha_emision >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Comprobante.fecha_emision <= fecha_hasta)
        
    total = query.count()
    items = query.order_by(
        Comprobante.fecha_emision.desc(),
        Comprobante.numero_comprobante.desc()
    ).offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

def get_comprobante_by_numero(db: Session, numero_comprobante: str) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.numero_comprobante == numero_comprobante).first()

def update_comprobante_estado(db: Session, db_comprobante: Comprobante, comprobante_in: ComprobanteUpdate, usuario_id: int) -> Comprobante | None:
    update_data = comprobante_in.model_dump(exclude_unset=True)
    
    try:
        for key, value in update_data.items():
            setattr(db_comprobante, key, value)
            
        db.add(db_comprobante)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="comprobantes",
            registro_id=db_comprobante.id,
            detalles_cambio=comprobante_in.model_dump(mode="json"),
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_comprobante)
        return db_comprobante
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_comprobante_estado): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar el comprobante.")
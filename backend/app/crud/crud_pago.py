from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Pago import Pago
from app.schemas.pago import PagoCreate, PagoUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log
from app.models.MovimientoCC import MovimientoCC

# Lauti te lo explico aca en pagos pero aplica para todos los cruds.
def get_pago_by_id(db: Session, pago_id: int) -> Pago | None:
    return db.query(Pago).filter(Pago.id == pago_id).first()

# skip es la cantidad de registros a saltar, y limit es el número maximo de registros a recuperar.
def get_pagos(db: Session, skip: int = 0, limit: int = 50, search: str = None) -> dict:
    query = db.query(Pago)
    
    if search:
        query = query.filter(Pago.numero_recibo.ilike(f"%{search}%"))
        
    total = query.count()
    items = query.order_by(Pago.fecha_pago.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_pago_by_numero_recibo(db: Session, numero_recibo: str) -> Pago | None:
    return db.query(Pago).filter(Pago.numero_recibo == numero_recibo).first()

def get_ultimo_numero_recibo(db: Session) -> str:
    ultimo_pago = db.query(Pago).order_by(Pago.id.desc()).first()
    
    if not ultimo_pago or not ultimo_pago.numero_recibo:
        return "REC-00000001"
    
    try:
        partes = ultimo_pago.numero_recibo.split('-')
        if len(partes) == 2:
            siguiente_numero = int(partes[1]) + 1
            nuevo_correlativo = str(siguiente_numero).zfill(8)
            return f"{partes[0]}-{nuevo_correlativo}"
        else:
            return "REC-00000001"
    except Exception:
        return "REC-00000001"
    
def create_pago(db: Session, pago: PagoCreate, usuario_id: int) -> Pago:
    # Convertimos el objeto Pydantic en un diccionario para pasarlo al constructor de Pago. 
    pago_data = pago.model_dump()
    pago_data_json = pago.model_dump(exclude_unset=True, mode='json')

    try:
        db_pago = Pago(**pago_data, usuario_creador_id=usuario_id)
        db.add(db_pago)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="pagos",
            registro_id=db_pago.id,
            detalles_cambio=pago_data_json,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db_movimiento = MovimientoCC(
            cliente_id=db_pago.cliente_id,
            fecha_movimiento=db_pago.fecha_pago,
            tipo_movimiento="Pago",
            referencia_id=db_pago.id,
            importe=db_pago.monto,
            anulado=False,
            usuario_creador_id=usuario_id
        )
        db.add(db_movimiento)
        db.flush()
        
        db.commit()
        db.refresh(db_pago)
        return db_pago
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_pago): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear el pago y su movimiento de Cuenta Corriente.")

def update_pago(db: Session, db_pago: Pago, pago_in: PagoUpdate, usuario_id: int) -> Pago:
    update_data = pago_in.model_dump(exclude_unset=True)
    update_data_json = pago_in.model_dump(exclude_unset=True, mode='json')
    
    try:
        for key, value in update_data.items():
            setattr(db_pago, key, value)

        db.add(db_pago)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="pagos",
            registro_id=db_pago.id,
            detalles_cambio=update_data_json,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_pago)
        return db_pago
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_pago): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar el pago.")

def anular_pago(db: Session, pago_id: int, usuario_id: int) -> Pago | None:
    db_pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if not db_pago:
        return None

    try:
        db_pago.anulado = True
        db.add(db_pago)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="pagos",
            registro_id=db_pago.id,
            detalles_cambio={"anulado": True},
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        movimiento = db.query(MovimientoCC).filter(
            MovimientoCC.referencia_id == pago_id,
            MovimientoCC.tipo_movimiento == "Pago"
        ).first()

        if movimiento:
            movimiento.anulado = True
            db.add(movimiento)
            db.flush()

        db.commit()
        db.refresh(db_pago)
        return db_pago
        
    except Exception as e:
        db.rollback()
        print(f"Error BD (anular_pago): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al anular el pago.")
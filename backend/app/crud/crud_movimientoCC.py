from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import date, datetime
from fastapi import APIRouter

from app.models.MovimientoCC import MovimientoCC
from app.schemas.movimiento_cc import MovimientoCCCreate, MovimientoCCUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log
from app.models.Cliente import Cliente

def get_movimiento_by_id(db: Session, movimiento_id: int) -> MovimientoCC | None:
    return db.query(MovimientoCC).filter(MovimientoCC.id == movimiento_id).first()

def get_movimientos(db: Session, skip: int = 0, limit: int = 100, cliente_id: int = None, anulado: bool = None, fecha_desde: date = None, fecha_hasta: date = None, tipo_movimiento: str = None) -> dict:
    query = db.query(MovimientoCC).filter(MovimientoCC.cliente_id == cliente_id)
    
    if anulado is not None:
        query = query.filter(MovimientoCC.anulado == anulado)
    if tipo_movimiento:
        query = query.filter(MovimientoCC.tipo_movimiento == tipo_movimiento)
    if fecha_desde:
        query = query.filter(MovimientoCC.fecha_movimiento >= fecha_desde)
    if fecha_hasta:
        query = query.filter(MovimientoCC.fecha_movimiento <= fecha_hasta)
        
    total = query.count()
    items = query.order_by(MovimientoCC.fecha_movimiento.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_resumen_general_cuentas(db: Session) -> list:
    clientes_cc = db.query(Cliente).filter(
        Cliente.tiene_cuenta_corriente == True, 
        Cliente.estado == True
    ).all()
    
    resultado = []
    
    for cliente in clientes_cc:
        totales = db.query(
            MovimientoCC.tipo_movimiento, 
            func.sum(MovimientoCC.importe).label('total')
        ).filter(
            MovimientoCC.cliente_id == cliente.id,
            MovimientoCC.anulado == False
        ).group_by(MovimientoCC.tipo_movimiento).all()
        
        saldo = 0
        for tipo, total in totales:
            if tipo == "Factura":
                saldo += float(total)
            elif tipo == "Pago":
                saldo -= float(total)
                
        resultado.append({
            "cliente_id": cliente.id,
            "razon_social": cliente.razon_social,
            "cuit_dni": cliente.cuit_dni,
            "saldo_total": saldo
        })
        
    return resultado

def get_resumen_cuenta_cliente(db: Session, cliente_id: int) -> dict:
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    totales = db.query(
        MovimientoCC.tipo_movimiento, 
        func.sum(MovimientoCC.importe).label('total')
    ).filter(
        MovimientoCC.cliente_id == cliente_id,
        MovimientoCC.anulado == False
    ).group_by(MovimientoCC.tipo_movimiento).all()
    
    saldo = 0
    for tipo, total in totales:
        if tipo == "Factura":
            saldo += float(total)
        elif tipo == "Pago":
            saldo -= float(total)
            
    cantidad = db.query(MovimientoCC).filter(
        MovimientoCC.cliente_id == cliente_id,
        MovimientoCC.anulado == False
    ).count()
            
    return {
        "cliente_id": cliente_id,
        "razon_social": cliente.razon_social if cliente else "Cliente Desconocido",
        "saldo_total": saldo,
        "cantidad_movimientos": cantidad
    }

def create_movimiento_cc(db: Session, movimiento: MovimientoCCCreate, usuario_id: int) -> MovimientoCC:
    movimiento_data = movimiento.model_dump()
    movimiento_data_json = movimiento.model_dump(exclude_unset=True, mode='json')
    
    try:
        db_movimiento = MovimientoCC(**movimiento_data, usuario_creador_id=usuario_id)
        db.add(db_movimiento)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="movimientos_cc",
            registro_id=db_movimiento.id,
            detalles_cambio=movimiento_data_json,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_movimiento)
        return db_movimiento
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_movimiento_cc): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear el movimiento.")

def anular_movimiento_cc(db: Session, db_movimiento: MovimientoCC, usuario_id: int) -> MovimientoCC:
    try:
        db_movimiento.anulado = True
        db.add(db_movimiento)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="movimientos_cc",
            registro_id=db_movimiento.id,
            detalles_cambio={"anulado": True},
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_movimiento)
        return db_movimiento
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (anular_movimiento_cc): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al anular el movimiento.")

def update_movimiento_cc(db: Session, db_movimiento: MovimientoCC, movimiento_in: MovimientoCCUpdate, usuario_id: int) -> MovimientoCC:
    movimiento_data = movimiento_in.model_dump(exclude_unset=True)
    movimiento_data_json = movimiento_in.model_dump(exclude_unset=True, mode='json')
    
    try:
        for key, value in movimiento_data.items():
            setattr(db_movimiento, key, value)
        
        db.add(db_movimiento)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="movimientos_cc",
            registro_id=db_movimiento.id,
            detalles_cambio=movimiento_data_json,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_movimiento)
        return db_movimiento
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_movimiento_cc): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar el movimiento.")
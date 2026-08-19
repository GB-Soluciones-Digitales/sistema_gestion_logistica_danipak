from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import APIRouter

from app.models.MovimientoCC import MovimientoCC
from app.schemas.movimiento_cc import MovimientoCCCreate, MovimientoCCUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

router = APIRouter(prefix="/movimientoCC", tags=["Movimientos de Cuenta Corriente"])

def get_movimiento_by_id(db: Session, movimiento_id: int) -> MovimientoCC | None:
    return db.query(MovimientoCC).filter(MovimientoCC.id == movimiento_id).first()

def get_movimientos_by_cliente(db: Session, cliente_id: int, skip: int = 0, limit: int = 100) -> list[MovimientoCC]:
    return db.query(MovimientoCC)\
             .filter(MovimientoCC.cliente_id == cliente_id)\
             .order_by(MovimientoCC.fecha_movimiento.desc())\
             .offset(skip).limit(limit).all()

def create_movimiento_cc(db: Session, movimiento: MovimientoCCCreate, usuario_id: int) -> MovimientoCC:
    movimiento_data = movimiento.model_dump()
    db_movimiento = MovimientoCC(**movimiento_data, usuario_creador_id=usuario_id)
    
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="INSERT",
        tabla_afectada="movimientos_cc",
        registro_id=db_movimiento.id,
        detalles_cambio=movimiento_data,
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    return db_movimiento

def anular_movimiento_cc(db: Session, db_movimiento: MovimientoCC, usuario_id: int) -> MovimientoCC:
    db_movimiento.anulado = True
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="UPDATE",
        tabla_afectada="movimientos_cc",
        registro_id=db_movimiento.id,
        detalles_cambio={"anulado": True},
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    return db_movimiento

def update_movimiento_cc(db: Session, db_movimiento: MovimientoCC, movimiento_in: MovimientoCCUpdate, usuario_id: int) -> MovimientoCC:
    movimiento_data = movimiento_in.model_dump(exclude_unset=True)
    for key, value in movimiento_data.items():
        setattr(db_movimiento, key, value)
    
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)

    log_data = AuditoriaCreate(
        usuario_id=usuario_id,
        accion="UPDATE",
        tabla_afectada="movimientos_cc",
        registro_id=db_movimiento.id,
        detalles_cambio=movimiento_data,
        fecha=datetime.now()
    )
    create_auditoria_log(db, log_data)

    return db_movimiento

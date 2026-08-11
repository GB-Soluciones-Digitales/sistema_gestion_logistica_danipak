from sqlalchemy.orm import Session

from app.models.MovimientoCC import MovimientoCC
from app.schemas.movimiento_cc import MovimientoCCCreate, MovimientoCCUpdate

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
    return db_movimiento

def anular_movimiento_cc(db: Session, db_movimiento: MovimientoCC) -> MovimientoCC:
    db_movimiento.anulado = True
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento
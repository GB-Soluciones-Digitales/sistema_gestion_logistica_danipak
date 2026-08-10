from models import movimientoCC
from sqlalchemy.orm import Session

def create_movimientoCC(db: Session, movimientoCC: movimientoCC) -> movimientoCC:
    db.add(movimientoCC)
    db.commit()
    db.refresh(movimientoCC)
    return movimientoCC

def get_movimientoCC_by_id(db: Session, movimientoCC_id: int) -> movimientoCC | None:
    return db.query(movimientoCC).filter(movimientoCC.id == movimientoCC_id).first()

def update_movimientoCC(db: Session, movimientoCC: movimientoCC) -> movimientoCC:
    db.merge(movimientoCC)
    db.commit()
    db.refresh(movimientoCC)
    return movimientoCC

def update_movimientoCC_estado(db: Session, movimientoCC_id: int, estado_actualizado: bool) -> movimientoCC | None:
    movimientoCC = db.query(movimientoCC).filter(movimientoCC.id == movimientoCC_id).first()
    if movimientoCC:
        movimientoCC.estado = estado_actualizado
        db.commit()
        db.refresh(movimientoCC)
    return movimientoCC
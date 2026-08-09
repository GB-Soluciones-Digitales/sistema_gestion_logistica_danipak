from models import Pago
from sqlalchemy.orm import Session

def get_pago_by_id(db: Session, pago_id: int) -> Pago | None:
    return db.query(Pago).filter(Pago.id == pago_id).first()

def get_pago_by_numero_recibo(db: Session, numero_recibo: str) -> Pago | None:
    return db.query(Pago).filter(Pago.numero_recibo == numero_recibo).first()

def get_pago_by_fecha_pago(db: Session, fecha_pago: str) -> Pago | None:
    return db.query(Pago).filter(Pago.fecha_pago == fecha_pago)

def remove_pago_by_numero_recibo(db: Session, numero_recibo: str) -> Pago | None:
    pago = db.query(Pago).filter(Pago.numero_recibo == numero_recibo).first()
    if pago:
        db.delete(pago)
        db.commit()
    return pago
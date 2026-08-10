from models import Pago
from sqlalchemy.orm import Session

def create_pago(db: Session, pago: Pago) -> Pago:
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago

def get_pago_by_id(db: Session, pago_id: int) -> Pago | None:
    return db.query(Pago).filter(Pago.id == pago_id).first()

def get_pago_by_numero_recibo(db: Session, numero_recibo: str) -> Pago | None:
    return db.query(Pago).filter(Pago.numero_recibo == numero_recibo).first()

def update_pago(db: Session, pago: Pago) -> Pago:
    db.merge(pago)
    db.commit()
    db.refresh(pago)
    return pago

def delete_pago(db: Session, pago_id: int) -> bool:
    pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if pago:
        db.delete(pago)
        db.commit()
        return True
    return False
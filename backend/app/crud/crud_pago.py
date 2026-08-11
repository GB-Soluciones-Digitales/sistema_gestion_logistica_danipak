from sqlalchemy.orm import Session

from app.models.Pago import Pago
from app.schemas.pago import PagoCreate, PagoUpdate

# Lauti te lo explico aca en pagos pero aplica para todos los cruds.
def get_pago_by_id(db: Session, pago_id: int) -> Pago | None:
    return db.query(Pago).filter(Pago.id == pago_id).first()

# skip es la cantidad de registros a saltar, y limit es el número maximo de registros a recuperar.
def get_pagos(db: Session, skip: int = 0, limit: int = 50) -> list[Pago]:
    return db.query(Pago).order_by(Pago.fecha_pago.desc()).offset(skip).limit(limit).all()

def create_pago(db: Session, pago: PagoCreate, usuario_id: int) -> Pago:
    # Convertimos el objeto Pydantic en un diccionario para pasarlo al constructor de Pago. 
    pago_data = pago.model_dump()
    db_pago = Pago(**pago_data, usuario_creador_id=usuario_id)

    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)
    return db_pago

def get_pago_by_numero_recibo(db: Session, numero_recibo: str) -> Pago | None:
    return db.query(Pago).filter(Pago.numero_recibo == numero_recibo).first()

def update_pago(db: Session, db_pago: Pago, pago_in: PagoUpdate) -> Pago:
    # exclude_unset=True garantiza que solo se actualicen los campos enviados, sin pisar con nulos.
    update_data = pago_in.model_dump(exclude_unset=True)
    
    # Iteramos sobre el diccionario e inyectamos dinámicamente los valores en el modelo de BD.
    for key, value in update_data.items():
        setattr(db_pago, key, value)

    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)
    return db_pago

def anular_pago(db: Session, pago_id: int) -> Pago | None:
    db_pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if db_pago:
        db_pago.anulado = True
        db.add(db_pago)
        db.commit()
        db.refresh(db_pago)
        return db_pago
    return None
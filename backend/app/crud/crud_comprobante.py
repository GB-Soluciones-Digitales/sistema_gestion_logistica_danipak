from models import Comprobante
from sqlalchemy.orm import Session


def get_comprobante_by_id(db: Session, comprobante_id: int) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

def get_comprobante_by_numero(db: Session, numero_comprobante: str) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.numero_comprobante == numero_comprobante).first()

def get_comprobante_by_fecha(db: Session, fecha_emision: str) ->  list[Comprobante] | None:
    return db.query(Comprobante).filter(Comprobante.fecha_emision == fecha_emision).all()

def update_comprobante_estado(db: Session, comprobante_id: int, estado_actualizado: bool) -> Comprobante | None:
    comprobante = db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()
    if comprobante:
        comprobante.estado = estado_actualizado
        db.commit()
        db.refresh(comprobante)
    return comprobante

def get_comprobante_by_cliente_id(db: Session, cliente_id: int) -> list[Comprobante] | None:
    return db.query(Comprobante).filter(Comprobante.cliente_id == cliente_id).all()
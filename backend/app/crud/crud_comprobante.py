from models import Comprobante
from sqlalchemy.orm import Session

def create_comprobante(db: Session, comprobante: Comprobante) -> Comprobante:
    db.add(comprobante)
    db.commit()
    db.refresh(comprobante)
    return comprobante

def get_comprobante_by_id(db: Session, comprobante_id: int) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

def get_comprobante_by_numero(db: Session, numero_comprobante: str) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.numero_comprobante == numero_comprobante).first()


def update_comprobante_estado(db: Session, comprobante_id: int, estado_actualizado: bool) -> Comprobante | None:
    comprobante = db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()
    if comprobante:
        comprobante.estado = estado_actualizado
        db.commit()
        db.refresh(comprobante)
    return comprobante

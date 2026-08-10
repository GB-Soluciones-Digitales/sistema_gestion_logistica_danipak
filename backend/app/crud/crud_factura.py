from models import Factura
from sqlalchemy.orm import Session

def create_factura(db: Session, factura: Factura) -> Factura:
    db.add(factura)
    db.commit()
    db.refresh(factura)
    return factura

def get_factura_by_id(db: Session, factura_id: int) -> Factura | None:
    return db.query(Factura).filter(Factura.id == factura_id).first()

def get_factura_by_numero_factura(db: Session, numero_factura: str) -> Factura | None:
    return db.query(Factura).filter(Factura.numero_factura == numero_factura).first()

def update_factura(db: Session, factura: Factura) -> Factura:
    db.merge(factura)
    db.commit()
    db.refresh(factura)
    return factura

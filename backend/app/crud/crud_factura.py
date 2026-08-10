from sqlalchemy.orm import Session
from app.models.Factura import Factura
from app.schemas.factura import FacturaCreate, FacturaUpdate

def get_factura_by_id(db: Session, factura_id: int) -> Factura | None:
    return db.query(Factura).filter(Factura.id == factura_id).first()

def get_factura_by_numero(db: Session, numero_factura: str) -> Factura | None:
    return db.query(Factura).filter(Factura.numero_factura == numero_factura).first()

def get_facturas(db: Session, skip: int = 0, limit: int = 100) -> list[Factura]:
    return db.query(Factura).order_by(Factura.fecha.desc()).offset(skip).limit(limit).all()

def create_factura(db: Session, factura: FacturaCreate, usuario_id: int) -> Factura:
    factura_data = factura.model_dump()
    db_factura = Factura(**factura_data, usuario_creador_id=usuario_id)
    
    db.add(db_factura)
    db.commit()
    db.refresh(db_factura)
    return db_factura

def update_factura(db: Session, db_factura: Factura, factura_in: FacturaUpdate) -> Factura:
    update_data = factura_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_factura, key, value)
        
    db.add(db_factura)
    db.commit()
    db.refresh(db_factura)
    return db_factura
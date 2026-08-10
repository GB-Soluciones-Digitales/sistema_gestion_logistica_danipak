from sqlalchemy.orm import Session
from app.models.Comprobante import Comprobante
from app.schemas.comprobante import ComprobanteCreate, ComprobanteUpdate

def create_comprobante(db: Session, comprobante: ComprobanteCreate, usuario_id: int) -> Comprobante:
    comprobante_data = comprobante.model_dump()
    
    db_comprobante = Comprobante(**comprobante_data, usuario_creador_id=usuario_id)

    db.add(db_comprobante)
    db.commit()
    db.refresh(db_comprobante)
    return db_comprobante

def get_comprobante_by_id(db: Session, comprobante_id: int) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.id == comprobante_id).first()

def get_comprobantes(db: Session, skip: int = 0, limit: int = 100) -> list[Comprobante]:
    return db.query(Comprobante).offset(skip).limit(limit).all()

def get_comprobante_by_numero(db: Session, numero_comprobante: str) -> Comprobante | None:
    return db.query(Comprobante).filter(Comprobante.numero_comprobante == numero_comprobante).first()

def update_comprobante_estado(db: Session, db_comprobante: Comprobante, comprobante_in: ComprobanteUpdate) -> Comprobante | None:
    update_data = comprobante_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_comprobante, key, value)
        
    db.add(db_comprobante)
    db.commit()
    db.refresh(db_comprobante)
    return db_comprobante
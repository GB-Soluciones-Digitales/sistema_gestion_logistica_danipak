from models import Auditoria
from sqlalchemy.orm import Session

def get_auditoria_by_id(db: Session, auditoria_id: int) -> Auditoria | None:
    return db.query(Auditoria).filter(Auditoria.id == auditoria_id).first()

def get_auditoria_by_fecha(db: Session, fecha: str) -> Auditoria | None:
    return db.query(Auditoria).filter(Auditoria.fecha == fecha).first()


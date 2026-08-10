from models import Auditoria
from sqlalchemy.orm import Session

def create_auditoria(db: Session, auditoria: Auditoria) -> Auditoria:
    db.add(auditoria)
    db.commit()
    db.refresh(auditoria)
    return auditoria


def get_auditoria_by_id(db: Session, auditoria_id: int) -> Auditoria | None:
    return db.query(Auditoria).filter(Auditoria.id == auditoria_id).first()



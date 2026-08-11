from sqlalchemy.orm import Session

from app.models.Auditoria import Auditoria
from app.schemas.auditoria import AuditoriaCreate

def get_auditoria_logs(db: Session, skip: int = 0, limit: int = 100) -> list[Auditoria]:
    return db.query(Auditoria).order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()

def get_auditoria_by_registro(db: Session, tabla: str, registro_id: int) -> list[Auditoria]:
    return db.query(Auditoria)\
             .filter(Auditoria.tabla_afectada == tabla, Auditoria.registro_id == registro_id)\
             .order_by(Auditoria.fecha.desc()).all()

def create_auditoria_log(db: Session, auditoria: AuditoriaCreate) -> Auditoria:
    auditoria_data = auditoria.model_dump()
    db_auditoria = Auditoria(**auditoria_data)
    
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

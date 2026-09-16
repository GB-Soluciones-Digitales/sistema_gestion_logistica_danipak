from sqlalchemy.orm import Session
from sqlalchemy import func, Date

from app.models.Auditoria import Auditoria
from app.schemas.auditoria import AuditoriaCreate

def get_auditoria_logs(db: Session, skip: int = 0, limit: int = 100, tabla_afectada: str = None, accion: str = None, usuario_id: int = None, fecha: str = None) -> dict:
    query = db.query(Auditoria)
    
    if tabla_afectada:
        query = query.filter(Auditoria.tabla_afectada == tabla_afectada)
    if accion:
        query = query.filter(Auditoria.accion == accion)
    if usuario_id:
        query = query.filter(Auditoria.usuario_id == usuario_id)
    if fecha:
        query = query.filter(func.cast(Auditoria.fecha, Date) == fecha)
        
    total = query.count()
    items = query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_auditoria_by_registro(db: Session, tabla: str, registro_id: int) -> list[Auditoria]:
    return db.query(Auditoria)\
             .filter(Auditoria.tabla_afectada == tabla, Auditoria.registro_id == registro_id)\
             .order_by(Auditoria.fecha.desc()).all()

def create_auditoria_log(db: Session, auditoria: AuditoriaCreate) -> Auditoria:
    auditoria_data = auditoria.model_dump()
    db_auditoria = Auditoria(**auditoria_data)
    
    db.add(db_auditoria)
    db.flush()
    return db_auditoria




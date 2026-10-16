from datetime import date, datetime, time, timedelta
from typing import Optional
from zoneinfo import ZoneInfo
from sqlalchemy import or_, cast, String
from sqlalchemy.orm import Session

from app.models.Auditoria import Auditoria
from app.schemas.auditoria import AuditoriaCreate

def get_auditoria_logs(db: Session, skip: int = 0, limit: int = 100, tabla_afectada: str = None, accion: str = None, usuario_id: int = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, search: Optional[str] = None) -> dict:
    query = db.query(Auditoria)

    if tabla_afectada:
        query = query.filter(Auditoria.tabla_afectada == tabla_afectada)
    if accion:
        query = query.filter(Auditoria.accion == accion)
    if usuario_id:
        query = query.filter(Auditoria.usuario_id == usuario_id)
    if fecha_desde:
        query = query.filter(Auditoria.fecha >= datetime.combine(fecha_desde, time.min))
    if fecha_hasta:
        query = query.filter(
            Auditoria.fecha < datetime.combine(fecha_hasta + timedelta(days=1), time.min)
        )
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            Auditoria.tabla_afectada.ilike(term),
            Auditoria.accion.ilike(term),
            cast(Auditoria.detalles_cambio, String).ilike(term),
        ))

    total = query.count()
    items = query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def get_auditoria_by_registro(db: Session, tabla: str, registro_id: int) -> list[Auditoria]:
    return db.query(Auditoria)\
             .filter(Auditoria.tabla_afectada == tabla, Auditoria.registro_id == registro_id)\
             .order_by(Auditoria.fecha.desc()).all()

def create_auditoria_log(db: Session, auditoria: AuditoriaCreate) -> Auditoria:
    auditoria_data = auditoria.model_dump()

    tz_ar = ZoneInfo("America/Argentina/Buenos_Aires")
    auditoria_data["fecha"] = datetime.now(tz_ar).replace(tzinfo=None)
    
    db_auditoria = Auditoria(**auditoria_data)
    
    db.add(db_auditoria)
    db.flush()
    return db_auditoria

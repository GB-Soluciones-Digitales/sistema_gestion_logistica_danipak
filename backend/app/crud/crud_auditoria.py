from datetime import date, datetime, time, timedelta
from typing import Optional
from sqlalchemy import and_, or_, cast, String
from sqlalchemy.orm import Session

from app.models.Auditoria import Auditoria
from app.models.Cliente import Cliente
from app.models.Usuario import Usuario
from app.schemas.auditoria import AuditoriaCreate

def _query_con_nombres(db: Session):
    # cliente_nombre solo aplica a registros de la tabla clientes; para el resto queda en None
    return db.query(Auditoria, Usuario.nombre_completo, Cliente.razon_social)             .join(Usuario, Usuario.id == Auditoria.usuario_id)             .outerjoin(Cliente, and_(Auditoria.tabla_afectada == "clientes", Auditoria.registro_id == Cliente.id))

def _adjuntar_nombres(rows) -> list[Auditoria]:
    items = []
    for log, usuario_nombre, cliente_nombre in rows:
        log.usuario_nombre = usuario_nombre
        log.cliente_nombre = cliente_nombre
        items.append(log)
    return items

def get_auditoria_logs(db: Session, skip: int = 0, limit: int = 100, tabla_afectada: str = None, accion: str = None, usuario_id: int = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, search: Optional[str] = None) -> dict:
    query = _query_con_nombres(db)

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
            Usuario.nombre_completo.ilike(term),
            Cliente.razon_social.ilike(term),
            cast(Auditoria.detalles_cambio, String).ilike(term),
        ))

    total = query.count()
    rows = query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    items = _adjuntar_nombres(rows)
    return {"total": total, "items": items}

def get_auditoria_by_registro(db: Session, tabla: str, registro_id: int) -> list[Auditoria]:
    return db.query(Auditoria)\
             .filter(Auditoria.tabla_afectada == tabla, Auditoria.registro_id == registro_id)\
             .order_by(Auditoria.fecha.desc()).all()

def create_auditoria_log(db: Session, auditoria: AuditoriaCreate) -> Auditoria:
    auditoria_data = auditoria.model_dump()

    auditoria_data["fecha"] = datetime.utcnow() - timedelta(hours=3)

    db_auditoria = Auditoria(**auditoria_data)
    
    db.add(db_auditoria)
    db.flush()
    return db_auditoria

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date
from app.models.Comprobante import Comprobante
from app.models.Cliente import Cliente
from app.models.Localidad import Localidad

def get_reportes_metrics(db: Session, fecha_consulta: date = None):
    if not fecha_consulta:
        fecha_consulta = date.today()

    # 1. Total de salidas
    total_salidas = db.query(func.count(Comprobante.id)).filter(
        func.date(Comprobante.fecha_emision) == fecha_consulta
    ).scalar() or 0

    # 2. Cantidad de bultos enviados por día
    bultos_hoy = db.query(func.sum(Comprobante.cantidad_bultos)).filter(
        func.date(Comprobante.fecha_emision) == fecha_consulta
    ).scalar() or 0

    # 3. Top 5 Clientes que más envían
    top_clientes = db.query(
        Cliente.razon_social, 
        func.count(Comprobante.id).label('total_envios')
    ).join(Comprobante, Cliente.id == Comprobante.cliente_remitente_id)\
     .group_by(Cliente.id)\
     .order_by(desc('total_envios'))\
     .limit(5).all()

    # 4. Localidades con más tráfico
    top_localidades = db.query(
        Localidad.nombre, 
        func.count(Comprobante.id).label('total_recepciones')
    ).join(Comprobante, Localidad.id == Comprobante.localidad_destinatario_id)\
     .group_by(Localidad.id)\
     .order_by(desc('total_recepciones'))\
     .limit(5).all()

    return {
        "fecha": fecha_consulta,
        "total_salidas": total_salidas,
        "bultos_enviados": bultos_hoy,
        "top_clientes": [{"nombre": c.razon_social, "envios": c.total_envios} for c in top_clientes],
        "top_localidades": [{"nombre": l.nombre, "envios": l.total_recepciones} for l in top_localidades]
    }
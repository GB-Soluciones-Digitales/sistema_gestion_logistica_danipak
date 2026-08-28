from http.client import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Factura import Factura
from app.schemas.factura import FacturaCreate, FacturaUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def get_factura_by_id(db: Session, factura_id: int) -> Factura | None:
    return db.query(Factura).filter(Factura.id == factura_id).first()

def get_factura_by_numero(db: Session, numero_factura: str) -> Factura | None:
    return db.query(Factura).filter(Factura.numero_factura == numero_factura).first()

def get_facturas(db: Session, skip: int = 0, limit: int = 100, search: str = None, estado: str = None) -> dict:
    query = db.query(Factura)
    
    if search:
        query = query.filter(Factura.numero_factura.ilike(f"%{search}%"))
    if estado:
        query = query.filter(Factura.estado == estado)
        
    total = query.count()
    items = query.order_by(Factura.fecha.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_factura(db: Session, factura: FacturaCreate, usuario_id: int) -> Factura:
    factura_data = factura.model_dump()
    
    try:
        db_factura = Factura(**factura_data, usuario_creador_id=usuario_id)
        db.add(db_factura)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="facturas",
            registro_id=db_factura.id,
            detalles_cambio=factura_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_factura)
        return db_factura
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_factura): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear la factura.")

def update_factura(db: Session, db_factura: Factura, factura_in: FacturaUpdate, usuario_id: int) -> Factura:
    update_data = factura_in.model_dump(exclude_unset=True)
    
    try:
        for key, value in update_data.items():
            setattr(db_factura, key, value)
            
        db.add(db_factura)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="facturas",
            registro_id=db_factura.id,
            detalles_cambio=update_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_factura)
        return db_factura
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_factura): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar la factura.")
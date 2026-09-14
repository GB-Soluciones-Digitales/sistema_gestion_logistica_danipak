from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Factura import Factura
from app.models.MovimientoCC import MovimientoCC
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
        
    total = query.count()
    items = query.order_by(Factura.fecha.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_factura(db: Session, factura: FacturaCreate, usuario_id: int) -> Factura:
    factura_data = factura.model_dump()
    factura_data_json = factura.model_dump(mode='json')
    
    try:
        db_factura = Factura(**factura_data, usuario_creador_id=usuario_id)
        db.add(db_factura)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="facturas",
            registro_id=db_factura.id,
            detalles_cambio=factura_data_json,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db_movimiento = MovimientoCC(
            cliente_id=db_factura.cliente_id,
            fecha_movimiento=db_factura.fecha,
            tipo_movimiento="Factura",
            referencia_id=db_factura.id,
            importe=db_factura.importe_total,
            anulado=False,
            usuario_creador_id=usuario_id
        )
        db.add(db_movimiento)
        db.flush()

        db.commit()
        db.refresh(db_factura)
        return db_factura
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (create_factura): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear la factura y su movimiento de Cuenta Corriente.")

def update_factura(db: Session, db_factura: Factura, factura_in: FacturaUpdate, usuario_id: int) -> Factura:
    update_data = factura_in.model_dump(exclude_unset=True)
    update_data_json = factura_in.model_dump(exclude_unset=True, mode='json')
    
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
            detalles_cambio=update_data_json,
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
from http.client import HTTPException

from sqlalchemy.orm import Session
from datetime import datetime

from app.models.Cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from app.schemas.auditoria import AuditoriaCreate
from app.crud.crud_auditoria import create_auditoria_log

def create_cliente(db: Session, cliente: ClienteCreate, usuario_id: int) -> Cliente:
    try:
        db_cliente = Cliente(**cliente.model_dump())
        db.add(db_cliente)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="INSERT",
            tabla_afectada="clientes",
            registro_id=db_cliente.id,
            detalles_cambio=cliente.model_dump(),
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit() 
        db.refresh(db_cliente)
        return db_cliente

    except Exception as e:
        db.rollback()
        print(f"Error en BD: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al crear el cliente.")

def get_cliente_by_id(db: Session, cliente_id: int) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()

def get_cliente_by_cuit(db: Session, cuit_dni: str) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.cuit_dni == cuit_dni).first()

def get_clientes(db: Session, skip: int = 0, limit: int = 100) -> list[Cliente]:
    return db.query(Cliente).offset(skip).limit(limit).all()

def update_cliente(db: Session, db_cliente: Cliente, cliente_in: ClienteUpdate, usuario_id: int) -> Cliente | None:
    update_data = cliente_in.model_dump(exclude_unset=True)
    
    try:
        for key, value in update_data.items():
            setattr(db_cliente, key, value)
            
        db.add(db_cliente)
        db.flush()

        log_data = AuditoriaCreate(
            usuario_id=usuario_id,
            accion="UPDATE",
            tabla_afectada="clientes",
            registro_id=db_cliente.id,
            detalles_cambio=update_data,
            fecha=datetime.now()
        )
        create_auditoria_log(db, log_data)

        db.commit()
        db.refresh(db_cliente)
        return db_cliente
    
    except Exception as e:
        db.rollback()
        print(f"Error BD (update_cliente): {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar el cliente.")
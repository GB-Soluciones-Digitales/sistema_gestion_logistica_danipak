from sqlalchemy.orm import Session
from app.models.Cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate

def create_cliente(db: Session, cliente: ClienteCreate) -> Cliente:
    db_cliente = Cliente(**cliente.model_dump())

    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

def get_cliente_by_id(db: Session, cliente_id: int) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()

def get_cliente_by_cuit(db: Session, cuit_dni: str) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.cuit_dni == cuit_dni).first()

def get_clientes(db: Session, skip: int = 0, limit: int = 100) -> list[Cliente]:
    return db.query(Cliente).offset(skip).limit(limit).all()

def update_cliente(db: Session, db_cliente: Cliente, cliente_in: ClienteUpdate) -> Cliente | None:
    update_data = cliente_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_cliente, key, value)
        
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente
from models import Cliente
from sqlalchemy.orm import Session


def create_cliente(db: Session, cliente: Cliente) -> Cliente:
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente

def get_cliente_by_id(db: Session, cliente_id: int) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()

def update_cliente_estado(db: Session, cliente_id: int, estado_actualizado: bool) -> Cliente | None:
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if cliente:
        cliente.estado = estado_actualizado
        db.commit()
        db.refresh(cliente)
    return cliente


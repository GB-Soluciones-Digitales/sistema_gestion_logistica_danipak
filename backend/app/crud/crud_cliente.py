from models import Cliente
from sqlalchemy.orm import Session


def get_cliente_by_username(db:Session, username: str) -> Cliente| None:
    return db.query(Cliente).filter(Cliente.username == username).first()

def get_cliente_by_email(db: Session, email: str) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.email == email).first()

def get_cliente_by_id(db: Session, cliente_id: int) -> Cliente | None:
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()

def update_cliente_estado(db: Session, cliente_id: int, estado_actualizado: bool) -> Cliente | None:
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if cliente:
        cliente.estado = estado_actualizado
        db.commit()
        db.refresh(cliente)
    return cliente


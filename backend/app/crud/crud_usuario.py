from sqlalchemy.orm import Session
from app.models.Usuario import Usuario


def get_usuario_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.username == username).first()

def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuario_by_id(db: Session, user_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id == user_id).first()

def update_usuario_estado(db: Session, usuario_id: int, estado_actualizado: bool) -> Usuario | None:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if (usuario!= None):
        usuario.estado = estado_actualizado
        db.commit()
        db.refresh(usuario)

    return usuario
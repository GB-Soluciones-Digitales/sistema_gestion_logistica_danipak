from models import Localidad
from sqlalchemy.orm import Session 

def get_localidad_by_id(db: Session, localidad_id: int) -> Localidad | None:
    return db.query(Localidad).filter(Localidad.id == localidad_id).first()

def get_localidad_by_nombre(db: Session, nombre: str) -> Localidad | None:
    return db.query(Localidad).filter(Localidad.nombre == nombre).first()

def get_localidad_by_codigo_postal(db: Session, codigo_postal: str) -> Localidad | None:
    return db.query(Localidad).filter(Localidad.codigo_postal == codigo_postal).first()

def update_localidad_estado(db: Session, localidad_id: int, estado_actualizado: bool) -> Localidad | None:
    localidad = db.query(Localidad).filter(Localidad.id == localidad_id).first()
    if (localidad != None):
        localidad.estado = estado_actualizado
        db.commit()
        db.refresh(localidad)
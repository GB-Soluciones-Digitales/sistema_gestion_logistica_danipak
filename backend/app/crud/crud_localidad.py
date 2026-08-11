from sqlalchemy.orm import Session

from app.models.Localidad import Localidad
from app.schemas.localidad import LocalidadCreate, LocalidadUpdate

def create_localidad(db: Session, localidad: LocalidadCreate) -> Localidad:
    db_localidad = Localidad(**localidad.model_dump())
    
    db.add(db_localidad)
    db.commit()
    db.refresh(db_localidad)
    return db_localidad

def get_localidad_by_id(db: Session, localidad_id: int) -> Localidad | None:
    return db.query(Localidad).filter(Localidad.id == localidad_id).first()

def get_localidades(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Localidad).offset(skip).limit(limit).all()

def update_localidad(db: Session, db_localidad: Localidad, localidad_in: LocalidadUpdate) -> Localidad:
    update_data = localidad_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_localidad, key, value)
        
    db.add(db_localidad)
    db.commit()
    db.refresh(db_localidad)
    return db_localidad
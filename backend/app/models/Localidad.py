from sqlalchemy import Column, String, Integer, Boolean
from app.db.base import Base 

class Localidad(Base):
    __tablename__ = "localidades"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo_postal = Column(String, nullable=True)
    estado = Column(Boolean, default=True, nullable=False)
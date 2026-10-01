from app.db.base import Base 
from sqlalchemy import Column, Integer, String

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    telefono = Column(String, nullable=False)
    telefono_aux = Column(String, nullable=True)
    direccion = Column(String, nullable=False) # direccion sin acento para evitar problemas de codificación
    correo = Column(String, nullable=False)
import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,Float, Integer, ForeignKey,Boolean  
from sqlachemy.orm import relationship


class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String, nullable=False)
    cuit_dni = Column(String, nullable=False, unique=True)
    localidad_id = Column(Integer, ForeignKey("localidades.id"), nullable=False)
    direccion = Column(String, nullable=True)
    estado = Column(Boolean, default=True, nullable=False)
    email = Column(String, nullable=True)

    localidad = relationship("Localidad", back_populates="clientes")


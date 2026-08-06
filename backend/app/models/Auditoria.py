import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,DateTime,Float, Integer, ForeignKey,Boolean  
from sqlachemy.orm import relationship

class Auditoria(Base):
    __tablename__ = "auditoria"
    id = Column(Integer, primary_key = True, index = True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable = False)
    accion = Column(String, nullable = False)
    tabla_afectada = Column(String, nullable = False)
    registro_id = Column(Integer, nullable = False)
    detalles_cambio = Column(String, nullable = True)
    fecha = Column(DateTime, nullable = False)

    usuario = relationship("Usuario", back_populates="auditoria")
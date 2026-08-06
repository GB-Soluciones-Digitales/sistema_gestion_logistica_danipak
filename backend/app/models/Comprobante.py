import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,Float, Integer, ForeignKey,Boolean, DateTime,Decimal  
from sqlachemy.orm import relationship

class Comprobante(Base):
    __tablename__ = "comprobantes"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable = False)
    numero_comprobante = Column(String, nullable = False)
    fecha_emision = Column(DateTime, nullable = False)
    cliente_remitente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    destinario_nombre = Column(String, nullable=False)
    domicilio_destino = Column(String, nullable=False)
    localidad_destino = Column(String, nullable=False)
    importe_flete_pago = Column(Decimal, nullable=True)
    importe_flete_cobro = Column(Decimal, nullable=True)
    estado = Column(String, nullable=False)
    observaciones = Column(String, nullable=True)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="comprobantes")
    cliente = relationship("Cliente", back_populates= "comprobantes")


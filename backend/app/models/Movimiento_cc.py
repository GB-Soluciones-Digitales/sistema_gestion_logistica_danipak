import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,Boolean,Integer, ForeignKey,DateTime,Decimal 
from sqlachemy.orm import relationship

class Movimiento_cc(Base):
    __tablename__ = "movimientos_cc"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    fecha_movimiento = Column(DateTime, nullable=False)
    tipo_movimiento = Column(String, nullable=False)
    referencia_id = Column(Integer, nullable=True)
    importe = Column(Decimal, nullable=False)
    anulado = Column(Boolean, default=False)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="movimientos_cc")
    usuario = relationship("Usuario", back_populates="movimientos_cc")
    
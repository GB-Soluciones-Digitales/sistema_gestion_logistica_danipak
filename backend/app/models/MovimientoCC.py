from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base import Base 

class MovimientoCC(Base):
    __tablename__ = "movimientos_cc"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    fecha_movimiento = Column(DateTime, nullable=False)
    tipo_movimiento = Column(String, nullable=False)
    referencia_id = Column(Integer, nullable=True)
    importe = Column(DECIMAL, nullable=False) 
    anulado = Column(Boolean, default=False)
    mes_correspondiente = Column(String, nullable=True)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="movimientos_cc")
    usuario = relationship("Usuario", back_populates="movimientos_cc")
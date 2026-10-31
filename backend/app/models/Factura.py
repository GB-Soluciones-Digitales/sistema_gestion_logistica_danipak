from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.db.base import Base 

class Factura(Base):
    __tablename__ = "facturas"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    numero_factura = Column(String, nullable=False)
    mes_correspondiente = Column(String, nullable=False)
    fecha = Column(DateTime, nullable=False)
    importe_total = Column(DECIMAL, nullable=False)
    observaciones = Column(Text, nullable=True)
    estado = Column(String, nullable=False, default="pendiente", server_default="pendiente")
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="facturas")
    usuario = relationship("Usuario", back_populates="facturas")
    pagos = relationship("Pago", secondary="pagos_facturas", back_populates="facturas")
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base import Base 

class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    numero_recibo = Column(String, nullable=False)
    monto = Column(DECIMAL, nullable=False)
    metodo_pago = Column(String, nullable=False)
    url_respaldo_pdf = Column(String, nullable=True)
    fecha_pago = Column(DateTime, nullable=False)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="pagos")
    usuario = relationship("Usuario", back_populates="pagos")

from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey, DECIMAL, Table
from sqlalchemy.orm import relationship
from app.db.base import Base 

# Facturas que cancela cada pago (relación muchos a muchos).
pagos_facturas = Table(
    "pagos_facturas",
    Base.metadata,
    Column("pago_id", Integer, ForeignKey("pagos.id"), primary_key=True),
    Column("factura_id", Integer, ForeignKey("facturas.id"), primary_key=True),
)

class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    numero_recibo = Column(String, nullable=False)
    monto = Column(DECIMAL, nullable=False)
    metodo_pago = Column(String, nullable=False)
    url_respaldo_pdf = Column(String, nullable=True)
    fecha_pago = Column(DateTime, nullable=False)
    anulado = Column(Boolean, default=False, nullable=False)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="pagos")
    usuario = relationship("Usuario", back_populates="pagos")
    facturas = relationship("Factura", secondary=pagos_facturas, back_populates="pagos")

from sqlalchemy import Column, String, Integer, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base 

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String, nullable=False, index=True)
    cuit_dni = Column(String, unique=True, index=True, nullable=False)
    direccion = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    estado = Column(Boolean, default=True, nullable=False)
    tiene_cuenta_corriente = Column(Boolean, default=False, nullable=False)

    comprobantes = relationship("Comprobante", back_populates="cliente")
    facturas = relationship("Factura", back_populates="cliente")
    movimientos_cc = relationship("MovimientoCC", back_populates="cliente")
    pagos = relationship("Pago", back_populates="cliente")
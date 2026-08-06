from sqlalchemy import Column, String, Integer, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base 

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    estado = Column(Boolean, default=True, nullable=False)

    comprobantes = relationship("Comprobante", back_populates="usuario")
    facturas = relationship("Factura", back_populates="usuario")
    movimientos_cc = relationship("MovimientoCC", back_populates="usuario")
    pagos = relationship("Pago", back_populates="usuario")
    # auditoria = relationship("Auditoria", back_populates="usuario")
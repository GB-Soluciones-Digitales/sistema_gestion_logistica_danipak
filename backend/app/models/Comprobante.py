from app.db.base import Base 
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, DECIMAL  
from sqlalchemy.orm import relationship

class Comprobante(Base):
    __tablename__ = "comprobantes"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    numero_comprobante = Column(String, nullable=False)
    fecha_emision = Column(DateTime, nullable=False)

    # DATOS DEL REMITENTE
    cliente_remitente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    domicilio_remitente = Column(String, nullable=False)
    localidad_remitente_id = Column(Integer, ForeignKey("localidades.id"), nullable=False)

    # DATOS DEL DESTINATARIO
    nombre_destinatario = Column(String, nullable=False)
    domicilio_destinatario = Column(String, nullable=False)
    localidad_destinatario_id = Column(Integer, ForeignKey("localidades.id"), nullable=False)

    # DETALLES DEL ENVÍO
    cantidad_bultos = Column(Integer, nullable=False)
    importe_contra_reembolso = Column(DECIMAL, nullable=True)
    importe_flete_pago = Column(DECIMAL, nullable=True)
    importe_flete_cobro = Column(DECIMAL, nullable=True)

    estado = Column(String, nullable=False)
    observaciones = Column(String, nullable=True)
    usuario_creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="comprobantes")
    cliente = relationship("Cliente", back_populates="comprobantes")
    
    localidad_remitente_rel = relationship("Localidad", foreign_keys=[localidad_remitente_id])
    localidad_destinatario_rel = relationship("Localidad", foreign_keys=[localidad_destinatario_id])
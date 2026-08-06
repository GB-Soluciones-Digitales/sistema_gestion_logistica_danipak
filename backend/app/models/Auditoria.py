from app.db.base import Base
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Auditoria(Base):
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    accion = Column(String, nullable=False)
    tabla_afectada = Column(String, nullable=False)
    registro_id = Column(Integer, nullable=False)
    detalles_cambio = Column(JSON, nullable=True) 
    fecha = Column(DateTime, nullable=False)

    usuario = relationship("Usuario", back_populates="auditoria")
from app.db.base import Base 
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, DECIMAL  
from sqlalchemy.orm import relationship


class Empresa(Base):
   __tablename__ = "Empresas"

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, nullable=False)
   telefono = Column(String, nullable=False)
   telefono_aux = Column(String, nullable=True)
   dirreccion = Column(String, nullable=False)
   correo = Column(String, nullable=False)

   

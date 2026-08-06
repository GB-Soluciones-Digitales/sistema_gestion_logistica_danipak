import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,Float, Integer, ForeignKey,Boolean  
from sqlachemy.orm import relationship

class Localidad(Base):
    __tablename__ = "Localidades"
    id = Column(Integer, primary_key = True, index = True)
    nombre = Column(String, nullable = False)
    codigo_postal = Column(String, nullable = True)
    estado = Column(Boolean, default = True, nullable = False)

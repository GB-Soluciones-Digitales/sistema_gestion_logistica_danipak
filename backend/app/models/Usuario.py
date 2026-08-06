import re
from typing import Optional
from unittest.mock import Base 
from sqlachemy import Column,String,Float, Integer, ForeignKey,Boolean  
from sqlachemy.orm import relationship


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key = True, index = True)
    nombre_completo = Column(String, nullable = False)
    username = Column(String, nullable = False)
    password_hash = Column(String, nullable = False)
    estado = Column(Boolean, default = True, nullable = False)
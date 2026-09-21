from pydantic import BaseModel, ConfigDict
from typing import Optional

class EmpresaBase(BaseModel):
    nombre: str
    telefono: str
    telefono_aux: Optional[str] = None
    dirreccion: str
    correo: str

class EmpresaCreate(BaseModel):
    pass

class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    telefono_aux: Optional[str] = None
    dirreccion: Optional[str] = None
    correo: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


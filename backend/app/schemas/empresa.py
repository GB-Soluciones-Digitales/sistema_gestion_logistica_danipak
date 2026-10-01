from pydantic import BaseModel, ConfigDict
from typing import Optional

class EmpresaBase(BaseModel):
    nombre: str
    telefono: str
    telefono_aux: Optional[str] = None
    direccion: str
    correo: str

class EmpresaCreate(EmpresaBase): # Una correccion, la clase EmpresaCreate hereda de EmpresaBase, que contiene los campos comunes para la creación de una empresa.
    pass

class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    telefono_aux: Optional[str] = None
    direccion: Optional[str] = None
    correo: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
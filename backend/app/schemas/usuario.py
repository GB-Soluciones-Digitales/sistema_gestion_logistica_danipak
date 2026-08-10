from pydantic import BaseModel, ConfigDict
from typing import Optional

class UsuarioBase(BaseModel):
    nombre_completo: str
    username: str
    estado: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    estado: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
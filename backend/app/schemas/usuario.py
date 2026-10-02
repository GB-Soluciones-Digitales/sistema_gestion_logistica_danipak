from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class UsuarioBase(BaseModel):
    nombre_completo: str
    username: str
    email: str
    estado: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    estado: Optional[bool] = None

class PasswordChange(BaseModel):
    password_actual: str
    password_nueva: str
    
class UsuarioResponse(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UsuarioPaginatedResponse(BaseModel):
    total: int
    items: List[UsuarioResponse]
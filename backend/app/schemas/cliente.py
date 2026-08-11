from pydantic import BaseModel, ConfigDict
from typing import Optional

class ClienteBase(BaseModel):
    razon_social: str
    cuit_dni: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    activo: bool = True

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    razon_social: Optional[str] = None
    cuit_dni: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    activo: Optional[bool] = None

class ClienteResponse(ClienteBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
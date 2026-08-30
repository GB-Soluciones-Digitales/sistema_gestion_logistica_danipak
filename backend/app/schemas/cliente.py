from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ClienteBase(BaseModel):
    razon_social: str
    cuit_dni: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    estado: bool = True

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    razon_social: Optional[str] = None
    cuit_dni: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    estado: Optional[bool] = None

class ClienteResponse(ClienteBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ClientePaginatedResponse(BaseModel):
    total: int
    items: List[ClienteResponse]
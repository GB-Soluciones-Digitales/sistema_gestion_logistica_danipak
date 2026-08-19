from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class LocalidadBase(BaseModel):
    nombre: str
    codigo_postal: Optional[str] = None
    estado: bool = True

class LocalidadCreate(LocalidadBase):
    pass

class LocalidadUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo_postal: Optional[str] = None
    estado: Optional[bool] = None

class LocalidadPaginatedResponse(BaseModel):
    total: int
    items: List[LocalidadResponse]
    
class LocalidadResponse(LocalidadBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
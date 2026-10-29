from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class AuditoriaBase(BaseModel):
    usuario_id: int
    accion: str
    tabla_afectada: str
    registro_id: int
    detalles_cambio: Optional[dict[str, Any]] = None
    fecha: datetime

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaResponse(AuditoriaBase):
    id: int
    usuario_nombre: Optional[str] = None
    cliente_nombre: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AuditoriaPaginatedResponse(BaseModel):
    total: int
    items: List[AuditoriaResponse]
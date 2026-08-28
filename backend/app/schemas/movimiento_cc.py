from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class MovimientoCCBase(BaseModel):
    cliente_id: int
    fecha_movimiento: datetime
    tipo_movimiento: str
    referencia_id: Optional[int] = None
    importe: Decimal
    anulado: bool = False

class MovimientoCCCreate(MovimientoCCBase):
    pass

class MovimientoCCUpdate(BaseModel):
    anulado: Optional[bool] = None

class MovimientoCCResponse(MovimientoCCBase):
    id: int
    usuario_creador_id: int
    model_config = ConfigDict(from_attributes=True)

class MovimientoCCPaginatedResponse(BaseModel):
    total: int
    items: List[MovimientoCCResponse]
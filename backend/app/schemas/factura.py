from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class FacturaBase(BaseModel):
    cliente_id: int
    numero_factura: str
    mes_correspondiente: str
    fecha: datetime
    importe_total: Decimal
    observaciones: Optional[str] = None

class FacturaCreate(FacturaBase):
    pass

class FacturaUpdate(BaseModel):
    observaciones: Optional[str] = None

class FacturaResponse(FacturaBase):
    id: int
    usuario_creador_id: int
    model_config = ConfigDict(from_attributes=True)

class FacturaPaginatedResponse(BaseModel):
    total: int
    items: List[FacturaResponse]
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PagoBase(BaseModel):
    cliente_id: int
    numero_recibo: str
    monto: Decimal
    metodo_pago: str
    url_respaldo_pdf: Optional[str] = None
    fecha_pago: datetime
    anulado: bool = False

class PagoCreate(PagoBase):
    pass

class PagoUpdate(BaseModel):
    url_respaldo_pdf: Optional[str] = None
    anulado: Optional[bool] = None

class PagoResponse(PagoBase):
    id: int
    usuario_creador_id: int
    model_config = ConfigDict(from_attributes=True)
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
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
    facturas_ids: List[int] = []

class PagoUpdate(BaseModel):
    url_respaldo_pdf: Optional[str] = None
    anulado: Optional[bool] = None

class PagoFacturaResumen(BaseModel):
    id: int
    numero_factura: str
    importe_total: Decimal
    model_config = ConfigDict(from_attributes=True)

class PagoResponse(PagoBase):
    id: int
    usuario_creador_id: int
    facturas: List[PagoFacturaResumen] = []
    model_config = ConfigDict(from_attributes=True)

class PagoPaginatedResponse(BaseModel):
    total: int
    items: List[PagoResponse]
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ComprobanteBase(BaseModel):
    tipo: str
    numero_comprobante: str
    fecha_emision: datetime
    
    cliente_remitente_id: int
    domicilio_remitente: str
    localidad_remitente_id: int
    
    nombre_destinatario: str
    domicilio_destinatario: str
    localidad_destinatario_id: int
    
    cantidad_bultos: int
    importe_contra_reembolso: Optional[Decimal] = None
    importe_flete_pago: Optional[Decimal] = None
    importe_flete_cobro: Optional[Decimal] = None
    
    estado: str
    observaciones: Optional[str] = None

class ComprobanteCreate(ComprobanteBase):
    pass

class ComprobanteUpdate(BaseModel):
    estado: Optional[str] = None
    observaciones: Optional[str] = None

class ComprobanteResponse(ComprobanteBase):
    id: int
    usuario_creador_id: int
    model_config = ConfigDict(from_attributes=True)
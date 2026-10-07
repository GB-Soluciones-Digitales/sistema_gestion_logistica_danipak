from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.MovimientoCC import MovimientoCC
from app.schemas.movimiento_cc import MovimientoCCCreate, MovimientoCCPaginatedResponse, MovimientoCCResponse
from app.crud import crud_movimientoCC
from app.models.Usuario import Usuario

router = APIRouter(prefix="/movimientos", tags=["Movimientos CC"])

@router.post("/", response_model=MovimientoCCResponse, status_code=status.HTTP_201_CREATED)
def create_movimiento(movimiento_in: MovimientoCCCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_movimientoCC.create_movimiento_cc(db=db, movimiento=movimiento_in, usuario_id=current_user.id)

@router.get("/resumen-general")
def get_resumen_general(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_movimientoCC.get_resumen_general_cuentas(db)

@router.get("/cliente/{cliente_id}/resumen")
def get_resumen_cuenta_corriente(cliente_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_movimientoCC.get_resumen_cuenta_cliente(db, cliente_id)

from datetime import date
from typing import Optional

@router.get("/cliente/{cliente_id}", response_model=MovimientoCCPaginatedResponse)
def get_movimientos_cliente(cliente_id: int, skip: int = 0, limit: int = 100, anulado: Optional[bool] = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, tipo_movimiento: Optional[str] = None, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_movimientoCC.get_movimientos(db=db, cliente_id=cliente_id, skip=skip, limit=limit, anulado=anulado, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, tipo_movimiento=tipo_movimiento)

@router.get("/{movimiento_id}", response_model=MovimientoCCResponse)
def get_movimiento(movimiento_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    movimiento = crud_movimientoCC.get_movimiento_by_id(db, movimiento_id)
    if not movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    return movimiento

@router.put("/{movimiento_id}/anular", response_model=MovimientoCCResponse)
def anular_movimiento(movimiento_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_movimiento = crud_movimientoCC.get_movimiento_by_id(db, movimiento_id)
    if not db_movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    
    if db_movimiento.anulado:
        raise HTTPException(status_code=400, detail="El movimiento ya se encuentra anulado.")
    
    return crud_movimientoCC.anular_movimiento_cc(db=db, db_movimiento=db_movimiento, usuario_id=current_user.id)

@router.put("/{movimiento_id}", response_model=MovimientoCCResponse)
def update_movimiento(movimiento_id: int, movimiento_in: MovimientoCCCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_movimiento = crud_movimientoCC.get_movimiento_by_id(db, movimiento_id)
    if not db_movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    
    return crud_movimientoCC.update_movimiento_cc(db=db, db_movimiento=db_movimiento, movimiento_in=movimiento_in, usuario_id=current_user.id)
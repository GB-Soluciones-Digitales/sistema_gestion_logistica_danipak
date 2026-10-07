from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_pago
from app.schemas.pago import PagoPaginatedResponse, PagoResponse, PagoCreate, PagoUpdate
from app.models.Usuario import Usuario

router = APIRouter(prefix="/pagos", tags=["Pagos"])

@router.post("/", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def create_pago(pago_in: PagoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    pago_existente = crud_pago.get_pago_by_numero_recibo(db, numero_recibo=pago_in.numero_recibo)
    if pago_existente:
        raise HTTPException(status_code=400, detail="El número de recibo ya se encuentra registrado.")
    
    return crud_pago.create_pago(db=db, pago=pago_in, usuario_id=current_user.id)

@router.get("/", response_model=PagoPaginatedResponse)
def get_pagos(skip: int = 0, limit: int = 50, search: Optional[str] = None, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_pago.get_pagos(db=db, skip=skip, limit=limit, search=search)

@router.get("/{pago_id}", response_model=PagoResponse)
def get_pago(pago_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    pago = crud_pago.get_pago_by_id(db, pago_id)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado.")
    return pago

@router.put("/{pago_id}", response_model=PagoResponse)
def update_pago(pago_id: int, pago_in: PagoUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_pago = crud_pago.get_pago_by_id(db, pago_id)
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado.")
    
    return crud_pago.update_pago(db=db, db_pago=db_pago, pago_in=pago_in, usuario_id=current_user.id)

@router.put("/{pago_id}/anular", response_model=PagoResponse)
def anular_pago(pago_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_pago = crud_pago.get_pago_by_id(db, pago_id)

    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado.")
    
    if db_pago.anulado:
        raise HTTPException(status_code=400, detail="El pago ya se encuentra anulado.")
    
    return crud_pago.anular_pago(db=db, pago_id=pago_id, usuario_id=current_user.id)
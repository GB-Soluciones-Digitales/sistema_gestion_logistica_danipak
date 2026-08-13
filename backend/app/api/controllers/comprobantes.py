from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.comprobante import ComprobanteCreate, ComprobanteUpdate, ComprobanteResponse
from app.crud import crud_comprobante

router = APIRouter(prefix="/comprobantes", tags=["Comprobantes"])

@router.post("/", response_model=ComprobanteResponse, status_code=status.HTTP_201_CREATED)
def create_comprobante(comprobante_in: ComprobanteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    comprobante_existente = crud_comprobante.get_comprobante_by_numero(db, numero_comprobante=comprobante_in.numero_comprobante)
    if comprobante_existente:
        raise HTTPException(status_code=400, detail="El número de comprobante ya se encuentra registrado.")
    
    return crud_comprobante.create_comprobante(db=db, comprobante=comprobante_in, usuario_id=current_user.id)

@router.get("/", response_model=list[ComprobanteResponse])
def get_comprobantes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_comprobante.get_comprobantes(db=db, skip=skip, limit=limit)

@router.get("/{comprobante_id}", response_model=ComprobanteResponse)
def get_comprobante(comprobante_id: int, db: Session = Depends(get_db)):
    comprobante = crud_comprobante.get_comprobante_by_id(db, comprobante_id)
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")
    return comprobante

@router.put("/{comprobante_id}", response_model=ComprobanteResponse)
def update_estado_comprobante(comprobante_id: int, comprobante_in: ComprobanteUpdate, db: Session = Depends(get_db)):
    db_comprobante = crud_comprobante.get_comprobante_by_id(db, comprobante_id)
    if not db_comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")
    
    return crud_comprobante.update_comprobante_estado(db=db, db_comprobante=db_comprobante, comprobante_in=comprobante_in)
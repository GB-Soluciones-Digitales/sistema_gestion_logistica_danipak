from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.factura import FacturaCreate, FacturaPaginatedResponse, FacturaUpdate, FacturaResponse
from app.crud import crud_factura

router = APIRouter(prefix="/facturas", tags=["Facturas"])

@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
def create_factura(factura_in: FacturaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    factura_existente = crud_factura.get_factura_by_numero(db, numero_factura=factura_in.numero_factura)
    if factura_existente:
        raise HTTPException(status_code=400, detail="El número de factura ya se encuentra registrado.")
    
    return crud_factura.create_factura(db=db, factura=factura_in, usuario_id=current_user.id)

@router.get("/", response_model=FacturaPaginatedResponse)
def get_facturas(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud_factura.get_facturas(db=db, skip=skip, limit=limit, search=search)

@router.get("/{factura_id}", response_model=FacturaResponse)
def get_factura(factura_id: int, db: Session = Depends(get_db)):
    factura = crud_factura.get_factura_by_id(db, factura_id)
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada.")
    return factura

@router.put("/{factura_id}", response_model=FacturaResponse)
def update_factura(factura_id: int, factura_in: FacturaUpdate, db: Session = Depends(get_db)):
    db_factura = crud_factura.get_factura_by_id(db, factura_id)
    if not db_factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada.")
    
    return crud_factura.update_factura(db=db, db_factura=db_factura, factura_in=factura_in)
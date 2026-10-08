from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_cliente
from app.schemas.cliente import ClientePaginatedResponse, ClienteResponse, ClienteCreate, ClienteUpdate

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente_in: ClienteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    cliente_existente = crud_cliente.get_cliente_by_cuit(db, cuit_dni=cliente_in.cuit_dni)
    if cliente_existente:
        raise HTTPException(status_code=400, detail="El CUIT/DNI ya está registrado en el sistema.")
    
    return crud_cliente.create_cliente(db=db, cliente=cliente_in, usuario_id=current_user.id)

@router.get("/", response_model=ClientePaginatedResponse)
def get_clientes(skip: int = 0, limit: int = 50, search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud_cliente.get_clientes(db, skip=skip, limit=limit, search=search)

@router.get("/{cliente_id}", response_model=ClienteResponse)
def get_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = crud_cliente.get_cliente_by_id(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado.")
    return cliente

@router.put("/{cliente_id}", response_model=ClienteResponse)
def update_cliente(cliente_id: int, cliente_in: ClienteUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_cliente = crud_cliente.get_cliente_by_id(db, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado.")
    
    return crud_cliente.update_cliente(db=db, db_cliente=db_cliente, cliente_in=cliente_in, usuario_id=current_user.id)
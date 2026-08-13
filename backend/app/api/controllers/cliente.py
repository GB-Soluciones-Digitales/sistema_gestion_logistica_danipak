from models import Cliente
from fastapi import APIRouter
from crud import crud_cliente






router = APIRouter(prefix="/api")

crud = crud_cliente()

@router.get("/clientes/{cliente_id}", response_model=Cliente)
def get_cliente(cliente_id: int):
    db_cliente = crud.get_cliente_by_id(cliente_id)
    if db_cliente is None:
        return {"error": "Cliente no encontrado"}
    return db_cliente

@router.get("/clientes/cuit/{cuit_dni}", response_model=Cliente)
def get_cliente_by_cuit(cuit_dni: str):
    db_cliente = crud.get_cliente_by_cuit(cuit_dni)
    if db_cliente is None:
        return {"error": "Cliente no encontrado"}
    return db_cliente

@router.get("/clientes", response_model=list[Cliente])
def get_clientes():
    return crud.get_all_clientes()


@router.post("/clientes", response_model=Cliente)
def create_cliente(cliente: Cliente):
    return crud.create_cliente(cliente)


@router.put("/clientes/{cliente_id}", response_model=Cliente)
def update_cliente(cliente_id: int, cliente: Cliente):
    db_cliente = crud.get_cliente_by_id(cliente_id)
    if db_cliente is None:
        return {"error": "Cliente no encontrado"}
    return crud.update_cliente(db_cliente, cliente)

from crud import crud_auditoria
from fastapi import APIRouter
from models import Auditoria

router = APIRouter(prefix = "/api")
crud = crud_auditoria()

@router.get("/auditorias/{auditoria_id}", response_model = Auditoria)
def get_auditoria_by_registro_id(auditoria_id: int):
    db_auditoria = crud.get_auditoria_by_id(auditoria_id)
    if db_auditoria is None:
        return {"error": "Auditoría no encontrada"}
    return db_auditoria

@router.get("/auditorias", response_model = list[Auditoria])
def get_auditorias(skip: int = 0, limit: int = 100):
    return crud.get_auditorias(skip=skip, limit=limit)

@router.put("/auditorias/{auditoria_id}", response_model = Auditoria)
def update_auditoria(auditoria_id: int, auditoria: Auditoria):
    db_auditoria = crud.get_auditoria_by_id(auditoria_id)
    if db_auditoria is None:
        return {"error": "La auditoría no existe"}
    return crud.update_auditoria(db_auditoria, auditoria)
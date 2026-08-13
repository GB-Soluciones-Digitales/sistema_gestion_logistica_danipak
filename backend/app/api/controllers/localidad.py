from crud import crud_localidad
from fastapi import APIRouter
from models import Localidad

router = APIRouter(prefix="/api")
crud = crud_localidad()

@router.get("/localidades/{localidad_id}", response_model = Localidad)
def get_localidad_by_id(localidad_id: int):
    db_localidad = crud.get_localidad_by_id(localidad_id)
    if db_localidad is None:
        return {"error": "Localidad no encontrada"}
    return db_localidad

@router.get("/localidades", response_model = list[Localidad])
def get_localidades(skip: int = 0, limit: int = 100):
    return crud.get_localidades(skip=skip, limit=limit)

@router.post("/localidades", response_model = Localidad)
def create_localidad(localidad: Localidad):
    return crud.create_localidad(localidad)

@router.put("/localidades/{localidad_id}", response_model = Localidad)
def update_localidad(localidad_id: int, localidad: Localidad):
    db_localidad = crud.get_localidad_by_id(localidad_id)
    if db_localidad is None:
        return {"error": "La localidad no existe"}
    return crud.update_localidad(db_localidad, localidad)
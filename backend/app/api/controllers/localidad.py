from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.localidad import LocalidadCreate, LocalidadUpdate, LocalidadResponse
from app.crud import crud_localidad

router = APIRouter(prefix="/localidades", tags=["Localidades"])

@router.post("/", response_model=LocalidadResponse, status_code=status.HTTP_201_CREATED)
def create_localidad(localidad_in: LocalidadCreate, db: Session = Depends(get_db)):
    return crud_localidad.create_localidad(db=db, localidad=localidad_in)

@router.get("/", response_model=list[LocalidadResponse])
def get_localidades(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_localidad.get_localidades(db=db, skip=skip, limit=limit)

@router.get("/{localidad_id}", response_model=LocalidadResponse)
def get_localidad(localidad_id: int, db: Session = Depends(get_db)):
    localidad = crud_localidad.get_localidad_by_id(db, localidad_id)
    if not localidad:
        raise HTTPException(status_code=404, detail="Localidad no encontrada.")
    return localidad

@router.put("/{localidad_id}", response_model=LocalidadResponse)
def update_localidad(localidad_id: int, localidad_in: LocalidadUpdate, db: Session = Depends(get_db)):
    db_localidad = crud_localidad.get_localidad_by_id(db, localidad_id)
    if not db_localidad:
        raise HTTPException(status_code=404, detail="Localidad no encontrada.")
    
    return crud_localidad.update_localidad(db=db, db_localidad=db_localidad, localidad_in=localidad_in)
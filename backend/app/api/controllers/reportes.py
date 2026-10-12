from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import crud_reportes
from app.models.Usuario import Usuario

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.get("/resumen")
def get_resumen_reportes(fecha: Optional[date] = None, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_reportes.get_reportes_metrics(db=db, fecha_consulta=fecha)
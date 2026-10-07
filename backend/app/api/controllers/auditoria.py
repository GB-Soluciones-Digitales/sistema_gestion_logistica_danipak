from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_auditoria
from app.schemas.auditoria import AuditoriaPaginatedResponse, AuditoriaResponse

router = APIRouter(prefix="/auditoria", tags=["Auditoría"], dependencies=[Depends(get_current_user)])

@router.get("/", response_model=AuditoriaPaginatedResponse)
def get_auditoria_logs(skip: int = 0, limit: int = 100, tabla_afectada: Optional[str] = None, accion: Optional[str] = None, usuario_id: Optional[int] = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud_auditoria.get_auditoria_logs(
        db=db,
        skip=skip,
        limit=limit,
        tabla_afectada=tabla_afectada,
        accion=accion,
        usuario_id=usuario_id,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        search=search,
    )

@router.get("/{tabla}/{registro_id}", response_model=list[AuditoriaResponse])
def get_auditoria_by_registro(tabla: str, registro_id: int, db: Session = Depends(get_db)):
    logs = crud_auditoria.get_auditoria_by_registro(db=db, tabla=tabla, registro_id=registro_id)
    if not logs:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron registros de auditoría para {tabla} con ID {registro_id}"
        )
    return logs
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.models.Usuario import Usuario

router = APIRouter(prefix="/empresa", tags=["Empresa"])

@router.post("/", response_model=EmpresaResponse, status_code= status.HTTP_201_CREATED)
def create_empresa(empresa_in: EmpresaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    empresa_existente = crud_empresa.get_primera_empresa(db) # Para corroborar que no se cree una segunda empresa.

    if empresa_existente:
        raise HTTPException(status_code=400, detail="Los datos de la empresa ya están registrados. Debe actualizarlos.")
    
    return crud_empresa.create_empresa(db=db, empresa=empresa_in) # No se necesita pasar el usuario_id porque no auditamos esta creacion.

@router.get("/{empresa_id}", response_model=EmpresaResponse)
def get_empresa(empresa_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    empresa = crud_empresa.get_empresa_by_id(db, empresa_id)
    
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    return empresa

@router.put("/{empresa_id}",response_model=EmpresaResponse)
def update_empresa(empresa_id: int, empresa_in: EmpresaUpdate, db: Session=Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_empresa = crud_empresa.get_empresa_by_id(db, empresa_id)
    
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    return crud_empresa.update_empresa(db=db, db_empresa=db_empresa, empresa_in=empresa_in, usuario_id=current_user.id)
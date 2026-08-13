from crud import crud_usuario
from fastapi import APIRouter
from models import Usuario


router = APIRouter(prefix="/api")

crud = crud_usuario()

@router.get("/usuarios/{usuario_username}", response_model = Usuario)
def get_usuario_by_username(usuario_username: str):
    db_usuario = crud.get_usuario_by_username(usuario_username)
    if db_usuario is None:
        return {"error": "El usuario no tiene concidencias"}
    return db_usuario

@router.get("/usuarios/{usuario_email}", response_model = Usuario)
def get_usuario_by_email(usuario_email: str):
    db_usuario = crud.get_usuario_by_email(usuario_email)
    if db_usuario is None:
        return {"error": "El email no tiene concidencias"}
    return db_usuario

@router.get("/usuarios/{usuario_id}", response_model = Usuario)
def get_usuario_by_id(usuario_id: int):
    db_usuario = crud.get_usuario_by_id(usuario_id)
    if db_usuario is None:
        return {"error": "Usuario no encontrado"}
    return db_usuario

@router.get("/usuarios", response_model = list[Usuario])
def get_usuarios():
    return crud.get_all_usuarios()

@router.post("/usuarios", response_model = Usuario)
def create_usuario(usuario: Usuario):
    return crud.create_usuario(usuario)

@router.put("/usarios/{usuario_id}", response_model = Usuario)
def update_usuario(usuario_id: int, usuario: Usuario):
    db_usuario = crud.get_usuario_by_id(usuario_id)
    if db_usuario is None:
        return {"error": "El usuario no existe"}
    return crud.update_usuario(db_usuario, usuario)

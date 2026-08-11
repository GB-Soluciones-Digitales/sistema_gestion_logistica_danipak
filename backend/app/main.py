from fastapi import FastAPI

from app.api.controllers import auth

app = FastAPI()

app.include_router(auth.router, prefix="/api")
    
@app.get("/")
def read_root():
    return {"status": "FastAPI corriendo en Docker con éxito"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.controllers import auth

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "https://discerning-surprise-production-759b.up.railway.app",   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
    
@app.get("/")
def read_root():
    return {"status": "FastAPI corriendo en Docker con éxito"}
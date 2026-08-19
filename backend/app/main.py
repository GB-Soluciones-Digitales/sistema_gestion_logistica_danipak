from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.controllers import auth, auditoria, clientes, comprobantes, facturas, localidad, movimientos_cc, pagos, usuarios
from app.models import Comprobante, Usuario, Cliente, Localidad, Auditoria, Factura, MovimientoCC, Pago

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

app.include_router(auditoria.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(clientes.router, prefix="/api")
app.include_router(comprobantes.router, prefix="/api")
app.include_router(facturas.router, prefix="/api")
app.include_router(localidad.router, prefix="/api")
app.include_router(movimientos_cc.router, prefix="/api")
app.include_router(pagos.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
    
@app.get("/")
def read_root():
    return {"status": "FastAPI corriendo en Docker con éxito"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter

from app.api.controllers import auth, auditoria, clientes, comprobantes, facturas, localidad, movimientos_cc, pagos, usuarios, empresa, reportes
from app.models import Comprobante, Usuario, Cliente, Localidad, Auditoria, Factura, MovimientoCC, Pago
from app.db.session import SessionLocal
from app.core.security import get_password_hash

app = FastAPI()

@app.on_event("startup")
def crear_usuario_inicial():
    db = SessionLocal()
    try:
        from app.models.Usuario import Usuario as ModeloUsuario

        usuario = db.query(ModeloUsuario).filter(ModeloUsuario.email == "brian_nbattauz@hotmail.com.ar").first()
        if usuario:
            print("🔄 Actualizando credenciales del usuario fundador existente...")
            usuario.username = "brian"
            usuario.nombre_completo = "Brian Battauz"
            usuario.password_hash = get_password_hash("123456")
            db.commit()
            print("✅ ¡Usuario fundador actualizado con éxito!")
        else:
            print("⚠️ No se encontró el usuario original. Omitiendo actualización para evitar colisión de IDs.")
    except Exception as e:
        print(f"❌ Error al crear el usuario inicial: {e}")
        db.rollback()
    finally:
        db.close()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(empresa.router, prefix="/api")
app.include_router(reportes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "FastAPI corriendo en Docker con éxito"}
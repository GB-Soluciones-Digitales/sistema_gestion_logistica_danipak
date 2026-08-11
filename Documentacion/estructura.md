# Estructura del proyecto -- Backend --

```bash
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencias (get_current_user para leer el token) (Lauti te dejo escrito mas o menos de que trata)
│   │   └── controllers/     # Endpoints (punto de entrada y llama a la logica de crud)
│   │       ├── auth.py      
│   │       ├── usuarios.py
│   │       └── ...          
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Aca leen las variables de entorno (.env) para las configuraciones globales
│   │   └── security.py      # Hash de claves y generacion de tokens
│   │
│   ├── crud/                # Logica para la base de datos. Paso anterior a los controllers
│   │   ├── __init__.py
│   │   ├── auth.py      
│   │   ├── usuarios.py
│   │   └── ...          
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py          # Conexion entre los models y la base de datos (SQLAlchemy)
│   │   └── session.py       # La conexión a PostgreSQL
│   │
│   ├── models/              # Los modelos (estan todos por ahora)
│   │   ├── Auditoria.py
│   │   ├── Cliente.py
│   │   ├── Comprobante.py
│   │   ├── Factura.py
│   │   ├── Localidad.py
│   │   ├── MoviminetoCC.py
│   │   ├── Pago.py
│   │   └── Usuario.py
│   │
│   ├── schemas/             # Los esquemas, se usa pydantic para las validaciones
│   │   ├── __init__.py
│   │   ├── auth.py          
│   │   └── usuario.py
│   │
│   ├── services/            # Toda la logica externa
│   │   └── email.py         # Ejemplo, logica para mandar mail de recuperacion
│   │
│   └── main.py
│                  
├── requirements.txt
├── .env
├── alembic.ini
└── Dockerfile
```

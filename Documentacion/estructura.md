# Estructura del proyecto

```bash
backend/
├── alembic/                 # Aca se autogeneran los archivos de las migraciones de la BD
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencias (get_current_user para leer el token) (Lauti te dejo escrito mas o menos de que trata)
│   │   └── controllers/     # Endpoints (punto de entrada y llama a la logica de crud)
│   │       ├── auth.py      
│   │       ├── auditoria.py
│   │       ├── clientes.py
│   │       ├── comprobantes.py
│   │       ├── facturas.py
│   │       ├── localidad.py
│   │       ├── movimientos_cc.py
│   │       ├── pagos.py
│   │       └── usuarios.py          
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Aca leen las variables de entorno (.env) para las configuraciones globales
│   │   └── security.py      # Hash de claves y generacion de tokens
│   ├── crud/                # Logica para la base de datos. Paso anterior a los controllers
│   │   ├── __init__.py
│   │   ├── crud_auditoria.py      
│   │   ├── crud_cliente.py
│   │   ├── crud_comprobante.py
│   │   ├── crud_factura.py
│   │   ├── crud_localidad.py
│   │   ├── crud_movimientoCC.py
│   │   ├── crud_pago.py
│   │   └── crud_usuario.py          
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py          # Conexion entre los models y la base de datos (SQLAlchemy)
│   │   └── session.py       # La conexión a PostgreSQL
│   ├── models/              # Los modelos
│   │   ├── Auditoria.py
│   │   ├── Cliente.py
│   │   ├── Comprobante.py
│   │   ├── Factura.py
│   │   ├── Localidad.py
│   │   ├── MovimientoCC.py
│   │   ├── Pago.py
│   │   └── Usuario.py
│   ├── schemas/             # Los esquemas, se usa pydantic para las validaciones
│   │   ├── __init__.py
│   │   ├── auditoria.py 
│   │   ├── auth.py
│   │   ├── cliente.py 
│   │   ├── comprobante.py 
│   │   ├── factura.py 
│   │   ├── localidad.py 
│   │   ├── movimiento_cc.py 
│   │   ├── pago.py        
│   │   └── usuario.py
│   ├── services/            # Toda la logica externa
│   │   └── email.py         # Ejemplo, logica para mandar mail de recuperacion
│   └── main.py
├── tests/                   # Aca van a ir los tests automatizados
├── requirements.txt
├── .env
├── .gitignore               # Para que no se suban cosas pesadas o secretas a GitHub
├── .dockerignore
├── alembic.ini
└── Dockerfile
```

```bash
frontend_sistema_danipak/
├── public/                         # Todo lo que va aca no se compila. Vital para la PWA
│   ├── pwa-192x192.png             # Icono para el celular
│   ├── pwa-512x512.png             # Icono de alta calidad
│   └── manifest.webmanifest        # Archivo de configuracion para que se instale offline
├── src/
│   ├── api/
│   │   ├── comprobantesService.js                      # Se maneja la conexion al backend
│   │   └── axios.js   
│   ├── assets/                     # Aca van los logos e imagenes estaticas que se compilan (preferentemente en .svg)
│   │   └── hero.png
│   ├── components/                 # Los componentes visuales del sistema
│   │   ├── layout/                 
│   │   │    └── Layout.jsx         # El layout se puede dividir en sidebar tambien
│   │   ├── ui/                     # Componentes reutilizables
│   │   │    ├── Button.jsx
│   │   │    ├── DataTable.jsx
│   │   │    ├── Input.jsx
│   │   │    └── Modal.jsx
│   │   └── ProtectedRoute.jsx      # Protector de rutas
│   ├── context/
│   │   └── AuthContext.jsx          
│   ├── hooks/
│   │   └── useOfflineSync.js       # Hook para guardar comprobantes sin internet
│   ├── pages/
│   │   ├── auth/
│   │   │    ├── Login.jsx
│   │   │    └── OlvidePassword.jsx
│   │   ├── control/
│   │   │    ├── Auditoria.jsx
│   │   │    └── Reportes.jsx
│   │   ├── error/
│   │   │    └── NotFound.jsx
│   │   └── operaciones/
│   │        ├── Clientes.jsx
│   │        ├── Comprobantes.jsx
│   │        ├── CuentasCorrientes.jsx
│   │        └── Pagos.jsx
│   ├── utils/        
│   │   └── formatters.js           # Para formatear plata y fechas
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│                  
├── .env                            # Aca pones la URL del backend de produccion o desarrollo
├── .gitignore
├── .dockerignore
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
└── Dockerfile
```

# 📦 DaniPak - Sistema de Gestión Logística

Plataforma integral diseñada para la gestión logística, control de cuentas corrientes, facturación y seguimiento de envíos. Construida bajo una arquitectura modular y un enfoque **Mobile-First (PWA)** para garantizar un acceso ágil tanto en escritorio como en dispositivos móviles de los operadores.

El sistema prioriza la interacción directa con el cliente en sus flujos de trabajo, prescindiendo de pasarelas de pago automatizadas en favor de una gestión validada y controlada manualmente.

---

## 🛠 Stack Tecnológico

El proyecto está estructurado como un **Monorepo** dividiendo claramente las responsabilidades:

### Frontend

- **Framework:** React + Vite (Configurado como Progressive Web App - PWA)
- **Estilos:** Tailwind CSS (Sistema de diseño centralizado)
- **Ruteo & Autenticación:** React Router DOM v6 + Context API (JWT)
- **Peticiones HTTP:** Axios (con interceptores configurados)

### Backend

- **Framework:** FastAPI (Python 3.11)
- **Base de Datos:** PostgreSQL
- **ORM & Validación:** SQLAlchemy + Pydantic
- **Autenticación:** OAuth2 (JWT Tokens) con hashing de contraseñas

### Infraestructura & DevOps

- **Contenedores:** Docker & Docker Compose
- **CI/CD:** GitHub Actions (Integración Continua)
- **Despliegue:** Railway (Despliegue Continuo)

---

## 🏗 Arquitectura del Proyecto

```bash
sistema_gestion_logistica_danipak/
├── .github/workflows/      # Pipelines de CI/CD (GitHub Actions)
├── backend/                # API RESTful (FastAPI)
│   ├── app/                # Lógica de negocio (CRUDs, Modelos, Schemas, Routers)
│   ├── requirements.txt    # Dependencias de Python
│   └── Dockerfile          # Configuración del contenedor Backend
├── frontend/               # Cliente Web (React)
│   ├── src/                # Componentes, Hooks, Contexto y Vistas
│   ├── vite.config.js      # Tokens de diseño y variables CSS
│   ├── Dockerfile          # Configuracion del contenedor Frontend
│   └── package.json        # Dependencias 
├── docker-compose.yml      # Orquestación de servicios locales
└── README.md
```

---

## 🔒 Flujo de Trabajo y CI/CD

El repositorio cuenta con protección estricta en la rama `main` para garantizar que la producción nunca se rompa.

**Reglas de despliegue:**

1. **Desarrollo:** Todo el desarrollo se realiza en ramas secundarias (ej: `feat/nueva-funcion`).
2. **Pull Requests:** Al abrir un PR hacia `main`, **GitHub Actions** levanta un entorno aislado que valida:
   - La correcta instalación y compilación del Backend.
   - La correcta instalación y compilación del Frontend.
3. **Merge:** Solo cuando ambos *checks* pasan a verde, se permite el merge.
4. **Despliegue Continuo (CD):** Railway escucha la rama `main`. Al detectarse un merge exitoso, despliega automáticamente los cambios en producción.

---

## 👨‍💻 Autor

Realizado por **GB Soluciones Digitales**

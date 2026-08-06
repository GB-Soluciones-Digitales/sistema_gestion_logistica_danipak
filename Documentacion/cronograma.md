# Cronograma

Plan de trabajo resumido y con estilo. Duración total: 45 días.

---

## Semana 1 (Días 1–3) — Arquitectura inicial

- Configuración de repositorios y estructura de monorepo/microservicios.
- Inicialización de contenedores Docker para aislar servicios.
- Setup inicial del frontend con Vite + PWA.

## Semana 2 (Días 4–6) — Base de datos y auth

- Modelado de la base de datos (esquema inicial).
- Implementación de API de autenticación (JWT).
- Despliegue inicial en Railway (pipeline básico).

## Semana 3 (Días 7–9) — Auditoría y trazabilidad

- Middleware para auditoría: registros inmutables con usuario y timestamp.
- Trazabilidad de acciones críticas.

## Días 10–14 — PWA avanzado y sincronización

- Configuración de Service Workers.
- Estructuración de IndexedDB para guardado local.
- Lógica de Background Sync y pruebas simulando cortes de red.

## Días 15–18 — ABM Clientes y Localidades

- Desarrollo backend y frontend del ABM de clientes.
- Módulo de localidades y relaciones.

## Días 19–23 — Comprobantes y Remitos

- Formularios de Comprobantes de Envío y Remitos.
- Gestión de estados y validaciones de flujo.

## Días 24–27 — Motor de PDFs

- Integración de librería para generación de PDFs.
- Maquetado de plantillas y botones en la UI.

## Días 28–31 — Cuentas Corrientes

- Lógica de Cuentas Corrientes y formulario unificado de cargos.
- Manejo de saldos independientes.

## Días 32–35 — Módulo de Pagos

- Registro de cobro manual y generación de recibos PDF.
- Integración con métodos de pago (si aplica).

## Días 36–38 — Control contable

- Implementación de Soft Delete en entidades contables.
- Reversión automática de saldos y auditoría de cambios.

## Días 39–41 — Gestión y reportes

- Grilla de gestión (Data-Table) y panel de deudores.
- Ledger individual por cliente.

## Días 42–43 — Exportes y reportes

- Exportaciones a Excel.
- Generación de los 4 reportes clave.

## Días 44–45 — QA y pase a producción

- QA intensivo en modos offline/online.
- Ajustes finales y despliegue a producción.

---

Notas:

- Priorizar pruebas automatizadas en paralelo.
- Iterar por sprints de 3–5 días según hallazgos.

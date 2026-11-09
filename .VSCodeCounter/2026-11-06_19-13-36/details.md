# Details

Date : 2026-11-06 19:13:36

Directory c:\\Users\\LOQ\\OneDrive\\Documentos\\Proyectos\\sistema_gestion_logistica_danipak\\backend

Total : 63 files,  2488 codes, 244 comments, 615 blanks, all 3347 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/Dockerfile](/backend/Dockerfile) | Docker | 8 | 0 | 6 | 14 |
| [backend/alembic.ini](/backend/alembic.ini) | Ini | 123 | 0 | 27 | 150 |
| [backend/alembic/env.py](/backend/alembic/env.py) | Python | 51 | 29 | 19 | 99 |
| [backend/alembic/versions/0c696cf8caa1\_permite\_remitentes\_ocasionales\_.py](/backend/alembic/versions/0c696cf8caa1_permite_remitentes_ocasionales_.py) | Python | 17 | 14 | 8 | 39 |
| [backend/alembic/versions/23627b9c256c\_agrega\_mes\_a\_movimientos\_cc.py](/backend/alembic/versions/23627b9c256c_agrega_mes_a_movimientos_cc.py) | Python | 11 | 14 | 8 | 33 |
| [backend/alembic/versions/377b96a640e8\_creacion\_tablas\_iniciales.py](/backend/alembic/versions/377b96a640e8_creacion_tablas_iniciales.py) | Python | 140 | 14 | 8 | 162 |
| [backend/alembic/versions/425f60d229d6\_crear\_empresa.py](/backend/alembic/versions/425f60d229d6_crear_empresa.py) | Python | 21 | 8 | 5 | 34 |
| [backend/alembic/versions/69be43ce3500\_agrega\_localidad\_id\_a\_clientes.py](/backend/alembic/versions/69be43ce3500_agrega_localidad_id_a_clientes.py) | Python | 13 | 14 | 8 | 35 |
| [backend/alembic/versions/a1f0c0de0001\_domicilio\_opcional\_en\_comprobantes.py](/backend/alembic/versions/a1f0c0de0001_domicilio_opcional_en_comprobantes.py) | Python | 15 | 10 | 8 | 33 |
| [backend/alembic/versions/a1f0c0de0002\_cuit\_cliente\_no\_unico.py](/backend/alembic/versions/a1f0c0de0002_cuit_cliente_no_unico.py) | Python | 12 | 10 | 8 | 30 |
| [backend/alembic/versions/a1f0c0de0003\_agrega\_estado\_a\_facturas.py](/backend/alembic/versions/a1f0c0de0003_agrega_estado_a_facturas.py) | Python | 11 | 10 | 8 | 29 |
| [backend/alembic/versions/a1f0c0de0004\_crea\_tabla\_pagos\_facturas.py](/backend/alembic/versions/a1f0c0de0004_crea_tabla_pagos_facturas.py) | Python | 18 | 10 | 8 | 36 |
| [backend/alembic/versions/b57c9546ab17\_agrega\_numero\_referencia\_a\_movimientos.py](/backend/alembic/versions/b57c9546ab17_agrega_numero_referencia_a_movimientos.py) | Python | 11 | 14 | 8 | 33 |
| [backend/alembic/versions/f56a7caa32f0\_crea\_tabla\_empresas.py](/backend/alembic/versions/f56a7caa32f0_crea_tabla_empresas.py) | Python | 17 | 14 | 7 | 38 |
| [backend/app/api/controllers/auditoria.py](/backend/app/api/controllers/auditoria.py) | Python | 30 | 0 | 4 | 34 |
| [backend/app/api/controllers/auth.py](/backend/app/api/controllers/auth.py) | Python | 87 | 14 | 25 | 126 |
| [backend/app/api/controllers/clientes.py](/backend/app/api/controllers/clientes.py) | Python | 25 | 0 | 7 | 32 |
| [backend/app/api/controllers/comprobantes.py](/backend/app/api/controllers/comprobantes.py) | Python | 175 | 12 | 40 | 227 |
| [backend/app/api/controllers/empresa.py](/backend/app/api/controllers/empresa.py) | Python | 25 | 0 | 10 | 35 |
| [backend/app/api/controllers/facturas.py](/backend/app/api/controllers/facturas.py) | Python | 32 | 0 | 9 | 41 |
| [backend/app/api/controllers/localidad.py](/backend/app/api/controllers/localidad.py) | Python | 25 | 0 | 8 | 33 |
| [backend/app/api/controllers/movimientos\_cc.py](/backend/app/api/controllers/movimientos_cc.py) | Python | 42 | 0 | 12 | 54 |
| [backend/app/api/controllers/pagos.py](/backend/app/api/controllers/pagos.py) | Python | 41 | 0 | 13 | 54 |
| [backend/app/api/controllers/reportes.py](/backend/app/api/controllers/reportes.py) | Python | 11 | 0 | 3 | 14 |
| [backend/app/api/controllers/usuarios.py](/backend/app/api/controllers/usuarios.py) | Python | 53 | 4 | 16 | 73 |
| [backend/app/api/deps.py](/backend/app/api/deps.py) | Python | 39 | 8 | 9 | 56 |
| [backend/app/core/config.py](/backend/app/core/config.py) | Python | 11 | 4 | 6 | 21 |
| [backend/app/core/limiter.py](/backend/app/core/limiter.py) | Python | 3 | 1 | 1 | 5 |
| [backend/app/core/security.py](/backend/app/core/security.py) | Python | 44 | 7 | 15 | 66 |
| [backend/app/crud/crud\_auditoria.py](/backend/app/crud/crud_auditoria.py) | Python | 55 | 1 | 12 | 68 |
| [backend/app/crud/crud\_cliente.py](/backend/app/crud/crud_cliente.py) | Python | 66 | 0 | 15 | 81 |
| [backend/app/crud/crud\_comprobante.py](/backend/app/crud/crud_comprobante.py) | Python | 104 | 0 | 25 | 129 |
| [backend/app/crud/crud\_empresa.py](/backend/app/crud/crud_empresa.py) | Python | 46 | 0 | 10 | 56 |
| [backend/app/crud/crud\_factura.py](/backend/app/crud/crud_factura.py) | Python | 91 | 0 | 20 | 111 |
| [backend/app/crud/crud\_localidad.py](/backend/app/crud/crud_localidad.py) | Python | 61 | 0 | 18 | 79 |
| [backend/app/crud/crud\_movimientoCC.py](/backend/app/crud/crud_movimientoCC.py) | Python | 163 | 0 | 38 | 201 |
| [backend/app/crud/crud\_pago.py](/backend/app/crud/crud_pago.py) | Python | 141 | 3 | 29 | 173 |
| [backend/app/crud/crud\_reportes.py](/backend/app/crud/crud_reportes.py) | Python | 36 | 4 | 6 | 46 |
| [backend/app/crud/crud\_usuario.py](/backend/app/crud/crud_usuario.py) | Python | 89 | 0 | 22 | 111 |
| [backend/app/db/base.py](/backend/app/db/base.py) | Python | 2 | 0 | 1 | 3 |
| [backend/app/db/session.py](/backend/app/db/session.py) | Python | 5 | 0 | 3 | 8 |
| [backend/app/main.py](/backend/app/main.py) | Python | 65 | 1 | 9 | 75 |
| [backend/app/models/Auditoria.py](/backend/app/models/Auditoria.py) | Python | 13 | 0 | 3 | 16 |
| [backend/app/models/Cliente.py](/backend/app/models/Cliente.py) | Python | 19 | 0 | 3 | 22 |
| [backend/app/models/Comprobante.py](/backend/app/models/Comprobante.py) | Python | 27 | 3 | 8 | 38 |
| [backend/app/models/Empresa.py](/backend/app/models/Empresa.py) | Python | 10 | 0 | 2 | 12 |
| [backend/app/models/Factura.py](/backend/app/models/Factura.py) | Python | 17 | 0 | 3 | 20 |
| [backend/app/models/Localidad.py](/backend/app/models/Localidad.py) | Python | 10 | 0 | 3 | 13 |
| [backend/app/models/MovimientoCC.py](/backend/app/models/MovimientoCC.py) | Python | 17 | 0 | 3 | 20 |
| [backend/app/models/Pago.py](/backend/app/models/Pago.py) | Python | 23 | 1 | 5 | 29 |
| [backend/app/models/Usuario.py](/backend/app/models/Usuario.py) | Python | 16 | 0 | 3 | 19 |
| [backend/app/schemas/auditoria.py](/backend/app/schemas/auditoria.py) | Python | 20 | 0 | 4 | 24 |
| [backend/app/schemas/auth.py](/backend/app/schemas/auth.py) | Python | 11 | 0 | 4 | 15 |
| [backend/app/schemas/cliente.py](/backend/app/schemas/cliente.py) | Python | 28 | 0 | 5 | 33 |
| [backend/app/schemas/comprobante.py](/backend/app/schemas/comprobante.py) | Python | 33 | 0 | 9 | 42 |
| [backend/app/schemas/empresa.py](/backend/app/schemas/empresa.py) | Python | 19 | 0 | 4 | 23 |
| [backend/app/schemas/factura.py](/backend/app/schemas/factura.py) | Python | 23 | 0 | 5 | 28 |
| [backend/app/schemas/localidad.py](/backend/app/schemas/localidad.py) | Python | 18 | 0 | 5 | 23 |
| [backend/app/schemas/movimiento\_cc.py](/backend/app/schemas/movimiento_cc.py) | Python | 24 | 0 | 5 | 29 |
| [backend/app/schemas/pago.py](/backend/app/schemas/pago.py) | Python | 30 | 0 | 6 | 36 |
| [backend/app/schemas/usuario.py](/backend/app/schemas/usuario.py) | Python | 27 | 0 | 7 | 34 |
| [backend/app/services/email.py](/backend/app/services/email.py) | Python | 24 | 20 | 5 | 49 |
| [backend/requirements.txt](/backend/requirements.txt) | pip requirements | 44 | 0 | 1 | 45 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)
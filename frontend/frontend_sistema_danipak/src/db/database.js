import Dexie from 'dexie';

/**
 * PATRÓN DE ARQUITECTURA OFFLINE:
 * El soporte offline y la caché local están limitados intencionalmente al flujo 
 * operativo principal (comprobantes, clientes, localidades). 
 * Los módulos administrativos y financieros (facturas, pagos, movimientos, usuarios) 
 * no tienen fallback offline; requieren conexión obligatoria para garantizar 
 * la seguridad y consistencia de los datos sensibles.
 */

export const db = new Dexie('DaniPakDB');

// V1: Estructura original
db.version(1).stores({
  sync_queue: '++id, endpoint, method, timestamp', 
  cache_clientes: 'id, razon_social, cuit_dni, estado', 
  cache_localidades: 'id, nombre, codigo_postal, estado', 
  cache_comprobantes: 'id, numero_comprobante, fecha_emision, estado'
});

// V2: Agregamos 'retries' a la cola offline
db.version(2).stores({
  sync_queue: '++id, endpoint, method, timestamp, retries', 
  cache_clientes: 'id, razon_social, cuit_dni, estado', 
  cache_localidades: 'id, nombre, codigo_postal, estado', 
  cache_comprobantes: 'id, numero_comprobante, fecha_emision, estado'
});

db.open().catch(function (err) {
    console.error('Error al abrir Dexie: ' + err.stack);
});
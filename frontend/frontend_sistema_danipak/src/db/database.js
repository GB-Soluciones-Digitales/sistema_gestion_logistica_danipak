import Dexie from 'dexie';

export const db = new Dexie('DaniPakDB');

db.version(1).stores({
  sync_queue: '++id, endpoint, method, timestamp', 
  cache_clientes: 'id, razon_social, cuit_dni, estado', 
  cache_localidades: 'id, nombre, codigo_postal, estado', 
  cache_comprobantes: 'id, numero_comprobante, fecha_emision, estado'
});

db.open().catch(function (err) {
    console.error('Error al abrir Dexie: ' + err.stack);
});
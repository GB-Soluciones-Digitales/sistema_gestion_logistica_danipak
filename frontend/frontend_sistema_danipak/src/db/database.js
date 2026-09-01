import Dexie from 'dexie';

export const db = new Dexie('DaniPakDB');

db.version(1).stores({
  sync_queue: '++id, endpoint, method, timestamp', // Cola de peticiones fallidas
  cache_clientes: 'id, razon_social, cuit_dni, estado', // Caché de lectura
  cache_localidades: 'id, nombre, codigo_postal, estado' // Caché de lectura
});
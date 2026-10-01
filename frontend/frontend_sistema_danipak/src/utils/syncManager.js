import { db } from '../db/database';
import { toast } from 'sonner';

// Función para avisar al Layout que hay cambios en la cola
const notifyQueueChange = () => {
  window.dispatchEvent(new Event('sync-queue-changed'));
};

export const addToSyncQueue = async (endpoint, method, payload) => {
  await db.sync_queue.add({
    endpoint,
    method,
    payload,
    timestamp: new Date().toISOString()
  });
  notifyQueueChange();
};

export const processSyncQueue = async () => {
  const pendingRequests = await db.sync_queue.toArray();
  if (pendingRequests.length === 0) return false;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');
  let syncedSomething = false;

  for (const req of pendingRequests) {
    try {
      const response = await fetch(`${baseUrl}${req.endpoint}`, {
        method: req.method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(req.payload)
      });

      if (response.ok) {
        await db.sync_queue.delete(req.id);
        syncedSomething = true;
        notifyQueueChange();
      } else if (response.status === 400 || response.status === 422) {
        console.error(`Payload rechazado por el servidor (${response.status}). Eliminando de la cola para no bloquear:`, req);
        await db.sync_queue.delete(req.id);
        notifyQueueChange();
        toast.error('Un comprobante no pudo enviarse por datos inválidos y fue descartado.');
      } else if (response.status === 401) {
        break;
      }
    } catch (error) {
      console.error("Fallo de red al procesar petición encolada", error);
      break; 
    }
  }
  
  return syncedSomething;
};
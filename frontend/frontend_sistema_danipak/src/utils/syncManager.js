import { db } from '../db/database';

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
      }
    } catch (error) {
      console.error("Fallo al procesar petición encolada", error);
      break; 
    }
  }
  
  return syncedSomething;
};
import { db } from '../db/database';
import { toast } from 'sonner';
import api from '../api/axios';

// Función para avisar al Layout que hay cambios en la cola
const notifyQueueChange = () => {
  window.dispatchEvent(new Event('sync-queue-changed'));
};

export const addToSyncQueue = async (endpoint, method, payload) => {
  await db.sync_queue.add({
    endpoint,
    method,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0
  });
  notifyQueueChange();
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return false;

  const pendingRequests = await db.sync_queue.toArray();
  if (pendingRequests.length === 0) return false;

  let syncedSomething = false;

  for (const req of pendingRequests) {
    try {
      await api({
        url: req.endpoint,
        method: req.method,
        data: req.payload
      });

      await db.sync_queue.delete(req.id);
      syncedSomething = true;
      notifyQueueChange();

    } catch (error) {
      console.error("Fallo de red al procesar petición encolada", error);

      const currentRetries = req.retries || 0;
      const status = error.response?.status;

      // Si el error es un 4xx (ej. 400 o 422) que no sea 401, los datos están mal.
      const isClientError = status >= 400 && status < 500 && status !== 401;
      
      if (currentRetries >= 3 || isClientError) {
        // Superó el límite o es un error incorregible de formato: lo descartamos
        await db.sync_queue.delete(req.id);
        notifyQueueChange();
        
        if (isClientError) {
          toast.error('Un comprobante no pudo enviarse por datos inválidos y fue descartado.');
        } else {
          toast.error('Un registro fue descartado tras fallar múltiples veces por problemas de conexión.');
        }
      } else {
        // Sumamos un intento y guardamos en Dexie
        await db.sync_queue.update(req.id, { retries: currentRetries + 1 });
        
        // Si falló por red/timeout, cortamos el bucle acá porque los demás también van a fallar
        if (!error.response || status >= 500) {
            break;
        }
      } 
    }
  }
  
  return syncedSomething;
};
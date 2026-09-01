import axios from 'axios';
import { toast } from 'sonner';
import { addToSyncQueue } from '../utils/syncManager';

// Usamos la variable de entorno, VITE_API_URL, para configurar la URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Intercepta la peticion y le inyecta el token antes de que la petición salga
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.params) {
      const cleanParams = {};
      for (const key in config.params) {
        const value = config.params[key];
        if (value !== "" && value !== null && value !== undefined) {
          cleanParams[key] = value;
        }
      }
      config.params = cleanParams;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepta la respuesta y maneja errores globales (ej: Token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError = error.code === 'ERR_NETWORK' || error.message.includes('Network Error');
    const isPostRequest = error.config?.method?.toLowerCase() === 'post';

    if (isNetworkError) {
      if (isPostRequest) {
        await addToSyncQueue(
          error.config.url,
          error.config.method,
          JSON.parse(error.config.data)
        );
        toast.warning('Sin conexión. Registro guardado localmente para envío posterior.');
        
        // Simula un éxito devolviendo una ID temporal
        return Promise.resolve({ data: { offline: true, id: 'PENDIENTE-' + Date.now() } });
      } else {
        toast.error('Sin conexión al servidor para cargar los datos.');
      }
    }

    // Maneja los errores HTTP
    else if (error.response) {
      if (error.response.status === 429) {
        toast.error('Demasiados intentos. Por seguridad, espere un minuto antes de volver a intentar.');
      }
      else if (error.response.status === 401) {
        toast.error('Su sesión ha expirado.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status >= 500) {
         toast.error('Error interno del servidor.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
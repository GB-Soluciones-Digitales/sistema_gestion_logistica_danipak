import axios from 'axios';
import { toast } from 'sonner';

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
  (error) => {
    // Detecta si se cae el internet o se cae el backend
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      toast.error('Sin conexión al servidor. Verifique su internet o contacte a soporte.', {
        duration: 5000,
      });
    }

    // Detecta si esta tardando demasiado
    else if (error.code === 'ECONNABORTED') {
      toast.warning('El servidor está tardando demasiado en responder.');
    }

    // Maneja los errores HTTP
    else if (error.response) {
      if (error.response.status === 401) {
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
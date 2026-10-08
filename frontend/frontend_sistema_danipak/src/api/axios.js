import axios from 'axios';
import { toast } from 'sonner';
import { addToSyncQueue } from '../utils/syncManager';

// Usamos la variable de entorno, VITE_API_URL, para configurar la URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true
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
    const method = error.config?.method?.toLowerCase();
    const isWriteRequest = method === 'post' || method === 'put' || method === 'delete';
    const originalRequest = error.config;

    if (isNetworkError) {
      // Evitamos encolar intentos de login sin conexión
      if (originalRequest.url.includes('/login')) {
        toast.error('No podés iniciar sesión sin conexión a internet.');
        return Promise.reject(error);
      }

      if (isWriteRequest) {
        // Parseo seguro con try/catch
        let requestData = error.config.data;
        try {
          if (typeof error.config.data === 'string') {
            requestData = JSON.parse(error.config.data);
          }
        } catch (error) {
          console.warn('Payload no es JSON válido, se guarda crudo en la cola local', error);
        }

        await addToSyncQueue(
          error.config.url,
          error.config.method,
          requestData
        );
        toast.warning('Sin conexión. Registro guardado localmente para envío posterior.');
        
        return Promise.resolve({ data: { offline: true, id: 'PENDIENTE-' + Date.now() } });
      } else {
        toast.error('Sin conexión al servidor para cargar los datos.');
      }
    }

    // Maneja los errores HTTP
    else if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {

        // Bloquea el refresh y el modal de sesión si el error viene de un intento de login
        if (originalRequest.url.includes('/login')) {
          return Promise.reject(error);
        }

        // Si ya hay un refresh en proceso, encola la petición
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Pedimos un nuevo token. La cookie de refresh viaja sola gracias a withCredentials
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
          
          const newAccessToken = res.data.access_token;
          localStorage.setItem('token', newAccessToken);

          // Actualizamos el header de la peticion que habia fallado y la disparamos de nuevo
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Libera las peticiones encoladas
          onRefreshed(newAccessToken);
          isRefreshing = false;

          return api(originalRequest);
          
        } catch (refreshError) {
          // Si falla, vacía la cola y expulsa al usuario
          refreshSubscribers = [];
          isRefreshing = false;
          // Si el refresh expira (pasaron los 7 dias), lo sacamos al login
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('session-expired'));
          return Promise.reject(refreshError);
        }
      } 
      
      else if (error.response.status === 429) {
        toast.error('Demasiados intentos. Espere un minuto.');
      } else if (error.response.status >= 500) {
         toast.error('Error interno del servidor.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
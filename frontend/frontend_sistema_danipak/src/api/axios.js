import axios from 'axios';

// Usamos la variable de entorno, VITE_API_URL, para configurar la URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
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
    if (error.response && error.response.status === 401) {
      // Si el backend dice "No autorizado", se borra el token y se redirige al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
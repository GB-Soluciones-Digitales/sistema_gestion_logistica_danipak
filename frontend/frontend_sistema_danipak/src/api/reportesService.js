import api from "./axios";

export const reportesService = {
  getResumen: async (fecha = '') => {
    const params = fecha ? { fecha } : {};
    const response = await api.get('/api/reportes/resumen', { params });
    return response.data;
  }
};
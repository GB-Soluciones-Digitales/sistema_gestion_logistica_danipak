import api from "./axios.js";

export const movimientosService = {

    createMovimiento: async (data) => {
        const response = await api.post('/movimientos', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/movimientos');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/moviminetos/${id}`);
        return response.data;
    },

    updateMovimiento: async (id, data) => {
        const response = await api.put(`/movimientos/${id}`, data);
        return response.data;
    },

    anularMovimiento: async (id) => {
        const response = await api.put(`/movimientos/${id}/anular`);
        return response.data;
    },
}
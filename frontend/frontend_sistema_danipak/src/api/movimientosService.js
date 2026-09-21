import api from "./axios.js";

export const movimientosService = {
    createMovimiento: async (data) => {
        const response = await api.post('/api/movimientos/', data);
        return response.data;
    },

    getAllByCliente: async (clienteId, page = 1, limit = 100, anulado = null, filtros = {}) => {
        const skip = (page - 1) * limit;
        const response = await api.get(`/api/movimientos/cliente/${clienteId}`, {
            params: { skip, limit, anulado, ...filtros } 
        });
        return response.data;
    },

    getResumenGeneral: async () => {
        const response = await api.get('/api/movimientos/resumen-general');
        return response.data;
    },
    
    getResumen: async (clienteId) => {
        const response = await api.get(`/api/movimientos/cliente/${clienteId}/resumen`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/movimientos/${id}`);
        return response.data;
    },

    updateMovimiento: async (id, data) => {
        const response = await api.put(`/api/movimientos/${id}`, data);
        return response.data;
    },

    anularMovimiento: async (id) => {
        const response = await api.put(`/api/movimientos/${id}/anular`);
        return response.data;
    },
}
import api from "./axios.js";

export const facturaService = {
    createFactura: async (data) => {
        const response = await api.post('/api/facturas/', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 100, search = "", filtros = {}) => {
        const skip = (page - 1) * limit;
        const response = await api.get('/api/facturas/', { 
            params: { skip, limit, search, ...filtros } 
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/facturas/${id}`);
        return response.data;
    },

    updateFactura: async (id, data) => {
        const response = await api.put(`/api/facturas/${id}`, data);
        return response.data;
    }
}
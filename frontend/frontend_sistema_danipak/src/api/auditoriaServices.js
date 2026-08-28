import api from "./axios";

export const auditoriaService = {

    createAuditoria: async (data) => {
        const response = await api.post('/auditoria/', data)
        return response.data
    },

    getAll: async (page = 1, limit = 100, filtros = {}) => {
        const skip = (page - 1) * limit;
        const response = await api.get('/auditoria/', { params: { skip, limit, ...filtros } });
        return response.data;
    },

    getById: async (tabla, id) => {
        const response = await api.get(`/auditoria/${tabla}/${id}`)
        return response.data
    }
}
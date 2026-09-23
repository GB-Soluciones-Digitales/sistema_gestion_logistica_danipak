import api from "./axios";

export const auditoriaService = {

    getAll: async (page = 1, limit = 100, filtros = {}) => {
        const skip = (page - 1) * limit;
        const params = { skip, limit };

        Object.entries(filtros).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                params[key] = value;
            }
        });

        const response = await api.get('/api/auditoria/', { params });
        return response.data;
    },

    getById: async (tabla, id) => {
        const response = await api.get(`/api/auditoria/${tabla}/${id}`);
        return response.data;
    },
};
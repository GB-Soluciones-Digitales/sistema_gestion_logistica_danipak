import api from "./axios";

export const auditoriaService = {

    createAuditoria: async (data) => {
        const response = await api.post('/auditoria', data)
        return response.data
    },

    getAll: async () => {
        const response = await api.get('/auditoria')
        return response.data.items || []
    },

    getById: async (tabla, id) => {
        const response = await api.get(`/auditoria/${tabla}/${id}`)
        return response.data
    }
}
import api from "./axios"

export const comprobantesService = {

    createComprobante: async (data) => {
        const response = await api.post('/comprobantes', data)
        return response.data
    },

    getAll: async () => {
        const response = await api.get('/compobantes')
        return response.data.items || []
    },

    getById: async (id) => {
        const response = await api.get(`/comprobantes/${id}`)
        return response.data
    },

    updateEstado: async (id, data) => {
        const response = await api.put(`/comprobantes/${id}`, data)
        return response.data
    }

}

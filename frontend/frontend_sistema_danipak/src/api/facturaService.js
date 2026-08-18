import api from "./axios.js";

export const facturaService = {

    createFactura: async (data) => {
        const response = await api.post('/facturas', data)
        return response.data
    },

    getAll: async () => {
        const response = await api.get('/facturas')
        return response.data.items
    },

    getbyId: async (id) => {
        const response = await api.get(`/facturas/${id}`)
        return response.data
    },

    updateFactura: async (id, data) => {
        const response = await api.put(`/facturas/${id}`, data)
        return response.data
    }
}
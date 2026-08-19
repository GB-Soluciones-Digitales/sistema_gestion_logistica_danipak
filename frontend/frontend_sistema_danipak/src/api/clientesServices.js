import api from "./axios";

export const clientesServices = {

    createClientes: async (data) => {
        const response = await api.post('/clientes', data)
        return response.data
    },

    getAll: async () => {
        const response = await api.get('/clientes')
        return response.data.items || []
    },

    getById: async (id) => {
        const response = await api.get(`/clientes/${id}`)
        return response.data
    },

    updateClientes: async (id, data) => {
        const response = await api.put(`/clientes/${id}`, data)
        return response.data 
    }
}
import api from "./axios";

export const clientesServices = {
    createClientes: async (data) => {
        const response = await api.post('/api/clientes/', data)
        return response.data
    },

    getAll: async (page = 1, limit = 10, search = "") => {
        const skip = (page - 1) * limit; 
        
        const response = await api.get('/api/clientes/', { 
            params: { skip, limit, search } 
        });
        return response.data; 
    },

    getById: async (id) => {
        const response = await api.get(`/api/clientes/${id}`)
        return response.data
    },

    updateClientes: async (id, data) => {
        const response = await api.put(`/api/clientes/${id}`, data)
        return response.data 
    }
}
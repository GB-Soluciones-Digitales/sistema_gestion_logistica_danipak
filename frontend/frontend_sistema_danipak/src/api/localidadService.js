import api from "./axios.js";

export const localidadService = {

    createLocalidad: async (data) => {
        const response = await api.post('/localidades', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, search = "") => {
        const skip = (page - 1) * limit; 
        
        const response = await api.get('/localidades', { 
            params: { skip, limit, search } 
        });
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/localidades/${id}`);
        return response.data;
    },

    updateLocalidad: async (id, data) => {
        const response = await api.put(`/localidades/${id}`, data);
        return response.data;
    },
}
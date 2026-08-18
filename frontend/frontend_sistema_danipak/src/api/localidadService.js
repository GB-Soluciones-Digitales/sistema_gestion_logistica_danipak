
import { api } from "./axios.js";

export const localidadService = {

    createLocalidad: async (data) => {
        const response = await api.post('/localidades', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/localidades');
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
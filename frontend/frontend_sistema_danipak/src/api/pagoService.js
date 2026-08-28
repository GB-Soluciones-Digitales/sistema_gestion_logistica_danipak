import api from "./axios.js";

export const pagoService = {

    createPago: async (data) => {
        const response = await api.post('/pagos/', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 50, search = "") => {
        const skip = (page - 1) * limit;
        const response = await api.get('/pagos/', { 
            params: { skip, limit, search } 
        });
        return response.data;
    },

    getById: async(id) => {
        const response = await api.get(`/pagos/${id}`)
        return response.data;
    },

    updatePago: async(id,data) => {
        const response = await api.post(`/pagos/${id}`, data);
        return response.data;
    },

    anularPago: async(id) => {
        const response = await api.post(`/pagos/${id}/anular`);
        return response.data;
    },

    
}
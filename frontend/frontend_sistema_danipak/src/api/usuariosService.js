import api from "./axios.js";

export const usuarioService = {

    createUsuario: async(data) => {
        const response = await api.post('/usuarios', data);
        return response.data;
    },

    getAll: async() => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    getById: async(id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    updateUsuario: async(id,data) => {
        const response = await api.post(`/usuarios/${id}`, data);
        return response.data;
    },
}
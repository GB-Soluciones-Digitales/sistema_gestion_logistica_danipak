import api from "./axios.js";

export const usuarioService = {

    createUsuario: async(data) => {
        const response = await api.post('/api/usuarios/', data);
        return response.data;
    },

    getAll: async(page = 1, limit = 100, search = "") => {
        const skip = (page - 1) * limit;
        const response = await api.get('/api/usuarios/', { 
            params: { skip, limit, search } 
        });
        return response.data;
    },

    getById: async(id) => {
        const response = await api.get(`/api/usuarios/${id}`);
        return response.data;
    },

    updateUsuario: async(id,data) => {
        const response = await api.put(`/api/usuarios/${id}`, data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/api/usuarios/me');
        return response.data;
    },

    updateMe: async (data) => {
        const response = await api.put('/api/usuarios/me', data);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.put("/api/auth/me/password", data);
        return response.data;
    },

    solicitarRecuperacion: async (email) => {
        const response = await api.post('/api/auth/olvide-password', { email });
        return response.data;
    },

    resetearPassword: async (token, nueva_password) => {
        const response = await api.post('/api/auth/reset-password', { 
            token, 
            nueva_password 
        });
        return response.data;
    }
}
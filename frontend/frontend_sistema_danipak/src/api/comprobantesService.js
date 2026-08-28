import api from "./axios"

export const comprobantesService = {

    getUltimoNumero: async () => {
        const response = await api.get('/comprobantes/ultimo-numero');
        return response.data; 
    },

    createComprobante: async (data) => {
        const response = await api.post('/api/comprobantes/', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, search = "", filtros = {}) => {
        const skip = (page - 1) * limit;

        const { tipo, cliente_id, localidad_id, mes } = filtros;

        const response = await api.get('/api/comprobantes/', {
            params: {
                skip,
                limit,
                search,
                tipo,
                cliente_id,
                localidad_id,
                mes
            }
        });

        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/comprobantes/${id}`)
        return response.data
    },

    updateEstado: async (id, data) => {
        const response = await api.put(`/api/comprobantes/${id}`, data)
        return response.data
    },

    descargarPdf: async (id) => {
        const response = await api.get(`/comprobantes/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }

}

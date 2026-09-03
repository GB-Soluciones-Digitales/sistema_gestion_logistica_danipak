import api from "./axios";
import { db } from "../db/database"; 

export const comprobantesService = {
    getUltimoNumero: async () => {
        const response = await api.get('/api/comprobantes/ultimo-numero');
        return response.data; 
    },

    createComprobante: async (data) => {
        const response = await api.post('/api/comprobantes/', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, search = "", filtros = {}) => {
        if (!navigator.onLine) {
            let offlineItems = await db.cache_comprobantes.toArray();
            
            if (search) {
                const searchLower = search.toLowerCase();
                offlineItems = offlineItems.filter(item => 
                    item.numero_comprobante?.toLowerCase().includes(searchLower) ||
                    item.nombre_destinatario?.toLowerCase().includes(searchLower)
                );
            }
            
            const skip = (page - 1) * limit;
            const paginatedItems = offlineItems.slice(skip, skip + limit);
            return { items: paginatedItems, total: offlineItems.length };
        }

        try {
            const skip = (page - 1) * limit;
            const response = await api.get('/api/comprobantes/', { 
                params: { skip, limit, search, ...filtros } 
            });
            
            if (response.data && response.data.items) {
                await db.cache_comprobantes.clear();
                await db.cache_comprobantes.bulkAdd(response.data.items);
            }
            return response.data;
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                const offlineItems = await db.cache_comprobantes.toArray();
                const skip = (page - 1) * limit;
                return { 
                    items: offlineItems.slice(skip, skip + limit), 
                    total: offlineItems.length 
                };
            }
            throw error;
        }
    },

    getById: async (id) => {
        if (!navigator.onLine) {
            const item = await db.cache_comprobantes.get(Number(id));
            if (item) return item;
        }
        const response = await api.get(`/api/comprobantes/${id}`);
        return response.data;
    },

    updateEstado: async (id, data) => {
        const response = await api.put(`/api/comprobantes/${id}`, data)
        return response.data
    }
};
import api from "./axios.js";
import { db } from "../utils/database";

export const localidadService = {
    createLocalidad: async (data) => {
        const response = await api.post('/api/localidades/', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, search = "") => {
        if (!navigator.onLine) {
            let offlineItems = await db.cache_localidades.toArray();
            
            if (search) {
                const searchLower = search.toLowerCase();
                offlineItems = offlineItems.filter(item => 
                    item.nombre?.toLowerCase().includes(searchLower) ||
                    item.codigo_postal?.toLowerCase().includes(searchLower)
                );
            }
            
            const skip = (page - 1) * limit;
            const paginatedItems = offlineItems.slice(skip, skip + limit);
            return { items: paginatedItems, total: offlineItems.length };
        }

        try {
            const skip = (page - 1) * limit; 
            const response = await api.get('/api/localidades/', { 
                params: { skip, limit, search } 
            });
            
            if (response.data && response.data.items) {
                await db.cache_localidades.clear();
                await db.cache_localidades.bulkAdd(response.data.items);
            }
            return response.data;
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                const offlineItems = await db.cache_localidades.toArray();
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
            const item = await db.cache_localidades.get(Number(id));
            if (item) return item;
        }
        const response = await api.get(`/api/localidades/${id}`);
        return response.data;
    },

    updateLocalidad: async (id, data) => {
        const response = await api.put(`/api/localidades/${id}`, data);
        return response.data;
    }
};
import api from "./axios";
import { db } from "../db/database"; 

export const clientesServices = {
    createClientes: async (data) => {
        const response = await api.post('/api/clientes/', data)
        return response.data
    },

    getAll: async (page = 1, limit = 10, search = "") => {
        if (!navigator.onLine) {
            let offlineItems = await db.cache_clientes.toArray();
            
            if (search) {
                const searchLower = search.toLowerCase();
                offlineItems = offlineItems.filter(item => 
                    item.razon_social?.toLowerCase().includes(searchLower) ||
                    item.cuit_dni?.toLowerCase().includes(searchLower) ||
                    item.nombre_fantasia?.toLowerCase().includes(searchLower)
                );
            }
            
            const skip = (page - 1) * limit;
            const paginatedItems = offlineItems.slice(skip, skip + limit);
            return { items: paginatedItems, total: offlineItems.length };
        }

        try {
            const skip = (page - 1) * limit; 
            const response = await api.get('/api/clientes/', { 
                params: { skip, limit, search } 
            });
            
            if (response.data && response.data.items) {
                await db.cache_clientes.clear();
                await db.cache_clientes.bulkAdd(response.data.items);
            }
            return response.data; 
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                const offlineItems = await db.cache_clientes.toArray();
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
            const item = await db.cache_clientes.get(Number(id));
            if (item) return item;
        }
        const response = await api.get(`/api/clientes/${id}`)
        return response.data
    },

    updateClientes: async (id, data) => {
        const response = await api.put(`/api/clientes/${id}`, data)
        return response.data 
    }
};
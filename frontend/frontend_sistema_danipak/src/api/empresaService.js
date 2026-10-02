import api from "./axios"

export const empresaService = {

    createEmpresa: async(data) => {
        const response = await api.post("/api/empresa/", data)
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/api/empresa/${id}`)
        return response.data
    },

    updateEmpresa: async(id,data) => {
        const response = await api.put(`/api/empresa/${id}`,data)
        return response.data

    }
}
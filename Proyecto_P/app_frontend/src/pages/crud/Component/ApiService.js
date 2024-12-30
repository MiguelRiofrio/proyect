import api from "../../../routes/api";

// Exportaciones con nombre
export const getData = (endpoint) => api.get(endpoint);
export const createData = (endpoint, data) => api.post(endpoint, data);
export const ReadData = (endpoint, id, data) => api.get(`${endpoint}${id}/`, data);
export const updateData = (endpoint, id, data) => api.put(`${endpoint}${id}/`, data);
export const deleteData = (endpoint, id) => api.delete(`${endpoint}${id}/`);

// Exportación por defecto (opcional)
export default api;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const auth = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export const etablissements = {
    getAll: () => api.get('/etablissements'),
    getOne: (code) => api.get(`/etablissements/${code}`),
    create: (data) => api.post('/etablissements', data),
    update: (code, data) => api.put(`/etablissements/${code}`, data),
    delete: (code) => api.delete(`/etablissements/${code}`),
};

export const kits = {
    getAll: () => api.get('/kits'),
    getOne: (id) => api.get(`/kits/${id}`),
    create: (data) => api.post('/kits', data),
    update: (id, data) => api.put(`/kits/${id}`, data),
    delete: (id) => api.delete(`/kits/${id}`),
};

export const distributions = {
    getAll: () => api.get('/distributions'),
    getOne: (id) => api.get(`/distributions/${id}`),
    create: (data) => api.post('/distributions', data),
    update: (id, data) => api.put(`/distributions/${id}`, data),
    delete: (id) => api.delete(`/distributions/${id}`),
    getStats: () => api.get('/distributions/stats'),
};

export default api;
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('parchi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('parchi_token');
      localStorage.removeItem('parchi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const parchiTypesAPI = {
  getAll: () => api.get('/parchi-types'),
  create: (data) => api.post('/parchi-types', data),
  update: (id, data) => api.put(`/parchi-types/${id}`, data),
  toggle: (id) => api.patch(`/parchi-types/${id}/toggle`),
  resetSerial: (id) => api.patch(`/parchi-types/${id}/reset-serial`),
  delete: (id) => api.delete(`/parchi-types/${id}`),
};

export const ticketsAPI = {
  create: (data) => api.post('/tickets', data),
  createBatch: (data) => api.post('/tickets/batch', data),
  getAll: (params) => api.get('/tickets', { params }),
  deleteBatches: (data) => api.delete('/tickets/batch', { data }),
};

export const membershipTypesAPI = {
  getAll: () => api.get('/membership-types'),
  create: (data) => api.post('/membership-types', data),
  update: (id, data) => api.put(`/membership-types/${id}`, data),
  toggle: (id) => api.patch(`/membership-types/${id}/toggle`),
  delete: (id) => api.delete(`/membership-types/${id}`),
};

export const membershipsAPI = {
  getAll: (params) => api.get('/memberships', { params }),
  create: (data) => api.post('/memberships', data),
};

export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getOperators: () => api.get('/reports/operators'),
  getDaily: (params) => api.get('/reports/daily', { params }),
  getShift: (params) => api.get('/reports/shift', { params }),
  getBatch: (params) => api.get('/reports/batch', { params }),
};

export default api;
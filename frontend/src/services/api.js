import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusfind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('campusfind_token');
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Users Endpoints
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  deactivateAccount: () => api.delete('/users/account'),
  getMyLostItems: (status) => api.get('/users/me/lost-items', { params: { status } }),
  getMyFoundItems: (status) => api.get('/users/me/found-items', { params: { status } }),
};

// Lost Items Endpoints
export const lostItemsApi = {
  getAll: (params) => api.get('/lost-items', { params }),
  getById: (id) => api.get(`/lost-items/${id}`),
  create: (data) => api.post('/lost-items', data),
  createWithFiles: (formData) =>
    api.post('/lost-items/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/lost-items/${id}`, data),
  delete: (id) => api.delete(`/lost-items/${id}`),
  updateStatus: (id, status) => api.patch(`/lost-items/${id}/status`, { status }),
  getMatches: (id) => api.get(`/lost-items/${id}/matches`),
};

// Found Items Endpoints
export const foundItemsApi = {
  getAll: (params) => api.get('/found-items', { params }),
  getById: (id) => api.get(`/found-items/${id}`),
  create: (data) => api.post('/found-items', data),
  createWithFiles: (formData) =>
    api.post('/found-items/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/found-items/${id}`, data),
  delete: (id) => api.delete(`/found-items/${id}`),
  updateStatus: (id, status) => api.patch(`/found-items/${id}/status`, { status }),
  getMatches: (id) => api.get(`/found-items/${id}/matches`),
};

// Claims Endpoints
export const claimsApi = {
  create: (data) => api.post('/claims', data),
  getMyClaims: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  getItemClaims: (itemId) => api.get(`/claims/item/${itemId}`),
  updateStatus: (id, status) => api.patch(`/claims/${id}`, { status }),
};

// Notifications Endpoints
export const notificationsApi = {
  getAll: (page = 1, pageSize = 20) => api.get('/notifications', { params: { page, pageSize } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Matching Endpoints
export const matchesApi = {
  getAll: (minConfidence = 50) => api.get('/matches', { params: { minConfidence } }),
};

// Reports Endpoints
export const reportsApi = {
  create: (data) => api.post('/reports', data),
  getById: (id) => api.get(`/reports/${id}`),
};

// Dashboard Stats Endpoints
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

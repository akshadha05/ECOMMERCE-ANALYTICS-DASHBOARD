import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Analytics APIs
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getRevenueTrends: (params) => api.get('/analytics/revenue-trends', { params }),
  getTopProducts: (params) => api.get('/analytics/top-products', { params }),
  getConversionFunnel: (params) => api.get('/analytics/conversion-funnel', { params }),
  getCategoryPerformance: (params) => api.get('/analytics/category-performance', { params }),
  getDeviceBreakdown: (params) => api.get('/analytics/device-breakdown', { params }),
  getSearchAnalytics: (params) => api.get('/analytics/search-analytics', { params }),
};

// Events APIs
export const eventsAPI = {
  processData: (data) => api.post('/events/process', data),
};

export default api;
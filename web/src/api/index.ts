import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin secret to all requests if available
api.interceptors.request.use((config) => {
  const adminSecret = localStorage.getItem('admin-secret');
  if (adminSecret) {
    config.headers['x-admin-secret'] = adminSecret;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.data;
    }
    return Promise.reject(new Error(res.message || 'Error'));
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(new Error(message));
  }
);

export default api;
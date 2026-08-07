import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses Vite proxy configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

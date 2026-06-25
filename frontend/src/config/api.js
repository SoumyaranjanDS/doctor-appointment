import axios from 'axios';

const api = axios.create({
  baseURL: `/api`, // Proxied through Vite
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  // Only attach dcp_token if an Authorization header isn't already set
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('dcp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

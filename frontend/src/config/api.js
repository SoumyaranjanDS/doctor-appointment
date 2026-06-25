import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Assuming your backend runs on port 8081 based on the .env file
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

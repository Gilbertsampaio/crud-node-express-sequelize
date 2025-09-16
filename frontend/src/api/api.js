import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Adiciona o token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para logout automático
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response?.data?.error === 'logout') {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?sessionExpired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

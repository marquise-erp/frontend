import { CLIENT_API_BASE } from '@/config/api-routes';
import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: CLIENT_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Optional: Handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('auth_token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

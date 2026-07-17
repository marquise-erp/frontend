import { CLIENT_API_BASE } from '@/config/api-routes';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { toApiError } from '@/lib/api-error';

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

    // Inject current scope/tenant context header for all authenticated requests.
    // The backend uses X-Tenant-Scope-ID to know which scope (organization context)
    // the request should be executed under.
    const { isAuthenticated, activeScopeId } = useAuthStore.getState();
    if (isAuthenticated && activeScopeId != null) {
        config.headers['X-Tenant-Scope-ID'] = activeScopeId;
    }

    return config;
});

// Handle 401 globally, and normalize every failure into a typed ApiError
// so callers get a consistent error shape (message + machine-readable code).
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("401 Unauthorized encountered on request:", error.config?.url, error.response?.data);
            Cookies.remove('auth_token');
            const pathname = window.location.pathname;
            const isPublicAuthPath =
                pathname.startsWith('/auth/') || pathname.startsWith('/invite/');
            if (!isPublicAuthPath) {
                const next = encodeURIComponent(pathname + window.location.search);
                window.location.href = `/auth/login?next=${next}`;
            }
        }
        return Promise.reject(toApiError(error));
    }
);

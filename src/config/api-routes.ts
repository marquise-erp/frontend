export const CLIENT_API_BASE = '/api/v1';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const API_ROUTES = {
    ADMIN: {
        AUTH: {
            LOGIN: `/auth/login`,
            LOGOUT: `/auth/logout`,
            ME: `/auth/me`,
            VERIFY_2FA: `/auth/verify-2fa`,
            SWITCH_SCOPE: `/auth/scopes/switch`,
        },
        ROLES: {
            LIST: `/auth/roles`,
            CREATE: `/auth/roles`,
            detail: (id: number | string) => `/auth/roles/${id}`,
            update: (id: number | string) => `/auth/roles/${id}`,
            delete: (id: number | string) => `/auth/roles/${id}`,
        },
        USERS: {
            LIST: `/auth/users`,
            CREATE: `/auth/users`,
            detail: (id: number | string) => `/auth/users/${id}`,
            update: (id: number | string) => `/auth/users/${id}`,
            delete: (id: number | string) => `/auth/users/${id}`,
        },
        ORGANIZATION: {
            ORGANIZATIONS: {
                LIST: `/organization/organizations`,
                CREATE: `/organization/organizations`,
                detail: (id: number | string) => `/organization/organizations/${id}`,
                update: (id: number | string) => `/organization/organizations/${id}`,
                delete: (id: number | string) => `/organization/organizations/${id}`,
            },
            BRANDS: `/organization/brands`,
            BRANCHES: `/branches`,
            SERVICES: `/services`,
            PACKAGES: `/packages`,
        },
        DEAL: {
            AVAILABILITY: `/bookings/availability`,
            CREATE: `/bookings`,
        },
    },
} as const;
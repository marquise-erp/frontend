export const CLIENT_API_BASE = '/api/v1';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const API_ROUTES = {
    ADMIN: {
        AUTH: {
            LOGIN: `/auth/login`,
            LOGOUT: `/auth/logout`,
            ME: `/auth/me`,
            VERIFY_2FA: `/auth/verify-2fa`,
        },
        ORGANIZATION: {
            ORGANIZATIONS: {
                LIST: `/organization/organizations`,
                CREATE: `/organizations`,
                UPDATE: `/organizations/{id}`,
                DELETE: `/organizations/{id}`,
            },
            BRANCHES: `/branches`,
            SERVICES: `/services`,
            PACKAGES: `/packages`,
        },
        DEAL: {
            AVAILABILITY: `/bookings/availability`,
            CREATE: `/bookings`,
        }
    },

} as const;
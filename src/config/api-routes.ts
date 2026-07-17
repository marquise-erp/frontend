export const CLIENT_API_BASE = '/api/v1';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const API_ROUTES = {
    ADMIN: {
        AUTH: {
            LOGIN: `/auth/login`,
            LOGOUT: `/auth/logout`,
            ME: `/auth/me`,
            REGISTER: `/auth/register`,
            VERIFY_2FA: `/auth/verify-2fa`,
            SWITCH_SCOPE: `/auth/scopes/switch`,
            SET_DEFAULT_SCOPE: `/auth/scopes/default`,
            removeScope: (scopeId: number) => `/auth/scopes/${scopeId}`,
        },
        INVITES: {
            detail: (token: string) => `/auth/invites/${token}`,
            accept: (token: string) => `/auth/invites/${token}/accept`,
        },
        ROLES: {
            LIST: `/auth/roles`,
            CREATE: `/auth/roles`,
            PERMISSIONS: `/auth/permissions`,
            detail: (id: number | string) => `/auth/roles/${id}`,
            update: (id: number | string) => `/auth/roles/${id}`,
            delete: (id: number | string) => `/auth/roles/${id}`,
        },
        POSITIONS: {
            LIST: `/auth/positions`,
            CREATE: `/auth/positions`,
            detail: (id: number | string) => `/auth/positions/${id}`,
            update: (id: number | string) => `/auth/positions/${id}`,
            delete: (id: number | string) => `/auth/positions/${id}`,
            accessRules: (id: number | string) => `/auth/positions/${id}/permission-access-rules`,
            syncAccessRules: (id: number | string) =>
                `/auth/positions/${id}/permission-access-rules/sync`,
        },
        CUSTOMER_GROUPS: {
            LIST: `/customer/customer-groups`,
            CREATE: `/customer/customer-groups`,
            detail: (id: number | string) => `/customer/customer-groups/${id}`,
            update: (id: number | string) => `/customer/customer-groups/${id}`,
            delete: (id: number | string) => `/customer/customer-groups/${id}`,
        },
        USERS: {
            LIST: `/auth/users`,
            CREATE: `/auth/users`,
            detail: (id: number | string) => `/auth/users/${id}`,
            update: (id: number | string) => `/auth/users/${id}`,
            delete: (id: number | string) => `/auth/users/${id}`,
        },
        ORGANIZATION: {
            COMMUNICATION: {
                COUNTRIES: `/communication/countries`,
                provinces: (countryId: string | number) => `/communication/countries/${countryId}/provinces`,
                cities: (provinceId: string | number) => `/communication/provinces/${provinceId}/cities`,
            },
            ORGANIZATIONS: {
                LIST: `/organization/organizations`,
                CREATE: `/organization/organizations`,
                detail: (id: number | string) => `/organization/organizations/${id}`,
                update: (id: number | string) => `/organization/organizations/${id}`,
                delete: (id: number | string) => `/organization/organizations/${id}`,
            },
            MEMBERS: {
                ASSIGN: `/organization/members/assign`,
            },
            INVITES: {
                list: (organizationId: number | string) =>
                    `/auth/organizations/${organizationId}/invites`,
                create: (organizationId: number | string) =>
                    `/auth/organizations/${organizationId}/invites`,
                cancel: (invitationId: number | string) =>
                    `/auth/invites/${invitationId}`,
                resend: (invitationId: number | string) =>
                    `/auth/invites/${invitationId}/resend`,
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
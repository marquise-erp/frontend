import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { roleListSchema, permissionListSchema } from "../../schemas/role/responses";
import { useTenantQuery } from "@/lib/tenant-query";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};

export function useRoles() {
  return useTenantQuery({
    queryKey: roleKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.ROLES.LIST, roleListSchema),
  });
}

export function usePermissions() {
  return useTenantQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.ROLES.PERMISSIONS, permissionListSchema),
  });
}

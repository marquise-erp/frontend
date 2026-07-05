import { fetchFromApi, deleteFromApi, postToApi, putToApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api-routes';
import {
  roleListSchema,
  roleSchema
} from '../schemas/rbac.schema';
import { CreateRoleInput, UpdateRoleInput, createRoleSchema, updateRoleSchema } from '../schemas/role-input.schema';
import { useTenantQuery, useTenantMutation } from '@/lib/tenant-query';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
};

export function useRoles() {
  return useTenantQuery({
    queryKey: roleKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.ROLES.LIST, roleListSchema),
  });
}

export function useCreateRole() {
  return useTenantMutation({
    mutationFn: async (data: CreateRoleInput) => {
      // Validate with Zod before sending (defense in depth)
      const parsed = createRoleSchema.parse(data);
      return postToApi(API_ROUTES.ADMIN.ROLES.CREATE, parsed, roleSchema);
    },
  });
}

export function useUpdateRole() {
  return useTenantMutation({
    mutationFn: async (data: UpdateRoleInput) => {
      const parsed = updateRoleSchema.parse(data);
      return putToApi(
        API_ROUTES.ADMIN.ROLES.update(data.id),
        { ...parsed, id: undefined }, // id is in path, not body
        roleSchema,
      );
    },
  });
}

export function useDeleteRole() {
  return useTenantMutation({
    mutationFn: async (id: number | string) =>
      deleteFromApi(API_ROUTES.ADMIN.ROLES.delete(id)),
  });
}


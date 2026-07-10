import { deleteFromApi, postToApi, putToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { roleSchema } from "../../schemas/role/responses";
import { CreateRoleInput, UpdateRoleInput, createRoleSchema, updateRoleSchema } from "../../schemas/role/requests";
import { useTenantMutation } from "@/lib/tenant-query";

export function useCreateRole() {
  return useTenantMutation({
    mutationFn: async (data: CreateRoleInput) => {
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
        { ...parsed, id: undefined },
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

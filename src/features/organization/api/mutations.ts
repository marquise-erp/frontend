import { postToApi, putToApi, deleteFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useTenantMutation } from "@/lib/tenant-query";
import { ORGANIZATION_LEVELS } from "../types/organization-tree";
import { OrganizationResponse, organizationResponseSchema } from "../schemas/responses";
import {
  createOrganizationRequestSchema,
  updateOrganizationRequestSchema,
  type UpdateOrganizationRequest,
  type CreateOrganizationRequest,
} from "../schemas/requests";

export function useCreateOrganization() {
  return useTenantMutation({
    mutationFn: async (data : CreateOrganizationRequest) => {
      const body = createOrganizationRequestSchema.parse(data);

      return postToApi<OrganizationResponse, CreateOrganizationRequest>(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.CREATE,
        body,
        organizationResponseSchema,
      );
    },
  });
}

export function useUpdateOrganization() {
  return useTenantMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateOrganizationRequest }) => {
      const body = updateOrganizationRequestSchema.parse(data);

      return putToApi<OrganizationResponse, UpdateOrganizationRequest>(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.update(id),
        body,
        organizationResponseSchema,
      );
    },
  });
}

export function useDeleteOrganization() {
  return useTenantMutation({
    mutationFn: async (id: number) =>
      deleteFromApi(API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.delete(id)),
  });
}

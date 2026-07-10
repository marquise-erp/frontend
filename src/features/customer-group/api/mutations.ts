import { postToApi, putToApi, deleteFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useTenantMutation } from "@/lib/tenant-query";
import {
  createCustomerGroupRequestSchema,
  updateCustomerGroupRequestSchema,
  type CreateCustomerGroupRequest,
  type UpdateCustomerGroupRequest,
} from "../schemas/requests";
import {
  customerGroupResponseSchema,
  type CustomerGroupResponse,
} from "../schemas/responses";

export function useCreateCustomerGroup() {
  return useTenantMutation({
    mutationFn: async (data: CreateCustomerGroupRequest) => {
      const body = createCustomerGroupRequestSchema.parse(data);

      return postToApi<CustomerGroupResponse, CreateCustomerGroupRequest>(
        API_ROUTES.ADMIN.CUSTOMER_GROUPS.CREATE,
        body,
        customerGroupResponseSchema,
      );
    },
  });
}

export function useUpdateCustomerGroup() {
  return useTenantMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCustomerGroupRequest }) => {
      const body = updateCustomerGroupRequestSchema.parse(data);

      return putToApi<CustomerGroupResponse, UpdateCustomerGroupRequest>(
        API_ROUTES.ADMIN.CUSTOMER_GROUPS.update(id),
        body,
        customerGroupResponseSchema,
      );
    },
  });
}

export function useDeleteCustomerGroup() {
  return useTenantMutation({
    mutationFn: async (id: number) =>
      deleteFromApi(API_ROUTES.ADMIN.CUSTOMER_GROUPS.delete(id)),
  });
}

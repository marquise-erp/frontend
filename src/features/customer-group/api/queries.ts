import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useTenantQuery } from "@/lib/tenant-query";
import { buildCustomerGroupForest } from "../lib/build-customer-group-tree";
import {
  customerGroupListResponseSchema,
  customerGroupResponseSchema,
  type CustomerGroupListResponse,
  type CustomerGroupResponse,
} from "../schemas/responses";

export const customerGroupKeys = {
  all: ["customer-groups"] as const,
  list: () => [...customerGroupKeys.all, "list"] as const,
  detail: (id: number) => [...customerGroupKeys.all, "detail", id] as const,
};

export function useCustomerGroups() {
  return useTenantQuery({
    queryKey: customerGroupKeys.list(),
    queryFn: () =>
      fetchFromApi<CustomerGroupListResponse>(
        API_ROUTES.ADMIN.CUSTOMER_GROUPS.LIST,
        customerGroupListResponseSchema,
      ),
    select: buildCustomerGroupForest,
  });
}

export function useCustomerGroup(id: number, enabled = true) {
  return useTenantQuery({
    queryKey: customerGroupKeys.detail(id),
    queryFn: () =>
      fetchFromApi<CustomerGroupResponse>(
        API_ROUTES.ADMIN.CUSTOMER_GROUPS.detail(id),
        customerGroupResponseSchema,
      ),
    enabled: enabled && id > 0,
  });
}

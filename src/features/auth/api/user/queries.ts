import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { userListSchema } from "../../schemas/user/responses";
import { useTenantQuery } from "@/lib/tenant-query";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export function useUsers() {
  return useTenantQuery({
    queryKey: userKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.USERS.LIST, userListSchema),
  });
}

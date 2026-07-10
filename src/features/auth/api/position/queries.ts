import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { positionListSchema } from "../../schemas/position/responses";
import { useTenantQuery } from "@/lib/tenant-query";

export const positionKeys = {
  all: ["positions"] as const,
  list: () => [...positionKeys.all, "list"] as const,
};

export function usePositions() {
  return useTenantQuery({
    queryKey: positionKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.POSITIONS.LIST, positionListSchema),
  });
}

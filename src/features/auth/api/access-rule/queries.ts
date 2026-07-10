import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { accessRuleListSchema } from "../../schemas/access-rule/responses";
import { useTenantQuery } from "@/lib/tenant-query";

export const accessRuleKeys = {
  all: ["access-rules"] as const,
  byPosition: (positionId: number) =>
    [...accessRuleKeys.all, "position", positionId] as const,
};

export function usePositionAccessRules(positionId: number | null) {
  return useTenantQuery({
    queryKey: accessRuleKeys.byPosition(positionId ?? 0),
    queryFn: () =>
      fetchFromApi(
        API_ROUTES.ADMIN.POSITIONS.accessRules(positionId!),
        accessRuleListSchema,
      ),
    enabled: positionId != null && positionId > 0,
  });
}

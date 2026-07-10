import { putToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import {
  SyncPositionAccessRulesInput,
  syncPositionAccessRulesSchema,
} from "../../schemas/access-rule/requests";
import { useTenantMutation } from "@/lib/tenant-query";
import { z } from "zod";

export function useSyncPositionAccessRules() {
  return useTenantMutation({
    mutationFn: async (data: {
      positionId: number | string;
      payload: SyncPositionAccessRulesInput;
    }) => {
      const parsed = syncPositionAccessRulesSchema.parse(data.payload);
      return putToApi(
        API_ROUTES.ADMIN.POSITIONS.syncAccessRules(data.positionId),
        parsed,
        z.unknown(),
      );
    },
  });
}

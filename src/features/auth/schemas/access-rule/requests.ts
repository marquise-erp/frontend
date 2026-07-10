import { z } from "zod";
import { accessStrategySchema } from "./responses";

/** Sync DTO — empty authorizable_ids clears all ids for that permission/strategy/type group. */
export const syncPositionAccessRulesSchema = z.object({
  permission: z.string().min(1),
  strategy: accessStrategySchema,
  authorizable_type: z.string().min(1),
  authorizable_ids: z.array(z.string().min(1)),
});

export type SyncPositionAccessRulesInput = z.infer<typeof syncPositionAccessRulesSchema>;

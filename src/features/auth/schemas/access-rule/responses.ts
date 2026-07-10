import { z } from "zod";

export const accessStrategySchema = z.enum(["allow", "deny"]);
export type AccessStrategy = z.infer<typeof accessStrategySchema>;

/** Grouped by permission + strategy + authorizable_type (backend list/sync shape). */
export const accessRuleSchema = z.object({
  permission: z.string().min(1),
  strategy: accessStrategySchema,
  authorizable_type: z.string().min(1),
  authorizable_ids: z.array(z.string().min(1)),
});

export type AccessRule = z.infer<typeof accessRuleSchema>;

export const accessRuleListSchema = z.array(accessRuleSchema);

export function accessRuleKey(rule: Pick<AccessRule, "permission" | "strategy" | "authorizable_type">): string {
  return `${rule.permission}:${rule.strategy}:${rule.authorizable_type}`;
}

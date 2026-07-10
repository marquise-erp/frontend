import { idSchema } from "@/features/shared/schemas/primitives";
import { z } from "zod";

export const switchScopeRequestSchema = z.object({
  scope_id: idSchema,
});

export type SwitchScopeRequest = z.infer<typeof switchScopeRequestSchema>;

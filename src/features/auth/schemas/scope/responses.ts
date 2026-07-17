import { z } from "zod";
import { baseEntitySchema } from "@/features/shared/schemas/primitives";
import { roleSchema } from "../role/responses";
import { positionSchema } from "../position/responses";
import { organizationEntityReferenceSchema } from "@/features/organization/schemas/responses";



export const scopeSchema = baseEntitySchema.extend({
  organization: organizationEntityReferenceSchema,
  role: roleSchema.nullable(),
  position: positionSchema.nullable(),
  is_current_context: z.boolean(),
  is_default: z.boolean(),
});

export type Scope = z.infer<typeof scopeSchema>;

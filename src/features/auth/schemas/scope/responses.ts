import { z } from "zod";
import { baseEntitySchema, idSchema, nameSchema } from "@/features/shared/schemas/primitives";
import { roleSchema } from "../role/responses";
import { positionSchema } from "../position/responses";
import { organizationTypeSchema } from "@/features/organization/schemas/types";
import { organizationRefSchema } from "@/features/organization/schemas/responses";

export const scopeOrganizationSchema = z
  .object({
    id: idSchema,
    name: nameSchema,
    type: organizationTypeSchema.optional(),
  })
  .passthrough()
  .extend({
    holding: organizationRefSchema.nullable(),
    brand: organizationRefSchema.nullable(),
  });

export type ScopeOrganization = z.infer<typeof scopeOrganizationSchema>;

export const scopeSchema = baseEntitySchema.extend({
  organization: scopeOrganizationSchema,
  role: roleSchema.nullable(),
  position: positionSchema.nullable(),
  is_current_context: z.boolean(),
});

export type Scope = z.infer<typeof scopeSchema>;

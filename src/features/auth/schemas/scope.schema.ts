import { z } from 'zod';
import { baseEntitySchema } from '@/features/shared/schemas/primitives';
import { roleSchema, positionSchema } from './rbac.schema';
import { organizationSchema } from '@/features/organization/schemas/organization.schema';
import { organizationRefSchema } from '@/features/organization/schemas/organization-ref.schema';

export const scopeOrganizationSchema = organizationSchema
  .pick({
    id: true,
    name: true,
    type: true,
    path: true,
  })
  .extend({
    holding: organizationRefSchema.nullable(),
    brand: organizationRefSchema.nullable(),
  })
  .strict();

export type ScopeOrganization = z.infer<typeof scopeOrganizationSchema>;

export const scopeSchema = baseEntitySchema.extend({
  organization: scopeOrganizationSchema,
  role: roleSchema.nullable(),
  position: positionSchema.nullable(),
  is_current_context: z.boolean(),
});
export type Scope = z.infer<typeof scopeSchema>;
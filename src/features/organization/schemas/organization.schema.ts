import { z } from 'zod';
import { organizationTypeSchema } from './organization-type.schema';
import { baseEntitySchema, nameSchema } from '@/features/shared/schemas/primitives';

export const organizationSchema = baseEntitySchema.extend({
    parent_id: z.number().nullable(),
    name: nameSchema,
    type: organizationTypeSchema,
    code: z.string().nullable().optional(),
    path: z.string(),
}).strict();

export type Organization = z.infer<typeof organizationSchema>;

export const organizationListSchema = z.array(organizationSchema);
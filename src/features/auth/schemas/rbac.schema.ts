import { z } from 'zod';
import { baseEntitySchema, nameSchema, slugSchema } from '@/features/shared/schemas/primitives';

export const permissionSchema = baseEntitySchema.extend({
  name: nameSchema,
  slug: slugSchema,
}).strict();

export type Permission = z.infer<typeof permissionSchema>;

export const roleSchema = baseEntitySchema.extend({
  name: nameSchema,
  slug: slugSchema,
  permissions: z.array(permissionSchema).optional(),
}).strict();

export type Role = z.infer<typeof roleSchema>;

export const positionSchema = baseEntitySchema.extend({
  name: nameSchema,
}).strict();

export type Position = z.infer<typeof positionSchema>;
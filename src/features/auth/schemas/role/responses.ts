import { z } from "zod";
import { baseEntitySchema, nameSchema, slugSchema } from "@/features/shared/schemas/primitives";

export const permissionSchema = baseEntitySchema.extend({
  name: nameSchema,
  slug: z.string().min(1).max(100).regex(/^[a-z0-9._-]+$/),
  group: z.array(z.string()).optional(),
});

export type Permission = z.infer<typeof permissionSchema>;

export const roleSchema = baseEntitySchema.extend({
  name: nameSchema,
  description: z.string().nullable().optional(),
  organization_id: z.number().optional().nullable(),
  permissions: z.array(permissionSchema).optional(),
});

export type Role = z.infer<typeof roleSchema>;

export const roleListSchema = z.array(roleSchema);

export const permissionListSchema = z.array(permissionSchema);

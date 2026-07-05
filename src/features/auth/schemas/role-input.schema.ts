import { nameSchema } from "@/features/shared/schemas/primitives";
import { z } from "zod";

// Role form input schemas (Zod first, then infer types)
export const createRoleSchema = z.object({
    name: nameSchema,
    description: z.string().trim().optional().or(z.literal('')),
    organization_id: z.coerce.number().int().positive().optional(),
    permission_ids: z.array(z.number().int().positive()).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.extend({
    id: z.coerce.number().int().positive(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;



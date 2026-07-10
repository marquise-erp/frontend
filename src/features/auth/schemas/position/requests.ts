import { nameSchema, idSchema } from "@/features/shared/schemas/primitives";
import { z } from "zod";

export const createPositionSchema = z.object({
  name: nameSchema,
  role_id: idSchema,
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;

export const updatePositionSchema = createPositionSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;

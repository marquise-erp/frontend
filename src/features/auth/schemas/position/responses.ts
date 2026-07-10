import { z } from "zod";
import { baseEntitySchema, idSchema, nameSchema } from "@/features/shared/schemas/primitives";
import { roleSchema } from "../role/responses";

export const positionSchema = baseEntitySchema.extend({
  name: nameSchema,
  role: roleSchema.optional().nullable(),
});

export type Position = z.infer<typeof positionSchema>;

export const positionListSchema = z.array(positionSchema);

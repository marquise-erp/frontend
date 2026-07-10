import { z } from "zod";
import { baseEntitySchema, descriptionSchema, idSchema, nameSchema } from "@/features/shared/schemas/primitives";
import { customerGroupTypeSchema } from "./types";

export const customerGroupResponseSchema = baseEntitySchema.extend({
  parent_id: idSchema.nullable(),
  name: nameSchema,
  path: z.string(),
  type: customerGroupTypeSchema.nullable().optional(),
}).strict();

export type CustomerGroupResponse = z.infer<typeof customerGroupResponseSchema>;

export const customerGroupListItemResponseSchema = customerGroupResponseSchema;

export type CustomerGroupListItemResponse = z.infer<typeof customerGroupListItemResponseSchema>;

export const customerGroupListResponseSchema = z.array(customerGroupListItemResponseSchema);

export type CustomerGroupListResponse = z.infer<typeof customerGroupListResponseSchema>;

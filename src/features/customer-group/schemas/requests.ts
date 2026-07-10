import { z } from "zod";
import { descriptionSchema, idSchema, nameSchema } from "@/features/shared/schemas/primitives";
import { customerGroupTypeSchema } from "./types";

export const createRootCustomerGroupRequestSchema = z.object({
  parent_id: z.null(),
  name: nameSchema,
  type: customerGroupTypeSchema,
});

export const createChildCustomerGroupRequestSchema = z.object({
  parent_id: idSchema,
  name: nameSchema,
});

export const createCustomerGroupRequestSchema = z.union([
  createRootCustomerGroupRequestSchema,
  createChildCustomerGroupRequestSchema,
]);

export type CreateRootCustomerGroupRequest = z.infer<typeof createRootCustomerGroupRequestSchema>;
export type CreateChildCustomerGroupRequest = z.infer<typeof createChildCustomerGroupRequestSchema>;
export type CreateCustomerGroupRequest = z.infer<typeof createCustomerGroupRequestSchema>;

export const updateCustomerGroupRequestSchema = z.object({
  id: idSchema,
  name: nameSchema,
  description: descriptionSchema,
});

export type UpdateCustomerGroupRequest = z.infer<typeof updateCustomerGroupRequestSchema>;

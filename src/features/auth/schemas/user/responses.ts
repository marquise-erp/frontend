import { z } from "zod";
import { baseEntitySchema, nameSchema } from "@/features/shared/schemas/primitives";
import { scopeSchema } from "../scope/responses";

export const userSchema = baseEntitySchema.extend({
  first_name: z.string().max(255).nullable().optional(),
  last_name: z.string().max(255).nullable().optional(),
  mobile: z.string().regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
  email: z.string().email("فرمت پست الکترونیک معتبر نیست").nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  scopes: z.array(scopeSchema).optional(),
});

export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);

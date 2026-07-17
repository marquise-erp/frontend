import { nameSchema } from "@/features/shared/schemas/primitives";
import { z } from "zod";

export const createUserSchema = z.object({
  first_name: z.string().max(255).optional().or(z.literal("")),
  last_name: z.string().max(255).optional().or(z.literal("")),
  mobile: z.string()
    .min(1, "شماره موبایل الزامی است")
    .regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
  email: z.string().email("فرمت پست الکترونیک معتبر نیست").optional().or(z.literal("")),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  organization_id: z.coerce.number().int().positive().optional(),
  role_ids: z.array(z.number().int().positive()).default([]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.extend({
  id: z.coerce.number().int().positive(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").optional().or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

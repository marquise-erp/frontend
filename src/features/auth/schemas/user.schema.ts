import { z } from 'zod';
import { baseEntitySchema, nameSchema } from '@/features/shared/schemas/primitives';

export const userSchema = baseEntitySchema.extend({
  name: nameSchema,
  mobile: z.string().regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
  email: z.string().email("فرمت پست الکترونیک معتبر نیست").nullable(),
}).strict();

export type User = z.infer<typeof userSchema>;
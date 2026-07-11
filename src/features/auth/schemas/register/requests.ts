import { z } from "zod";

export const registerRequestSchema = z
  .object({
    first_name: z
      .preprocess((val) => (val === "" ? null : val), z.string().max(255, "نام حداکثر ۲۵۵ کاراکتر است").nullable())
      .optional(),
    last_name: z
      .preprocess((val) => (val === "" ? null : val), z.string().max(255, "نام خانوادگی حداکثر ۲۵۵ کاراکتر است").nullable())
      .optional(),
    mobile: z
      .string()
      .min(1, "شماره موبایل الزامی است")
      .regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
    email: z
      .preprocess((val) => (val === "" ? null : val), z.string().email("فرمت ایمیل معتبر نیست").max(255, "ایمیل حداکثر ۲۵۵ کاراکتر است").nullable())
      .optional(),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    password_confirmation: z.string().min(8, "تکرار رمز عبور الزامی است"),
    invite_token: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["password_confirmation"],
  });

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

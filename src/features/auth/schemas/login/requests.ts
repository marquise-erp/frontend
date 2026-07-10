import { z } from "zod";

export const loginRequestSchema = z.object({
  mobile: z.string()
    .min(1, "شماره موبایل الزامی است")
    .regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
  remember: z.boolean().default(false),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const verifyOtpSchema = z.object({
  mobile: z.string().min(1, "شماره موبایل الزامی است"),
  code: z.string().length(6, "کد تایید باید دقیقاً ۶ رقم باشد"),
});

export type VerifyOtpType = z.infer<typeof verifyOtpSchema>;

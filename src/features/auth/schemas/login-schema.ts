import { z } from "zod";
import { permissionSchema, scopeSchema, userSchema } from "./auth-entities";

export const loginSchema = z.object({
  mobile: z.string()
    .min(1, "شماره موبایل الزامی است")
    .regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
  remember: z.boolean().default(false),
});
export type LoginType = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  mobile: z.string().min(1, "شماره موبایل الزامی است"),
  code: z.string().length(6, "کد تایید باید دقیقاً ۶ رقم باشد"),
});
export type VerifyOtpType = z.infer<typeof verifyOtpSchema>;

export const loginChallengeResponseSchema = z.object({
  requires_otp: z.literal(true),
  mobile: z.string(),
  message: z.string(),
  code: z.literal(202),
});
export type LoginChallengeResponse = z.infer<typeof loginChallengeResponseSchema>;

export const meResponseSchema = z.object({
  user: userSchema,
  permissions: z.array(permissionSchema), 
  scopes: z.array(scopeSchema),          
  requires_otp: z.literal(false).optional(), 
});
export type MeResponse = z.infer<typeof meResponseSchema>;

export const loginResponseSchema = z.union([meResponseSchema, loginChallengeResponseSchema]);
export type LoginResponseType = z.infer<typeof loginResponseSchema>;

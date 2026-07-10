import { z } from "zod";
import { userSchema } from "../user/responses";
import { scopeSchema } from "../scope/responses";

export const loginChallengeResponseSchema = z.object({
  requires_otp: z.literal(true),
  mobile: z.string(),
  message: z.string(),
  code: z.literal(202),
});

export type LoginChallengeResponse = z.infer<typeof loginChallengeResponseSchema>;

export const meResponseSchema = z.object({
  user: userSchema,
  permissions: z.array(z.string()).optional().nullable(),
  scopes: z.array(scopeSchema),
  requires_otp: z.literal(false).optional(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

export const loginResponseSchema = z.union([meResponseSchema, loginChallengeResponseSchema]);

export type LoginResponse = z.infer<typeof loginResponseSchema>;

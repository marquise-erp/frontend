import { z } from "zod";
import {
  baseEntitySchema,
  idSchema,
  mobileSchema,
  nameSchema,
} from "@/features/shared/schemas/primitives";
import { positionSchema } from "@/features/auth/schemas/position/responses";
import { organizationTypeSchema } from "./types";

export const createInviteRequestSchema = z
  .object({
    mobile: mobileSchema.optional(),
    user_id: idSchema.optional(),
    role_id: idSchema.min(1, "انتخاب نقش الزامی است"),
    position_id: idSchema.optional(),
  })
  .refine((data) => data.user_id != null || data.mobile != null, {
    message: "کاربر یا شماره موبایل الزامی است",
    path: ["user_id"],
  });

export type CreateInviteRequest = z.infer<typeof createInviteRequestSchema>;

const invitationOrganizationSchema = z
  .object({
    id: idSchema,
    name: nameSchema,
    type: organizationTypeSchema,
    profile: z.unknown().nullable().optional(),
  })
  .strict();

const invitationRoleSchema = z
  .object({
    id: idSchema,
    name: nameSchema,
  })
  .strict();

export const invitationSchema = baseEntitySchema.extend({
  token: z.string(),
  link: z.string().url(),
  mobile: z.string().nullable().optional(),
  status: z.string(),
  expires_at: z.string().datetime({ offset: true }),
  organization: invitationOrganizationSchema,
  role: invitationRoleSchema,
  position: positionSchema.nullable(),
}).strict();

export type Invitation = z.infer<typeof invitationSchema>;

export const invitationListSchema = z.array(invitationSchema);

export type InvitationList = z.infer<typeof invitationListSchema>;

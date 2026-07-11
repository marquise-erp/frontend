import { z } from "zod";

export const invitePreviewSchema = z
  .object({
    organization_name: z.string(),
    role_name: z.string(),
    position_name: z.string().nullable(),
    inviter_name: z.string().nullable(),
    requires_registration: z.boolean(),
    expires_at: z.string().datetime({ offset: true }),
  })
  .strict();

export type InvitePreview = z.infer<typeof invitePreviewSchema>;

function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}

export function isInvitePreviewExpired(invite: InvitePreview): boolean {
  return isInviteExpired(invite.expires_at);
}

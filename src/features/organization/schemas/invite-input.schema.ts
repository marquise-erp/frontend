import { z } from "zod";
import { mobileSchema } from "@/features/shared/schemas/primitives";

export const inviteMemberInputSchema = z
  .object({
    userId: z.string().optional().default(""),
    mobile: z.string(),
    roleId: z.string().min(1, "انتخاب نقش الزامی است"),
    positionId: z.string().optional().default(""),
    organizationId: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    const hasUser = data.userId.trim().length > 0;
    const hasMobile = data.mobile.trim().length > 0;

    if (!hasUser && !hasMobile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "کاربر یا شماره موبایل الزامی است",
        path: ["userId"],
      });
      return;
    }

    if (!hasUser && hasMobile && !mobileSchema.safeParse(data.mobile).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "شماره موبایل معتبر نیست",
        path: ["mobile"],
      });
    }
  });

export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;

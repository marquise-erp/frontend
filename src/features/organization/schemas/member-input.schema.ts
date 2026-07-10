import { z } from "zod";
import { mobileSchema } from "@/features/shared/schemas/primitives";
import { organizationTypeSchema } from "./types";

export const assignMemberInputSchema = z
  .object({
    userId: z.string(),
    mobile: z.string(),
    roleId: z.string().min(1, "انتخاب نقش الزامی است"),
    position: z.string(),
    levelId: z.string().min(1),
    levelType: organizationTypeSchema,
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
    }

    if (hasMobile && !mobileSchema.safeParse(data.mobile).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "شماره موبایل معتبر نیست",
        path: ["mobile"],
      });
    }
  });

export type AssignMemberInput = z.infer<typeof assignMemberInputSchema>;

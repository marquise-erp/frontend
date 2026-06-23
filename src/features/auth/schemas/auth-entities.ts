import { organizationSchema } from "@/features/organization/schemas/organization-entities";
import { OrganizationTypeSchema } from "@/features/organization/schemas/organization-schema";
import { z } from "zod";

export const permissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  });
  export type PermissionType = z.infer<typeof permissionSchema>;
  
  export const roleSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  });
  export type RoleType = z.infer<typeof roleSchema>;
  
  export const positionSchema = z.object({
    id: z.number(),
    name: z.string(),
  });
  export type PositionType = z.infer<typeof positionSchema>;

  export const scopeOrganizationSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: OrganizationTypeSchema,
    holding: organizationSchema.nullable(),
    brand: organizationSchema.nullable(),
});
export type ScopeOrganizationType = z.infer<typeof scopeOrganizationSchema>;

  
  export const scopeSchema = z.object({
    id: z.number(),
    organization: scopeOrganizationSchema,
    role: roleSchema.nullable(),
    position: positionSchema.nullable(),
    is_current_context: z.boolean(),
  });
  export type ScopeType = z.infer<typeof scopeSchema>;

  export const userSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "نام کاربر نمی‌تواند خالی باشد"),
    mobile: z.string().regex(/^09\d{9}$/, "فرمت شماره موبایل معتبر نیست"),
    email: z.string().email("فرمت پست الکترونیک معتبر نیست").nullable(),
  });
  
  export type UserType = z.infer<typeof userSchema>;
  
  
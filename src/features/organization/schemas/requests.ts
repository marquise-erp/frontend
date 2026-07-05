import { z } from 'zod';
import { descriptionSchema, idSchema, mobileSchema, nameSchema } from '@/features/shared/schemas/primitives';
import { organizationTypeSchema } from './types';

export const updateOrganizationRequestSchema = z.object({
  id: idSchema,
  name: nameSchema,
  description: descriptionSchema,
});

export type UpdateOrganizationRequest = z.infer<typeof updateOrganizationRequestSchema>;

export const createOrganizationRequestSchema = z.object({
  parent_id: idSchema,
  name: nameSchema,
  type: organizationTypeSchema,
});

export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequestSchema>;

export const assignMemberRequestSchema = z.object({
  userId: z.string().optional(),
  mobile: mobileSchema.optional(),

  roleId: idSchema.min(1, 'انتخاب نقش الزامی است'),
  positionId: idSchema.min(1, 'انتخاب موقعیت الزامی است'),
  organizationId: idSchema.min(1, 'انتخاب سازمان الزامی است'),
}).refine((data) => data.userId || data.mobile, {
  message: 'کاربر یا شماره موبایل الزامی است',
  path: ['userId'],
});

export type AssignMemberRequest = z.infer<typeof assignMemberRequestSchema>;


export const assignRoleRequestSchema = z.object({
  roleId: idSchema.min(1, 'انتخاب نقش الزامی است'),
  organizationId: idSchema.min(1, 'انتخاب سازمان الزامی است'),
});

export type AssignRoleRequest = z.infer<typeof assignRoleRequestSchema>;

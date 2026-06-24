import { z } from 'zod';

export const idSchema = z.coerce.number().int().positive();
export const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/);
export const nameSchema = z.string().min(1).max(255);

export const moneySchema = z.string().regex(/^\d+(\.\d{1,4})?$/);

export const timestampSchema = z.string().datetime().or(z.date());

export const tenantFieldsSchema = z.object({
  holding_id: idSchema.nullable().optional(),
});

export const auditFieldsSchema = z.object({
  created_by: idSchema.nullable().optional(),
  updated_by: idSchema.nullable().optional(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional(),
  deleted_at: timestampSchema.nullable().optional(),
});

export const baseEntitySchema = z.object({
  id: idSchema,
});//.merge(tenantFieldsSchema).merge(auditFieldsSchema);
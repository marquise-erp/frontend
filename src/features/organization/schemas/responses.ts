import { z } from 'zod';
import { organizationTypeSchema } from './types';
import { baseEntitySchema, descriptionSchema, idSchema, nameSchema } from '@/features/shared/schemas/primitives';

//City
export const cityProfileSchema = baseEntitySchema.extend({
  id: z.number(),
  name: nameSchema,
}).strict();

export type CityProfile = z.infer<typeof cityProfileSchema>;

//Region
export const regionProfileSchema = baseEntitySchema.extend({
  id: z.number(),
  tax_rate: z.string(),
  tax_name: z.string().nullable(),
  currency_code: z.string(),
}).strict();

export type RegionProfile = z.infer<typeof regionProfileSchema>;

export const organizationResponseSchema = baseEntitySchema.extend({
  parent_id: idSchema.nullable(),
  name: nameSchema,
  description: descriptionSchema,
  type: organizationTypeSchema,
  path: z.string(),
  profile: z.union([
    regionProfileSchema,
    cityProfileSchema,
  ]).nullable().optional(),
}).strict();

export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;

//List
export const organizationListItemResponseSchema = baseEntitySchema.extend({
  parent_id: idSchema.nullable(),
  name: nameSchema,
  description: descriptionSchema,
  type: organizationTypeSchema,
  path: z.string(),
}).strict();

export type OrganizationListItemResponse = z.infer<typeof organizationListItemResponseSchema>;

export const organizationListResponseSchema = z.array(organizationListItemResponseSchema);

export type OrganizationListResponse = z.infer<typeof organizationListResponseSchema>;

//Ref
export const organizationRefSchema = baseEntitySchema.extend({
  name: nameSchema,
}).strict();

export type OrganizationRef = z.infer<typeof organizationRefSchema>;

export const organizationRefListSchema = z.array(organizationRefSchema);



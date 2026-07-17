import { z } from 'zod';
import { organizationTypeSchema } from './types';
import { baseEntitySchema, descriptionSchema, idSchema, nameSchema } from '@/features/shared/schemas/primitives';

// ── Profile schemas (match backend DTOs) ──────────────────────────────

// Region — RegionData
export const regionProfileSchema = z.object({
  tax_rate: z.union([z.number(), z.string()]),
  tax_name: z.string().nullable(),
  currency_code: z.string(),
  timezone: z.string(),
  locale: z.string(),
});
export type RegionProfile = z.infer<typeof regionProfileSchema>;

// City — CityProfileData
export const cityProfileSchema = z.object({
  city_id: z.number().optional().nullable(),
  province_id: z.number().optional().nullable(),
  country_id: z.number().optional().nullable(),
});
export type CityProfile = z.infer<typeof cityProfileSchema>;

// Brand — BrandProfileData
export const brandProfileSchema = z.object({
  website: z.string().nullable(),
  primary_color: z.string().nullable(),
  secondary_color: z.string().nullable(),
  settings: z.any().nullable().optional(),
});
export type BrandProfile = z.infer<typeof brandProfileSchema>;

// Branch — BranchProfileData
export const branchProfileSchema = z.object({
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  postal_code: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  business_license_number: z.string().nullable(),
  business_license_expire_at: z.string().nullable(),
  tax_identifier: z.string().nullable(),
  tax_file_number: z.string().nullable(),
  settings: z.any().nullable().optional(),
});
export type BranchProfile = z.infer<typeof branchProfileSchema>;

// Union of all profile types
export const organizationProfileSchema = z.union([
  regionProfileSchema,
  cityProfileSchema,
  brandProfileSchema,
  branchProfileSchema,
]).nullable().optional();

export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;

// ── Organization response ─────────────────────────────────────────────

export const organizationResponseSchema = z.object({
  id: idSchema,
  parent_id: idSchema.nullable(),
  name: nameSchema,
  description: descriptionSchema.optional(),
  type: organizationTypeSchema,
  path: z.string(),
  profile: organizationProfileSchema,
}).passthrough();

export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;

// ── List ───────────────────────────────────────────────────────────────

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

// ── Ref ────────────────────────────────────────────────────────────────

export const organizationRefSchema = baseEntitySchema.extend({
  name: nameSchema,
}).strict();

export type OrganizationRef = z.infer<typeof organizationRefSchema>;

export const organizationRefListSchema = z.array(organizationRefSchema);

// ── Entity reference ───────────────────────────────────────────────────

export const organizationEntityReferenceSchema = z
  .object({
    id: idSchema,
    name: nameSchema,
    type: organizationTypeSchema.optional(),
  })
  .passthrough()
  .extend({
    holding: organizationRefSchema.nullable(),
    brand: organizationRefSchema.nullable(),
  });

export type OrganizationEntityReference = z.infer<typeof organizationEntityReferenceSchema>;

// ── Location (communication endpoints) ─────────────────────────────────

export const locationItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
});

export const locationItemListSchema = z.array(locationItemSchema);
export type LocationItem = z.infer<typeof locationItemSchema>;

import { z } from 'zod';

export const organizationTypeSchema = z.enum([
    "holding",
    "brand",
    "region",
    "city",
    "branch",
    "unit",
]);

export type OrganizationType = z.infer<typeof organizationTypeSchema>;
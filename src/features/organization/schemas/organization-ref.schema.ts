import { z } from 'zod';
import { organizationSchema } from './organization.schema';

export const organizationRefSchema = organizationSchema
  .pick({
    id: true,
    name: true,
    type: true,
  })
  .strict();

export type OrganizationRef = z.infer<typeof organizationRefSchema>;
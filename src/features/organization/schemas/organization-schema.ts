import { z } from "zod";

export const OrganizationTypeSchema = z.enum([
    "holding",
    "brand",
    "region",
    "city",
    "branch",
    "unit",
  ]);
  export type OrganizationType = z.infer<typeof OrganizationTypeSchema>;

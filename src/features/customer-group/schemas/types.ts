import { z } from "zod";

export const customerGroupTypeSchema = z.enum([
  "demographic",
  "financial",
  "behavioral",
  "geographic",
]);

export type CustomerGroupType = z.infer<typeof customerGroupTypeSchema>;

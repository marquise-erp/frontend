import { z } from "zod"
import { baseEntitySchema } from "@/features/shared/schemas/primitives"

export const formStatusSchema = z.enum(["draft", "published", "archived"])
export type FormStatus = z.infer<typeof formStatusSchema>

export const formSchema = baseEntitySchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  elements: z.array(z.unknown()),
  /** Lucide icon name, e.g. "FileText", "Contact", "Package" */
  icon: z.string().nullable().optional(),
  status: formStatusSchema.optional().default("draft"),
  version: z.number().int().min(1).optional().default(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Form = z.infer<typeof formSchema>

export const formListSchema = z.array(formSchema)

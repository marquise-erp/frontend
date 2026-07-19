import { z } from "zod"
import { baseEntitySchema } from "@/features/shared/schemas/primitives"

export const formSchema = baseEntitySchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  elements: z.array(z.unknown()),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Form = z.infer<typeof formSchema>

export const formListSchema = z.array(formSchema)

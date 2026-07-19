import { z } from "zod"

// ---------------------------------------------------------------------------
// Primitive reusable schemas
// ---------------------------------------------------------------------------

const fieldWidthSchema = z.enum(["full", "half", "third"])
const labelPositionSchema = z.enum(["top", "left", "hidden"])
const controlSizeSchema = z.enum(["sm", "default", "lg"])
const labelAlignSchema = z.enum(["left", "center", "right"])

// ---------------------------------------------------------------------------
// Viewport appearance override (all fields optional — partial overrides)
// ---------------------------------------------------------------------------

export const viewportAppearanceSchema = z.object({
  labelPosition: labelPositionSchema.optional(),
  labelAlign: labelAlignSchema.optional(),
  width: fieldWidthSchema.optional(),
  size: controlSizeSchema.optional(),
})

// ---------------------------------------------------------------------------
// Element option
// ---------------------------------------------------------------------------

const elementOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  value: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Element props
// ---------------------------------------------------------------------------

const elementPropsSchema = z.object({
  // Content
  label: z.string().min(1),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  helpText: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.array(elementOptionSchema).optional(),

  // Appearance (desktop baseline)
  width: fieldWidthSchema,
  labelPosition: labelPositionSchema,
  size: controlSizeSchema,
  labelAlign: labelAlignSchema,
  hidden: z.boolean(),

  // Per-viewport overrides
  viewportStyles: z.object({
    mobile: viewportAppearanceSchema,
    tablet: viewportAppearanceSchema,
  }),

  // Style
  radius: z.number().int().min(0).max(100),
  borderWidth: z.number().int().min(0).max(10),
  accentColor: z.string().min(1),
  showBorder: z.boolean(),
  background: z.enum(["transparent", "muted", "card"]),

  // Validation
  required: z.boolean(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  errorMessage: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Form element
// ---------------------------------------------------------------------------

const elementTypeSchema = z.enum([
  "text",
  "textarea",
  "email",
  "number",
  "url",
  "dropdown",
  "single-choice",
  "multiple-choice",
  "checkbox",
  "date",
  "file",
  "heading",
  "paragraph",
  "divider",
])

const formElementSchema = z.object({
  id: z.string().uuid(),
  type: elementTypeSchema,
  props: elementPropsSchema,
})

// ---------------------------------------------------------------------------
// Form payload (create / update body)
// ---------------------------------------------------------------------------

export const createFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  elements: z.array(formElementSchema),
})

export type CreateFormInput = z.infer<typeof createFormSchema>

export const updateFormSchema = createFormSchema.extend({
  id: z.union([z.string(), z.coerce.number().int().positive()]),
})

export type UpdateFormInput = z.infer<typeof updateFormSchema>

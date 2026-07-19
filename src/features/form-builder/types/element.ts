export type ElementType =
    | "text"
    | "textarea"
    | "email"
    | "number"
    | "url"
    | "dropdown"
    | "single-choice"
    | "multiple-choice"
    | "checkbox"
    | "date"
    | "file"
    | "heading"
    | "paragraph"
    | "divider";

export type FieldWidth = "full" | "half" | "third"
export type LabelPosition = "top" | "left" | "hidden"
export type ControlSize = "sm" | "default" | "lg"
export type LabelAlign = "left" | "center" | "right"

export interface ElementOption {
  id: string
  label: string
  value: string
}

/**
 * The four appearance properties that can be overridden per viewport.
 * All fields are optional — omitted fields fall through to the desktop baseline
 * stored directly on ElementProps.
 */
export interface ViewportAppearance {
  labelPosition?: LabelPosition
  labelAlign?: LabelAlign
  width?: FieldWidth
  size?: ControlSize
}

export interface ElementProps {
    // General / content
    label: string
    placeholder?: string
    description?: string
    helpText?: string
    defaultValue?: string
    options?: ElementOption[]
  
    // Appearance (desktop baseline — also used when no viewport override exists)
    width: FieldWidth
    labelPosition: LabelPosition
    size: ControlSize
    labelAlign: LabelAlign
    hidden: boolean

    /**
     * Per-viewport appearance overrides.
     * Only the properties explicitly set here differ from the desktop baseline.
     * `desktop` is intentionally omitted — the baseline IS the desktop value.
     */
    viewportStyles: {
      mobile: ViewportAppearance
      tablet: ViewportAppearance
    }
  
    // Style
    radius: number
    borderWidth: number
    accentColor: string
    showBorder: boolean
    background: "transparent" | "muted" | "card"
  
    // Validation
    required: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    errorMessage?: string
  }

  export interface FormElement {
    id: string
    type: ElementType
    props: ElementProps
  }

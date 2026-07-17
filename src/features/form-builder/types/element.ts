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

export interface ElementProps {
    // General / content
    label: string
    placeholder?: string
    description?: string
    helpText?: string
    defaultValue?: string
    options?: ElementOption[]
  
    // Appearance
    width: FieldWidth
    labelPosition: LabelPosition
    size: ControlSize
    labelAlign: LabelAlign
    hidden: boolean
  
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
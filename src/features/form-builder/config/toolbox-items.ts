import {
    TextCursorInput,
    AlignLeft,
    AtSign,
    Hash,
    Link2,
    ListFilter,
    CircleCheck,
    ListChecks,
    SquareCheck,
    CalendarDays,
    FileUp,
    Heading1,
    Pilcrow,
    Minus,
    type LucideIcon,
  } from "lucide-react"
import { ToolboxItem } from "../types/toolbox"
import { ElementType } from "../types/element"

export const ICONS: Record<string, LucideIcon> = {
    TextCursorInput,
    AlignLeft,
    AtSign,
    Hash,
    Link2,
    ListFilter,
    CircleCheck,
    ListChecks,
    SquareCheck,
    CalendarDays,
    FileUp,
    Heading1,
    Pilcrow,
    Minus,
  }
  
  export const TOOLBOX_ITEMS: ToolboxItem[] = [
    // Inputs
    {
      type: "text",
      label: "Text Input",
      icon: "TextCursorInput",
      category: "Inputs",
      description: "Single line text field",
    },
    {
      type: "textarea",
      label: "Long Text",
      icon: "AlignLeft",
      category: "Inputs",
      description: "Multi-line text area",
    },
    {
      type: "email",
      label: "Email",
      icon: "AtSign",
      category: "Inputs",
      description: "Email address input",
    },
    {
      type: "number",
      label: "Number",
      icon: "Hash",
      category: "Inputs",
      description: "Numeric input field",
    },
    {
      type: "url",
      label: "URL Input",
      icon: "Link2",
      category: "Inputs",
      description: "Web address input",
    },
    // Choices
    {
      type: "dropdown",
      label: "Dropdown",
      icon: "ListFilter",
      category: "Choices",
      description: "Select from a list",
    },
    {
      type: "single-choice",
      label: "Single Choice",
      icon: "CircleCheck",
      category: "Choices",
      description: "Pick one option",
    },
    {
      type: "multiple-choice",
      label: "Multiple Choice",
      icon: "ListChecks",
      category: "Choices",
      description: "Pick several options",
    },
    {
      type: "checkbox",
      label: "Checkbox",
      icon: "SquareCheck",
      category: "Choices",
      description: "Single yes/no toggle",
    },
    // Advanced
    {
      type: "date",
      label: "Date Picker",
      icon: "CalendarDays",
      category: "Advanced",
      description: "Select a date",
    },
    {
      type: "file",
      label: "File Uploader",
      icon: "FileUp",
      category: "Advanced",
      description: "Upload a document",
    },
    // Layout
    {
      type: "heading",
      label: "Heading",
      icon: "Heading1",
      category: "Layout",
      description: "Section title",
    },
    {
      type: "paragraph",
      label: "Paragraph",
      icon: "Pilcrow",
      category: "Layout",
      description: "Descriptive text block",
    },
    {
      type: "divider",
      label: "Divider",
      icon: "Minus",
      category: "Layout",
      description: "Horizontal separator",
    },
  ]
  
  export const CATEGORY_ORDER = ["Inputs", "Choices", "Advanced", "Layout"]
  
  export function getToolboxItem(type: ElementType): ToolboxItem {
    return TOOLBOX_ITEMS.find((item) => item.type === type) ?? TOOLBOX_ITEMS[0]
  }
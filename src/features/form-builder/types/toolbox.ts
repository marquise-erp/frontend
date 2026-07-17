import { ElementType } from "./element"

export interface ToolboxItem {
    type: ElementType
    label: string
    icon: string
    category: string
    description: string
  }
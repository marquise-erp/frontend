import type { OrganizationType as OrgNodeType } from "@/features/organization/schemas/types"
import type * as React from "react"


export interface SidebarItem {
  key: string
  href?: string
  icon?: React.ReactNode
  permission?: string
  allowedLevels?: OrgNodeType[]
  children?: SidebarItem[]
  order?: number
}

import type * as React from "react"

export interface SidebarItem {
  key: string
  href?: string
  icon?: React.ReactNode
  permission?: string
  children?: SidebarItem[]
  order?: number
}

import type * as React from "react"

export interface NavUserMenuItem {
  key: string
  title: string
  icon: React.ReactNode
  href?: string
  permission?: string
  action?: "logout"
  order?: number
}

export interface NavUserMenuGroup {
  key: string
  items: NavUserMenuItem[]
  order?: number
}

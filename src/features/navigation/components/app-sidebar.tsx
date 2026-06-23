"use client"

import * as React from "react"
import { NavMain } from "@/features/navigation/components/nav-main"
import { NavUser } from "@/features/navigation/components/nav-user"
import { ScopeSwitcher } from "@/features/navigation/components/scope-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { appSidebarItems } from "@/features/navigation/config/sidebar-items"
import {
  mockAvailableScopes,
  mockDevSidebarAccess,
} from "@/features/navigation/config/mock-dev-session"
import {
  filterSidebarItems,
  sortSidebarItems,
} from "@/features/navigation/lib/filter-sidebar"
import { useAuthStore } from "@/features/auth/store/auth-store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const scopes = useAuthStore((s) => s.scopes)
  const activeScopeId = useAuthStore((s) => s.activeScopeId)
  const permissions = useAuthStore((s) => s.permissions)
  const switchContextNode = useAuthStore((s) => s.switchContextNode)

  const resolvedScopes = React.useMemo(() => {
    return scopes.length ? scopes : mockAvailableScopes
  }, [scopes])

  const access = React.useMemo(() => {
    const activeScope =
      resolvedScopes.find((scope) => scope.id === activeScopeId) ??
      resolvedScopes.find((scope) => scope.is_current_context) ??
      resolvedScopes[0]

    if (!activeScope || !permissions.length) {
      return mockDevSidebarAccess
    }

    return {
      permissions: new Set(permissions.map((permission) => permission.slug)),
      orgNodeType: activeScope.organization.type,
    }
  }, [resolvedScopes, activeScopeId, permissions])

  const navItems = React.useMemo(() => {
    const filtered = filterSidebarItems(appSidebarItems, access)
    return sortSidebarItems(filtered)
  }, [access])

  const resolvedActiveScopeId = React.useMemo(() => {
    if (activeScopeId && resolvedScopes.some((scope) => scope.id === activeScopeId)) {
      return activeScopeId
    }
    const defaultScope =
      resolvedScopes.find((scope) => scope.is_current_context) ?? resolvedScopes[0]
    return defaultScope?.id ?? null
  }, [resolvedScopes, activeScopeId])

  return (
    <Sidebar collapsible="icon" {...props} className="sidebar-gradient">
      <SidebarHeader>
        <ScopeSwitcher
          scopes={resolvedScopes}
          activeScopeId={resolvedActiveScopeId}
          onScopeChange={switchContextNode}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

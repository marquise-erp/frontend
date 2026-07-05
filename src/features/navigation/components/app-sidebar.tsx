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
  mockDevSidebarAccess,
} from "@/features/navigation/config/mock-dev-session"
import {
  filterSidebarItems,
  sortSidebarItems,
} from "@/features/navigation/lib/filter-sidebar"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { useAuthMe } from "@/features/auth/hooks/use-auth"
import { useSwitchScope } from "@/features/auth/hooks/use-switch-scope"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Hydrate auth data from server on mount / reload using React Query + store sync.
  // This fixes missing user/scopes/permissions in scope-switcher and nav-user after refresh.
  useAuthMe();

  const scopes = useAuthStore((s) => s.scopes)
  const activeScopeId = useAuthStore((s) => s.activeScopeId)
  const permissions = useAuthStore((s) => s.permissions)

  // useSwitchScope performs the server call (POST /auth/switch-scope)
  // and updates the local activeScopeId on success. The header
  // X-Tenant-Scope-ID will be sent on all future requests automatically.
  const switchScopeMutation = useSwitchScope()

  const access = React.useMemo(() => {
    const activeScope =
      scopes.find((scope) => scope.id === activeScopeId) ??
      scopes.find((scope) => scope.is_current_context) ??
      scopes[0]

    if (!activeScope || !permissions.length) {
      return mockDevSidebarAccess
    }

    return {
      permissions: new Set(permissions.map((permission) => permission.slug)),
      orgNodeType: activeScope.organization.type,
    }
  }, [scopes, activeScopeId, permissions])

  const navItems = React.useMemo(() => {
    const filtered = filterSidebarItems(appSidebarItems, access)
    return sortSidebarItems(filtered)
  }, [access])

  const resolvedActiveScopeId = React.useMemo(() => {
    if (activeScopeId && scopes.some((scope) => scope.id === activeScopeId)) {
      return activeScopeId
    }
    const defaultScope =
      scopes.find((scope) => scope.is_current_context) ?? scopes[0]
    return defaultScope?.id ?? null
  }, [scopes, activeScopeId])

  return (
    <Sidebar collapsible="icon" {...props} className="sidebar-gradient">
      <SidebarHeader>
        <ScopeSwitcher
          scopes={scopes}
          activeScopeId={resolvedActiveScopeId}
          onScopeChange={switchScopeMutation.mutate}
          disabled={switchScopeMutation.isPending}
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

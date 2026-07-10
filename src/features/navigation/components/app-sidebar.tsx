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
  filterSidebarItems,
  sortSidebarItems,
} from "@/features/navigation/lib/filter-sidebar"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { useAuthPermissions } from "@/features/auth/hooks/use-permissions"
import { useAuthMe } from "@/features/auth/api/auth"
import { useSwitchScope } from "@/features/auth/api/scope"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  useAuthMe();

  const scopes = useAuthStore((s) => s.scopes)
  const activeScopeId = useAuthStore((s) => s.activeScopeId)
  const switchScopeMutation = useSwitchScope()
  const { can } = useAuthPermissions()



  const navItems = React.useMemo(() => {
    const filtered = filterSidebarItems(appSidebarItems, can)
    return sortSidebarItems(filtered)
  }, [can])

  return (
    <Sidebar collapsible="icon" {...props} className="sidebar-gradient">
      <SidebarHeader>
        <ScopeSwitcher
          scopes={scopes}
          activeScopeId={activeScopeId}
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

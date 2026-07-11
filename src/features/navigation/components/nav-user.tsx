"use client"

import Link from "next/link"
import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useAuthStore } from "@/features/auth/store/auth-store"
import {
  navUserLogoutItem,
  navUserMenuGroups,
} from "@/features/navigation/config/nav-user-items"
import { filterNavUserMenuGroups } from "@/features/navigation/lib/filter-nav-user-items"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { User } from "@/features/auth/schemas"

const mockDevUser: User = {
  id: 0,
  name: "دمو کاربر",
  mobile: "09120000000",
  email: "demo@example.com",
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function getUserSubtitle(user: User): string {
  return user.email ?? user.mobile
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const storeUser = useAuthStore((state) => state.user)
  const permissions = useAuthStore((state) => state.permissions)

  const user = storeUser ?? mockDevUser
  const permissionSlugs = React.useMemo(
    () => new Set(permissions),
    [permissions]
  )

  const visibleGroups = React.useMemo(
    () => filterNavUserMenuGroups(navUserMenuGroups, permissionSlugs),
    [permissionSlugs]
  )

  const handleLogout = useLogout();

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || "کاربر";
  const initials = getUserInitials(displayName)
  const subtitle = getUserSubtitle(user)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/placeholder.svg" alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{subtitle}</span>
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="ms-auto size-4"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/placeholder.svg" alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{subtitle}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {visibleGroups.map((group) => (
              <React.Fragment key={group.key}>
                <DropdownMenuGroup>
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.key} asChild>
                      <Link href={item.href!}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </React.Fragment>
            ))}
            <DropdownMenuItem onClick={handleLogout}>
              {navUserLogoutItem.icon}
              {navUserLogoutItem.title}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

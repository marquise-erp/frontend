"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import type { Scope  } from "@/features/auth/schemas"

function scopeTitle(
  scope: Scope,
  tOrganizationType: (type: Scope["organization"]["type"]) => string
): string {
  const roleOrPosition = scope.position?.name ?? scope.role?.name ?? ""
  const orgType = tOrganizationType(scope.organization.type)
  return `${roleOrPosition} ${orgType} ${scope.organization.name}`
}

function scopeSubTitle(scope: Scope): string {
  const { holding, brand } = scope.organization
  return [holding?.name, brand?.name].filter(Boolean).join("/")
}

export function ScopeSwitcher({
  scopes,
  activeScopeId,
  onScopeChange,
  disabled = false,
}: {
  scopes: Scope[]
  activeScopeId: number | null
  onScopeChange: (scopeId: number) => void
  disabled?: boolean
}) {
  const { isMobile } = useSidebar()
  const tOrganizationType = useTranslations("organization.type")

  const activeScope = React.useMemo(() => {
    if (!scopes.length) return null
    const found = activeScopeId
      ? scopes.find((scope) => scope.id === activeScopeId)
      : undefined
    return found ?? scopes[0]
  }, [scopes, activeScopeId])

  if (!activeScope) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={disabled}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">
                  {scopeTitle(activeScope, tOrganizationType as any)}
                </span>
                <span className="truncate text-xs">
                  {scopeSubTitle(activeScope)}
                </span>
              </div>
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-92 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              حوزه کاری
            </DropdownMenuLabel>
            {scopes.map((scope, index) => (
              <DropdownMenuItem
                key={scope.id}
                disabled={disabled}
                onClick={() => onScopeChange(scope.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">
                    {scopeTitle(scope, tOrganizationType as any)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {scopeSubTitle(scope)}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

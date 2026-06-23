"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { SidebarItem } from "@/features/navigation/types/sidebar"
import { getSidebarLabel } from "../config/sidebar-items"
import { useTranslations } from "next-intl"

function isPathActive(pathname: string, targetUrl: string) {
  if (targetUrl === "/") {
    return pathname === "/"
  }
  return pathname === targetUrl || pathname.startsWith(`${targetUrl}/`)
}

function sortItems(items: SidebarItem[]) {
  return items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function subtreeHasActivePath(pathname: string, node: SidebarItem): boolean {
  if (node.href && isPathActive(pathname, node.href)) {
    return true
  }
  if (!node.children?.length) {
    return false
  }
  return node.children.some((c) => subtreeHasActivePath(pathname, c))
}

function SubNavTree({ items, pathname }: { items: SidebarItem[]; pathname: string }) {
  const t = useTranslations("navigation.sidebar")

  return sortItems(items).map((item) => {
    const label = getSidebarLabel(item, t)

    if (item.children?.length) {
      const children = sortItems(item.children)
      const isOpen =
        Boolean(item.href && isPathActive(pathname, item.href)) ||
        subtreeHasActivePath(pathname, item)

      return (
        <SidebarMenuSubItem key={item.key}>
          <Collapsible defaultOpen={isOpen} className="group/subcollapsible w-full">
            <CollapsibleTrigger asChild>
              <SidebarMenuSubButton className="w-full cursor-pointer">
                {item.icon}
                <span>{label}</span>
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={2}
                  className="ms-auto transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90"
                />
              </SidebarMenuSubButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="
              overflow-hidden
              data-[state=closed]:animate-accordion-up
              data-[state=open]:animate-accordion-down
            ">
              <SidebarMenuSub className="mx-0 border-none px-0">
                <SubNavTree items={children} pathname={pathname} />
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSubItem>
      )
    }

    if (!item.href) {
      return null
    }

    return (
      <SidebarMenuSubItem key={item.key}>
        <SidebarMenuSubButton
          asChild
          isActive={isPathActive(pathname, item.href)}
        >
          <Link href={item.href}>
            {item.icon}
            <span>{label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  })
}

export function NavMain({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname()
  const t = useTranslations("navigation.sidebar")

  if (!items.length) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {sortItems(items).map((item) => {
          const label = getSidebarLabel(item, t)

          if (item.children?.length) {
            const children = sortItems(item.children)
            const isItemActive = Boolean(
              item.href && isPathActive(pathname, item.href)
            )
            const isOpen =
              isItemActive || subtreeHasActivePath(pathname, { ...item, children })

            return (
              <Collapsible
                key={item.key}
                defaultOpen={isOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={label}
                      isActive={isItemActive}
                    >
                      {item.icon}
                      <span>{label}</span>
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        strokeWidth={2}
                        className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-[-90deg]"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="
                    overflow-hidden
                    data-[state=closed]:animate-accordion-up
                    data-[state=open]:animate-accordion-down
                  ">
                    <SidebarMenuSub>
                      <SubNavTree items={children} pathname={pathname} />
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          if (!item.href) {
            return null
          }

          return (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                asChild
                tooltip={label}
                isActive={isPathActive(pathname, item.href)}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

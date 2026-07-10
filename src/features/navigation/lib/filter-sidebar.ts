import type { PermissionCode } from "@/config/permissions"
import type { SidebarItem } from "@/features/navigation/types/sidebar"

/** Predicate that resolves whether the current user has a given permission. */
export type SidebarPermissionCheck = (permission: PermissionCode) => boolean

function hasPermission(required: string | undefined, can: SidebarPermissionCheck): boolean {
  if (!required) {
    return true
  }
  return can(required as PermissionCode)
}

export function filterSidebarItems(
  items: SidebarItem[],
  can: SidebarPermissionCheck
): SidebarItem[] {
  function visit(item: SidebarItem): SidebarItem | null {
    const permOk = hasPermission(item.permission, can)

    if (item.children?.length) {
      const mapped = item.children.map(visit).filter((n): n is SidebarItem => n !== null)

      if (!permOk || mapped.length === 0) {
        return null
      }
      return { ...item, children: mapped }
    }

    if (!item.href) {
      return null
    }

    if (!permOk) {
      return null
    }

    return item
  }

  return items.map(visit).filter((n): n is SidebarItem => n !== null)
}

export function sortSidebarItems(items: SidebarItem[]): SidebarItem[] {
  return items
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) =>
      item.children?.length
        ? { ...item, children: sortSidebarItems(item.children) }
        : item
    )
}

import type { OrgNodeType } from "@/features/organization/types/organization"
import type { SidebarItem } from "@/features/navigation/types/sidebar"

export interface SidebarAccessContext {
  /** Effective permission strings from `scope.role.permissions`. */
  permissions: ReadonlySet<string>
  /** Organization node type from `scope.type`. */
  orgNodeType: OrgNodeType
}

function isOrgNodeTypeAllowed(
  levels: OrgNodeType[] | undefined,
  userType: OrgNodeType
): boolean {
  if (!levels?.length) {
    return true
  }
  return levels.includes(userType)
}

function hasPermission(required: string | undefined, granted: ReadonlySet<string>): boolean {
  if (!required) {
    return true
  }
  return granted.has(required)
}

/**
 * Returns a copy of the tree containing only nodes the user may see.
 *
 * **Parent rule:** If an item has `children`, it is shown only when the user
 * passes this node’s own `permission` / `allowedLevels` checks *and* every child is
 * visible after the same rules (no partial branches).
 */
export function filterSidebarItems(
  items: SidebarItem[],
  access: SidebarAccessContext | null
): SidebarItem[] {
  if (!access) {
    return []
  }

  const { permissions, orgNodeType } = access

  function visit(item: SidebarItem): SidebarItem | null {
    const levelOk = isOrgNodeTypeAllowed(item.allowedLevels, orgNodeType)
    const permOk = hasPermission(item.permission, permissions)

    if (item.children?.length) {
      const mapped = item.children.map(visit).filter((n): n is SidebarItem => n !== null)

      if (mapped.length !== item.children.length) {
        return null
      }
      if (!levelOk || !permOk) {
        return null
      }
      return { ...item, children: mapped }
    }

    if (!item.href) {
      return null
    }

    if (!levelOk || !permOk) {
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

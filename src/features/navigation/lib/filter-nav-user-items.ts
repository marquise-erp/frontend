import type { NavUserMenuGroup, NavUserMenuItem } from "@/features/navigation/types/nav-user"

function hasPermission(required: string | undefined, granted: ReadonlySet<string>): boolean {
  if (!required) {
    return true
  }
  return granted.has(required)
}

function filterMenuItem(
  item: NavUserMenuItem,
  permissions: ReadonlySet<string>
): NavUserMenuItem | null {
  if (item.action === "logout" || item.href) {
    return hasPermission(item.permission, permissions) ? item : null
  }
  return null
}

export function filterNavUserMenuGroups(
  groups: NavUserMenuGroup[],
  permissions: ReadonlySet<string>
): NavUserMenuGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterMenuItem(item, permissions))
        .filter((item): item is NavUserMenuItem => item !== null)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

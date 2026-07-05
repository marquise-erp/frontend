import type { SidebarAccessContext } from "@/features/navigation/lib/filter-sidebar"


/** Keep in sync with `permission` on sidebar item definitions. */
const mockPermissions = [
  "users.manage",
  "roles.manage",
  "org.view",
  "forms.view",
  "units.view",
  "bank_accounts.view",
  "price_board.manage",
  "invoice.settings",
  "accounting.settings",
  "reports.contacts",
  "reports.products",
  "deal.create",
  "finance.view",
] as const


/**
 * Lets every sidebar leaf pass {@link filterSidebarItems} when the
 * real session has no active scope (API offline).
 */
export const mockDevSidebarAccess: SidebarAccessContext = {
  permissions: new Set(mockPermissions),
  orgNodeType: "holding",
}

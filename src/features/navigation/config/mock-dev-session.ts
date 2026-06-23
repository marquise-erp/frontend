import type { OrgNodeType } from "@/features/organization/types/organization"
import type { SidebarAccessContext } from "@/features/navigation/lib/filter-sidebar"
import type { ScopeType, UserType } from "@/features/auth/schemas/auth-entities"

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

const mockHolding = { id: 1, name: "مارکیز", type: "holding" as const }
const mockBrand = { id: 2, name: "کیا گلد", type: "brand" as const }

function mockScope(
  id: number,
  type: OrgNodeType,
  organizationName: string,
  roleName: string,
  isCurrentContext = false
): ScopeType {
  return {
    id,
    organization: {
      id,
      name: organizationName,
      type,
      holding: mockHolding,
      brand: mockBrand,
    },
    role: { id: 1, name: roleName, slug: roleName },
    position: null,
    is_current_context: isCurrentContext,
  }
}

/** Used when the API is down or `scopes` is missing (local dev). */
export const mockAvailableScopes: ScopeType[] = [
  mockScope(1, "holding", "مدیر هلدینگ", "ادمین", true),
  mockScope(5, "region", "مدیر فروش منطقه ایران", "مدیر فروش"),
  mockScope(12, "branch", "فروشنده شعبه ولیعصر", "فروشنده"),
]

/** Shown in the sidebar footer when there is no session user (API offline). */
export const mockDevUser: UserType = {
  id: 0,
  name: "دمو کاربر",
  mobile: "09120000000",
  email: "demo@example.com",
}

/**
 * Lets every sidebar leaf pass {@link filterSidebarItems} when the
 * real session has no active scope (API offline).
 */
export const mockDevSidebarAccess: SidebarAccessContext = {
  permissions: new Set(mockPermissions),
  orgNodeType: "holding",
}

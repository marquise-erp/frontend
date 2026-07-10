"use client"

import {
  BriefcaseIcon,
  ChartHistogramIcon,
  Invoice01Icon,
  Layers01Icon,
  Settings05Icon,
  Shield01Icon,
  UserMultiple02Icon,
  UserShield01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { SidebarItem } from "@/features/navigation/types/sidebar"
import { PERMISSION_CODES } from "@/config/permissions"

const icon = (Icon: typeof UserMultiple02Icon) => (
  <HugeiconsIcon icon={Icon} strokeWidth={2} />
)

export const appSidebarItems: SidebarItem[] = [
  {
    key: "access",
    order: 1,
    icon: icon(Shield01Icon),
    children: [
      {
        key: "access.users",
        href: "/app/access/users",
        order: 1,
        permission: PERMISSION_CODES.AUTH_USER_VIEW,
        icon: icon(UserMultiple02Icon),
      },
      {
        key: "access.roles",
        href: "/app/access/roles",
        order: 2,
        permission: PERMISSION_CODES.AUTH_ROLE_VIEW,
        icon: icon(UserShield01Icon),
      },
      {
        key: "access.positions",
        href: "/app/access/positions",
        order: 3,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
        icon: icon(BriefcaseIcon),
      },
    ],
  },
  {
    key: "definitions",
    order: 2,
    icon: icon(Layers01Icon),
    children: [
      {
        key: "definitions.org",
        href: "/app/definitions/organization",
        order: 1,
        permission: PERMISSION_CODES.ORGANIZATION_VIEW,
      },
      {
        key: "definitions.customer_groups",
        href: "/app/definitions/customer-group",
        order: 2,
        permission: PERMISSION_CODES.CUSTOMER_GROUP_VIEW,
      },
      {
        key: "definitions.forms",
        href: "/app/definitions/forms",
        order: 3,
        permission: PERMISSION_CODES.AUTH_POSITION_CREATE,
      },
      {
        key: "definitions.units",
        href: "/app/definitions/units",
        order: 4,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
      {
        key: "definitions.banks",
        href: "/app/definitions/bank-accounts",
        order: 5,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
    ],
  },
  {
    key: "settings",
    order: 3,
    icon: icon(Settings05Icon),
    children: [
      {
        key: "settings.price_board",
        href: "/app/settings/price-board",
        order: 1,
        permission: PERMISSION_CODES.AUTH_POSITION_CREATE,
      },
      {
        key: "settings.invoice_prefs",
        href: "/app/settings/invoice",
        order: 2,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
      {
        key: "settings.accounting",
        href: "/app/settings/accounting",
        order: 3,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
    ],
  },
  {
    key: "reports",
    order: 4,
    icon: icon(ChartHistogramIcon),
    children: [
      {
        key: "reports.contacts",
        href: "/app/reports/contacts",
        order: 1,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
      {
        key: "reports.products",
        href: "/app/reports/products",
        order: 2,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
    ],
  },
  {
    key: "invoice",
    order: 5,
    icon: icon(Invoice01Icon),
    children: [
      {
        key: "invoice.create",
        href: "/app/invoice/new",
        order: 1,
        permission: PERMISSION_CODES.AUTH_POSITION_CREATE,
      },
      {
        key: "invoice.list",
        href: "/app/invoice",
        order: 2,
        permission: PERMISSION_CODES.AUTH_POSITION_VIEW,
      },
    ],
  },
]

export function getSidebarLabel(
  item: SidebarItem,
  t: (key: string) => string
): string {
  if (item.children?.length) {
    return t(`${item.key}.title`)
  }
  return t(item.key)
}

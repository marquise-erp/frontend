"use client"

import {
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
        permission: "users.manage",
        icon: icon(UserMultiple02Icon),
      },
      {
        key: "access.roles",
        href: "/app/access/roles",
        order: 2,
        permission: "roles.manage",
        icon: icon(UserShield01Icon),
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
        permission: "org.view",
        allowedLevels: ["holding", "brand"],
      },
      {
        key: "definitions.forms",
        href: "/app/definitions/forms",
        order: 2,
        permission: "forms.view",
      },
      {
        key: "definitions.units",
        href: "/app/definitions/units",
        order: 3,
        permission: "units.view",
      },
      {
        key: "definitions.banks",
        href: "/app/definitions/bank-accounts",
        order: 4,
        permission: "bank_accounts.view",
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
        permission: "price_board.manage",
      },
      {
        key: "settings.invoice_prefs",
        href: "/app/settings/invoice",
        order: 2,
        permission: "invoice.settings",
      },
      {
        key: "settings.accounting",
        href: "/app/settings/accounting",
        order: 3,
        permission: "accounting.settings",
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
        permission: "reports.contacts",
      },
      {
        key: "reports.products",
        href: "/app/reports/products",
        order: 2,
        permission: "reports.products",
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
        permission: "deal.create",
      },
      {
        key: "invoice.list",
        href: "/app/invoice",
        order: 2,
        permission: "finance.view",
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

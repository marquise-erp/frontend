"use client"

import {
  CheckmarkBadgeIcon,
  CreditCardIcon,
  LogoutIcon,
  NotificationIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { NavUserMenuGroup, NavUserMenuItem } from "@/features/navigation/types/nav-user"

const icon = (Icon: typeof SparklesIcon) => (
  <HugeiconsIcon icon={Icon} strokeWidth={2} />
)

export const navUserMenuGroups: NavUserMenuGroup[] = [
  {
    key: "billing",
    order: 1,
    items: [
      {
        key: "upgrade",
        title: "ارتقا حساب",
        icon: icon(SparklesIcon),
        href: "/app/billing/upgrade",
        permission: "account.upgrade",
        order: 1,
      },
    ],
  },
  {
    key: "account",
    order: 2,
    items: [
      {
        key: "profile",
        title: "حساب کاربری",
        icon: icon(CheckmarkBadgeIcon),
        href: "/app/profile",
        order: 1,
      },
      {
        key: "payment",
        title: "پرداخت",
        icon: icon(CreditCardIcon),
        href: "/app/payment",
        permission: "payment.licence",
        order: 2,
      },
      {
        key: "notifications",
        title: "اعلانات",
        icon: icon(NotificationIcon),
        href: "/app/notifications",
        permission: "notifications.view",
        order: 3,
      },
    ],
  },
]

export const navUserLogoutItem: NavUserMenuItem = {
  key: "logout",
  title: "خروج",
  icon: icon(LogoutIcon),
  action: "logout",
}

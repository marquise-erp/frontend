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
import { PERMISSION_CODES } from "@/config/permissions"

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
        permission: PERMISSION_CODES.AUTH_USER_VIEW,
        order: 1,
      },
    ],
  },
  {
    key: "account",
    order: 2,
    items: [
      {
        key: "setting",
        title: "تنظیمات کاربری",
        icon: icon(CheckmarkBadgeIcon),
        href: "/app/settings",
        order: 1,
      },
      {
        key: "payment",
        title: "پرداخت",
        icon: icon(CreditCardIcon),
        href: "/app/payment",
        permission: PERMISSION_CODES.AUTH_USER_VIEW,
        order: 2,
      },
      {
        key: "notifications",
        title: "اعلانات",
        icon: icon(NotificationIcon),
        href: "/app/notifications",
        permission: PERMISSION_CODES.AUTH_USER_VIEW,
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

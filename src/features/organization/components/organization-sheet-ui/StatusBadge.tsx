"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export type MemberStatus = "active" | "invite-sent" | "inactive";

export function StatusBadge({ status }: { status: MemberStatus }) {
  const t = useTranslations('organization.sheet');

  if (status === "active") {
    return (
      <Badge className="rounded-full border-transparent bg-emerald-100 px-2.5 font-medium text-emerald-700 hover:bg-emerald-100">
        {t('status.active')}
      </Badge>
    );
  }
  if (status === "invite-sent") {
    return (
      <Badge className="rounded-full border-transparent bg-amber-100 px-2.5 font-medium text-amber-700 hover:bg-amber-100">
        {t('status.inviteSent')}
      </Badge>
    );
  }
  return (
    <span className="px-1 text-sm font-medium text-muted-foreground">
      {t('status.inactive')}
    </span>
  );
}

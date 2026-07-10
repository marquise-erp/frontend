"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailSend01Icon, MoreVerticalIcon, Power, PowerOff, Delete02Icon, X } from "@hugeicons/core-free-icons";
import { MemberStatus } from "./StatusBadge";

interface MemberActionsProps {
  status: MemberStatus;
  onResendInvite?: () => void;
  onCancelInvite?: () => void;
  onToggleActive?: () => void;
  onRemove?: () => void;
}

export function MemberActions({
  status,
  onResendInvite,
  onCancelInvite,
  onToggleActive,
  onRemove,
}: MemberActionsProps) {
  const t = useTranslations('organization.sheet');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground"
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {status === "invite-sent" ? (
          <>
            <DropdownMenuItem onClick={onResendInvite}>
              <HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} className="size-4" />
              {t('actions.resend')}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onCancelInvite}>
              <HugeiconsIcon icon={X} strokeWidth={2} className="size-4" />
              {t('actions.cancelInvite')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onToggleActive}>
              {status === "active" ? (
                <>
                  <HugeiconsIcon icon={PowerOff} strokeWidth={2} className="size-4" />
                  {t('actions.setInactive')}
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Power} strokeWidth={2} className="size-4" />
                  {t('actions.setActive')}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
              {t('actions.remove')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

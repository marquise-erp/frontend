"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus, Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { Role } from "@/features/auth/schemas/rbac.schema";
import type { OrgMember } from "../../types/organization-tree";

interface RolesTabProps {
  roles: Role[];
  members: OrgMember[];
  onAddRole?: () => void;
}

export function RolesTab({ roles, members, onAddRole }: RolesTabProps) {
  const t = useTranslations('organization.sheet');

  // Simple role usage count derived from current members
  const roleUsage = roles.map((role) => ({
    ...role,
    memberCount: members.filter((m) => String(m.roleId) === String(role.id)).length,
    status: "active" as const,
  }));

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t('roles.title')}</h3>
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
            {roleUsage.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddRole}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
          {t('roles.add')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
        <Select defaultValue="All">
          <SelectTrigger size="sm" className="rounded-lg">
            <span className="text-muted-foreground">{t('roles.status')}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t('members.all')}</SelectItem>
            <SelectItem value="Active">{t('status.active')}</SelectItem>
            <SelectItem value="Inactive">{t('status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="px-6 pt-3">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder={t('roles.search')} className="rounded-lg pl-9" />
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.4fr_1.6fr_auto] items-center gap-3 bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>{t('roles.role')}</span>
            <span>{t('roles.members')}</span>
            <span>{t('roles.statusLabel')}</span>
          </div>

          {roleUsage.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t('roles.noRoles')}
            </div>
          ) : (
            <ul className="divide-y">
              {roleUsage.map((role) => (
                <li
                  key={role.id}
                  className="grid grid-cols-[1.4fr_1.6fr_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className={cn("text-xs font-medium bg-muted")}>
                        {role.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium text-foreground">{role.name}</span>
                  </div>
                  <span className="truncate text-sm text-muted-foreground">
                    {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                  </span>
                  <div className="justify-self-start">
                    <StatusBadge status={role.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

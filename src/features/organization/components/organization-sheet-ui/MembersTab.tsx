"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Search01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { StatusBadge, type MemberStatus } from "./StatusBadge";
import { MemberActions } from "./MemberActions";
import { InviteMemberForm } from "./InviteMemberForm";
import { useCancelInvite } from "../../api";
import type { Invitation } from "../../schemas/invite.schema";
import type { Role } from "@/features/auth/schemas/role/responses";
import type { User } from "@/features/auth/schemas/user/responses";
import type { OrganizationTreeNode, OrgMember } from "../../types/organization-tree";

interface MembersTabProps {
  node: OrganizationTreeNode;
  members: OrgMember[];
  invites: Invitation[];
  users: User[];
  roles: Role[];
  onRefresh?: () => void;
}

function inviteDisplayName(invite: Invitation): string {
  return invite.mobile ?? "—";
}

function inviteContact(invite: Invitation): string {
  return invite.mobile ?? "—";
}

export function MembersTab({ node, members, invites, users, roles, onRefresh }: MembersTabProps) {
  const t = useTranslations('organization.sheet');
  const [inviteOpen, setInviteOpen] = useState(false);
  const cancelInviteMutation = useCancelInvite();

  const pendingInvites = invites.filter((invite) => invite.status === "pending");

  const displayMembers = [
    ...members.map((m) => ({
      id: m.id,
      name: m.fullName,
      mobile: m.phone || m.email,
      role: roles.find((r) => String(r.id) === String(m.roleId))?.name ?? "—",
      position: "",
      status: m.status as MemberStatus,
      avatarClass: "bg-muted text-foreground",
      initials: m.fullName
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      invitationId: null as number | null,
    })),
    ...pendingInvites.map((invite) => ({
      id: `invite-${invite.id}`,
      name: inviteDisplayName(invite),
      mobile: inviteContact(invite),
      role: invite.role.name,
      position: invite.position?.name ?? "",
      status: "invite-sent" as const,
      avatarClass: "bg-muted text-muted-foreground",
      initials: inviteDisplayName(invite)
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      invitationId: invite.id,
    })),
  ];

  const handleCancelInvite = async (invitationId: number) => {
    try {
      await cancelInviteMutation.mutateAsync(invitationId);
      toast.success(t('actions.cancelInvite'));
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel invite");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t('members.title')}</h3>
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
            {displayMembers.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen((v) => !v)}
          aria-expanded={inviteOpen}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="size-4" />
          {t('members.invite')}
        </button>
      </div>

      {inviteOpen && (
        <div className="px-6">
          <InviteMemberForm
            organizationId={node.id}
            users={users}
            roles={roles}
            onClose={() => setInviteOpen(false)}
            onSuccess={onRefresh}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
        <Select defaultValue="All">
          <SelectTrigger size="sm" className="rounded-lg">
            <span className="text-muted-foreground">{t('members.status')}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t('members.all')}</SelectItem>
            <SelectItem value="Active">{t('members.active')}</SelectItem>
            <SelectItem value="Invite sent">{t('members.inviteSent')}</SelectItem>
            <SelectItem value="Inactive">{t('members.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="All">
          <SelectTrigger size="sm" className="rounded-lg">
            <span className="text-muted-foreground">{t('members.permissions')}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t('members.all')}</SelectItem>
            <SelectItem value="Admin">{t('members.all')}</SelectItem>
            <SelectItem value="Member">{t('members.all')}</SelectItem>
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
          <Input placeholder={t('members.search')} className="rounded-lg pl-9" />
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-3 bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>{t('members.name')}</span>
            <span>{t('members.rolePosition')}</span>
            <span>{t('members.status')}</span>
            <span className="sr-only">Actions</span>
          </div>

          {displayMembers.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t('members.noMembers')}
            </div>
          ) : (
            <ul className="divide-y">
              {displayMembers.map((member) => (
                <li
                  key={member.id}
                  className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className={cn("text-xs font-medium", member.avatarClass)}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.mobile}</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{member.role}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="rtl">
                      {member.position}
                    </p>
                  </div>
                  <div className="justify-self-start">
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="justify-self-end">
                    <MemberActions
                      status={member.status}
                      onCancelInvite={
                        member.invitationId != null
                          ? () => handleCancelInvite(member.invitationId!)
                          : undefined
                      }
                      onToggleActive={() => {
                        onRefresh?.();
                      }}
                      onRemove={() => onRefresh?.()}
                    />
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

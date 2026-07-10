"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Plus, Search01Icon } from "@hugeicons/core-free-icons";
import { RoleDialog } from "@/features/auth/components/role/role-dialog";
import type { Role } from "@/features/auth/schemas/role/responses";
import type { OrgMember } from "../../types/organization-tree";
import { StatusBadge } from "./StatusBadge";

interface BrandRef {
  id: number;
  name: string;
}

interface RolesTabProps {
  brand: BrandRef;
  roles: Role[];
  members: OrgMember[];
}

export function RolesTab({ brand, roles, members }: RolesTabProps) {
  const t = useTranslations("organization.sheet");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const brandRoles = useMemo(
    () => roles.filter((role) => role.organization_id === brand.id),
    [roles, brand.id],
  );

  const availablePermissions = useMemo(() => {
    const map = new Map<number, NonNullable<Role["permissions"]>[number]>();
    roles.forEach((role) => {
      (role.permissions ?? []).forEach((permission) => {
        if (!map.has(permission.id)) {
          map.set(permission.id, permission);
        }
      });
    });
    return Array.from(map.values());
  }, [roles]);

  const roleUsage = brandRoles.map((role) => ({
    ...role,
    memberCount: members.filter((m) => String(m.roleId) === String(role.id)).length,
    status: "active" as const,
  }));

  const handleAddRole = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingRole(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t("roles.title")}</h3>
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
            {roleUsage.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddRole}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
          {t("roles.add")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
        <Select defaultValue="All">
          <SelectTrigger size="sm" className="rounded-lg">
            <span className="text-muted-foreground">{t("roles.status")}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t("members.all")}</SelectItem>
            <SelectItem value="Active">{t("status.active")}</SelectItem>
            <SelectItem value="Inactive">{t("status.inactive")}</SelectItem>
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
          <Input placeholder={t("roles.search")} className="rounded-lg pl-9" />
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.4fr_1.6fr_auto_auto] items-center gap-3 bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>{t("roles.role")}</span>
            <span>{t("roles.members")}</span>
            <span>{t("roles.statusLabel")}</span>
            <span className="sr-only">{t("roles.actions")}</span>
          </div>

          {roleUsage.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t("roles.noRoles")}
            </div>
          ) : (
            <ul className="divide-y">
              {roleUsage.map((role) => (
                <li
                  key={role.id}
                  className="grid grid-cols-[1.4fr_1.6fr_auto_auto] items-center gap-3 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-foreground">{role.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                  </span>
                  <div className="justify-self-start">
                    <StatusBadge status={role.status} />
                  </div>
                  <div className="justify-self-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground"
                      onClick={() => handleEditRole(role)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
                      <span className="sr-only">{t("roles.edit")}</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingRole={editingRole}
        brands={[brand]}
        availablePermissions={availablePermissions}
        lockedOrganizationId={brand.id}
      />
    </>
  );
}

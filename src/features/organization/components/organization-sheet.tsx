"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useRoles } from "@/features/auth/api/role";
import { useUsers } from "@/features/auth/api/user";
import { useCreateOrganization, useOrganizationInvites, useUpdateOrganization } from "../api";
import { InlineEdit } from "./organization-sheet-ui/InlineEdit";
import { GeneralTab } from "./organization-sheet-ui/GeneralTab";
import { MembersTab } from "./organization-sheet-ui/MembersTab";
import { RolesTab } from "./organization-sheet-ui/RolesTab";
import { ORGANIZATION_LEVELS, type OrganizationTreeNode, type OrgMember } from "../types/organization-tree";
import type { OrganizationType } from "../schemas/types";

const allTabKeys = ["general", "roles", "members"] as const;
type TabKey = (typeof allTabKeys)[number];

/** Describes what the sheet is doing: editing an existing node or creating a child. */
export type OrganizationSheetMode =
  | { type: "edit"; node: OrganizationTreeNode }
  | { type: "create"; parent: OrganizationTreeNode; createType: OrganizationType };

export interface OrganizationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: OrganizationSheetMode | null;
}

const sheetContentClass = "w-full gap-0 overflow-y-auto p-0 data-[side=left]:md:max-w-md data-[side=left]:lg:max-w-lg";

export function OrganizationSheet({ open, onOpenChange, target }: OrganizationSheetProps) {
  const t = useTranslations("organization.sheet");

  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const { data: roles = [] } = useRoles();
  const { data: users = [] } = useUsers();

  // Inline-edit header state (edit mode, auto-saved on change).
  const [localName, setLocalName] = useState("");
  const [localDesc, setLocalDesc] = useState("");

  // Create-mode form state.
  const [createName, setCreateName] = useState("");

  // Once a node is created, we keep the sheet open and continue in edit mode
  // for this freshly-created node (it now has a real id).
  const [createdNode, setCreatedNode] = useState<OrganizationTreeNode | null>(null);

  const organizationId =
    createdNode?.id ?? (target?.type === "edit" ? target.node.id : null);
  const invitesEnabled =
    target != null &&
    !(target.type === "create" && createdNode == null) &&
    organizationId != null;

  const { data: invites = [], refetch: refetchInvites } = useOrganizationInvites(
    organizationId ?? 0,
    invitesEnabled,
  );

  const updateMutation = useUpdateOrganization();
  const createMutation = useCreateOrganization();

  const editNode = target?.type === "edit" ? target.node : null;

  const targetKey =
    target == null
      ? "none"
      : target.type === "edit"
        ? `edit:${target.node.id}`
        : `create:${target.parent.id}:${target.createType}`;

  const effectiveNode =
    createdNode ?? (target?.type === "edit" ? target.node : null);
  const showRolesTab =
    effectiveNode?.type === "brand" || effectiveNode?.type === "holding";

  const members = useMemo<OrgMember[]>(() => {
    const node = effectiveNode;
    if (!node) return [];
    return users
      .filter((user) =>
        user.scopes?.some(
          (scope) => String(scope.organization?.id) === String(node.id)
        )
      )
      .map((user) => {
        const matchingScope = user.scopes?.find(
          (scope) => String(scope.organization?.id) === String(node.id)
        );
        return {
          id: String(user.id),
          fullName: (user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()) || user.mobile,
          email: user.email ?? "",
          phone: user.mobile,
          roleId: matchingScope?.role?.id,
          positionName: matchingScope?.position?.name,
          status: user.is_active ? "active" : "inactive",
        };
      });
  }, [users, effectiveNode]);

  // Reset internal state whenever the sheet target changes (hook order stays stable).
  useEffect(() => {
    setCreatedNode(null);
    setActiveTab("general");
    if (target?.type === "edit") {
      setLocalName(target.node.name);
      setLocalDesc(target.node.description ?? "");
    } else if (target?.type === "create") {
      setCreateName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, editNode?.name, editNode?.description]);

  useEffect(() => {
    if (!showRolesTab && activeTab === "roles") {
      setActiveTab("general");
    }
  }, [showRolesTab, activeTab]);

  // If we have no target, still render the Sheet shell so that open/close
  // animations and controlled state continue to work correctly.
  if (!target) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" showCloseButton className={sheetContentClass} />
      </Sheet>
    );
  }

  // While a "create" target has not yet produced a node, we're in create mode.
  const isCreating = target.type === "create" && !createdNode;

  // The node currently being edited: the just-created one, or the edit target.
  const node = effectiveNode;

  const tabKeys = showRolesTab
    ? allTabKeys
    : (["general", "members"] as const satisfies readonly TabKey[]);

  const meta = isCreating
    ? ORGANIZATION_LEVELS[target.createType]
    : ORGANIZATION_LEVELS[node!.type];
  const Icon = meta.icon;

  const handleCreate = async () => {
    if (target.type !== "create") return;
    const name = createName.trim();
    if (!name) return;
    try {
      const res = await createMutation.mutateAsync({
        parent_id: Number(target.parent.id),
        name,
        type: target.createType,
      });
      const newNode: OrganizationTreeNode = {
        id: String(res.id),
        name: res.name,
        type: res.type,
        description: res.description ?? undefined,
        profile: res.profile ?? null,
        children: [],
      };
      // Stay open and switch into edit mode for the new node.
      setCreatedNode(newNode);
      setLocalName(newNode.name);
      setLocalDesc(newNode.description ?? "");
      setActiveTab("general");
      toast.success("Organization created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create");
    }
  };

  const handleSaveHeader = async (name: string, description: string) => {
    if (!node) return;
    try {
      await updateMutation.mutateAsync({
        id: Number(node.id),
        data: {
          id: Number(node.id),
          name,
          description,
        },
      });
      toast.success("Organization updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
      // revert? for simplicity we keep the local optimistic value
    }
  };

  const handleNameChange = (next: string) => {
    setLocalName(next);
    handleSaveHeader(next, localDesc);
  };

  const handleDescChange = (next: string) => {
    setLocalDesc(next);
    handleSaveHeader(localName, next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" showCloseButton className={sheetContentClass}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
                color: meta.color,
              }}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-7" />
            </div>
            <div className="min-w-0">
              {isCreating ? (
                <>
                  <h2 className="text-xl font-semibold leading-tight text-foreground">
                    {`افزودن ${meta.label} جدید`}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {`در «${target.parent.name}»`}
                  </p>
                </>
              ) : (
                <>
                  <InlineEdit
                    ariaLabel={t("titlePlaceholder")}
                    value={localName}
                    onChange={handleNameChange}
                    className="text-xl font-semibold leading-tight text-foreground"
                    inputClassName="text-xl font-semibold"
                    disabled={updateMutation.isPending}
                  />
                  <InlineEdit
                    ariaLabel="Description"
                    value={localDesc || ""}
                    onChange={handleDescChange}
                    className="mt-0.5 text-sm text-muted-foreground"
                    inputClassName="text-sm"
                    disabled={updateMutation.isPending}
                    placeholder={t("descriptionPlaceholder")}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs (roles/members are disabled until the node is created) */}
        <div className="mt-6 border-t border-dashed px-6">
          <div className="-mb-px flex flex-wrap gap-1 pt-3">
            {tabKeys.map((key) => {
              const disabled = isCreating && key !== "general";
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setActiveTab(key)}
                  title={disabled ? t("createFirst") : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    activeTab === key && !disabled
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground"
                  )}
                >
                  {t(`tabs.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isCreating ? (
          <div className="grid gap-4 px-6 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="org-create-name">{`نام ${meta.label}`}</Label>
              <Input
                id="org-create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder={`نام ${meta.label} را وارد کنید`}
                autoFocus
              />
            </div>

            <p className="text-xs text-muted-foreground">{t("createHint")}</p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                انصراف
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!createName.trim() || createMutation.isPending}
                style={{ background: meta.color, color: "white" }}
              >
                {createMutation.isPending ? "در حال ایجاد..." : `افزودن ${meta.label}`}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "general" && <GeneralTab node={node!} memberCount={members.length} />}
            {activeTab === "roles" && showRolesTab && node && (
              <RolesTab
                brand={{ id: Number(node.id), name: node.name }}
                roles={roles}
                members={members}
              />
            )}
            {activeTab === "members" && (
              <MembersTab
                node={node!}
                members={members}
                invites={invites}
                users={users}
                roles={roles}
                onRefresh={() => {
                  void refetchInvites();
                }}
              />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

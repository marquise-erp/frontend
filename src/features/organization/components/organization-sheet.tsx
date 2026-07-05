"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useRoles } from "@/features/auth/hooks/use-roles";
import { useUpdateOrganization } from "../api";

import { InlineEdit } from "./node-sheet/InlineEdit";
import { GeneralTab } from "./node-sheet/GeneralTab";
import { MembersTab } from "./node-sheet/MembersTab";
import { RolesTab } from "./node-sheet/RolesTab";
import { ORGANIZATION_LEVELS, type OrganizationTreeNode, type OrgMember } from "../types/organization-tree";

const tabKeys = ["general", "roles", "members"] as const;

export interface NodeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrganizationTreeNode | null;
}

export function OrganizationSheet({ open, onOpenChange, node }: NodeSheetProps) {
  // IMPORTANT: All hooks must be called unconditionally (Rules of Hooks).
  // Never put hooks after a conditional early return based on `node`.
  const t = useTranslations('organization.sheet');

  const [activeTab, setActiveTab] = useState<"general" | "roles" | "members">("general");

  const { data: roles = [] } = useRoles();
  // No members API yet; org members are shown as an empty list for now.
  const members: OrgMember[] = [];

  // Local header state must be declared on every render
  const [localName, setLocalName] = useState("");
  const [localDesc, setLocalDesc] = useState("");

  const updateMutation = useUpdateOrganization();

  // Keep local header fields in sync when the selected node changes.
  // This effect always runs (hook order is stable).
  useEffect(() => {
    if (node) {
      setLocalName(node.name);
      setLocalDesc(node.description ?? "");
    }
  }, [node?.id, node?.name, node?.description]);

  // If we have no node, still render the Sheet shell so that open/close
  // animations and controlled state continue to work correctly.
  if (!node) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          showCloseButton
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
        />
      </Sheet>
    );
  }

  // From this point on, node is guaranteed to exist.
  const meta = ORGANIZATION_LEVELS[node.type];
  const Icon = meta.icon;

  const handleSaveHeader = async (name: string, description: string) => {
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
      <SheetContent
        side="left"
        showCloseButton
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        {/* Org header */}
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
              <InlineEdit
                ariaLabel={t('titlePlaceholder')}
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
                placeholder={t('descriptionPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-t border-dashed px-6">
          <div className="-mb-px flex flex-wrap gap-1 pt-3">
            {tabKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`tabs.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "general" && <GeneralTab node={node} memberCount={members.length} />}
        {activeTab === "roles" && (
          <RolesTab roles={roles} members={members} onAddRole={() => { /* TODO: open role assign dialog */ }} />
        )}
        {activeTab === "members" && (
          <MembersTab
            node={node}
            members={members}
            roles={roles}
            onRefresh={() => {
              // RBAC store updates are synchronous; parent tree will react via re-render
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { InlineEdit } from "@/features/organization/components/organization-sheet-ui/InlineEdit";
import { useCreateCustomerGroup, useUpdateCustomerGroup } from "../api";
import { GeneralTab } from "./customer-group-sheet-ui/GeneralTab";
import {
  CUSTOMER_GROUP_TYPES,
  CHILD_GROUP_META,
  getNodeDisplayMeta,
  type CustomerGroupTreeNode,
} from "../types/customer-group-tree";
import type { CustomerGroupType } from "../schemas/types";
import type { CreateCustomerGroupRequest } from "../schemas/requests";

/** Describes what the sheet is doing: editing an existing node or creating a child/root. */
export type CustomerGroupSheetMode =
  | { type: "edit"; node: CustomerGroupTreeNode }
  | { type: "create"; parent: CustomerGroupTreeNode | null; segmentType?: CustomerGroupType };

export interface CustomerGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CustomerGroupSheetMode | null;
}

const sheetContentClass = "w-full gap-0 overflow-y-auto p-0 sm:max-w-xl";

export function CustomerGroupSheet({ open, onOpenChange, target }: CustomerGroupSheetProps) {
  const t = useTranslations("customerGroup.sheet");

  const [localName, setLocalName] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  const [createName, setCreateName] = useState("");
  const [createdNode, setCreatedNode] = useState<CustomerGroupTreeNode | null>(null);

  const updateMutation = useUpdateCustomerGroup();
  const createMutation = useCreateCustomerGroup();

  const editNode = target?.type === "edit" ? target.node : null;

  const isRootCreate = target?.type === "create" && target.parent == null;

  const targetKey =
    target == null
      ? "none"
      : target.type === "edit"
        ? `edit:${target.node.id}`
        : `create:${target.parent?.id ?? "root"}:${target.segmentType ?? "child"}`;

  useEffect(() => {
    setCreatedNode(null);
    if (target?.type === "edit") {
      setLocalName(target.node.name);
      setLocalDesc(target.node.description ?? "");
    } else if (target?.type === "create") {
      setCreateName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, editNode?.name, editNode?.description]);

  if (!target) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" showCloseButton className={sheetContentClass} />
      </Sheet>
    );
  }

  const isCreating = target.type === "create" && !createdNode;
  const node = createdNode ?? (target.type === "edit" ? target.node : null);

  const displayMeta = isCreating
    ? isRootCreate && target.segmentType
      ? CUSTOMER_GROUP_TYPES[target.segmentType]
      : CHILD_GROUP_META
    : getNodeDisplayMeta(node!);
  const Icon = displayMeta.icon;

  const handleCreate = async () => {
    if (target.type !== "create") return;
    const name = createName.trim();
    if (!name) return;
    try {
      const payload: CreateCustomerGroupRequest =
        target.parent == null
          ? {
              parent_id: null,
              name,
              type: target.segmentType!,
            }
          : {
              parent_id: Number(target.parent.id),
              name,
            };

      const res = await createMutation.mutateAsync(payload);
      const newNode: CustomerGroupTreeNode = {
        id: String(res.id),
        name: res.name,
        type: res.type ?? null,
        segmentType: res.type ?? target.parent?.segmentType ?? undefined,
        description: res.description ?? undefined,
        children: [],
      };
      setCreatedNode(newNode);
      setLocalName(newNode.name);
      setLocalDesc(newNode.description ?? "");
      toast.success(t("created"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("createFailed");
      toast.error(message);
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
      toast.success(t("updated"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("updateFailed");
      toast.error(message);
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

  const createTitle = isRootCreate
    ? t("addNewRoot", { type: displayMeta.label })
    : t("addNewChild");

  const nameLabel = isRootCreate
    ? t("nameLabel", { type: displayMeta.label })
    : t("childNameLabel");

  const namePlaceholder = isRootCreate
    ? t("namePlaceholder", { type: displayMeta.label })
    : t("childNamePlaceholder");

  const submitLabel = isRootCreate
    ? t("add", { type: displayMeta.label })
    : t("addChild");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" showCloseButton className={sheetContentClass}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${displayMeta.color} 18%, transparent)`,
                color: displayMeta.color,
              }}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-7" />
            </div>
            <div className="min-w-0">
              {isCreating ? (
                <>
                  <h2 className="text-xl font-semibold leading-tight text-foreground">
                    {createTitle}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {target.parent
                      ? t("underParent", { name: target.parent.name })
                      : t("rootLevel", { type: displayMeta.label })}
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

        {isCreating ? (
          <div className="grid gap-4 px-6 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="cg-create-name">{nameLabel}</Label>
              <Input
                id="cg-create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder={namePlaceholder}
                autoFocus
              />
            </div>

            <p className="text-xs text-muted-foreground">{t("createHint")}</p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!createName.trim() || createMutation.isPending}
                style={{ background: displayMeta.color, color: "white" }}
              >
                {createMutation.isPending ? t("creating") : submitLabel}
              </Button>
            </div>
          </div>
        ) : (
          <GeneralTab node={node!} />
        )}
      </SheetContent>
    </Sheet>
  );
}

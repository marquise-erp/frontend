"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ORGANIZATION_LEVELS,
  type OrganizationLevelMeta,
  type OrganizationTreeNode,
} from "../types/organization-tree";
import { findPath, findNode } from "../lib/org-tree-utils";
import { useCreateOrganization, useUpdateOrganization } from "../api";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { OrganizationType } from "../schemas/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  roots: OrganizationTreeNode[];
  parentId?: string;
  parentType?: OrganizationType;
  node?: OrganizationTreeNode;
}

export function NodeFormDialog({ open, onOpenChange, mode, roots, parentId, parentType, node }: Props) {
  const childType = mode === "edit" ? node!.type : parentType ? ORGANIZATION_LEVELS[parentType].child : null;
  const targetType = childType ?? "brand";
  const meta = ORGANIZATION_LEVELS[targetType];
  const Icon = meta.icon;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const isPending = createOrganization.isPending || updateOrganization.isPending;

  const parentNode = useMemo(() => {
    if (mode === "edit" && node) {
      const path = findPath(roots, node.id);
      return path.length > 1 ? path[path.length - 2] : null;
    }
    return parentId ? findNode(roots, parentId) : null;
  }, [roots, mode, node, parentId]);

  const parentPath = mode === "edit" && node
    ? findPath(roots, node.id).slice(0, -1)
    : parentId
      ? findPath(roots, parentId)
      : [];

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && node) {
      setName(node.name);
      setCode(node.code ?? "");
    } else {
      setName("");
      setCode("");
    }
  }, [open, mode, node]);

  const submit = async () => {
    if (!name.trim()) return;

    try {
      if (mode === "edit" && node) {
        await updateOrganization.mutateAsync({
          id: Number(node.id),
          name: name.trim(),
        });
      } else if (parentId && parentType) {
        await createOrganization.mutateAsync({
          parentId,
          parentType,
          name: name.trim(),
          code: code.trim() || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // Errors surface via React Query; keep dialog open for retry.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1 flex-wrap">
            {parentPath.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1">
                {i > 0 && <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-3 w-3" />}
                <span>{ORGANIZATION_LEVELS[p.type].label}</span>
                <span className="text-foreground/70">«{p.name}»</span>
              </div>
            ))}
            {parentPath.length > 0 && <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-3 w-3" />}
            <span
              className="font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                color: meta.color,
              }}
            >
              {meta.label}
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in oklab, ${meta.color} 15%, transparent)`, color: meta.color }}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="h-4 w-4" />
            </span>
            {mode === "edit" ? `ویرایش ${meta.label}` : `افزودن ${meta.label} جدید`}
          </DialogTitle>
        </DialogHeader>

        <GeneralForm
          name={name}
          setName={setName}
          code={code}
          setCode={setCode}
          meta={meta}
          parentRegionName={parentNode?.type === "region" ? parentNode.name : undefined}
        />
        <DialogFooter className="gap-2 sm:gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || isPending}
            style={{ background: meta.color, color: "white" }}
          >
            {mode === "edit" ? "ذخیره تغییرات" : `افزودن ${meta.label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GeneralForm({
  name,
  setName,
  code,
  setCode,
  meta,
  parentRegionName,
}: {
  name: string;
  setName: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  meta: OrganizationLevelMeta;
  parentRegionName?: string;
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="flex items-center gap-2">
          نام {meta.label}
          {parentRegionName && (
            <Badge variant="secondary" className="text-[10px]">منطقه: {parentRegionName}</Badge>
          )}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`نام ${meta.label} را وارد کنید`}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="code">کد یکتا</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="مثلاً KIA-001"
          dir="ltr"
        />
      </div>
    </div>
  );
}


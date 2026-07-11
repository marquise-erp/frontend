"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TreeTable } from "@/components/ui/tree-table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NeuralNetworkIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { OrganizationSheet, type OrganizationSheetMode } from "./organization-sheet";
import {
  ORGANIZATION_LEVELS,
  type OrganizationTreeNode,
} from "../types/organization-tree";
import { useOrganizations } from "../api";
import { OrganizationTreeRow } from "./organization-tree-ui/organization-tree-row";
import { useUsers } from "@/features/auth/api/user";

export function OrganizationTree() {
  const { data: roots, isPending, isError, error } = useOrganizations();
  const { data: users = [] } = useUsers();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<OrganizationSheetMode | null>(null);

  const rootNode = roots?.[0];

  const openEdit = (node: OrganizationTreeNode) => {
    setTarget({ type: "edit", node });
    setSheetOpen(true);
  };

  const openCreate = (parent: OrganizationTreeNode) => {
    const childType = ORGANIZATION_LEVELS[parent.type].child;
    if (!childType) return;
    setTarget({ type: "create", parent, createType: childType });
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Clear the target after the close animation finishes.
      // OrganizationSheet renders open=true + target=null safely.
      setTimeout(() => setTarget(null), 200);
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon icon={NeuralNetworkIcon} strokeWidth={2} className="h-4 w-4 text-primary" />
            ساختار سازمانی
          </CardTitle>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => rootNode && openCreate(rootNode)}
            disabled={!rootNode}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
            افزودن برند
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-4 max-w-full text-xs text-muted-foreground break-words">
            روی نام هر گره کلیک کنید تا شیت جزئیات و مدیریت اعضا/نقش‌ها باز شود.
          </p>

          {isPending ? (
            <OrgTreeSkeleton />
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>خطا در بارگذاری ساختار سازمانی</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "ارتباط با سرور برقرار نشد."}
              </AlertDescription>
            </Alert>
          ) : !roots?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              هنوز ساختار سازمانی ثبت نشده است.
            </p>
          ) : (
            <TreeTable<OrganizationTreeNode>
              data={roots}
              defaultExpandedDepth={2}
              renderRow={(node, ctx) => (
                <OrganizationTreeRow
                  node={node}
                  ctx={ctx}
                  onEdit={openEdit}
                  onAddChild={openCreate}
                  allUsers={users}
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      <OrganizationSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        target={target}
      />
    </div>
  );
}

function OrgTreeSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" style={{ marginInlineStart: `${i * 0.75}rem` }} />
      ))}
    </div>
  );
}

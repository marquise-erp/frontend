"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { NeuralNetworkIcon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { NodeFormDialog } from "@/features/organization/components/NodeFormDialog";
import { OrgTree } from "@/features/organization/components/organization-tree";
import { useOrganizations } from "@/features/organization/api";
import type { OrganizationTreeNode } from "@/features/organization/types/organization-tree";
import { OrganizationSheet } from "@/features/organization/components/organization-sheet";

export default function OrganizationPage() {
  const { data: roots, isPending, isError, error } = useOrganizations();
  const [addOpen, setAddOpen] = useState(false);

  // NodeSheet (primary details + edit surface for a node)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrganizationTreeNode | null>(null);

  const rootNode = roots?.[0];

  const handleNodeClick = (node: OrganizationTreeNode) => {
    setSelectedNode(node);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Clear the node after the sheet close animation finishes.
      // NodeSheet itself handles renders where open=true + node=null safely.
      setTimeout(() => setSelectedNode(null), 200);
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
          <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)} disabled={!rootNode}>
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
            <div className="space-y-4">
              {roots.map((node) => (
                <OrgTree
                  key={node.id}
                  root={node}
                  roots={roots}
                  onNodeClick={handleNodeClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {addOpen && rootNode && (
        <NodeFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="create"
          parentId={rootNode.id}
          parentType={rootNode.type}
          roots={roots ?? []}
        />
      )}

      <OrganizationSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        node={selectedNode}
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

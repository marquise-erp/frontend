"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TreeTable } from "@/components/ui/tree-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { CustomerGroupSheet, type CustomerGroupSheetMode } from "./customer-group-sheet";
import { useCustomerGroups } from "../api";
import { CustomerGroupTreeRow } from "./customer-group-tree-ui/customer-group-tree-row";
import {
  CUSTOMER_GROUP_TYPES,
  CUSTOMER_GROUP_TYPE_LIST,
  type CustomerGroupTreeNode,
} from "../types/customer-group-tree";
import type { CustomerGroupType } from "../schemas/types";

export function CustomerGroupTree() {
  const t = useTranslations("customerGroup");
  const { data: roots, isPending, isError, error } = useCustomerGroups();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<CustomerGroupSheetMode | null>(null);

  const openEdit = (node: CustomerGroupTreeNode) => {
    setTarget({ type: "edit", node });
    setSheetOpen(true);
  };

  const openCreateChild = (parent: CustomerGroupTreeNode) => {
    setTarget({ type: "create", parent });
    setSheetOpen(true);
  };

  const openCreateRoot = (segmentType: CustomerGroupType) => {
    setTarget({ type: "create", parent: null, segmentType });
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setTimeout(() => setTarget(null), 200);
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="h-4 w-4 text-primary" />
            {t("title")}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                {t("addRoot")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {CUSTOMER_GROUP_TYPE_LIST.map((segmentType) => {
                const meta = CUSTOMER_GROUP_TYPES[segmentType];
                return (
                  <DropdownMenuItem
                    key={segmentType}
                    onClick={() => openCreateRoot(segmentType)}
                  >
                    <HugeiconsIcon
                      icon={meta.icon}
                      strokeWidth={2}
                      className="h-4 w-4"
                      style={{ color: meta.color }}
                    />
                    {meta.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="mb-4 max-w-full break-words text-xs text-muted-foreground">
            {t("hint")}
          </p>

          {isPending ? (
            <CustomerGroupTreeSkeleton />
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>{t("loadError")}</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadErrorGeneric")}
              </AlertDescription>
            </Alert>
          ) : !roots?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <TreeTable<CustomerGroupTreeNode>
              data={roots}
              defaultExpandedDepth={2}
              renderRow={(node, ctx) => (
                <CustomerGroupTreeRow
                  node={node}
                  ctx={ctx}
                  onEdit={openEdit}
                  onAddChild={openCreateChild}
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      <CustomerGroupSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        target={target}
      />
    </div>
  );
}

function CustomerGroupTreeSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-12 w-full rounded-lg"
          style={{ marginInlineStart: `${i * 0.75}rem` }}
        />
      ))}
    </div>
  );
}

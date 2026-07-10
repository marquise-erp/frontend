"use client";

import { useState } from "react";
import { DeleteDialog } from "@/features/shared/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TreeRowContext } from "@/components/ui/tree-table";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { useDeleteCustomerGroup } from "../../api";
import {
  getNodeDisplayMeta,
  isRootNode,
  type CustomerGroupTreeNode,
} from "../../types/customer-group-tree";

export function CustomerGroupTreeRow({
  node,
  ctx,
  onEdit,
  onAddChild,
}: {
  node: CustomerGroupTreeNode;
  ctx: TreeRowContext;
  onEdit: (node: CustomerGroupTreeNode) => void;
  onAddChild: (node: CustomerGroupTreeNode) => void;
}) {
  const { depth, expanded, hasChildren, toggle } = ctx;
  const meta = getNodeDisplayMeta(node);
  const Icon = meta.icon;
  const isRoot = isRootNode(node);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteCustomerGroup = useDeleteCustomerGroup();

  const handleConfirmDelete = () => {
    deleteCustomerGroup.mutate(Number(node.id));
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        className="group/row relative flex items-center gap-2 px-2 py-2.5 transition-colors hover:bg-accent/40"
        style={{
          paddingInlineStart: `${depth * 1.25 + 0.5}rem`,
          borderBottom: `1px solid color-mix(in oklab, ${meta.color} 20%, transparent)`,
          borderRadius: 0,
        }}
      >
        <span
          className="absolute inset-y-2 w-[3px] rounded-full"
          style={{ insetInlineStart: `${depth * 1.25 + 0.1}rem`, background: meta.color, opacity: 0.5 }}
        />

        {hasChildren ? (
          <button
            onClick={toggle}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            aria-label="toggle"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className={cn("h-4 w-4 transition-transform", expanded && "-rotate-90")}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
            color: meta.color,
          }}
        >
          <HugeiconsIcon icon={Icon} strokeWidth={2} className="h-4 w-4" />
        </span>

        <button
          type="button"
          onClick={() => onEdit(node)}
          className="group -mx-1 min-w-0 flex-1 rounded-md px-1 py-0.5 text-start leading-tight hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold group-hover:underline">{node.name}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {isRoot && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {meta.label}
              </span>
            )}
            {(node.children?.length ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground/70">
                {isRoot && "· "}
                {(node.children?.length ?? 0).toLocaleString("fa-IR")} زیرگروه
              </span>
            )}
          </div>
        </button>

        <div className="ml-auto flex min-w-[88px] flex-shrink-0 items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 max-md:hidden">
          <div className="w-7">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onAddChild(node)}
              aria-label="افزودن زیرگروه"
              title="افزودن زیرگروه"
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                className="h-3.5 w-3.5"
                style={{ color: meta.color }}
              />
            </Button>
          </div>
          <div className="w-7">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onEdit(node)}
              aria-label="ویرایش / جزئیات"
              title="ویرایش / جزئیات"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="w-7">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteCustomerGroup.isPending}
              aria-label="حذف"
              title="حذف"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="گزینه‌ها">
                <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onAddChild(node)}>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  className="h-4 w-4"
                  style={{ color: meta.color }}
                />
                افزودن زیرگروه
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(node)}>
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="h-4 w-4" />
                ویرایش
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                disabled={deleteCustomerGroup.isPending}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityLabel={isRoot ? meta.label : "زیرگروه"}
        entityName={node.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteCustomerGroup.isPending}
      />
    </>
  );
}

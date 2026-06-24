import { useState } from "react";
import { cn } from "@/lib/utils";
import { ORGANIZATION_LEVELS} from "../config/organization-levels";
import { NodeFormDialog } from "./NodeFormDialog";
import { Button } from "@/components/ui/button";
import { useUsersForLevel } from "../store/rbac-store";
import { AvatarGroup } from "./AvatarGroup";
import {
  useDeleteOrganization,
} from "../hooks/use-organizations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft01Icon, Delete02Icon, MoreVerticalIcon, PencilEdit01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { OrganizationTreeNode } from "../types/organization-tree";

function Row({
  node,
  depth,
  roots,
}: {
  node: OrganizationTreeNode;
  depth: number;
  roots: OrganizationTreeNode[];
}) {
  const meta = ORGANIZATION_LEVELS[node.type];
  const Icon = meta.icon;
  const hasChildren = (node.children?.length ?? 0) > 0;
  const canAdd = meta.child !== null;
  const canDelete = node.type !== "holding";
  const [open, setOpen] = useState(depth < 2);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const deleteOrganization = useDeleteOrganization();

  const users = useUsersForLevel(node.id);
  const isActive = false;

  const handleDelete = () => {
    if (confirm(`حذف «${node.name}»؟`)) {
      deleteOrganization.mutate(node.id);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group/row relative flex items-center gap-2 px-2 py-2.5 transition-colors hover:bg-accent/40",
          isActive && "bg-accent/60",
        )}
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
            onClick={() => setOpen((o) => !o)}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            aria-label="toggle"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className={cn("h-4 w-4 transition-transform", open && "-rotate-90")} />
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{
            background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
            color: meta.color,
          }}
        >
          <HugeiconsIcon icon={Icon} strokeWidth={2} className="h-4 w-4" />
        </span>

        <div className="flex-1 min-w-0 leading-tight">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">{node.name}</span>
            {node.code && (
              <span className="text-[10px] font-mono text-muted-foreground/70" dir="ltr">
                {node.code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {meta.label}
            </span>
            {node.type === "branch" && (node.children?.length ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground/70">
                · {(node.children?.length ?? 0).toLocaleString("fa-IR")} واحد
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center mr-2 flex-shrink-0">
          <AvatarGroup users={users} max={5} />
        </div>

        <div className="hidden md:flex items-center gap-0.5 ml-auto min-w-[88px] justify-end opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0">
          <div className="w-7">
            {canAdd && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setAddOpen(true)}
                aria-label="افزودن زیرمجموعه"
                title={`افزودن ${ORGANIZATION_LEVELS[meta.child!].label}`}
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-3.5 w-3.5" style={{ color: meta.color }} />
              </Button>
            )}
          </div>
          <div className="w-7">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setEditOpen(true)}
              aria-label="ویرایش"
              title="ویرایش"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="w-7">
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteOrganization.isPending}
                aria-label="حذف"
                title="حذف"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="md:hidden flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="گزینه‌ها">
                <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {canAdd && (
                <DropdownMenuItem onClick={() => setAddOpen(true)}>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" style={{ color: meta.color }} />
                  افزودن {ORGANIZATION_LEVELS[meta.child!].label}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="h-4 w-4" />
                ویرایش
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleteOrganization.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-4 w-4" />
                    حذف
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {open && (
        <div>
          {node.children?.map((c) => (
            <Row key={c.id} node={c} depth={depth + 1} roots={roots} />
          ))}
        </div>
      )}

      {editOpen && (
        <NodeFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          node={node}
          roots={roots}
        />
      )}
      {addOpen && canAdd && (
        <NodeFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="create"
          parentId={node.id}
          parentType={node.type}
          roots={roots}
        />
      )}
    </div>
  );
}

export function OrgTree({
  root,
  roots,
}: {
  root: OrganizationTreeNode;
  roots: OrganizationTreeNode[];
}) {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-border/40">
      <Row node={root} depth={0} roots={roots} />
    </div>
  );
}

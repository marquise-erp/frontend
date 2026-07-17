import { DeleteDialog } from "@/features/shared/components/delete-dialog";
import { useDeleteOrganization } from "../../api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    ArrowLeft01Icon,
    Delete02Icon,
    MoreVerticalIcon,
    PencilEdit01Icon,
    PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { AvatarGroup } from "./avatar-group";
import {
    ORGANIZATION_LEVELS,
    type OrganizationTreeNode,
    type OrgMember,
} from "../../types/organization-tree";
import type { User } from "@/features/auth/schemas/user/responses";
import { TreeRowContext } from "@/components/ui/tree-table";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function OrganizationTreeRow({
    node,
    ctx,
    onEdit,
    onAddChild,
    allUsers = [],
}: {
    node: OrganizationTreeNode;
    ctx: TreeRowContext;
    onEdit: (node: OrganizationTreeNode) => void;
    onAddChild: (node: OrganizationTreeNode) => void;
    allUsers?: User[];
}) {
    const { depth, expanded, hasChildren, toggle } = ctx;
    const meta = ORGANIZATION_LEVELS[node.type];
    const Icon = meta.icon;
    const canAdd = meta.child !== null;
    const canDelete = node.type !== "holding";

    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteOrganization = useDeleteOrganization();

    const users: OrgMember[] = allUsers
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
                fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.mobile,
                email: user.email ?? "",
                phone: user.mobile,
                roleId: matchingScope?.role?.id,
                positionName: matchingScope?.position?.name,
                status: user.is_active ? "active" : "inactive",
            };
        });

    const handleConfirmDelete = () => {
        deleteOrganization.mutate(Number(node.id));
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
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className={cn("h-4 w-4 transition-transform", expanded && "-rotate-90")} />
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

                <button
                    type="button"
                    onClick={() => onEdit(node)}
                    className="group flex-1 min-w-0 text-start leading-tight rounded-md px-1 -mx-1 py-0.5 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold group-hover:underline">{node.name}</span>
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
                </button>

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
                                onClick={() => onAddChild(node)}
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
                            onClick={() => onEdit(node)}
                            aria-label="ویرایش / جزئیات"
                            title="ویرایش / جزئیات"
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
                                onClick={() => setDeleteOpen(true)}
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
                                <DropdownMenuItem onClick={() => onAddChild(node)}>
                                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" style={{ color: meta.color }} />
                                    افزودن {ORGANIZATION_LEVELS[meta.child!].label}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(node)}>
                                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="h-4 w-4" />
                                ویرایش
                            </DropdownMenuItem>
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setDeleteOpen(true)}
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

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                entityLabel={meta.label}
                entityName={node.name}
                onConfirm={handleConfirmDelete}
                isLoading={deleteOrganization.isPending}
            />
        </>
    );
}
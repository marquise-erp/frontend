'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  CheckmarkSquare02Icon,
  CancelSquareIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  usePositionAccessRules,
  useSyncPositionAccessRules,
} from '@/features/auth/api/access-rule';
import type { Permission } from '@/features/auth/schemas/role/responses';
import {
  accessRuleKey,
  type AccessRule,
} from '@/features/auth/schemas/access-rule/responses';
import { AUTHORIZABLE_TYPES } from './authorizable-selector';
import { AccessRuleDialog } from './access-rule-dialog';
import { DeleteDialog } from '@/features/shared/components/delete-dialog';

interface PermissionRulesPanelProps {
  positionId: number;
  permissions: Permission[];
}

function typeLabel(type: string): string {
  return AUTHORIZABLE_TYPES.find((t) => t.value === type)?.label ?? type;
}

interface RuleBadgeProps {
  rule: AccessRule;
  onEdit: (rule: AccessRule) => void;
  onDelete: (rule: AccessRule) => void;
}

function RuleBadge({ rule, onEdit, onDelete }: RuleBadgeProps) {
  const isAllow = rule.strategy === 'allow';

  return (
    <div
      className={cn(
        'group/rule flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
        isAllow
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
          : 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
      )}
    >
      <HugeiconsIcon
        icon={isAllow ? CheckmarkSquare02Icon : CancelSquareIcon}
        className="h-3 w-3 shrink-0"
      />
      <span className="font-medium">{typeLabel(rule.authorizable_type)}</span>
      <span className="text-[10px] opacity-70">
        {rule.authorizable_ids.length} مورد
      </span>

      <span className="flex items-center gap-0.5 ml-0.5">
        <button
          type="button"
          onClick={() => onEdit(rule)}
          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="ویرایش"
        >
          <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(rule)}
          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="حذف"
        >
          <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
        </button>
      </span>
    </div>
  );
}

interface PermissionRowProps {
  permission: Permission;
  rules: AccessRule[];
  onAddRule: (permission: Permission) => void;
  onEditRule: (rule: AccessRule) => void;
  onDeleteRule: (rule: AccessRule) => void;
}

function PermissionRow({
  permission,
  rules,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: PermissionRowProps) {
  const myRules = rules.filter((r) => r.permission === permission.slug);
  const [expanded, setExpanded] = useState(myRules.length > 0);

  return (
    <div className="rounded-lg border transition-colors hover:border-border/70">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <HugeiconsIcon
          icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{permission.name}</p>
          <code className="text-[11px] text-muted-foreground">{permission.slug}</code>
        </div>
        {myRules.length > 0 && (
          <Badge variant="outline" className="shrink-0 text-xs">
            {myRules.length} قانون
          </Badge>
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-2">
          {myRules.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              هیچ قانون دسترسی تعریف نشده — پیش‌فرض رفتار نقش اعمال می‌شود.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {myRules.map((rule) => (
                <RuleBadge
                  key={accessRuleKey(rule)}
                  rule={rule}
                  onEdit={onEditRule}
                  onDelete={onDeleteRule}
                />
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => onAddRule(permission)}
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
            افزودن قانون
          </Button>
        </div>
      )}
    </div>
  );
}

interface GroupNode {
  name: string;
  key: string;
  subgroups: GroupNode[];
  permissions: Permission[];
}

function getAllPermissions(node: GroupNode): Permission[] {
  const list: Permission[] = [...node.permissions];
  for (const sub of node.subgroups) {
    list.push(...getAllPermissions(sub));
  }
  return list;
}

function buildPermissionTree(permissions: Permission[]): GroupNode[] {
  interface TempNode {
    name: string;
    key: string;
    subgroups: Map<string, TempNode>;
    permissions: Permission[];
  }

  const rootMap = new Map<string, TempNode>();

  const getOrCreateNode = (path: string[]): TempNode => {
    let currentMap = rootMap;
    let currentNode: TempNode | undefined;
    const currentPath: string[] = [];

    for (const segment of path) {
      currentPath.push(segment);
      const nodeKey = currentPath.join('/');
      if (!currentMap.has(segment)) {
        currentMap.set(segment, {
          name: segment,
          key: nodeKey,
          subgroups: new Map<string, TempNode>(),
          permissions: [],
        });
      }
      currentNode = currentMap.get(segment)!;
      currentMap = currentNode.subgroups;
    }
    return currentNode!;
  };

  for (const perm of permissions) {
    const path = perm.group && perm.group.length > 0 ? perm.group : ['سایر'];
    const node = getOrCreateNode(path);
    node.permissions.push(perm);
  }

  const convertNode = (temp: TempNode): GroupNode => {
    return {
      name: temp.name,
      key: temp.key,
      subgroups: Array.from(temp.subgroups.values()).map(convertNode),
      permissions: temp.permissions,
    };
  };

  return Array.from(rootMap.values()).map(convertNode);
}

interface PermissionGroupProps {
  node: GroupNode;
  rules: AccessRule[];
  onAddRule: (permission: Permission) => void;
  onEditRule: (rule: AccessRule) => void;
  onDeleteRule: (rule: AccessRule) => void;
}

function PermissionGroup({
  node,
  rules,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: PermissionGroupProps) {
  const [expanded, setExpanded] = useState(true);
  
  const allGroupPermissions = getAllPermissions(node);
  const groupRuleCount = rules.filter((r) =>
    allGroupPermissions.some((p) => p.slug === r.permission),
  ).length;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted text-right"
      >
        <HugeiconsIcon
          icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
          className="h-3.5 w-3.5 text-muted-foreground shrink-0"
        />
        <span className="text-sm font-semibold text-muted-foreground">{node.name}</span>
        {groupRuleCount > 0 && (
          <Badge variant="secondary" className="mr-auto text-xs">
            {groupRuleCount}
          </Badge>
        )}
      </button>

      {expanded && (
        <div className="mr-4 space-y-1.5 border-r border-dashed border-muted/50 pr-2">
          {/* Subgroups */}
          {node.subgroups.map((sub) => (
            <PermissionGroup
              key={sub.key}
              node={sub}
              rules={rules}
              onAddRule={onAddRule}
              onEditRule={onEditRule}
              onDeleteRule={onDeleteRule}
            />
          ))}

          {/* Direct Permissions */}
          {node.permissions.map((perm) => (
            <PermissionRow
              key={perm.id}
              permission={perm}
              rules={rules}
              onAddRule={onAddRule}
              onEditRule={onEditRule}
              onDeleteRule={onDeleteRule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionRulesPanel({
  positionId,
  permissions,
}: PermissionRulesPanelProps) {
  const { data: rules = [], isLoading } = usePositionAccessRules(positionId);
  const syncRules = useSyncPositionAccessRules();

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [activePermission, setActivePermission] = useState<Permission | null>(null);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<AccessRule | null>(null);

  const tree = buildPermissionTree(permissions);

  const handleAddRule = (permission: Permission) => {
    setActivePermission(permission);
    setEditingRule(null);
    setRuleDialogOpen(true);
  };

  const handleEditRule = (rule: AccessRule) => {
    const perm = permissions.find((p) => p.slug === rule.permission);
    setActivePermission(perm ?? null);
    setEditingRule(rule);
    setRuleDialogOpen(true);
  };

  const handleDeleteRule = (rule: AccessRule) => {
    setDeletingRule(rule);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRule) return;
    try {
      // Sync with empty ids clears that permission/strategy/type group.
      await syncRules.mutateAsync({
        positionId,
        payload: {
          permission: deletingRule.permission,
          strategy: deletingRule.strategy,
          authorizable_type: deletingRule.authorizable_type,
          authorizable_ids: [],
        },
      });
      toast.success('قانون دسترسی حذف شد');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'خطا در حذف قانون';
      toast.error(errorMsg);
    } finally {
      setDeletingRule(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        در حال بارگذاری قوانین دسترسی...
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          این نقش هیچ دسترسی‌ای ندارد.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tree.map((node) => (
          <PermissionGroup
            key={node.key}
            node={node}
            rules={rules}
            onAddRule={handleAddRule}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
          />
        ))}
      </div>

      {activePermission && (
        <AccessRuleDialog
          open={ruleDialogOpen}
          onOpenChange={setRuleDialogOpen}
          positionId={positionId}
          permission={activePermission.slug}
          editingRule={editingRule}
        />
      )}

      <DeleteDialog
        open={!!deletingRule}
        onOpenChange={(open) => {
          if (!open) setDeletingRule(null);
        }}
        entityLabel="قانون دسترسی"
        entityName={
          deletingRule
            ? `${deletingRule.permission} → ${typeLabel(deletingRule.authorizable_type)} (${deletingRule.authorizable_ids.length})`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        isLoading={syncRules.isPending}
      />
    </>
  );
}

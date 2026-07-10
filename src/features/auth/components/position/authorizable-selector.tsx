'use client';

import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TreeView, type TreeViewItem } from '@/components/ui/tree-view';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCustomerGroups } from '@/features/customer-group/api';
import {
  getNodeDisplayMeta,
  type CustomerGroupTreeNode,
} from '@/features/customer-group/types/customer-group-tree';

// ─── Known authorizable types ────────────────────────────────────────────────

export const AUTHORIZABLE_TYPES = [
  { value: 'customer_group', label: 'گروه مشتری' },
  { value: 'tag', label: 'برچسب' },
] as const;

export type AuthorizableType = (typeof AUTHORIZABLE_TYPES)[number]['value'] | string;

function toTreeViewItems(nodes: CustomerGroupTreeNode[]): TreeViewItem[] {
  return nodes.map((node) => ({
    id: String(node.id),
    name: node.name,
    type: node.segmentType ?? node.type ?? 'folder',
    children: node.children?.length ? toTreeViewItems(node.children) : undefined,
  }));
}

function flattenTree(items: TreeViewItem[]): TreeViewItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenTree(item.children) : [])]);
}

function buildDescendantsMap(items: TreeViewItem[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  const walk = (item: TreeViewItem): string[] => {
    const descendants = [item.id];
    for (const child of item.children ?? []) {
      descendants.push(...walk(child));
    }
    map.set(item.id, descendants);
    return descendants;
  };

  for (const item of items) {
    walk(item);
  }

  return map;
}

function expandSelection(ids: string[], descendantsMap: Map<string, string[]>): Set<string> {
  const expanded = new Set<string>();
  for (const id of ids) {
    const descendants = descendantsMap.get(id) ?? [id];
    for (const descendant of descendants) expanded.add(descendant);
  }
  return expanded;
}

function normalizeSelection(items: TreeViewItem[], selectedSet: Set<string>): string[] {
  type WalkResult = { full: boolean; ids: string[] };

  const walk = (item: TreeViewItem): WalkResult => {
    const isSelfSelected = selectedSet.has(item.id);
    const children = item.children ?? [];

    if (children.length === 0) {
      return isSelfSelected ? { full: true, ids: [item.id] } : { full: false, ids: [] };
    }

    const childResults = children.map(walk);
    const areAllChildrenFullySelected = childResults.every((result) => result.full);

    // If parent is selected, or all descendants are effectively selected, collapse to parent.
    if (isSelfSelected || areAllChildrenFullySelected) {
      return { full: true, ids: [item.id] };
    }

    return {
      full: false,
      ids: childResults.flatMap((result) => result.ids),
    };
  };

  return items.flatMap((item) => walk(item).ids);
}

function normalizeIds(value: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return value.split(',').map((id) => id.trim()).filter(Boolean);
}

// ─── Customer group tree selector ────────────────────────────────────────────

interface CustomerGroupSelectorProps {
  value: string | string[];
  onChange: (ids: string[], labels: string[]) => void;
}

function CustomerGroupSelector({ value, onChange }: CustomerGroupSelectorProps) {
  const { data: groups = [], isLoading } = useCustomerGroups();
  const selectedIds = useMemo(() => normalizeIds(value), [value]);
  const baseTreeData = useMemo(() => toTreeViewItems(groups), [groups]);
  const descendantsMap = useMemo(() => buildDescendantsMap(baseTreeData), [baseTreeData]);
  const expandedSelectedSet = useMemo(
    () => expandSelection(selectedIds, descendantsMap),
    [selectedIds, descendantsMap],
  );

  const treeData = useMemo(() => {
    const markChecked = (item: TreeViewItem): TreeViewItem => ({
      ...item,
      checked: expandedSelectedSet.has(item.id),
      children: item.children?.map(markChecked),
    });
    return baseTreeData.map(markChecked);
  }, [baseTreeData, expandedSelectedSet]);
  const flatItems = useMemo(() => flattenTree(treeData), [treeData]);
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of flatItems) map.set(item.id, item.name);
    return map;
  }, [flatItems]);

  const handleSelectionChange = useCallback(
    (items: TreeViewItem[]) => {
      const rawSet = new Set(items.map((item) => item.id));
      const normalizedIds = normalizeSelection(baseTreeData, rawSet);
      const labels = normalizedIds.map((id) => labelById.get(id) ?? id);
      onChange(normalizedIds, labels);
    },
    [baseTreeData, labelById, onChange],
  );

  const handleCheckChange = useCallback(
    (item: TreeViewItem, checked: boolean) => {
      const nextSet = new Set(expandedSelectedSet);
      const affectedIds = descendantsMap.get(item.id) ?? [item.id];

      for (const id of affectedIds) {
        if (checked) {
          nextSet.add(id);
        } else {
          nextSet.delete(id);
        }
      }

      const normalizedIds = normalizeSelection(baseTreeData, nextSet);
      const labels = normalizedIds.map((id) => labelById.get(id) ?? id);
      onChange(normalizedIds, labels);
    },
    [baseTreeData, descendantsMap, expandedSelectedSet, labelById, onChange],
  );

  const getIcon = useCallback((item: TreeViewItem) => {
    const meta = getNodeDisplayMeta({
      id: item.id,
      name: item.name,
      segmentType: item.type as CustomerGroupTreeNode['segmentType'],
    });
    const Icon = meta.icon;
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
          color: meta.color,
        }}
      >
        <HugeiconsIcon icon={Icon} strokeWidth={2} className="h-3.5 w-3.5" />
      </span>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
        گروه مشتری تعریف نشده است
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TreeView
        data={treeData}
        getIcon={getIcon}
        defaultSelectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onCheckChange={handleCheckChange}
        searchPlaceholder="جستجو در گروه‌ها..."
        selectionText="انتخاب‌شده"
        showExpandAll={false}
        showCheckboxes
        enableModifierMultiSelect={false}
        clearSelectionOnClickAway={false}
        className="max-h-56 overflow-y-auto"
      />
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const label = labelById.get(id) ?? id;
            return (
              <Badge key={id} variant="secondary" className="text-xs">
                {label}
              </Badge>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        انتخاب چندتایی فقط از طریق چک‌باکس انجام می‌شود.
      </p>
    </div>
  );
}

// ─── Tag selector (flat list + text input) ───────────────────────────────────

interface TagSelectorProps {
  value: string;
  onChange: (id: string, label: string) => void;
}

const MOCK_TAGS = [
  { id: 'vip', label: 'VIP' },
  { id: 'new', label: 'مشتری جدید' },
  { id: 'premium', label: 'پرمیوم' },
  { id: 'inactive', label: 'غیرفعال' },
];

function TagSelector({ value, onChange }: TagSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = MOCK_TAGS.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <Input
        placeholder="جستجوی برچسب..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border p-2">
        {filtered.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(tag.id, tag.label)}
          >
            <Badge
              variant={value === tag.id ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80"
            >
              {tag.label}
            </Badge>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground w-full text-center py-2">
            برچسبی یافت نشد
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Generic text fallback ────────────────────────────────────────────────────

interface GenericSelectorProps {
  value: string;
  onChange: (id: string, label: string) => void;
  type: string;
}

function GenericSelector({ value, onChange, type }: GenericSelectorProps) {
  return (
    <div className="space-y-1">
      <Input
        placeholder={`شناسه ${type}`}
        value={value}
        onChange={(e) => onChange(e.target.value, e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        شناسه عددی یا متنی موجودیت را وارد کنید
      </p>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

interface AuthorizableSelectorProps {
  authorizableType: string;
  value: string | string[];
  /** Called with (id(s), displayLabel(s)) — arrays for customer_group multiselect */
  onChange: (id: string | string[], label: string | string[]) => void;
}

export function AuthorizableSelector({
  authorizableType,
  value,
  onChange,
}: AuthorizableSelectorProps) {
  if (authorizableType === 'customer_group') {
    return (
      <CustomerGroupSelector
        value={value}
        onChange={(ids, labels) => onChange(ids, labels)}
      />
    );
  }
  if (authorizableType === 'tag') {
    const singleValue = Array.isArray(value) ? (value[0] ?? '') : value;
    return (
      <TagSelector
        value={singleValue}
        onChange={(id, label) => onChange(id, label)}
      />
    );
  }
  const singleValue = Array.isArray(value) ? (value[0] ?? '') : value;
  return (
    <GenericSelector
      value={singleValue}
      onChange={(id, label) => onChange(id, label)}
      type={authorizableType}
    />
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { TreeView, type TreeViewItem } from '@/components/ui/tree-view';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon, Shield01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useCreateRole, useDeleteRole, useUpdateRole } from '@/features/auth/api/role';
import { useApiError } from '@/lib/use-api-error';
import { DeleteDialog } from '@/features/shared/components/delete-dialog';
import {
  type Permission,
  type Role,
} from '@/features/auth/schemas/role/responses';
import { CreateRoleInput, createRoleSchema } from '@/features/auth/schemas/role/requests';

interface GroupNode {
  name: string;
  key: string;
  subgroups: GroupNode[];
  permissions: Permission[];
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

function groupTreeToTreeViewItems(nodes: GroupNode[], selectedPermissionIds: number[]): TreeViewItem[] {
  return nodes.map((node) => {
    const children: TreeViewItem[] = [
      ...groupTreeToTreeViewItems(node.subgroups, selectedPermissionIds),
      ...node.permissions.map((perm) => ({
        id: `perm-${perm.id}`,
        name: perm.name,
        type: 'file',
        checked: selectedPermissionIds.includes(perm.id),
      })),
    ];

    return {
      id: `group-${node.key}`,
      name: node.name,
      type: 'folder',
      children: children.length > 0 ? children : undefined,
    };
  });
}

function getLeafPermissionIds(item: TreeViewItem): number[] {
  const ids: number[] = [];
  const walk = (node: TreeViewItem) => {
    if (node.id.startsWith('perm-')) {
      const permId = Number(node.id.replace('perm-', ''));
      if (!isNaN(permId)) {
        ids.push(permId);
      }
    }
    node.children?.forEach(walk);
  };
  walk(item);
  return ids;
}

interface Brand {
  id: number;
  name: string;
}

interface RoleFormProps {
  editingRole?: Role | null;
  brands: Brand[];
  availablePermissions: Permission[];
  lockedOrganizationId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoleForm({
  editingRole,
  brands,
  availablePermissions,
  lockedOrganizationId,
  onSuccess,
  onCancel,
}: RoleFormProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const { getErrorMessage, toastError } = useApiError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isEditing = !!editingRole;

  // Group permissions for UI
  const permissionTree = buildPermissionTree(availablePermissions);

  const defaultValues: CreateRoleInput = {
    name: editingRole?.name ?? '',
    description: editingRole?.description ?? '',
    organization_id: lockedOrganizationId ?? editingRole?.organization_id ?? undefined,
    permission_ids: (editingRole?.permissions ?? []).map((p) => p.id),
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }: { value: CreateRoleInput }) => {
        const result = createRoleSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }: { value: CreateRoleInput }) => {
      try {
        if (isEditing && editingRole) {
          await updateRole.mutateAsync({
            ...value,
            id: editingRole.id,
          });
          toast.success('نقش با موفقیت به‌روزرسانی شد');
        } else {
          await createRole.mutateAsync(value);
          toast.success('نقش جدید با موفقیت ایجاد شد');
        }
        onSuccess?.();
      } catch (error) {
        toastError(error);
      }
    },
  });

  const isSubmitting = createRole.isPending || updateRole.isPending || deleteRole.isPending;

  const handleDelete = async () => {
    if (!editingRole) return;

    try {
      await deleteRole.mutateAsync(editingRole.id);
      toast.success('نقش با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      onSuccess?.();
    } catch (error) {
      toastError(error);
    }
  };

  const getIcon = useCallback((item: TreeViewItem) => {
    if (item.type === 'folder') {
      return (
        <span className="flex h-5 w-5 items-center justify-center text-primary/80">
          <HugeiconsIcon icon={Folder01Icon} className="h-4 w-4" />
        </span>
      );
    }
    return (
      <span className="flex h-5 w-5 items-center justify-center text-teal-600">
        <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5" />
      </span>
    );
  }, []);

  const handleCheckChange = useCallback((item: TreeViewItem, checked: boolean) => {
    const affectedIds = getLeafPermissionIds(item);
    form.setFieldValue('permission_ids', (current: number[] = []) => {
      const next = checked
        ? Array.from(new Set([...current, ...affectedIds]))
        : current.filter((id: number) => !affectedIds.includes(id));
      return next;
    });
  }, [form]);

  // Note: We intentionally do NOT define isGroupSelected / isPermissionSelected here
  // using getFieldValue, because that would not trigger re-renders.
  // They are defined inside <form.Subscribe> below so the UI reacts to setFieldValue.

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Name */}
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>نام نقش</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="مثال: مدیر هلدینگ"
                  disabled={isSubmitting}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className="text-sm text-destructive">
                    {String(field.state.meta.errors?.[0] ?? 'نام نقش الزامی است')}
                  </p>
                )}
              </div>
            );
          }}
        />

        {/* Description */}
        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>توضیحات</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="توضیح مختصر در مورد این نقش..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          )}
        />

        {/* Brand / Organization */}
        <form.Field
          name="organization_id"
          children={(field) => {
            const currentValue = field.state.value ? String(field.state.value) : '';
            return (
              <div className="space-y-2">
                <Label>برند / سازمان</Label>
                <Select
                  value={currentValue}
                  onValueChange={(val) => {
                    const num = val ? Number(val) : undefined;
                    field.handleChange(num);
                  }}
                  disabled={isSubmitting || lockedOrganizationId != null}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب برند" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
        />
      </div>

      {/* Permissions */}
      <div className="space-y-3">
        <Label className="mb-3">دسترسی‌های نقش</Label>

        <form.Subscribe selector={(state) => state.values.permission_ids ?? []}>
          {(permissionIds) => {
            const treeData = groupTreeToTreeViewItems(permissionTree, permissionIds);
            return (
              <>
                {treeData.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    هیچ دسترسی‌ای برای انتخاب موجود نیست.
                  </div>
                ) : (
                  <TreeView
                    data={treeData}
                    getIcon={getIcon}
                    showCheckboxes
                    onCheckChange={handleCheckChange}
                    selectionText="دسترسی انتخاب‌شده"
                    showSearchBar={false}
                    enableModifierMultiSelect={false}
                    clearSelectionOnClickAway={false}
                    className="max-h-76 overflow-y-auto p-4"
                  />
                )}
              </>
            );
          }}
        </form.Subscribe>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t pt-4">
        {isEditing ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSubmitting}
          >
            حذف نقش
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            انصراف
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting
                  ? 'در حال ذخیره...'
                  : isEditing
                    ? 'ذخیره تغییرات'
                    : 'ایجاد نقش'}
              </Button>
            )}
          />
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityLabel="نقش"
        entityName={editingRole?.name}
        onConfirm={handleDelete}
        isLoading={deleteRole.isPending}
      />

      {/* Global error display */}
      {(createRole.isError || updateRole.isError || deleteRole.isError) && (
        <div className="text-sm text-destructive text-center">
          {getErrorMessage(
            createRole.error || updateRole.error || deleteRole.error,
          )}
        </div>
      )}
    </form>
  );
}

'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldContent, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';

import { useCreateRole, useUpdateRole } from '@/features/auth/hooks/use-roles';
import {
  type Permission,
  type Role,
} from '@/features/auth/schemas/rbac.schema';
import { CreateRoleInput, createRoleSchema } from '../../schemas/role-input.schema';

interface Brand {
  id: number;
  name: string;
}

interface RoleFormProps {
  editingRole?: Role | null;
  brands: Brand[];
  availablePermissions: Permission[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoleForm({
  editingRole,
  brands,
  availablePermissions,
  onSuccess,
  onCancel,
}: RoleFormProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const isEditing = !!editingRole;

  // Group permissions for UI
  const groupedPermissions = availablePermissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const group = perm.group || 'سایر';
      if (!acc[group]) acc[group] = [];
      acc[group].push(perm);
      return acc;
    },
    {}
  );

  const defaultValues: CreateRoleInput = {
    name: editingRole?.name ?? '',
    description: editingRole?.description ?? '',
    organization_id: editingRole?.organization_id ?? undefined,
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
      } catch (error: any) {
        toast.error(error?.message || 'خطا در ذخیره نقش');
      }
    },
  });

  const isSubmitting = createRole.isPending || updateRole.isPending;

  const togglePermission = (permissionId: number, checked: boolean) => {
    form.setFieldValue('permission_ids', (current: number[] = []) => {
      const next = checked
        ? [...current, permissionId]
        : current.filter((id: number) => id !== permissionId);
      return Array.from(new Set(next));
    });
  };

  const toggleGroup = (group: string, checked: boolean) => {
    const groupPerms = groupedPermissions[group] || [];
    const groupIds = groupPerms.map((p) => p.id);

    form.setFieldValue('permission_ids', (current: number[] = []) => {
      const next = checked
        ? Array.from(new Set([...current, ...groupIds]))
        : current.filter((id: number) => !groupIds.includes(id));
      return next;
    });
  };

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
                  disabled={isSubmitting}
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
        <Label className="mb-1">دسترسی‌های نقش</Label>

        <form.Subscribe selector={(state) => state.values.permission_ids ?? []}>
          {(permissionIds) => {
            const isGroupSelected = (group: string) => {
              const groupPerms = groupedPermissions[group] || [];
              return (
                groupPerms.length > 0 &&
                groupPerms.every((p) => permissionIds.includes(p.id))
              );
            };

            const isPermissionSelected = (id: number) => {
              return permissionIds.includes(id);
            };

            return (
              <>
                {Object.keys(groupedPermissions).length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    هیچ دسترسی‌ای برای انتخاب موجود نیست.
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group} className="rounded-lg border p-4">
                      <Field orientation="horizontal" className="mb-3 items-center">
                        <Checkbox
                          id={`group-${group.replace(/\s+/g, '-')}`}
                          checked={isGroupSelected(group)}
                          onCheckedChange={(checked) => toggleGroup(group, !!checked)}
                          disabled={isSubmitting}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={`group-${group.replace(/\s+/g, '-')}`}>
                            {group}
                          </FieldLabel>
                        </FieldContent>
                      </Field>

                      <FieldSeparator className="mb-2" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {perms.map((perm) => (
                          <Field key={perm.id} orientation="horizontal" className="items-center">
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={isPermissionSelected(perm.id)}
                              onCheckedChange={(checked) => togglePermission(perm.id, !!checked)}
                              disabled={isSubmitting}
                            />
                            <FieldContent className="ml-2">
                              <FieldLabel
                                htmlFor={`perm-${perm.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {perm.name}
                              </FieldLabel>
                            </FieldContent>
                          </Field>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            );
          }}
        </form.Subscribe>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
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

      {/* Global error display */}
      {(createRole.isError || updateRole.isError) && (
        <div className="text-sm text-destructive text-center">
          {((createRole.error || updateRole.error) as any)?.message ||
            'عملیات با خطا مواجه شد'}
        </div>
      )}
    </form>
  );
}

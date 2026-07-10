'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreatePosition, useUpdatePosition } from '@/features/auth/api/position';
import type { Position } from '@/features/auth/schemas/position/responses';
import {
  CreatePositionInput,
  createPositionSchema,
} from '@/features/auth/schemas/position/requests';
import type { Role } from '@/features/auth/schemas/role/responses';

interface PositionFormProps {
  editingPosition?: Position | null;
  roles: Role[];
  onSuccess?: (saved: Position) => void;
  onCancel?: () => void;
}

export function PositionForm({
  editingPosition,
  roles,
  onSuccess,
  onCancel,
}: PositionFormProps) {
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();

  const isEditing = !!editingPosition;

  const defaultRoleId =
    editingPosition?.role?.id ?? (undefined as unknown as number);

  const defaultValues: CreatePositionInput = {
    name: editingPosition?.name ?? '',
    role_id: defaultRoleId,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }: { value: CreatePositionInput }) => {
        const result = createPositionSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }: { value: CreatePositionInput }) => {
      try {
        let saved: Position;
        if (isEditing && editingPosition) {
          saved = await updatePosition.mutateAsync({ ...value, id: editingPosition.id });
          toast.success('سمت با موفقیت به‌روزرسانی شد');
        } else {
          saved = await createPosition.mutateAsync(value);
          toast.success('سمت جدید با موفقیت ایجاد شد');
        }
        onSuccess?.(saved);
      } catch (error: any) {
        toast.error(error?.message || 'خطا در ذخیره سمت');
      }
    },
  });

  const isSubmitting = createPosition.isPending || updatePosition.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      {/* Name */}
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>نام سمت</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="مثال: فروشنده مشتریان ناراضی"
                disabled={isSubmitting}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors?.[0] ?? 'نام سمت الزامی است')}
                </p>
              )}
            </div>
          );
        }}
      />

      {/* Role */}
      <form.Field
        name="role_id"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          const currentValue =
            field.state.value != null && Number(field.state.value) > 0
              ? String(field.state.value)
              : undefined;
          return (
            <div className="space-y-1.5">
              <Label>نقش پایه</Label>
              <Select
                value={currentValue}
                onValueChange={(val) =>
                  field.handleChange(
                    val ? Number(val) : (undefined as unknown as number),
                  )
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب نقش..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && (
                <p className="text-sm text-destructive">انتخاب نقش الزامی است</p>
              )}
              <p className="text-xs text-muted-foreground">
                دسترسی‌های این سمت از نقش انتخاب‌شده گرفته می‌شود
              </p>
            </div>
          );
        }}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t pt-4">
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
                  : 'ایجاد سمت'}
            </Button>
          )}
        />
      </div>

      {(createPosition.isError || updatePosition.isError) && (
        <div className="text-sm text-destructive text-center">
          {((createPosition.error || updatePosition.error) as any)?.message ||
            'عملیات با خطا مواجه شد'}
        </div>
      )}
    </form>
  );
}

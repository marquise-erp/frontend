'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';

import { useCreateUser, useUpdateUser } from '@/features/auth/hooks/use-users';
import { type User } from '@/features/auth/schemas/user.schema';
import { CreateUserInput, createUserSchema } from '../../schemas/user-input.schema';

interface RoleOption {
  id: number;
  name: string;
}

interface UserFormProps {
  editingUser?: User | null;
  availableRoles: RoleOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({
  editingUser,
  availableRoles,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isEditing = !!editingUser;

  const defaultValues: CreateUserInput = {
    name: editingUser?.name ?? '',
    mobile: editingUser?.mobile ?? '',
    email: editingUser?.email ?? '',
    password: '',
    organization_id: undefined,
    role_ids: [], // in real, would come from editingUser.roles
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }: { value: CreateUserInput }) => {
        const result = createUserSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }: { value: CreateUserInput }) => {
      try {
        if (isEditing && editingUser) {
          await updateUser.mutateAsync({
            ...value,
            id: editingUser.id,
            // don't send empty password on update usually
            ...(value.password ? {} : { password: undefined }),
          } as any);
          toast.success('کاربر با موفقیت به‌روزرسانی شد');
        } else {
          await createUser.mutateAsync(value);
          toast.success('کاربر جدید با موفقیت ایجاد شد');
        }
        onSuccess?.();
      } catch (error: any) {
        toast.error(error?.message || 'خطا در ذخیره کاربر');
      }
    },
  });

  const isSubmitting = createUser.isPending || updateUser.isPending;

  const toggleRole = (roleId: number, checked: boolean) => {
    form.setFieldValue('role_ids', (current: number[] = []) => {
      const next = checked
        ? [...current, roleId]
        : current.filter((id: number) => id !== roleId);
      return Array.from(new Set(next));
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>نام کامل</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="نام کاربر"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="mobile">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>موبایل</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="09121234567"
              />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="email">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>ایمیل (اختیاری)</FieldLabel>
            <Input
              id={field.name}
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="user@example.com"
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {isEditing ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
            </FieldLabel>
            <Input
              id={field.name}
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={isEditing ? 'خالی بگذارید تا تغییر نکند' : 'حداقل ۶ کاراکتر'}
            />
          </Field>
        )}
      </form.Field>

      {/* Roles assignment */}
      {availableRoles.length > 0 && (
        <form.Field name="role_ids">
          {(field) => (
            <Field>
              <FieldLabel>نقش‌ها</FieldLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 border rounded-lg p-4">
                {availableRoles.map((role) => {
                  const checked = (field.state.value || []).includes(role.id);
                  return (
                    <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleRole(role.id, !!c)}
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
          )}
        </form.Field>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'در حال ذخیره...' : isEditing ? 'ویرایش کاربر' : 'ایجاد کاربر'}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useUsers, useDeleteUser } from '@/features/auth/api/user';
import { useRoles } from '@/features/auth/api/role';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/features/auth/schemas';
import { UserDialog } from '@/features/auth/components/user/user-dialog';
import { UsersTable } from '@/features/auth/components/user/users-table';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const { data: roles = [] } = useRoles();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Available roles for assignment
  const availableRoles = useMemo(() => {
    return roles.map((r: any) => ({ id: r.id, name: r.name }));
  }, [roles]);

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('کاربر با موفقیت حذف شد');
    } catch (error: any) {
      toast.error(error?.message || 'خطا در حذف کاربر');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>کاربران</CardTitle>
          <CardDescription>مدیریت کاربران و تخصیص نقش‌ها</CardDescription>
          <CardAction>
            <Button onClick={handleCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              افزودن کاربر جدید
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            deleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        availableRoles={availableRoles}
      />
    </div>
  );
}

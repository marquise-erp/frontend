'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useRoles, useDeleteRole, usePermissions } from '@/features/auth/api/role';
import { useApiError } from '@/lib/use-api-error';
import { useBrands } from '@/features/organization/api';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '@/features/auth/schemas';
import { RoleDialog } from '@/features/auth/components/role/role-dialog';
import { RolesTable } from '@/features/auth/components/role/roles-table';
import { Button } from '@/components/ui/button';

export default function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const { toastError } = useApiError();

  const { data: brands = [] } = useBrands();
  const { data: availablePermissions = [] } = usePermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success('نقش با موفقیت حذف شد');
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>نقش‌ها و دسترسی‌ها</CardTitle>
          <CardDescription>مدیریت نقش‌های کاربری</CardDescription>
          <CardAction>
            <Button onClick={handleCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              افزودن نقش جدید
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RolesTable
            roles={roles}
            isLoading={isLoading}
            onEdit={handleEdit}
            deleteRole={handleDeleteRole}
            brands={brands}
          />
        </CardContent>
      </Card>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRole={editingRole}
        brands={brands}
        availablePermissions={availablePermissions}
      />
    </div>
  );
}


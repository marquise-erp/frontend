'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useRoles, useDeleteRole } from '@/features/auth/hooks/use-roles';
import { useBrands } from '@/features/organization/api';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '@/features/auth/schemas';
import { RoleDialog } from '@/features/auth/components/role/role-dialog';
import { RolesTable } from '@/features/auth/components/role/roles-table';
import { Button } from '@/components/ui/button';

export default function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const { data: brands = [] } = useBrands();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Aggregate all unique permissions from existing roles (for checkbox UI)
  const availablePermissions = useMemo(() => {
    const map = new Map<number, any>();
    roles.forEach((r: any) => {
      (r.permissions || []).forEach((p: any) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
    });
    return Array.from(map.values());
  }, [roles]);

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
    } catch (error: any) {
      toast.error(error?.message || 'خطا در حذف نقش');
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


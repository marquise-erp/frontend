'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleForm } from './role-form';
import type { Permission, Role } from '@/features/auth/schemas/rbac.schema';

interface Brand {
  id: number;
  name: string;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  brands: Brand[];
  availablePermissions: Permission[];
}

export function RoleDialog({
  open,
  onOpenChange,
  editingRole,
  brands,
  availablePermissions,
}: RoleDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {editingRole ? 'ویرایش نقش' : 'افزودن نقش جدید'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <RoleForm
            editingRole={editingRole}
            brands={brands}
            availablePermissions={availablePermissions}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

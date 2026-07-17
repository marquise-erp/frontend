'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleForm } from './role-form';
import type { Permission, Role } from '@/features/auth/schemas/role/responses';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  lockedOrganizationId?: number;
}

export function RoleDialog({
  open,
  onOpenChange,
  editingRole,
  brands,
  availablePermissions,
  lockedOrganizationId,
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

        <ScrollArea type="hover" className="flex-1 px-6 py-2 min-h-0">
          <RoleForm
            editingRole={editingRole}
            brands={brands}
            availablePermissions={availablePermissions}
            lockedOrganizationId={lockedOrganizationId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

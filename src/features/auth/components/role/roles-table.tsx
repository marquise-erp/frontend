'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import type { Role } from '@/features/auth/schemas';
import { DeleteDialog } from '@/features/shared/components/delete-dialog';

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  deleteRole?: (role: Role) => Promise<void>;
  brands?: Array<{ id: number; name: string }>;
}

export function RolesTable({ roles, isLoading, onEdit, deleteRole, brands }: RolesTableProps) {
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (role: Role) => {
    setDeletingRole(role);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole || !deleteRole) return;

    setIsDeleting(true);
    try {
      await deleteRole(deletingRole);
    } finally {
      setIsDeleting(false);
      setDeletingRole(null);
    }
  };
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'نام نقش',
      cell: ({ row }) => (
        <div 
          className="font-semibold cursor-pointer hover:text-primary"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue('name')}
        </div>
      ),
    },
    {
      id: 'brand',
      header: 'برند',
      cell: ({ row }) => {
        const role = row.original as any;
        if (brands && brands.length > 0) {
          const orgId = role.organization_id || role.owner_node_id;
          const found = brands.find((b: any) => b.id === Number(orgId));
          if (found) return found.name;
        }
        return role.brand_name || role.organization?.name || '-';
      },
    },
    {
      accessorKey: 'description',
      header: 'توضیحات',
      cell: ({ row }) => (
        <div className="max-w-[420px] text-sm text-muted-foreground line-clamp-2">
          {row.getValue('description') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'دسترسی‌ها',
      cell: ({ row }) => {
        const count = ((row.getValue('permissions') as any[]) || []).length;
        return <Badge variant="outline">{count} مورد</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">عملیات</div>,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(role);
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(role);
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        enableGlobalFilter
        onRowClick={onEdit}
      />

      <DeleteDialog
        open={!!deletingRole}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingRole(null);
        }}
        entityLabel="نقش"
        entityName={deletingRole?.name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
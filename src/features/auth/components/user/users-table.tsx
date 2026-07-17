'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import type { User } from '@/features/auth/schemas';
import { DeleteDialog } from '@/features/shared/components/delete-dialog';

interface UserWithRoles extends User {
  roles?: Array<{ id: number; name: string }>;
}

interface UsersTableProps {
  users: UserWithRoles[];
  isLoading: boolean;
  onEdit: (user: UserWithRoles) => void;
  deleteUser?: (user: UserWithRoles) => Promise<void>;
}

export function UsersTable({ users, isLoading, onEdit, deleteUser }: UsersTableProps) {
  const [deletingUser, setDeletingUser] = useState<UserWithRoles | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (user: UserWithRoles) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser || !deleteUser) return;

    setIsDeleting(true);
    try {
      await deleteUser(deletingUser);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const columns: ColumnDef<UserWithRoles>[] = [
    {
      id: 'name',
      header: 'نام کاربر',
      cell: ({ row }) => {
        const user = row.original;
        const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'کاربر';
        return (
          <div
            className="font-semibold cursor-pointer hover:text-primary"
            onClick={() => onEdit(user)}
          >
            {displayName}
          </div>
        );
      },
    },
    {
      accessorKey: 'mobile',
      header: 'موبایل',
    },
    {
      accessorKey: 'email',
      header: 'ایمیل',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      id: 'roles',
      header: 'نقش‌ها',
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        if (roles.length === 0) return <Badge variant="outline">بدون نقش</Badge>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 2).map((r, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{r.name}</Badge>
            ))}
            {roles.length > 2 && <Badge variant="outline" className="text-xs">+{roles.length - 2}</Badge>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">عملیات</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(user);
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
        data={users}
        isLoading={isLoading}
        enableGlobalFilter
        onRowClick={onEdit}
      />

      <DeleteDialog
        open={!!deletingUser}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingUser(null);
        }}
        entityLabel="کاربر"
        entityName={deletingUser ? ([deletingUser.first_name, deletingUser.last_name].filter(Boolean).join(" ") || undefined) : undefined}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

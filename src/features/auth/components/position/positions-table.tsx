'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import type { Position } from '@/features/auth/schemas/position/responses';
import type { Role } from '@/features/auth/schemas/role/responses';
import { DeleteDialog } from '@/features/shared/components/delete-dialog';

interface PositionsTableProps {
  positions: Position[];
  isLoading: boolean;
  roles?: Role[];
  onEdit: (position: Position) => void;
  deletePosition?: (position: Position) => Promise<void>;
}

export function PositionsTable({
  positions,
  isLoading,
  roles = [],
  onEdit,
  deletePosition,
}: PositionsTableProps) {
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (position: Position) => {
    setDeletingPosition(position);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPosition || !deletePosition) return;
    setIsDeleting(true);
    try {
      await deletePosition(deletingPosition);
    } finally {
      setIsDeleting(false);
      setDeletingPosition(null);
    }
  };

  const columns: ColumnDef<Position>[] = [
    {
      accessorKey: 'name',
      header: 'نام سمت',
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
      id: 'role',
      header: 'نقش پایه',
      cell: ({ row }) => {
        const position = row.original;
        const role = position.role as Role | null | undefined;
        if (!role) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{role.name}</Badge>
            {role.permissions && role.permissions.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {role.permissions.length} دسترسی
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">عملیات</div>,
      cell: ({ row }) => {
        const position = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(position);
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
                handleDeleteClick(position);
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
        data={positions}
        isLoading={isLoading}
        enableGlobalFilter
        onRowClick={onEdit}
      />

      <DeleteDialog
        open={!!deletingPosition}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingPosition(null);
        }}
        entityLabel="سمت"
        entityName={deletingPosition?.name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

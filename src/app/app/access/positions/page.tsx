'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { usePositions, useDeletePosition } from '@/features/auth/api/position';
import { useRoles } from '@/features/auth/api/role';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Position } from '@/features/auth/schemas/position/responses';
import { PositionSheet } from '@/features/auth/components/position/position-sheet';
import { PositionsTable } from '@/features/auth/components/position/positions-table';
import { Button } from '@/components/ui/button';

export default function PositionsPage() {
  const { data: positions = [], isLoading } = usePositions();
  const { data: roles = [] } = useRoles();
  const deletePosition = useDeletePosition();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const handleCreate = () => {
    setEditingPosition(null);
    setSheetOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setSheetOpen(true);
  };

  const handleDeletePosition = async (position: Position) => {
    try {
      await deletePosition.mutateAsync(position.id);
      toast.success('سمت با موفقیت حذف شد');
    } catch (error: any) {
      toast.error(error?.message || 'خطا در حذف سمت');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>سمت‌ها</CardTitle>
          <CardDescription>مدیریت سمت‌های سازمانی و قوانین دسترسی آن‌ها</CardDescription>
          <CardAction>
            <Button onClick={handleCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              افزودن سمت جدید
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <PositionsTable
            positions={positions}
            roles={roles}
            isLoading={isLoading}
            onEdit={handleEdit}
            deletePosition={handleDeletePosition}
          />
        </CardContent>
      </Card>

      <PositionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingPosition={editingPosition}
        roles={roles}
      />
    </div>
  );
}

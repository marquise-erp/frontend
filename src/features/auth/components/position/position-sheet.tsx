'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { BriefcaseIcon } from '@hugeicons/core-free-icons';
import { PositionForm } from './position-form';
import { PermissionRulesPanel } from './permission-rules-panel';
import type { Position } from '@/features/auth/schemas/position/responses';
import type { Role } from '@/features/auth/schemas/role/responses';

interface PositionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPosition: Position | null;
  roles: Role[];
}

export function PositionSheet({
  open,
  onOpenChange,
  editingPosition,
  roles,
}: PositionSheetProps) {
  // After a create, we keep the sheet open and switch to access-rules tab
  const [savedPosition, setSavedPosition] = useState<Position | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'rules'>('info');

  const targetKey = editingPosition ? `edit:${editingPosition.id}` : 'create';

  useEffect(() => {
    if (open) {
      setSavedPosition(null);
      setActiveTab('info');
    }
  }, [open, targetKey]);

  const currentPosition = savedPosition ?? editingPosition;
  const isExisting = currentPosition != null;

  // Resolved role from nested position.role (API does not expose role_id on Position)
  const resolvedRole: Role | null =
    (currentPosition?.role as Role | null | undefined) ?? null;

  const permissions = resolvedRole?.permissions ?? [];

  const handleSaved = (saved: Position) => {
    setSavedPosition(saved);
    // Switch to rules tab automatically after save
    setActiveTab('rules');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" showCloseButton className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={BriefcaseIcon} strokeWidth={2} className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold truncate">
              {currentPosition?.name || (editingPosition ? editingPosition.name : 'سمت جدید')}
            </h2>
            {resolvedRole && (
              <p className="text-xs text-muted-foreground truncate">
                نقش: {resolvedRole.name}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'info' | 'rules')}
          >
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
              <TabsTrigger value="rules" disabled={!isExisting}>
                قوانین دسترسی
                {isExisting && permissions.length > 0 && (
                  <Badge variant="secondary" className="mr-1.5 text-[10px]">
                    {permissions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Info tab */}
            <TabsContent value="info" className="mt-5">
              <PositionForm
                key={currentPosition ? `edit-${currentPosition.id}` : 'create'}
                editingPosition={currentPosition}
                roles={roles}
                onSuccess={handleSaved}
                onCancel={handleClose}
              />
            </TabsContent>

            {/* Access rules tab */}
            <TabsContent value="rules" className="mt-5">
              {isExisting ? (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                  {permissions.length > 0 ? (
                    <PermissionRulesPanel
                      positionId={currentPosition!.id}
                      permissions={permissions}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        نقش انتخاب‌شده دسترسی‌ای ندارد یا بارگذاری نشده است.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    ابتدا سمت را ذخیره کنید
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

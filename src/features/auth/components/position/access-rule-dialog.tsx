'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSyncPositionAccessRules } from '@/features/auth/api/access-rule';
import type { AccessRule, AccessStrategy } from '@/features/auth/schemas/access-rule/responses';
import {
  AuthorizableSelector,
  AUTHORIZABLE_TYPES,
} from './authorizable-selector';

interface AccessRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionId: number;
  /** Pre-filled and locked when adding from a specific permission row. */
  permission: string;
  /** When provided, the dialog is filling/editing a grouped rule. */
  editingRule?: AccessRule | null;
}

export function AccessRuleDialog({
  open,
  onOpenChange,
  positionId,
  permission,
  editingRule,
}: AccessRuleDialogProps) {
  const isEditing = !!editingRule;
  const syncRules = useSyncPositionAccessRules();

  const [strategy, setStrategy] = useState<AccessStrategy>(editingRule?.strategy ?? 'allow');
  const [authorizableType, setAuthorizableType] = useState<string>(
    editingRule?.authorizable_type ?? '',
  );
  const [authorizableIds, setAuthorizableIds] = useState<string[]>(
    editingRule?.authorizable_ids ?? [],
  );
  const [authorizableLabels, setAuthorizableLabels] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStrategy(editingRule?.strategy ?? 'allow');
      setAuthorizableType(editingRule?.authorizable_type ?? '');
      setAuthorizableIds(editingRule?.authorizable_ids ?? []);
      setAuthorizableLabels([]);
    }
  }, [open, editingRule]);

  const handleTypeChange = (type: string) => {
    setAuthorizableType(type);
    setAuthorizableIds([]);
    setAuthorizableLabels([]);
  };

  const handleIdChange = useCallback((
    id: string | string[],
    label: string | string[],
  ) => {
    const nextIds = Array.isArray(id) ? id : id ? [id] : [];
    const nextLabels = Array.isArray(label) ? label : label ? [label] : [];

    setAuthorizableIds((prev) =>
      prev.length === nextIds.length && prev.every((value, index) => value === nextIds[index])
        ? prev
        : nextIds,
    );
    setAuthorizableLabels((prev) =>
      prev.length === nextLabels.length &&
      prev.every((value, index) => value === nextLabels[index])
        ? prev
        : nextLabels,
    );
  }, []);

  const canSubmit = strategy && authorizableType && authorizableIds.length > 0;
  const isPending = syncRules.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await syncRules.mutateAsync({
        positionId,
        payload: {
          permission,
          strategy,
          authorizable_type: authorizableType,
          authorizable_ids: authorizableIds,
        },
      });

      toast.success(isEditing ? 'قانون دسترسی به‌روزرسانی شد' : 'قانون دسترسی ذخیره شد');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ذخیره قانون دسترسی');
    }
  };

  const strategyLabel = strategy === 'allow' ? 'مجاز' : 'غیرمجاز';
  const strategyClass =
    strategy === 'allow'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'ویرایش قانون دسترسی' : 'افزودن قانون دسترسی'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">دسترسی</Label>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <code className="text-sm font-mono">{permission}</code>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>استراتژی</Label>
            <div className="flex gap-2">
              {(['allow', 'deny'] as AccessStrategy[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrategy(s)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    strategy === s
                      ? s === 'allow'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s === 'allow' ? '✓ مجاز' : '✗ غیرمجاز'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>نوع موجودیت</Label>
            <Select value={authorizableType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نوع..." />
              </SelectTrigger>
              <SelectContent>
                {AUTHORIZABLE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {authorizableType && (
            <div className="space-y-1.5">
              <Label>
                {AUTHORIZABLE_TYPES.find((t) => t.value === authorizableType)?.label ??
                  authorizableType}
              </Label>
              <AuthorizableSelector
                authorizableType={authorizableType}
                value={authorizableIds}
                onChange={handleIdChange}
              />
            </div>
          )}

          {canSubmit && (
            <div className="rounded-lg border border-dashed p-3 space-y-1">
              <p className="text-xs text-muted-foreground">پیش‌نمایش قانون</p>
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <Badge variant="outline" className={strategyClass}>
                  {strategyLabel}
                </Badge>
                <span className="text-muted-foreground">برای</span>
                <Badge variant="outline">
                  {AUTHORIZABLE_TYPES.find((t) => t.value === authorizableType)?.label ??
                    authorizableType}
                </Badge>
                <span className="font-medium">
                  {authorizableLabels.length > 0
                    ? authorizableLabels.join('، ')
                    : `${authorizableIds.length} مورد`}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending
                ? 'در حال ذخیره...'
                : isEditing
                  ? 'ذخیره تغییرات'
                  : 'افزودن قانون'}
            </Button>
          </div>

          {syncRules.isError && (
            <p className="text-sm text-destructive text-center">
              {(syncRules.error as any)?.message || 'عملیات با خطا مواجه شد'}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

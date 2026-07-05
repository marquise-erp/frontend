'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Called when user confirms the deletion. Can be async. */
  onConfirm: () => void | Promise<void>;

  /** e.g. "نقش", "سازمان", "کاربر" */
  entityLabel?: string;

  /** The actual name of the item being deleted */
  entityName?: string;

  /** Full custom title. If not provided, will be built from entityLabel */
  title?: string;

  /** Full custom description. If not provided, will be built from entityLabel + entityName */
  description?: string;

  /** Override the destructive confirm button variant if needed */
  variant?: 'destructive' | 'default';

  /** Text for the confirm (destructive) button */
  confirmText?: string;

  /** Text for the cancel button */
  cancelText?: string;

  /** Show loading state on the confirm button */
  isLoading?: boolean;

  /** Optional extra content below the description */
  children?: React.ReactNode;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  entityLabel,
  entityName,
  title,
  description,
  confirmText = 'حذف',
  cancelText = 'انصراف',
  isLoading = false,
  children,
  variant = 'destructive',
}: DeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    // Parent should usually close via onOpenChange, but we let it control
  };

  // Build default title
  const dialogTitle = title ?? (entityLabel ? `حذف ${entityLabel}` : 'حذف');

  // Build default description
  const dialogDescription =
    description ??
    (entityLabel && entityName
      ? `آیا از حذف ${entityLabel} «${entityName}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.`
      : entityLabel
        ? `آیا از حذف این ${entityLabel} مطمئن هستید؟ این عمل غیرقابل بازگشت است.`
        : 'آیا از حذف این مورد مطمئن هستید؟ این عمل غیرقابل بازگشت است.');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {isLoading ? 'در حال حذف...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

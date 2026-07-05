'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthPermissions } from '../hooks/use-permissions';
import { ShieldIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PermissionCode } from '@/config/permissions';

interface PermissionGuardProps {
  permission: PermissionCode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {
  const { can } = useAuthPermissions();
  const t = useTranslations('errors');

  if (!can(permission)) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ShieldIcon} className="size-5 text-muted-foreground" />
            <CardTitle>{t('accessDeniedTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('accessDeniedDescription', { permission })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('accessDeniedContact')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

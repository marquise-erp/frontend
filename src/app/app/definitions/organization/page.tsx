import { Suspense } from 'react';
import { PERMISSION_CODES } from '@/config/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGuard } from '@/features/auth/components/permission-guard';

export default async function OrganizationsPage() {

  return (
    <PermissionGuard permission={PERMISSION_CODES.USER_READ}>
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <OrganizationTree/>
        </Suspense>
      </div>
    </PermissionGuard>
  );
}

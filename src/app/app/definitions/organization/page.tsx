import { PERMISSION_CODES } from '@/config/permissions';
import { PermissionGuard } from '@/features/auth/components/permission-guard';
import { OrganizationTree } from '@/features/organization/components/organization-tree';

export default function OrganizationsPage() {
  return (
    <PermissionGuard permission={PERMISSION_CODES.ORGANIZATION_VIEW}>
      <div className="space-y-6">
        <OrganizationTree />
      </div>
    </PermissionGuard>
  );
}

import { PERMISSION_CODES } from '@/config/permissions';
import { PermissionGuard } from '@/features/auth/components/permission-guard';
import { CustomerGroupTree } from '@/features/customer-group/components/customer-group-tree';

export default function CustomerGroupsPage() {
  return (
    <PermissionGuard permission={PERMISSION_CODES.CUSTOMER_GROUP_VIEW}>
      <div className="space-y-6">
        <CustomerGroupTree />
      </div>
    </PermissionGuard>
  );
}

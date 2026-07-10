export const PERMISSION_CODES = {
  // User
  AUTH_USER_VIEW: 'auth.user.view',
  AUTH_USER_CREATE: 'auth.user.create',
  AUTH_USER_EDIT: 'auth.user.edit',
  AUTH_USER_DELETE: 'auth.user.delete',

  // Role
  AUTH_ROLE_VIEW: 'auth.role.view',
  AUTH_ROLE_CREATE: 'auth.role.create',
  AUTH_ROLE_EDIT: 'auth.role.edit',
  AUTH_ROLE_DELETE: 'auth.role.delete',

  // Scope
  AUTH_SCOPE_VIEW: 'auth.scope.view',
  AUTH_SCOPE_CREATE: 'auth.scope.create',
  AUTH_SCOPE_EDIT: 'auth.scope.edit',
  AUTH_SCOPE_DELETE: 'auth.scope.delete',

  // Position
  AUTH_POSITION_VIEW: 'auth.position.view',
  AUTH_POSITION_CREATE: 'auth.position.create',
  AUTH_POSITION_EDIT: 'auth.position.edit',
  AUTH_POSITION_DELETE: 'auth.position.delete',

  // Organization
  ORGANIZATION_VIEW: 'organization.view',
  ORGANIZATION_CREATE: 'organization.create',
  ORGANIZATION_EDIT: 'organization.edit',
  ORGANIZATION_DELETE: 'organization.delete',

  // Customer group
  CUSTOMER_GROUP_VIEW: 'customer.customer_group.view',
  CUSTOMER_GROUP_CREATE: 'customer.customer_group.create',
  CUSTOMER_GROUP_EDIT: 'customer.customer_group.edit',
  CUSTOMER_GROUP_DELETE: 'customer.customer_group.delete',

  // Permission access rule
  AUTH_PERMISSION_ACCESS_RULE_VIEW: 'auth.permission_access_rule.view',
  AUTH_PERMISSION_ACCESS_RULE_CREATE: 'auth.permission_access_rule.create',
  AUTH_PERMISSION_ACCESS_RULE_EDIT: 'auth.permission_access_rule.edit',
  AUTH_PERMISSION_ACCESS_RULE_DELETE: 'auth.permission_access_rule.delete',
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';


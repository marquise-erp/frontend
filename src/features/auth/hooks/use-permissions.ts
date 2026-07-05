'use client';

import { PermissionCode, SUPER_ADMIN_ROLE } from "@/config/permissions";
import { useAuthStore } from "../store/auth-store";

export const useAuthPermissions = () => {
  const scopes = useAuthStore((s) => s.scopes);
  const activeScopeId = useAuthStore((s) => s.activeScopeId);
  const permissions = useAuthStore((s) => s.permissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isSuperAdmin = scopes.some((scope) => scope.id === activeScopeId && scope.role?.name === SUPER_ADMIN_ROLE);

  const can = (code: PermissionCode): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permissions.includes(code);
  };

  return { can, isSuperAdmin, isAuthenticated, scopes, permissions, activeScopeId };
};

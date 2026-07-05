import type { LoginResponse } from "@/features/auth/schemas/login-schema"
import type { SidebarAccessContext } from "@/features/navigation/lib/filter-sidebar"

export function getSidebarAccessFromSession(
  session: LoginResponse | null
): SidebarAccessContext | null {
  // NOTE: LoginResponse shape changed; using defensive access + cast until auth flow is aligned
  const s = session as any;
  const scope = s?.scope ?? (s?.scopes?.[0] ?? null);
  if (!scope || !scope?.role?.permissions?.length) {
    return null;
  }
  return {
    permissions: new Set(scope.role.permissions),
    orgNodeType: scope.type ?? "holding",
  };
}

import type { LoginResponseData } from "@/features/auth/schemas/login-schema"
import type { SidebarAccessContext } from "@/features/navigation/lib/filter-sidebar"

export function getSidebarAccessFromSession(
  session: LoginResponseData | null
): SidebarAccessContext | null {
  const scope = session?.scope
  if (!scope?.role?.permissions?.length || !scope.type) {
    return null
  }
  return {
    permissions: new Set(scope.role.permissions),
    orgNodeType: scope.type,
  }
}

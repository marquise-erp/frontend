export function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app/dashboard";
  }
  if (next.startsWith("/auth/") || next.startsWith("/invite/")) {
    return "/app/dashboard";
  }
  return next;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_ROUTES, BACKEND_URL, CLIENT_API_BASE } from './config/api-routes';

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const xsrfToken = getCookieValue(cookieHeader, "XSRF-TOKEN");

    const response = await fetch(
      `${BACKEND_URL}${CLIENT_API_BASE}${API_ROUTES.ADMIN.AUTH.ME}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
          "X-Requested-With": "XMLHttpRequest",
          Referer: request.nextUrl.origin,
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
        credentials: "include",
        cache: "no-store",
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isAppRoute = pathname.startsWith("/app");

  if (!isAuthRoute && !isAppRoute) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);

  if (isAppRoute && !authenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*", ],
};

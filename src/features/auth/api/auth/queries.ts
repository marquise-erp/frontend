"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { meResponseSchema } from "../../schemas/login/responses";
import { useAuthStore } from "../../store/auth-store";
import { PermissionCode } from "@/config/permissions";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useAuthMe(options?: { enabled?: boolean }) {
  const setAuthData = useAuthStore((s) => s.setAuthData);

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.AUTH.ME, meResponseSchema),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (query.data?.user) {
      const { user, scopes, permissions } = query.data;
      setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);
    }
  }, [query.data, setAuthData]);

  return query;
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { authKeys } from "@/features/auth/api/auth/queries";
import { meResponseSchema, type MeResponse } from "@/features/auth/schemas/login/responses";
import { PermissionCode } from "@/config/permissions";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { toApiError } from "@/lib/api-error";

export function useAcceptInvite(token: string, redirectTo?: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthData } = useAuthStore();

  return useMutation({
    mutationFn: async () =>
      postToApi(
        API_ROUTES.ADMIN.INVITES.accept(token),
        {},
        meResponseSchema,
      ),
    onSuccess: (data: MeResponse) => {
      const { user, scopes, permissions } = data;
      setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);
      queryClient.setQueryData<MeResponse>(authKeys.me, { user, scopes, permissions });
      toast.success("دعوت‌نامه با موفقیت پذیرفته شد.");
      router.push(getSafeRedirectPath(redirectTo ?? "/app/dashboard"));
    },
    onError: (error) => {
      const apiError = toApiError(error);
      toast.error(apiError.message || "پذیرش دعوت‌نامه ناموفق بود.");
    },
  });
}

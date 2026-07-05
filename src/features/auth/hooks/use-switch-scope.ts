"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useAuthStore } from "../store/auth-store";
import { authKeys } from "./use-auth";
import { meResponseSchema, type MeResponse } from "../schemas/login-schema";

export function useSwitchScope() {
  const queryClient = useQueryClient();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const switchContextNode = useAuthStore((state) => state.switchContextNode);

  // We read the latest scope inside callbacks using getState() to avoid stale closures
  const getActiveScopeId = () => useAuthStore.getState().activeScopeId;

  return useMutation<MeResponse, Error, number, { previousActive: number | null }>({
    mutationFn: async (scopeId: number) => {
      // Local guard (defense in depth)
      const currentScopes = useAuthStore.getState().scopes;
      const hasAccess = currentScopes.some((scope) => scope.id === scopeId);

      if (!hasAccess) {
        throw new Error("You do not have access to the selected scope.");
      }

      // Tell server we are switching scope. Server returns the full MeResponse
      // (user + updated scopes + permissions) so we don't need a separate /me call.
      return postToApi(
        API_ROUTES.ADMIN.AUTH.SWITCH_SCOPE,
        { scope_id: scopeId },
        meResponseSchema
      );
    },
    onMutate: (scopeId) => {
      // Optimistic update: change active scope in UI immediately.
      // Reverted on error.
      const previousActive = useAuthStore.getState().activeScopeId;

      if (previousActive !== scopeId) {
        switchContextNode(scopeId);
      }

      return { previousActive };
    },
    onSuccess: (data: MeResponse) => {
      const { user, scopes, permissions } = data;

      // Update store with the fresh data returned by the switch endpoint.
      // setAuthData will keep the activeScopeId we optimistically set (see store logic).
      setAuthData(user, scopes, permissions);

      // Seed the React Query cache directly with the response.
      // No need to call GET /auth/me again.
      queryClient.setQueryData(authKeys.me, data);

      // Invalidate all data for the newly selected tenant/scope.
      // This works together with useTenantQuery / useTenantMutation.
      // All queries using the wrapper are keyed under ['tenant', <scope>, ...]
      const currentScopeId = getActiveScopeId();
      if (currentScopeId != null) {
        queryClient.invalidateQueries({
          queryKey: ['tenant', currentScopeId],
        });
      }
    },
    onError: (error: any, _scopeId, context) => {
      // Revert optimistic scope change
      if (context?.previousActive != null) {
        switchContextNode(context.previousActive);
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to switch working scope.";
      toast.error(message);
    },
  });
}

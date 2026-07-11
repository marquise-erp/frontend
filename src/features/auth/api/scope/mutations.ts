"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { PermissionCode } from "@/config/permissions";
import { useAuthStore } from "../../store/auth-store";
import { authKeys } from "../auth/queries";
import { meResponseSchema, type MeResponse } from "../../schemas/login/responses";
import { switchScopeRequestSchema } from "../../schemas/scope/requests";

export function useSwitchScope() {
  const queryClient = useQueryClient();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const switchContextNode = useAuthStore((state) => state.switchContextNode);

  const getActiveScopeId = () => useAuthStore.getState().activeScopeId;

  return useMutation<MeResponse, Error, number, { previousActive: number | null }>({
    mutationFn: async (scopeId: number) => {
      const currentScopes = useAuthStore.getState().scopes;
      const hasAccess = currentScopes.some((scope) => scope.id === scopeId);

      if (!hasAccess) {
        throw new Error("You do not have access to the selected scope.");
      }

      return postToApi(
        API_ROUTES.ADMIN.AUTH.SWITCH_SCOPE,
        switchScopeRequestSchema.parse({ scope_id: scopeId }),
        meResponseSchema,
      );
    },
    onMutate: (scopeId) => {
      const previousActive = useAuthStore.getState().activeScopeId;

      if (previousActive !== scopeId) {
        switchContextNode(scopeId);
      }

      return { previousActive };
    },
    onSuccess: (data: MeResponse) => {
      const { user, scopes, permissions } = data;

      setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);
      queryClient.setQueryData(authKeys.me, data);

      const currentScopeId = getActiveScopeId();
      if (currentScopeId != null) {
        queryClient.invalidateQueries({
          queryKey: ["tenant", currentScopeId],
        });
      }
    },
    onError: (error: any, _scopeId, context) => {
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

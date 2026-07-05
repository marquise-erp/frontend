import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware";
import { postToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { Permission, Scope, User } from "../schemas";
import { PermissionCode } from "@/config/permissions";

interface AuthState {
  user: User | null

  scopes: Scope[];
  permissions: PermissionCode[];

  activeScopeId: number | null;

  isAuthenticated: boolean;

  logout: () => Promise<void>;

  setAuthData: (user: User, scopes: Scope[], permissions: Permission[]) => void;
  switchContextNode: (organizationNodeId: number) => void;
  purgeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      scopes: [],
      permissions: [],
      activeScopeId: null,
      isAuthenticated: false,

      logout: async () => {
        try {
          await postToApi(API_ROUTES.ADMIN.AUTH.LOGOUT, {});
        } catch (err) {
          console.error("Logout failed", err);
        } finally {
          get().purgeAuth();
        }
      },

      setAuthData: (user, scopes, permissions) => set((state) => {
        const defaultContext =
          scopes.find((scope) => scope.is_current_context) ?? scopes[0] ?? null;

        return {
          user,
          scopes,
          permissions,
          activeScopeId:
            state.activeScopeId ??
            defaultContext?.id ??
            null,
          isAuthenticated: true,
        };
      }),

      switchContextNode: (scopeId) => set((state) => {
        const hasAccess = state.scopes.some((scope) => scope.id === scopeId);

        if (!hasAccess) {
          console.error(`Security Boundary Blocked: User has no scope for Node ID [${scopeId}]`);
          return {};
        }

        return { activeScopeId: scopeId };
      }),

      purgeAuth: () => {
        set({
          user: null,
          scopes: [],
          permissions: [],
          activeScopeId: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "marquise-auth-scope",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        activeScopeId: state.activeScopeId,
      }),
    }
  )
);

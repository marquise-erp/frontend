import { create } from "zustand"
import { PermissionType, ScopeType, UserType } from "../schemas/auth-entities"
import { api } from "@/lib/axios";
import { postToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";

interface AuthState {
  user: UserType | null

  scopes: ScopeType[];
  permissions: PermissionType[];

  activeScopeId: number | null;

  isAuthenticated: boolean;

  logout: () => Promise<void>;

  setAuthData: (user: UserType, scopes: ScopeType[], permissions: PermissionType[]) => void;
  switchContextNode: (organizationNodeId: number) => void;
  purgeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
      scopes.find((scope) => scope.is_current_context) ?? scopes[0] ?? null

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


  purgeAuth: async () => {
    set({
      user: null,
      scopes: [],
      permissions: [],
      activeScopeId: null,
      isAuthenticated: false,
    });
  },
}));

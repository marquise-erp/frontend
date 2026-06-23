import { useSyncExternalStore } from "react";
import { initialRoles, initialUsers, type Role, type AppUser } from "../config/rbac-data";
import type { OrganizationLevel } from "../config/organization-levels";

interface RbacState {
  roles: Role[];
  users: AppUser[];
}

let state: RbacState = { roles: initialRoles, users: initialUsers };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const uid = () => Math.random().toString(36).slice(2, 9);

export const rbacStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return state;
  },
  // Roles
  addRole(role: Omit<Role, "id">) {
    state = { ...state, roles: [...state.roles, { ...role, id: `role-${uid()}` }] };
    emit();
  },
  updateRole(id: string, patch: Partial<Role>) {
    state = { ...state, roles: state.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) };
    emit();
  },
  removeRole(id: string) {
    state = { ...state, roles: state.roles.filter((r) => r.id !== id) };
    emit();
  },
  toggleRolePermission(roleId: string, permId: string) {
    state = {
      ...state,
      roles: state.roles.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: r.permissions.includes(permId)
                ? r.permissions.filter((p) => p !== permId)
                : [...r.permissions, permId],
            }
          : r,
      ),
    };
    emit();
  },
  // Users
  addUser(user: Omit<AppUser, "id">) {
    state = { ...state, users: [...state.users, { ...user, id: `usr-${uid()}` }] };
    emit();
  },
  updateUser(id: string, patch: Partial<AppUser>) {
    state = { ...state, users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) };
    emit();
  },
  removeUser(id: string) {
    state = { ...state, users: state.users.filter((u) => u.id !== id) };
    emit();
  },
  assignUserToLevel(userId: string, levelType: OrganizationLevel, levelId: string) {
    this.updateUser(userId, { levelType, levelId });
  },
};

export function useRbac() {
  return useSyncExternalStore(rbacStore.subscribe, rbacStore.get, rbacStore.get);
}

export function getUsersForLevel(levelId: string): AppUser[] {
  return state.users.filter((u) => u.levelId === levelId);
}

export function useUsersForLevel(levelId: string) {
  const { users } = useRbac();
  return users.filter((u) => u.levelId === levelId);
}
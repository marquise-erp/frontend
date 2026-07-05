import { fetchFromApi, deleteFromApi, postToApi, putToApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api-routes';
import {
  userSchema,
  userListSchema
} from '../schemas/user.schema';
import { CreateUserInput, UpdateUserInput, createUserSchema, updateUserSchema } from '../schemas/user-input.schema';
import { useTenantQuery, useTenantMutation } from '@/lib/tenant-query';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

export function useUsers() {
  return useTenantQuery({
    queryKey: userKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.USERS.LIST, userListSchema),
  });
}

export function useCreateUser() {
  return useTenantMutation({
    mutationFn: async (data: CreateUserInput) => {
      const parsed = createUserSchema.parse(data);
      return postToApi(API_ROUTES.ADMIN.USERS.CREATE, parsed, userSchema);
    },
  });
}

export function useUpdateUser() {
  return useTenantMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const parsed = updateUserSchema.parse(data);
      return putToApi(
        API_ROUTES.ADMIN.USERS.update(data.id),
        { ...parsed, id: undefined },
        userSchema,
      );
    },
  });
}

export function useDeleteUser() {
  return useTenantMutation({
    mutationFn: async (id: number | string) =>
      deleteFromApi(API_ROUTES.ADMIN.USERS.delete(id)),
  });
}

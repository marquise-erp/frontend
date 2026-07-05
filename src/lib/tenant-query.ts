import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth-store';

export type TenantQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey'> & {
  queryKey: readonly unknown[];
};

/**
 * useTenantQuery
 * 
 * Wrapper around useQuery that automatically:
 * - Prefixes the queryKey with ['tenant', activeScopeId]
 * - Disables the query when there is no active scope (unless explicitly enabled)
 * 
 * Usage:
 *   const { data, isLoading } = useTenantQuery({
 *     queryKey: ['roles', 'list'],
 *     queryFn: () => fetchFromApi(...),
 *   });
 */
export function useTenantQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
>(
  options: TenantQueryOptions<TQueryFnData, TError, TData>
): UseQueryResult<TData, TError> {
  const activeScopeId = useAuthStore((s) => s.activeScopeId);

  // Build tenant-aware key: ['tenant', <scopeId>, ...userKey]
  const tenantQueryKey: readonly unknown[] = [
    'tenant',
    activeScopeId,
    ...options.queryKey,
  ];

  // If caller didn't specify `enabled`, we default to requiring a valid scope.
  const enabled =
    options.enabled !== undefined ? options.enabled : activeScopeId != null;

  return useQuery({
    ...options,
    queryKey: tenantQueryKey,
    enabled,
  });
}

/**
 * useTenantMutation
 * 
 * Wrapper around useMutation that:
 * - Automatically invalidates all queries under ['tenant', activeScopeId] on success.
 * - Preserves any onSuccess provided by the caller.
 * 
 * This means any successful mutation created with this hook
 * will cause all tenant-scoped data on the current page to refetch.
 * 
 * Usage:
 *   const mutation = useTenantMutation({
 *     mutationFn: (data) => postToApi(...),
 *     onSuccess: (data) => { toast.success('Created'); },
 *   });
 */
export function useTenantMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  // Read fresh scope at call time (especially important inside onSuccess callbacks)
  const getActiveScopeId = () => useAuthStore.getState().activeScopeId;

  return useMutation({
    ...options,
    onSuccess: (...args: any[]) => {
      // Invalidate all tenant-scoped data for the *current* active scope.
      // This causes all useTenantQuery calls for the active tenant to refetch.
      const activeScopeId = getActiveScopeId();
      if (activeScopeId != null) {
        queryClient.invalidateQueries({
          queryKey: ['tenant', activeScopeId],
        });
      }

      // Forward to the original onSuccess (if provided).
      // Using any[] avoids complex generic signature mismatches in v5.
      (options.onSuccess as any)?.(...args);
    },
  });
}

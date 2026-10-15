import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services';

export const userKeys = {
  all: ['users'],
  list: (params) => [...userKeys.all, 'list', params],
  detail: (id) => [...userKeys.all, 'detail', id],
};

/**
 * Liste paginée des utilisateurs (admin only).
 * `params` : { page, limit } — passées en query string.
 */
export function useUsersQuery(params = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => usersApi.list({ ...params, signal }),
    // On garde les données affichées quand une mutation tourne en arrière-plan.
    placeholderData: (previous) => previous,
  });
}

/** Détail d'un utilisateur (admin only). */
export function useUserQuery(id, options = {}) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => usersApi.get(id, { signal }),
    enabled: Boolean(id),
    ...options,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => {
    // Toute modification de la liste doit rafraîchir la liste paginée.
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };
}

export function useUpdateUser(options = {}) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: usersApi.update,
    ...options,
    onSuccess: (updated, ...rest) => {
      invalidate();
      options.onSuccess?.(updated, ...rest);
    },
  });
}

export function useUpdateUserRole(options = {}) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: usersApi.updateRole,
    ...options,
    onSuccess: (updated, ...rest) => {
      invalidate();
      options.onSuccess?.(updated, ...rest);
    },
  });
}

export function useDeleteUser(options = {}) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: usersApi.remove,
    ...options,
    onSuccess: (id, ...rest) => {
      invalidate();
      options.onSuccess?.(id, ...rest);
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/services';

export const serviceKeys = {
  all: ['services'],
  list: () => [...serviceKeys.all, 'list'],
};

/** Liste complète des services du catalogue. */
export function useServicesQuery() {
  return useQuery({
    queryKey: serviceKeys.list(),
    queryFn: ({ signal }) => servicesApi.list({ signal }),
  });
}

/** Met à jour le cache local sans attendre un nouveau GET. */
function useCacheUpdater() {
  const queryClient = useQueryClient();
  return (updater) => {
    queryClient.setQueryData(serviceKeys.list(), (previous) => updater(previous ?? []));
    queryClient.invalidateQueries({ queryKey: serviceKeys.all });
  };
}

export function useCreateService(options = {}) {
  const updateCache = useCacheUpdater();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,
    ...options,
    onSuccess: (created, ...rest) => {
      updateCache((services) => [created, ...services]);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      options.onSuccess?.(created, ...rest);
    },
  });
}

export function useUpdateService(options = {}) {
  const updateCache = useCacheUpdater();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.update,
    ...options,
    onSuccess: (updated, ...rest) => {
      updateCache((services) => services.map((s) => (s.id === updated.id ? updated : s)));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      options.onSuccess?.(updated, ...rest);
    },
  });
}

export function useDeleteService(options = {}) {
  const updateCache = useCacheUpdater();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.remove,
    ...options,
    onSuccess: (id, ...rest) => {
      updateCache((services) => services.filter((s) => s.id !== id));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      options.onSuccess?.(id, ...rest);
    },
  });
}

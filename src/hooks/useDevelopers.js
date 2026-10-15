import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { developersApi } from '@/services';

export const developerKeys = {
  all: ['developers'],
  list: () => [...developerKeys.all, 'list'],
};

/** Liste tous les développeurs (entité 1ʳᵉ classe côté backend). */
export function useDevelopersQuery() {
  return useQuery({
    queryKey: developerKeys.list(),
    queryFn: ({ signal }) => developersApi.list({ signal }),
  });
}

function useCacheUpdater() {
  const queryClient = useQueryClient();
  return (updater) => {
    queryClient.setQueryData(developerKeys.list(), (previous) => updater(previous ?? []));
    // Les développeurs sont référencés par les services :
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };
}

export function useCreateDeveloper(options = {}) {
  const updateCache = useCacheUpdater();
  return useMutation({
    mutationFn: developersApi.create,
    ...options,
    onSuccess: (created, ...rest) => {
      updateCache((devs) => [...devs, created].sort((a, b) => a.name.localeCompare(b.name)));
      options.onSuccess?.(created, ...rest);
    },
  });
}

export function useUpdateDeveloper(options = {}) {
  const updateCache = useCacheUpdater();
  return useMutation({
    mutationFn: developersApi.update,
    ...options,
    onSuccess: (updated, ...rest) => {
      updateCache((devs) =>
        devs.map((d) => (d.id === updated.id ? updated : d)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      options.onSuccess?.(updated, ...rest);
    },
  });
}

export function useDeleteDeveloper(options = {}) {
  const updateCache = useCacheUpdater();
  return useMutation({
    mutationFn: developersApi.remove,
    ...options,
    onSuccess: (id, ...rest) => {
      updateCache((devs) => devs.filter((d) => d.id !== id));
      options.onSuccess?.(id, ...rest);
    },
  });
}

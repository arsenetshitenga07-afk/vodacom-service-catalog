import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { technologiesApi } from '@/services';

export const technologyKeys = {
  all: ['technologies'],
  list: () => [...technologyKeys.all, 'list'],
};

/** Liste toutes les technologies (entité 1ʳᵉ classe côté backend). */
export function useTechnologiesQuery() {
  return useQuery({
    queryKey: technologyKeys.list(),
    queryFn: ({ signal }) => technologiesApi.list({ signal }),
  });
}

function useCacheUpdater() {
  const queryClient = useQueryClient();
  return (updater) => {
    queryClient.setQueryData(technologyKeys.list(), (previous) => updater(previous ?? []));
    // Les technologies apparaissent dans le détail des services et les filtres :
    // on invalide aussi la liste de services pour qu'ils se rechargent.
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };
}

function useSideEffects() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };
}

export function useCreateTechnology(options = {}) {
  const updateCache = useCacheUpdater();
  const sideEffects = useSideEffects();
  return useMutation({
    mutationFn: technologiesApi.create,
    ...options,
    onSuccess: (created, ...rest) => {
      updateCache((techs) => [...techs, created].sort((a, b) => a.name.localeCompare(b.name)));
      sideEffects();
      options.onSuccess?.(created, ...rest);
    },
  });
}

export function useUpdateTechnology(options = {}) {
  const updateCache = useCacheUpdater();
  const sideEffects = useSideEffects();
  return useMutation({
    mutationFn: technologiesApi.update,
    ...options,
    onSuccess: (updated, ...rest) => {
      updateCache((techs) =>
        techs.map((t) => (t.id === updated.id ? updated : t)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      sideEffects();
      options.onSuccess?.(updated, ...rest);
    },
  });
}

export function useDeleteTechnology(options = {}) {
  const updateCache = useCacheUpdater();
  const sideEffects = useSideEffects();
  return useMutation({
    mutationFn: technologiesApi.remove,
    ...options,
    onSuccess: (id, ...rest) => {
      updateCache((techs) => techs.filter((t) => t.id !== id));
      sideEffects();
      options.onSuccess?.(id, ...rest);
    },
  });
}

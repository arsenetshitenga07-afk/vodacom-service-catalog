import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services';

export const statsKeys = {
  all: ['stats'],
  dashboard: () => [...statsKeys.all, 'dashboard'],
  departments: () => [...statsKeys.all, 'departments'],
};

/**
 * Statistiques agrégées pour le dashboard (admin).
 * Pas de polling : on refetch au focus uniquement (les stats sont peu volatiles).
 */
export function useDashboardStatsQuery(options = {}) {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: ({ signal }) => statsApi.dashboard({ signal }),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

/**
 * Liste des départements acceptés par le backend.
 * Cachée 5 min (la liste bouge très rarement).
 */
export function useServiceDepartmentsQuery(options = {}) {
  return useQuery({
    queryKey: statsKeys.departments(),
    queryFn: ({ signal }) => statsApi.departments({ signal }),
    staleTime: 5 * 60_000,
    ...options,
  });
}

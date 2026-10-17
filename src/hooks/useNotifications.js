import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationsApi } from '@/services';

export const notificationKeys = {
  all: ['notifications'],
  list: (params) => [...notificationKeys.all, 'list', params],
};

/**
 * Liste paginée des notifications (fil d'activité).
 * Polling automatique toutes les 30s + refetch au focus fenêtre pour
 * récupérer les actions récentes (create/update/delete) sans rafraîchir.
 */
export function useNotificationsQuery(params = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: ({ signal }) => notificationsApi.list({ ...params, signal }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    placeholderData: (previous) => previous,
  });
}

/**
 * Hook utilitaire : quand une mutation sur services/users/developers/technologies
 * réussit, invalide automatiquement la liste des notifications pour que la cloche
 * se mette à jour sans attendre le polling.
 *
 * Usage : dans le hook de mutation, appelle `onSuccess: invalidateNotifications(queryClient)`.
 */
export function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

/**
 * Variante pratique : déclenche la requête immédiatement quand le composant
 * est monté (utile pour les badges de la sidebar qui ont besoin d'un count
 * au plus vite).
 */
export function useNotificationsRealtime(params = {}) {
  const query = useNotificationsQuery(params);
  useEffect(() => {
    // No-op : useQuery gère déjà le polling via `refetchInterval`.
  }, [query.dataUpdatedAt]);
  return query;
}

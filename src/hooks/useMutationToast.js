import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/errors';

/**
 * Helper de toasts pour les mutations CRUD :
 * - toaste automatiquement les succès/erreurs (sauf si `silent: true` est passé
 *   par le caller, qui gère lui-même ses messages).
 * - Utiliser `useMutationToast({ success: '...', error: '...' })` puis passer
 *   le retour à un `useMutation` React Query.
 *
 * Pourquoi ? Évite que chaque mutation oublie son toast (très fréquent), et
 * uniformise le format des messages d'erreur.
 */
export function useMutationToast({ success, error: errorKey, silent = false } = {}) {
  const { t } = useTranslation();

  const onSuccess = useCallback(
    (data) => {
      if (silent || !success) return;
      // Si `success` est une fonction, elle reçoit la donnée et retourne le message.
      const message = typeof success === 'function' ? success(data) : success;
      toast.success(t(message));
    },
    [success, silent, t],
  );

  const onError = useCallback(
    (err) => {
      if (silent) return;
      // Le caller peut passer une clé i18n `error` ; sinon on tombe sur getErrorMessage.
      const message = errorKey
        ? getErrorMessage(err, t) || t(errorKey)
        : getErrorMessage(err, t);
      toast.error(message);
    },
    [errorKey, silent, t],
  );

  return { onSuccess, onError };
}

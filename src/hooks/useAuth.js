import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, USE_MOCK_API } from '@/services';
import { selectIsAuthenticated, selectUser, useAuthStore } from '@/store/authStore';

/** Session courante et actions d'authentification. */
export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const logoutFromStore = useAuthStore((state) => state.logout);

  const logout = useCallback(
    (reason = 'loggedOut') => {
      logoutFromStore(reason);
      queryClient.clear();
    },
    [logoutFromStore, queryClient],
  );

  return { user, isAuthenticated, logout };
}

/** Mutation de connexion : enregistre la session et vide le cache précédent. */
export function useLogin(options = {}) {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    ...options,
    onSuccess: (session, ...rest) => {
      queryClient.clear();
      setSession(session);
      options.onSuccess?.(session, ...rest);
    },
  });
}

/** Vérification du code reçu par e-mail : ouvre la session et vide le cache précédent. */
export function useVerifyCode(options = {}) {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.verifyCode,
    ...options,
    onSuccess: (session, ...rest) => {
      queryClient.clear();
      setSession(session);
      options.onSuccess?.(session, ...rest);
    },
  });
}

/**
 * Avec le vrai backend : recharge le profil (`GET /auth/me`) à l'ouverture de l'application,
 * pour connaître le rôle à jour. Un jeton expiré renvoie 401 → déconnexion automatique.
 */
export function useProfileSync() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: isAuthenticated && !USE_MOCK_API,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) updateUser(data);
  }, [data, updateUser]);
}

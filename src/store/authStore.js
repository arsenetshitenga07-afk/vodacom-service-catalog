import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Session utilisateur persistée.
 * `logoutReason` permet d'afficher un message adapté (ex. session expirée)
 * sur la page de connexion, puis est remis à zéro.
 * `isLocked` : écran de verrouillage actif (persisté : un rechargement ne le contourne pas).
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      user: null,
      logoutReason: null,
      isLocked: false,
      setSession: ({ token, user }) => set({ token, user, logoutReason: null, isLocked: false }),
      logout: (reason = null) =>
        set({ token: null, user: null, logoutReason: reason, isLocked: false }),
      lock: () => set((state) => (state.token ? { isLocked: true } : state)),
      unlock: () => set({ isLocked: false }),
      updateUser: (user) =>
        set((state) => (state.token ? { user: { ...state.user, ...user } } : state)),
      clearLogoutReason: () => set({ logoutReason: null }),
    }),
    {
      name: 'vsc-auth',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user, isLocked }) => ({ token, user, isLocked }),
    },
  ),
);

export const selectIsAuthenticated = (state) => Boolean(state.token);
export const selectUser = (state) => state.user;
export const selectIsLocked = (state) => state.isLocked;
/**
 * Droit de créer / modifier / supprimer des services : réservé au rôle `admin`
 * côté backend. Sans rôle connu (mode démo), toutes les actions restent disponibles.
 */
export const selectCanManage = (state) => !state.user?.role || state.user.role === 'admin';

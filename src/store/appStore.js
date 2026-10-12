import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LOCK_AFTER_MINUTES, LOCK_DELAY_OPTIONS } from '@/utils/constants';

export const THEMES = /** @type {const} */ (['light', 'dark', 'system']);
export const LANGUAGES = /** @type {const} */ (['en', 'fr']);
export const VIEW_MODES = /** @type {const} */ (['grid', 'table']);

/**
 * Préférences d'interface persistées (thème, langue, mode d'affichage, barre latérale).
 * La clé `vsc-preferences` est aussi lue par le script inline d'index.html
 * pour appliquer le thème avant le premier rendu.
 */
export const useAppStore = create()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      viewMode: 'grid',
      sidebarOpen: true,
      lockAfterMinutes: LOCK_AFTER_MINUTES, // 0 = jamais
      setTheme: (theme) => THEMES.includes(theme) && set({ theme }),
      setLanguage: (language) => LANGUAGES.includes(language) && set({ language }),
      setViewMode: (viewMode) => VIEW_MODES.includes(viewMode) && set({ viewMode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen: Boolean(sidebarOpen) }),
      setLockAfterMinutes: (minutes) =>
        LOCK_DELAY_OPTIONS.includes(minutes) && set({ lockAfterMinutes: minutes }),
    }),
    {
      name: 'vsc-preferences',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, language, viewMode, sidebarOpen, lockAfterMinutes }) => ({
        theme,
        language,
        viewMode,
        sidebarOpen,
        lockAfterMinutes,
      }),
    },
  ),
);

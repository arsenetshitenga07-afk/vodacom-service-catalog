import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';
import { useAppStore } from '@/store/appStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribe(callback) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

const getSnapshot = () => window.matchMedia(DARK_QUERY).matches;
const getServerSnapshot = () => false;

/** Suit la préférence système en temps réel. */
function useSystemPrefersDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Thème courant.
 * - `theme` : préférence enregistrée (light | dark | system)
 * - `resolvedTheme` : thème réellement appliqué (light | dark)
 */
export function useTheme() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const systemPrefersDark = useSystemPrefersDark();

  const resolvedTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme],
  );

  return { theme, resolvedTheme, setTheme, toggleTheme };
}

/** Applique la classe `dark` sur <html>. À appeler une seule fois, à la racine. */
export function useApplyTheme() {
  const { resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);
}

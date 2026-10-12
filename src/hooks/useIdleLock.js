import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { selectIsLocked, useAuthStore } from '@/store/authStore';

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
const STORAGE_KEY = 'vsc-last-activity';

/**
 * Verrouille la session après le délai d'inactivité choisi dans les paramètres
 * (`lockAfterMinutes`, 0 = jamais).
 * La dernière activité est partagée entre les onglets via localStorage :
 * travailler dans un onglet évite le verrouillage des autres.
 */
export function useIdleLock() {
  const minutes = useAppStore((state) => state.lockAfterMinutes);
  const isLocked = useAuthStore(selectIsLocked);
  const lock = useAuthStore((state) => state.lock);

  useEffect(() => {
    if (isLocked || !minutes) return undefined;
    const timeoutMs = minutes * 60 * 1000;

    const readLastActivity = () => {
      try {
        return Number(localStorage.getItem(STORAGE_KEY)) || Date.now();
      } catch {
        return Date.now();
      }
    };

    let lastWrite = 0;
    const markActivity = () => {
      const now = Date.now();
      // Écriture limitée à une fois toutes les 5 s pour ne pas solliciter le stockage.
      if (now - lastWrite < 5000) return;
      lastWrite = now;
      try {
        localStorage.setItem(STORAGE_KEY, String(now));
      } catch {
        /* stockage indisponible : le minuteur reste local à l'onglet */
      }
    };

    markActivity();
    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, markActivity, { passive: true }),
    );

    const interval = setInterval(() => {
      if (Date.now() - readLastActivity() >= timeoutMs) lock();
    }, 15_000);

    return () => {
      clearInterval(interval);
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, markActivity));
    };
  }, [isLocked, lock, minutes]);
}

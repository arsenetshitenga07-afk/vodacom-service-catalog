import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '@/components/common/PageLoader';
import { useProfileSync } from '@/hooks/useAuth';
import { useIdleLock } from '@/hooks/useIdleLock';
import { useAppStore } from '@/store/appStore';
import { selectIsLocked, useAuthStore } from '@/store/authStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LockScreen } from './LockScreen';

export function AppLayout() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const isLocked = useAuthStore(selectIsLocked);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  useIdleLock();
  useProfileSync();

  return (
    <>
      {/* Verrouillé : le contenu reste monté mais devient inaccessible (souris, clavier, lecteurs d'écran). */}
      <div
        className="flex min-h-screen flex-col"
        inert={isLocked}
        aria-hidden={isLocked || undefined}
      >
        <Header />
        <div className="flex flex-1">
          {/* Barre latérale (≥ 1024 px) : toute la hauteur, fixe au défilement, masquable via ☰ */}
          {sidebarOpen && (
            <aside
              id="app-sidebar"
              className="bg-card hidden w-64 shrink-0 border-r lg:block dark:bg-[#18181B]"
            >
              <div className="sticky top-[67px] flex h-[calc(100vh-67px)] flex-col overflow-y-auto p-4">
                <Sidebar className="flex-1" />
              </div>
            </aside>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="container flex-1 py-8 lg:py-10">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </main>
            <footer className="bg-card border-t dark:bg-[#18181B]">
              <div className="text-muted-foreground container flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
                <p>{t('layout.copyright', { year })}</p>
                <p className="flex items-center gap-2">
                  <span className="bg-success size-1.5 rounded-full" aria-hidden="true" />
                  {t('layout.version', { version: __APP_VERSION__ })}
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
      {isLocked && <LockScreen />}
    </>
  );
}

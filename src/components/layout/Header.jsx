import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { ROUTES } from '@/utils/constants';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Header() {
  const { t } = useTranslation();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="bg-card/80 supports-backdrop-filter:bg-card/70 sticky top-0 z-40 border-b shadow-[0_1px_12px_-6px_rgb(0_0_0/0.12)] backdrop-blur-xl dark:bg-[#18181B]/80">
      {/* Liseré de marque */}
      <div className="bg-primary h-[3px]" aria-hidden="true" />
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {/* ☰ : sur ordinateur, cache / affiche la barre latérale ; sur mobile, ouvre le menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:inline-flex"
            aria-label={sidebarOpen ? t('nav.hide') : t('nav.show')}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            title={sidebarOpen ? t('nav.hide') : t('nav.show')}
          >
            <Menu />
          </Button>
          <MobileNav />
          <Link
            to={ROUTES.home}
            className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-lg focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-hidden"
          >
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="bg-border mx-2 h-6 w-px" aria-hidden="true" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const label = isDark ? t('header.switchToLight') : t('header.switchToDark');

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label}>
      <Sun className="scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}

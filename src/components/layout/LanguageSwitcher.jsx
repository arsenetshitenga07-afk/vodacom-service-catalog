import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { useAppStore } from '@/store/appStore';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const current = SUPPORTED_LANGUAGES.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5"
          aria-label={t('header.language')}
        >
          <Languages />
          <span className="text-xs font-semibold">{current?.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t('header.language')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
              <span className="flex-1">{lang.label}</span>
              <span className="text-muted-foreground text-xs">{lang.short}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

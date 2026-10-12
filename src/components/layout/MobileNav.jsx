import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';

/** Bouton « menu » + panneau latéral contenant la navigation (écrans < 1024 px). */
export function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('nav.open')}>
          <Menu />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0B0C0E]/45 dark:bg-black/70" />
        <DialogPrimitive.Content className="bg-card fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r p-4 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('common.close')}>
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Title className="sr-only">{t('nav.label')}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t('nav.label')}
          </DialogPrimitive.Description>
          <Sidebar onNavigate={() => setOpen(false)} className="flex-1" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

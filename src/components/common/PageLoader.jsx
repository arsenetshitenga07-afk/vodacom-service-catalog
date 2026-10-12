import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PageLoader() {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <Loader2 className="text-primary size-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

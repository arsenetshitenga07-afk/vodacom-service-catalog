import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
      <div
        className="bg-dots text-foreground/6 pointer-events-none absolute inset-0 -z-10 mask-[radial-gradient(ellipse_at_center,black,transparent_65%)]"
        aria-hidden="true"
      />
      <BrandMark className="size-14" title="Vodacom" />
      <div className="space-y-3">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          {t('notFound.code')}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('notFound.title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-md">{t('notFound.description')}</p>
      </div>
      <Button asChild size="lg">
        <Link to={ROUTES.home}>
          <ArrowLeft />
          {t('notFound.backHome')}
        </Link>
      </Button>
    </div>
  );
}

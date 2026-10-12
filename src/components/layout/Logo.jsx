import { useTranslation } from 'react-i18next';
import vodacomLogo from '@/assets/vodacom-logo.png';
import { cn } from '@/utils/cn';

/** Logo officiel Vodacom (PNG détouré, fond transparent). */
export function BrandMark({ className, title }) {
  return (
    <img
      src={vodacomLogo}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      width={512}
      height={512}
      draggable="false"
      className={cn('size-8 shrink-0 select-none', className)}
    />
  );
}

/**
 * Logo complet : symbole + « Vodacom » + nom du portail.
 * `inverse` = texte blanc, pour les fonds rouges ou sombres.
 */
export function Logo({ className, showText = true, inverse = false }) {
  const { t } = useTranslation();

  return (
    <span className={cn('flex items-center gap-3', className)}>
      <BrandMark className="size-9" title={showText ? undefined : 'Vodacom'} />
      {showText && (
        <span className="flex items-center gap-3 leading-none">
          <span className="text-[19px] font-bold tracking-tight">Vodacom</span>
          <span
            className={cn('hidden h-6 w-px sm:block', inverse ? 'bg-white/30' : 'bg-border')}
            aria-hidden="true"
          />
          <span className="hidden flex-col sm:flex">
            <span className="text-[13px] font-semibold tracking-tight">{t('app.name')}</span>
            <span
              className={cn(
                'mt-1 text-[11px] font-medium',
                inverse ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {t('app.tagline')}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

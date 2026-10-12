import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

const STYLES = {
  live: { badge: 'bg-success/10 text-success', dot: 'bg-success', pulse: true },
  uat: { badge: 'bg-warning/10 text-warning', dot: 'bg-warning', pulse: false },
  none: { badge: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60', pulse: false },
};

/** Pastille de statut d'environnement (production / UAT / non déployé). */
export function StatusBadge({ status, className }) {
  const { t } = useTranslation();
  const style = STYLES[status] ?? STYLES.none;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        style.badge,
        className,
      )}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {style.pulse && (
          <span
            className={cn('absolute inset-0 animate-ping rounded-full opacity-60', style.dot)}
          />
        )}
        <span className={cn('relative size-1.5 rounded-full', style.dot)} />
      </span>
      {t(`status.${status}`)}
    </span>
  );
}

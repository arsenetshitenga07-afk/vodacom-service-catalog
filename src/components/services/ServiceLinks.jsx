import { FlaskConical, FolderGit2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const SERVICE_LINKS = [
  { key: 'liveUrl', labelKey: 'services.links.live', icon: Globe },
  { key: 'uatUrl', labelKey: 'services.links.uat', icon: FlaskConical },
  { key: 'githubUrl', labelKey: 'services.links.github', icon: FolderGit2 },
];

/** Liens rapides (Live, UAT, GitHub). `compact` = icônes seules. */
export function ServiceLinks({ service, compact = false, className }) {
  const { t } = useTranslation();
  const available = SERVICE_LINKS.filter((link) => service[link.key]);

  if (available.length === 0) {
    return <span className="text-muted-foreground text-xs">{t('services.noLinks')}</span>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {available.map(({ key, labelKey, icon: Icon }) => {
        const label = t(labelKey);
        return (
          <Button
            key={key}
            asChild
            variant={compact ? 'ghost' : 'outline'}
            size={compact ? 'icon-sm' : 'sm'}
            className={cn(
              'text-muted-foreground hover:text-primary',
              !compact && 'hover:border-primary/40 h-7 gap-1.5 px-2.5',
            )}
          >
            <a
              href={service[key]}
              target="_blank"
              rel="noreferrer"
              title={`${label} · ${service[key]}`}
              aria-label={`${label} — ${service.name}`}
            >
              <Icon />
              {!compact && label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ArrowRight, Code2, Search, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useServicesQuery } from '@/hooks/useServices';
import { developerDirectory } from '@/utils/catalogStats';
import { ROUTES } from '@/utils/constants';
import { getInitials } from '@/utils/format';

const MAX_TECH_SHOWN = 5;

/** Développeurs du catalogue, avec leurs applications et technologies. */
export default function DevelopersPage() {
  const { t } = useTranslation();
  const { data: services = [], isPending } = useServicesQuery();
  const [search, setSearch] = useState('');

  const developers = useMemo(() => developerDirectory(services), [services]);
  const query = search.trim().toLowerCase();
  const filtered = developers.filter(
    (dev) =>
      dev.name.toLowerCase().includes(query) ||
      dev.technologies.some((tech) => tech.toLowerCase().includes(query)),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Code2}
        title={t('nav.developers')}
        description={
          isPending
            ? t('common.loading')
            : t('pages.developers.subtitle', { count: developers.length })
        }
      />

      <div className="bg-card shadow-card rounded-2xl border p-3">
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('pages.developers.search')}
            aria-label={t('pages.developers.search')}
            className="bg-background h-11 pl-10 shadow-none"
          />
        </div>
      </div>

      {isPending ? (
        <ul className="grid grid-cols-1 gap-5 min-[1340px]:grid-cols-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-60 rounded-xl" />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t('services.noResultsTitle')}
          description={t('services.noResultsDescription')}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-5 min-[1340px]:grid-cols-3 sm:grid-cols-2">
          {filtered.map((dev) => {
            const hiddenTech = dev.technologies.length - MAX_TECH_SHOWN;
            return (
              <li key={dev.name}>
                <article className="bg-card shadow-card hover:border-primary/30 flex h-full flex-col rounded-xl border p-5 transition-[border-color,box-shadow] hover:shadow-md">
                  <header className="flex items-center gap-3">
                    <span className="from-primary to-brand-dark text-primary-foreground grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br text-sm font-semibold">
                      {getInitials(dev.name)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{dev.name}</h2>
                      <p className="text-muted-foreground text-xs">
                        {t('pages.developers.appCount', { count: dev.services.length })}
                      </p>
                    </div>
                  </header>

                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      {t('pages.developers.applications')}
                    </p>
                    <ul className="space-y-1">
                      {dev.services.map((service) => (
                        <li key={service.id} className="flex items-center gap-2 text-sm">
                          <span
                            className="bg-primary size-1.5 shrink-0 rounded-full"
                            aria-hidden="true"
                          />
                          <span className="truncate">{service.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex-1">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      {t('services.fields.techStack')}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {dev.technologies.slice(0, MAX_TECH_SHOWN).map((tech) => (
                        <li key={tech}>
                          <Badge variant="brand">{tech}</Badge>
                        </li>
                      ))}
                      {hiddenTech > 0 && (
                        <li>
                          <Badge variant="muted" title={dev.technologies.join(', ')}>
                            +{hiddenTech}
                          </Badge>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-4 border-t pt-3">
                    <Link
                      to={`${ROUTES.applications}?developer=${encodeURIComponent(dev.name)}`}
                      className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    >
                      {t('pages.developers.viewApps')}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

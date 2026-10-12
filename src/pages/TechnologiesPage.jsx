import { useMemo, useState } from 'react';
import { ArrowRight, Layers, Search, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ServiceAvatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useServicesQuery } from '@/hooks/useServices';
import { technologyUsage } from '@/utils/catalogStats';
import { ROUTES } from '@/utils/constants';

const MAX_APPS_SHOWN = 4;

/** Technologies utilisées dans le catalogue, avec les applications qui les emploient. */
export default function TechnologiesPage() {
  const { t } = useTranslation();
  const { data: services = [], isPending } = useServicesQuery();
  const [search, setSearch] = useState('');

  const technologies = useMemo(() => technologyUsage(services), [services]);
  const filtered = technologies.filter((tech) =>
    tech.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title={t('nav.technologies')}
        description={
          isPending
            ? t('common.loading')
            : t('pages.technologies.subtitle', { count: technologies.length })
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
            placeholder={t('pages.technologies.search')}
            aria-label={t('pages.technologies.search')}
            className="bg-background h-11 pl-10 shadow-none"
          />
        </div>
      </div>

      {isPending ? (
        <ul className="grid grid-cols-1 gap-5 min-[1340px]:grid-cols-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-52 rounded-xl" />
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
          {filtered.map((tech) => {
            const hidden = tech.services.length - MAX_APPS_SHOWN;
            return (
              <li key={tech.name}>
                <article className="bg-card shadow-card hover:border-primary/30 flex h-full flex-col rounded-xl border p-5 transition-[border-color,box-shadow] hover:shadow-md">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-primary/10 text-primary dark:bg-primary/20 grid size-10 shrink-0 place-items-center rounded-xl">
                        <Layers className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{tech.name}</h2>
                        <p className="text-muted-foreground text-xs">
                          {t('pages.technologies.usedBy', { count: tech.services.length })}
                        </p>
                      </div>
                    </div>
                  </header>

                  <ul className="mt-4 flex-1 space-y-2">
                    {tech.services.slice(0, MAX_APPS_SHOWN).map((service) => (
                      <li key={service.id} className="flex items-center gap-2.5 text-sm">
                        <ServiceAvatar
                          name={service.name}
                          className="size-7 rounded-md text-[10px]"
                        />
                        <span className="truncate">{service.name}</span>
                      </li>
                    ))}
                    {hidden > 0 && (
                      <li className="text-muted-foreground pl-9 text-xs">
                        {t('pages.technologies.more', { count: hidden })}
                      </li>
                    )}
                  </ul>

                  <div className="mt-4 border-t pt-3">
                    <Link
                      to={`${ROUTES.applications}?tech=${encodeURIComponent(tech.name)}`}
                      className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    >
                      {t('pages.technologies.viewApps')}
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

import { useMemo, useState } from 'react';
import { ArrowRight, Plus, Code2, Search, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { ReadOnlyNotice } from '@/components/common/ReadOnlyNotice';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttachToServicesDialog } from '@/components/services/AttachToServicesDialog';
import { ManageItemMenu } from '@/components/services/ManageItemMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDevelopersQuery } from '@/hooks/useDevelopers';
import { useServicesQuery } from '@/hooks/useServices';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';
import { getInitials } from '@/utils/format';

const MAX_TECH_SHOWN = 5;

/**
 * Développeurs du catalogue, avec leurs applications et technologies.
 * Source : `GET /developers` (entité 1ʳᵉ classe côté backend) ; le mapping
 * « dev → services / techs » est reconstruit côté client depuis la liste des
 * services (les services portent `developers: string[]` et `techStack: string[]`).
 */
export default function DevelopersPage() {
  const { t } = useTranslation();
  const { data: developers = [], isPending: isDevPending } = useDevelopersQuery();
  const { data: services = [], isPending: isServicesPending } = useServicesQuery();
  const [search, setSearch] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const canManage = useAuthStore(selectCanManage);

  // Index des services par développeur (lowercase) → pour mapper chaque dev à ses services
  // et à la liste agrégée de ses technologies.
  const { servicesByDev, technologiesByDev } = useMemo(() => {
    const servicesMap = new Map();
    const techsMap = new Map();
    services.forEach((service) => {
      (service.developers ?? []).forEach((devName) => {
        const key = devName.toLowerCase();
        if (!servicesMap.has(key)) servicesMap.set(key, []);
        servicesMap.get(key).push(service);
        const techs = techsMap.get(key) ?? new Set();
        (service.techStack ?? []).forEach((tech) => techs.add(tech));
        techsMap.set(key, techs);
      });
    });
    return {
      servicesByDev: servicesMap,
      technologiesByDev: Array.from(techsMap.entries()).map(([k, v]) => [k, Array.from(v)]),
    };
  }, [services]);

  const query = search.trim().toLowerCase();
  const filtered = developers.filter((dev) => {
    if (dev.name.toLowerCase().includes(query)) return true;
    const devTechs = technologiesByDev.find(([k]) => k === dev.name.toLowerCase())?.[1] ?? [];
    return devTechs.some((tech) => tech.toLowerCase().includes(query));
  });

  const isPending = isDevPending || isServicesPending;

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
        action={
          canManage &&
          !isPending && (
            <Button onClick={() => setAttachOpen(true)} className="shadow-brand">
              <Plus />
              {t('attach.developer.open')}
            </Button>
          )
        }
      />

      <ReadOnlyNotice />

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
            const devKey = dev.name.toLowerCase();
            const devServices = servicesByDev.get(devKey) ?? [];
            const devTechs = technologiesByDev.find(([k]) => k === devKey)?.[1] ?? [];
            const hiddenTech = devTechs.length - MAX_TECH_SHOWN;
            return (
              <li key={dev.id}>
                <article className="bg-card shadow-card hover:border-primary/30 flex h-full flex-col rounded-xl border p-5 transition-[border-color,box-shadow] hover:shadow-md">
                  <header className="flex items-center gap-3">
                    <span className="from-primary to-brand-dark text-primary-foreground grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br text-sm font-semibold">
                      {getInitials(dev.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold">{dev.name}</h2>
                      <p className="text-muted-foreground text-xs">
                        {t('pages.developers.appCount', { count: devServices.length })}
                      </p>
                    </div>
                    {canManage && (
                      <ManageItemMenu kind="developer" entityId={dev.id} name={dev.name} />
                    )}
                  </header>

                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      {t('pages.developers.applications')}
                    </p>
                    <ul className="space-y-1">
                      {devServices.map((service) => (
                        <li key={service.id} className="flex items-center gap-2 text-sm">
                          <span
                            className="bg-primary size-1.5 shrink-0 rounded-full"
                            aria-hidden="true"
                          />
                          <Link
                            to={ROUTES.applicationDetail(service.id)}
                            className="hover:text-primary focus-visible:ring-ring truncate rounded-sm focus-visible:ring-2 focus-visible:outline-hidden"
                          >
                            {service.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex-1">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      {t('services.fields.techStack')}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {devTechs.slice(0, MAX_TECH_SHOWN).map((tech) => (
                        <li key={tech}>
                          <Badge variant="brand">{tech}</Badge>
                        </li>
                      ))}
                      {hiddenTech > 0 && (
                        <li>
                          <Badge variant="muted" title={devTechs.join(', ')}>
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

      <AttachToServicesDialog
        kind="developer"
        open={attachOpen}
        onOpenChange={setAttachOpen}
        services={services}
        suggestions={developers.map((item) => item.name)}
      />
    </div>
  );
}

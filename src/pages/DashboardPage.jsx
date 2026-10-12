import { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Boxes, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ServiceAvatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { DeploymentsChart } from '@/components/dashboard/DeploymentsChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { TechnologiesChart } from '@/components/dashboard/TechnologiesChart';
import { PageHero } from '@/components/layout/PageHero';
import { DepartmentLabel } from '@/components/services/DepartmentLabel';
import { StatusBadge } from '@/components/services/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useServicesQuery } from '@/hooks/useServices';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { recentlyDeployed } from '@/utils/catalogStats';
import { ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatRelativeDate } from '@/utils/format';
import { getServiceStatus } from '@/utils/serviceStatus';

function getGreetingKey(hour = new Date().getHours()) {
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

/** Tableau de bord : vue d'ensemble du catalogue (chiffres, graphiques, activité récente). */
export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const canManage = useAuthStore(selectCanManage);
  const {
    data: services = [],
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useServicesQuery();
  const recent = useMemo(() => recentlyDeployed(services, 5), [services]);
  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('dashboard.eyebrow')}
        title={firstName ? t(getGreetingKey(), { name: firstName }) : t('nav.dashboard')}
        description={t('dashboard.subtitle')}
      />

      {isError && (
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title={t('services.errorTitle')}
          description={getErrorMessage(error, t)}
          action={
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {t('common.retry')}
            </Button>
          }
        />
      )}

      {!isPending && !isError && services.length === 0 && (
        <EmptyState
          icon={Boxes}
          title={t('services.emptyTitle')}
          description={t('services.emptyDescription')}
          action={
            canManage && (
              <Button asChild>
                <Link to={ROUTES.applications} state={{ create: true }}>
                  <Plus />
                  {t('services.add')}
                </Link>
              </Button>
            )
          }
        />
      )}

      {/* Graphiques */}
      {!isPending && !isError && services.length > 0 && (
        <section
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.15fr_1.1fr_1fr]"
          aria-label={t('charts.sectionLabel')}
        >
          <DeploymentsChart services={services} className="md:col-span-2 xl:col-span-1" />
          <TechnologiesChart services={services} />
          <StatusChart services={services} />
        </section>
      )}

      {/* Dernières applications déployées */}
      {!isError && (isPending || services.length > 0) && (
        <section
          className="bg-card shadow-card overflow-hidden rounded-xl border"
          aria-labelledby="recent-title"
        >
          <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
            <h2
              id="recent-title"
              className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
            >
              <span className="bg-primary h-4 w-1 rounded-full" aria-hidden="true" />
              {t('pages.dashboard.recentTitle')}
            </h2>
            <Link
              to={ROUTES.applications}
              className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
            >
              {t('charts.linkApplications')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y">
            {isPending
              ? Array.from({ length: 4 }, (_, index) => (
                  <li key={index} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="size-9 rounded-lg" />
                    <Skeleton className="h-4 w-48" />
                  </li>
                ))
              : recent.map((service) => (
                  <li
                    key={service.id}
                    className="hover:bg-muted/40 flex items-center gap-3 px-5 py-3.5 transition-colors"
                  >
                    <ServiceAvatar name={service.name} className="size-9 rounded-lg text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{service.name}</p>
                      <DepartmentLabel id={service.department} className="flex" />
                    </div>
                    <StatusBadge
                      status={getServiceStatus(service)}
                      className="hidden sm:inline-flex"
                    />
                    <div className="w-32 shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums">
                        {formatDate(service.lastDeploymentDate, i18n.language)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelativeDate(service.lastDeploymentDate, i18n.language)}
                      </p>
                    </div>
                  </li>
                ))}
          </ul>
        </section>
      )}
    </div>
  );
}

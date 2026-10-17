import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  Code2,
  FileText,
  Layers,
  Plus,
  Users as UsersIcon,
} from 'lucide-react';
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
import { useNotificationsQuery } from '@/hooks/useNotifications';
import { useDashboardStatsQuery } from '@/hooks/useStats';
import { useServicesQuery } from '@/hooks/useServices';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { recentlyDeployed } from '@/utils/catalogStats';
import { ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatRelativeDate } from '@/utils/format';
import { formatNotification, getNotificationLink } from '@/utils/notifications';
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
  // Bloc admin : compteurs agrégés + 5 dernières notifications.
  const { data: stats, isPending: isStatsPending } = useDashboardStatsQuery();
  const { data: notifData } = useNotificationsQuery({ page: 1, limit: 5 });
  const recentNotifications = notifData?.data ?? [];
  const recent = useMemo(() => recentlyDeployed(services, 5), [services]);
  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('dashboard.eyebrow')}
        title={firstName ? t(getGreetingKey(), { name: firstName }) : t('nav.dashboard')}
        description={t('dashboard.subtitle')}
      />

      {/* Bloc admin : compteurs + répartition + activité récente. */}
      {canManage && (
        <AdminOverview
          stats={stats}
          isLoading={isStatsPending}
          recentNotifications={recentNotifications}
        />
      )}

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
                      <Link
                        to={ROUTES.applicationDetail(service.id)}
                        className="hover:text-primary focus-visible:ring-ring block truncate rounded-sm text-sm font-semibold focus-visible:ring-2 focus-visible:outline-hidden"
                      >
                        {service.name}
                      </Link>
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

/** Petites cartes compteur (services / users / devs / techs / docs). Chaque carte
 *  est un lien vers la page correspondante. */
const COUNT_CARDS = [
  { key: 'services', icon: Boxes, to: ROUTES.applications },
  { key: 'users', icon: UsersIcon, to: ROUTES.adminUsers },
  { key: 'developers', icon: Code2, to: ROUTES.developers },
  { key: 'technologies', icon: Layers, to: ROUTES.technologies },
  { key: 'documents', icon: FileText, to: ROUTES.applications },
];

/**
 * Bloc réservé à l'admin : 5 cartes compteur + répartition par département/rôle
 * + 5 dernières notifications. Toutes les données viennent du backend
 * (`/stats/dashboard` + `/notifications?page=1&limit=5`).
 */
function AdminOverview({ stats, isLoading, recentNotifications }) {
  const { t } = useTranslation();

  return (
    <section aria-label={t('dashboard.counts.services')} className="space-y-5">
      {/* 5 cartes compteur (cliquables) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {COUNT_CARDS.map(({ key, icon: Icon, to }) => {
          const value = stats?.counts?.[key] ?? 0;
          return (
            <Link
              key={key}
              to={to}
              className="bg-card shadow-card hover:border-primary/40 rounded-2xl border p-4 transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {t(`dashboard.counts.${key}`)}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {isLoading ? '—' : value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Répartitions + activité */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Services par département */}
        <div className="bg-card shadow-card rounded-2xl border p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Building2 className="text-muted-foreground size-4" />
            {t('dashboard.byDepartment')}
          </h3>
          {!isLoading && Object.keys(stats?.servicesByDepartment ?? {}).length === 0 ? (
            <p className="text-muted-foreground text-sm">—</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(stats?.servicesByDepartment ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([dept, count]) => {
                  const total = Object.values(stats?.servicesByDepartment ?? {}).reduce(
                    (sum, n) => sum + n,
                    0,
                  );
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={dept} className="flex items-center gap-3 text-sm">
                      <span className="min-w-24 truncate font-medium">{dept}</span>
                      <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                        <div className="bg-primary h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted-foreground w-12 text-right tabular-nums">
                        {count}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        {/* Utilisateurs par rôle */}
        <div className="bg-card shadow-card rounded-2xl border p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <UsersIcon className="text-muted-foreground size-4" />
            {t('dashboard.byRole')}
          </h3>
          {Object.keys(stats?.usersByRole ?? {}).length === 0 ? (
            <p className="text-muted-foreground text-sm">—</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(stats?.usersByRole ?? {}).map(([role, count]) => (
                <li
                  key={role}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-medium capitalize">{role}</span>
                  <span className="text-muted-foreground tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 5 dernières notifications */}
        <div className="bg-card shadow-card rounded-2xl border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ArrowRight className="text-muted-foreground size-4" />
              {t('dashboard.recentActivity')}
            </h3>
            <Link
              to={ROUTES.notifications}
              className="text-primary text-xs font-semibold hover:underline"
            >
              {t('nav.notifications')}
            </Link>
          </div>
          {recentNotifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('dashboard.noActivity')}</p>
          ) : (
            <ul className="space-y-2">
              {recentNotifications.slice(0, 5).map((notif) => (
                <li key={notif.id}>
                  <Link
                    to={getNotificationLink(notif)}
                    className="hover:text-primary text-muted-foreground hover:bg-muted/40 block truncate rounded-md px-2 py-1 text-xs transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                  >
                    {formatNotification(notif, t)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

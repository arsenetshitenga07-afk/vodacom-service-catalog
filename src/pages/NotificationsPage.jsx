import { useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { PersonAvatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationsQuery } from '@/hooks/useNotifications';
import { getErrorMessage } from '@/utils/errors';
import { formatNotification, getNotificationLink, getNotificationIcon } from '@/utils/notifications';

const NOTIFICATIONS_PAGE_SIZE = 20;

/**
 * Fil d'activité global : liste paginée des dernières actions (create/update/delete)
 * sur les services, technologies, développeurs et utilisateurs.
 * Polling automatique toutes les 30s (voir `useNotificationsQuery`).
 */
export default function NotificationsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, isFetching } = useNotificationsQuery({
    page,
    limit: NOTIFICATIONS_PAGE_SIZE,
  });

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? 0;
  const isLoadingInitial = isPending && items.length === 0;
  const errorMessage = isError ? getErrorMessage(error, t) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title={t('notifications.title')}
        description={
          isLoadingInitial
            ? t('notifications.loading')
            : t('notifications.subtitle', { count: total })
        }
      />

      {isLoadingInitial ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-20 rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title={t('notifications.error')}
          description={errorMessage ?? t('common.error')}
        />
      ) : items.length === 0 ? (
        <EmptyState icon={SearchX} title={t('notifications.empty')} description="" />
      ) : (
        <ul className="space-y-2">
          {items.map((notif) => {
            const IconName = getNotificationIcon(notif.action);
            const Icon = IconName === 'Plus' ? Plus : IconName === 'Pencil' ? Pencil : IconName === 'Trash2' ? Trash2 : Activity;
            return (
              <li key={notif.id}>
                <Link
                  to={getNotificationLink(notif)}
                  className="bg-card hover:border-primary/30 group flex items-center gap-3 rounded-xl border p-3 transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                >
                  <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{formatNotification(notif, t)}</p>
                    <p className="text-muted-foreground text-xs">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <PersonAvatar name={notif.actorName} className="size-7 text-[10px]" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoadingInitial && totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {t('admin.users.pagination.page', { page, total: totalPages })}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="border-input bg-background hover:bg-accent inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" /> {t('admin.users.pagination.previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="border-input bg-background hover:bg-accent inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              {t('admin.users.pagination.next')} <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

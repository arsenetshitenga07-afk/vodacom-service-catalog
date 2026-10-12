import { useMemo, useState } from 'react';
import { CircleDashed, FlaskConical, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { statusBreakdown } from '@/utils/dashboardStats';
import { ROUTES } from '@/utils/constants';
import { ChartCard } from './ChartCard';

/** Couleurs de statut validées (daltonisme / contraste) — voir index.css. */
const STATUS_STYLE = {
  live: { color: 'hsl(var(--success))', dot: 'bg-success', icon: Globe },
  uat: { color: 'hsl(var(--warning))', dot: 'bg-warning', icon: FlaskConical },
  none: { color: 'hsl(var(--neutral))', dot: 'bg-neutral', icon: CircleDashed },
};

const SIZE = 140;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2; // espace de surface entre les segments

/** Anneau : répartition des applications par statut d'environnement. */
export function StatusChart({ services }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);
  const data = useMemo(() => statusBreakdown(services), [services]);
  const total = services.length;
  const visible = data.filter((item) => item.count > 0);

  const percent = (count) => (total ? Math.round((count / total) * 100) : 0);

  // Segments : chaque part retire GAP px pour laisser l'espace de surface.
  let offset = 0;
  const segments = visible.map((item) => {
    const length = (item.count / total) * CIRCUMFERENCE;
    const segment = {
      ...item,
      dash: Math.max(0, length - (visible.length > 1 ? GAP : 0)),
      offset,
    };
    offset += length;
    return segment;
  });

  const focused = active ? data.find((item) => item.status === active) : null;

  return (
    <ChartCard
      link={{ to: ROUTES.applications, label: t('charts.linkApplications') }}
      title={t('charts.statusTitle')}
      table={data.map((item) => [
        t(`status.${item.status}`),
        `${item.count} (${percent(item.count)} %)`,
      ])}
    >
      <div className="flex flex-col items-center gap-6 py-2 @sm:flex-row @sm:gap-8">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} aria-hidden="true">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={STROKE}
            />
            {segments.map((segment) => (
              <circle
                key={segment.status}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={STATUS_STYLE[segment.status].color}
                strokeWidth={STROKE}
                strokeDasharray={`${segment.dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={-segment.offset}
                className="transition-opacity duration-150"
                style={{ opacity: active === null || active === segment.status ? 1 : 0.4 }}
                onMouseEnter={() => setActive(segment.status)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </svg>
          {/* Valeur centrale */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[28px] leading-none font-bold tracking-tight">
                {focused ? focused.count : total}
              </p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-[5.5rem] truncate text-[11px] leading-tight">
                {focused
                  ? t(`status.${focused.status}`)
                  : t('charts.applications', { count: total })}
              </p>
            </div>
          </div>
        </div>

        {/* Légende (étiquettes directes + valeurs : l'identité ne repose pas sur la couleur seule) */}
        <ul className="w-full min-w-0 space-y-1.5">
          {data.map((item) => {
            const { dot, icon: Icon } = STATUS_STYLE[item.status];
            return (
              <li
                key={item.status}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors',
                  active === item.status && 'bg-muted',
                )}
                onMouseEnter={() => setActive(item.status)}
                onMouseLeave={() => setActive(null)}
              >
                <span className={cn('size-2.5 shrink-0 rounded-full', dot)} aria-hidden="true" />
                <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {t(`status.${item.status}`)}
                </span>
                <span className="font-semibold tabular-nums">{item.count}</span>
                <span className="text-muted-foreground w-10 text-right tabular-nums">
                  {percent(item.count)} %
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </ChartCard>
  );
}

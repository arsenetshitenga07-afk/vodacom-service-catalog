import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@/i18n';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';
import { deploymentsByMonth } from '@/utils/dashboardStats';
import { ChartCard, ChartTooltip } from './ChartCard';

const PLOT_HEIGHT = 190;
const TOP_PADDING = 24; // place pour l'étiquette au-dessus du point le plus haut
const VIEW_WIDTH = 1000; // largeur logique du SVG (étiré horizontalement)

/** Courbe avec aire : déploiements par mois sur 12 mois (une seule série, rouge Vodacom). */
export function DeploymentsChart({ services, className }) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(null);
  const data = useMemo(() => deploymentsByMonth(services), [services]);

  const locale = getLocale(i18n.language);
  const shortMonth = new Intl.DateTimeFormat(locale, { month: 'short' });
  const longMonth = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const countLabel = (count) => t('charts.deploymentCount', { count });

  const max = Math.max(...data.map((item) => item.count), 1);
  const maxIndex = data.findIndex((item) => item.count === max);
  const lastIndex = data.length - 1;

  // Chaque point est centré dans sa « colonne » de mois, pour rester aligné avec l'étiquette.
  const points = data.map((item, index) => ({
    xPercent: ((index + 0.5) / data.length) * 100,
    y: TOP_PADDING + (1 - item.count / max) * (PLOT_HEIGHT - TOP_PADDING - 4),
  }));
  const toX = (percent) => (percent / 100) * VIEW_WIDTH;
  const line = points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${toX(point.xPercent).toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(' ');
  const area = `${line} L${toX(points[lastIndex].xPercent)},${PLOT_HEIGHT} L${toX(points[0].xPercent)},${PLOT_HEIGHT} Z`;

  // Étiquettes sélectives : le pic et le dernier mois.
  const labelled = new Set([maxIndex, lastIndex]);

  return (
    <ChartCard
      link={{ to: ROUTES.applications, label: t('charts.linkApplications') }}
      className={className}
      title={t('charts.deploymentsTitle')}
      table={data.map((item) => [longMonth.format(item.date), countLabel(item.count)])}
    >
      <div aria-hidden="true">
        <div className="relative" style={{ height: PLOT_HEIGHT }}>
          {/* Grille discrète : milieu et ligne de base */}
          <span
            className="bg-border absolute inset-x-0 h-px"
            style={{ top: TOP_PADDING + (PLOT_HEIGHT - TOP_PADDING) / 2 }}
          />
          <span className="bg-border absolute inset-x-0 bottom-0 h-px" />

          {/* Aire + courbe */}
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${PLOT_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="deployments-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#E60000" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#E60000" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#deployments-area)" />
            <path
              d={line}
              fill="none"
              stroke="#E60000"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Repère vertical du mois survolé */}
          {active !== null && (
            <span
              className="bg-foreground/20 absolute top-0 bottom-0 w-px"
              style={{ left: `${points[active].xPercent}%` }}
            />
          )}

          {/* Points (en HTML pour rester ronds) + étiquettes sélectives */}
          {data.map((item, index) => {
            const point = points[index];
            const isActive = active === index;
            return (
              <span key={item.date.toISOString()}>
                {labelled.has(index) && !isActive && item.count > 0 && (
                  <span
                    className="text-foreground absolute -translate-x-1/2 text-[11px] leading-none font-semibold tabular-nums"
                    style={{ left: `${point.xPercent}%`, top: point.y - 18 }}
                  >
                    {item.count}
                  </span>
                )}
                <span
                  className={cn(
                    'border-card bg-primary absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
                    isActive && 'ring-primary/25 ring-4',
                  )}
                  style={{ left: `${point.xPercent}%`, top: point.y }}
                />
                {isActive && (
                  <ChartTooltip
                    title={longMonth.format(item.date)}
                    value={countLabel(item.count)}
                    className="-translate-x-1/2"
                    style={{
                      left: `clamp(4.5rem, ${point.xPercent}%, calc(100% - 4.5rem))`,
                      bottom: PLOT_HEIGHT - point.y + 14,
                    }}
                  />
                )}
              </span>
            );
          })}

          {/* Zones de survol : une par mois, sur toute la hauteur */}
          <div className="absolute inset-0 flex">
            {data.map((item, index) => (
              <div
                key={item.date.toISOString()}
                className="h-full flex-1 cursor-default"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </div>
        </div>

        {/* Mois */}
        <div className="mt-2 flex">
          {data.map((item, index) => (
            <span
              key={item.date.toISOString()}
              className="text-muted-foreground flex-1 text-center text-[10px] leading-none capitalize"
            >
              {/* Un mois sur deux sur petit écran pour éviter les chevauchements */}
              <span className={index % 2 === 1 ? 'hidden sm:inline' : undefined}>
                {shortMonth.format(item.date).replace('.', '')}
              </span>
            </span>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

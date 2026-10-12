import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/utils/constants';
import { topTechnologies } from '@/utils/dashboardStats';
import { ChartCard, ChartTooltip } from './ChartCard';

const PLOT_HEIGHT = 170;
const BAR_MAX = PLOT_HEIGHT - 20; // place réservée à la valeur au-dessus de la colonne

/** Colonnes verticales : technologies les plus utilisées (une seule série, rouge Vodacom). */
export function TechnologiesChart({ services }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);
  const data = useMemo(() => topTechnologies(services, 5), [services]);
  const max = Math.max(...data.map((item) => item.count), 1);
  const total = services.length;

  const usageLabel = (count) => t('charts.techUsage', { count, total });

  return (
    <ChartCard
      link={{ to: ROUTES.technologies, label: t('charts.linkTechnologies') }}
      title={t('charts.techTitle')}
      table={data.map((item) => [item.name, usageLabel(item.count)])}
    >
      {data.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">{t('charts.empty')}</p>
      ) : (
        <div className="flex items-stretch" aria-hidden="true">
          {data.map((item, index) => {
            const height = Math.max(6, (item.count / max) * BAR_MAX);
            const isActive = active === index;
            return (
              <div
                key={item.name}
                className="relative flex min-w-0 flex-1 cursor-default flex-col items-center"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
              >
                <div
                  className="flex w-full flex-col items-center justify-end px-1"
                  style={{ height: PLOT_HEIGHT }}
                >
                  <span className="text-foreground mb-1 text-[11px] leading-none font-semibold tabular-nums">
                    {item.count}
                  </span>
                  <span
                    className="from-brand-dark to-primary w-full max-w-7 rounded-t-[4px] bg-linear-to-t transition-opacity duration-150"
                    style={{ height, opacity: active === null || isActive ? 1 : 0.45 }}
                  />
                </div>
                {/* Ligne de base */}
                <span className="bg-border h-px w-full" />
                <span
                  className="text-muted-foreground mt-2 w-full truncate text-center text-[10px] leading-none tracking-tight"
                  title={item.name}
                >
                  {item.name}
                </span>
                {isActive && (
                  <ChartTooltip
                    title={item.name}
                    value={usageLabel(item.count)}
                    className={
                      index === 0
                        ? 'left-0'
                        : index === data.length - 1
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                    }
                    style={{ bottom: height + 44 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}

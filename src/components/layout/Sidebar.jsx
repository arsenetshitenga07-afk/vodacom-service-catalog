import { useMemo } from 'react';
import { Boxes, Code2, LayoutDashboard, Layers, Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useServicesQuery } from '@/hooks/useServices';
import { developerDirectory, technologyUsage } from '@/utils/catalogStats';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';

/**
 * Navigation principale. Chaque entrée mène à sa page de détail ;
 * le compteur indique le nombre d'éléments correspondants.
 * `onNavigate` : appelé après un clic (ferme le menu mobile).
 */
export function Sidebar({ onNavigate, className }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: services = [], isPending } = useServicesQuery();
  const canManage = useAuthStore(selectCanManage);

  const counts = useMemo(
    () => ({
      applications: services.length,
      technologies: technologyUsage(services).length,
      developers: developerDirectory(services).length,
    }),
    [services],
  );

  const items = [
    { to: ROUTES.home, label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    {
      to: ROUTES.applications,
      label: t('nav.applications'),
      icon: Boxes,
      count: counts.applications,
    },
    {
      to: ROUTES.technologies,
      label: t('nav.technologies'),
      icon: Layers,
      count: counts.technologies,
    },
    { to: ROUTES.developers, label: t('nav.developers'), icon: Code2, count: counts.developers },
  ];

  const createService = () => {
    // La page Applications ouvre le formulaire de création à réception de cet état.
    navigate(ROUTES.applications, { state: { create: true } });
    onNavigate?.();
  };

  return (
    <nav aria-label={t('nav.label')} className={cn('flex min-h-full flex-col gap-6', className)}>
      <div>
        <p className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase">
          {t('nav.section')}
        </p>
        <ul className="space-y-1">
          {items.map((item) => (
            <NavItem key={item.to} {...item} isPending={isPending} onNavigate={onNavigate} />
          ))}
        </ul>
      </div>

      {canManage && (
        <Button onClick={createService} className="shadow-brand w-full">
          <Plus />
          {t('services.add')}
        </Button>
      )}

      {/* Paramètres : épinglés en bas de la barre latérale */}
      <ul className="mt-auto border-t pt-4">
        <NavItem
          to={ROUTES.settings}
          label={t('nav.settings')}
          icon={Settings}
          onNavigate={onNavigate}
        />
      </ul>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon, count, end, isPending, onNavigate }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden',
            isActive
              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#FAFAFA]'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                className="bg-primary absolute top-2 bottom-2 -left-3 w-1 rounded-r-full"
                aria-hidden="true"
              />
            )}
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">{label}</span>
            {count != null && !isPending && (
              <span
                className={cn(
                  'min-w-6 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
              >
                {count}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

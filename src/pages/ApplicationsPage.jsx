import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, Code2, Plus, SearchX, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeleteServiceDialog } from '@/components/services/DeleteServiceDialog';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFormDialog } from '@/components/services/ServiceFormDialog';
import { ServiceGridSkeleton } from '@/components/services/ServiceGridSkeleton';
import { ServicesToolbar } from '@/components/services/ServicesToolbar';
import { ServiceTable } from '@/components/services/ServiceTable';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useServicesQuery } from '@/hooks/useServices';
import { useAppStore } from '@/store/appStore';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/utils/errors';
import { collectTechnologies, filterServices } from '@/utils/filterServices';

const CLOSED = { open: false, service: null };

/**
 * Catalogue complet des applications.
 * Filtres partageables dans l'URL : `?tech=React&tech=Docker` et `?developer=Nom`
 * (utilisés par les pages Technologies et Développeurs).
 */
export default function ApplicationsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: services = [],
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useServicesQuery();

  const canManage = useAuthStore(selectCanManage);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);

  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState(CLOSED);
  const [deleteState, setDeleteState] = useState(CLOSED);

  const selectedTechnologies = searchParams.getAll('tech');
  const developer = searchParams.get('developer') ?? '';

  const updateParams = (mutate) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        mutate(next);
        return next;
      },
      { replace: true },
    );

  const setSelectedTechnologies = (techs) =>
    updateParams((params) => {
      params.delete('tech');
      techs.forEach((tech) => params.append('tech', tech));
    });
  const clearDeveloper = () => updateParams((params) => params.delete('developer'));

  // Bouton « Ajouter un service » de la barre latérale : ouvre le formulaire à l'arrivée.
  useEffect(() => {
    if (location.state?.create && canManage) {
      setFormState({ open: true, service: null });
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate, canManage]);

  const debouncedSearch = useDebouncedValue(search, 150);
  const technologies = useMemo(() => collectTechnologies(services), [services]);
  const filteredServices = useMemo(
    () =>
      filterServices(services, {
        search: debouncedSearch,
        technologies: selectedTechnologies,
        developer,
      }),
    // `selectedTechnologies` est recalculé à chaque rendu : on dépend de sa forme texte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, debouncedSearch, selectedTechnologies.join('|'), developer],
  );

  const hasFilters = search.trim() !== '' || selectedTechnologies.length > 0 || developer !== '';

  const openCreate = () => setFormState({ open: true, service: null });
  const openEdit = (service) => setFormState({ open: true, service });
  const openDelete = (service) => setDeleteState({ open: true, service });
  const clearFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
  };

  const renderContent = () => {
    if (isPending) return <ServiceGridSkeleton />;

    if (isError) {
      return (
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
      );
    }

    if (services.length === 0) {
      return (
        <EmptyState
          icon={Boxes}
          title={t('services.emptyTitle')}
          description={t('services.emptyDescription')}
          action={
            canManage && (
              <Button onClick={openCreate}>
                <Plus />
                {t('services.add')}
              </Button>
            )
          }
        />
      );
    }

    if (filteredServices.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title={t('services.noResultsTitle')}
          description={t('services.noResultsDescription')}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t('services.clearFilters')}
            </Button>
          }
        />
      );
    }

    return viewMode === 'table' ? (
      <ServiceTable
        services={filteredServices}
        onEdit={canManage ? openEdit : undefined}
        onDelete={canManage ? openDelete : undefined}
      />
    ) : (
      <ul className="grid grid-cols-1 gap-5 min-[1340px]:grid-cols-3 sm:grid-cols-2">
        {filteredServices.map((service) => (
          <li key={service.id}>
            <ServiceCard
              service={service}
              onEdit={canManage ? openEdit : undefined}
              onDelete={canManage ? openDelete : undefined}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Boxes}
        title={t('nav.applications')}
        description={
          isPending
            ? t('common.loading')
            : hasFilters
              ? t('services.results', { count: filteredServices.length })
              : t('services.subtitle', { count: services.length })
        }
        action={
          hasFilters &&
          !isPending && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              {t('services.clearFilters')}
            </button>
          )
        }
      />

      {/* Filtre développeur (arrivée depuis la page Développeurs) */}
      {developer && (
        <div className="flex items-center gap-2">
          <span className="border-primary/25 bg-primary/[0.06] text-primary inline-flex items-center gap-2 rounded-full border py-1 pr-1.5 pl-3 text-xs font-medium dark:text-red-300">
            <Code2 className="size-3.5" aria-hidden="true" />
            {t('pages.applications.developerFilter', { name: developer })}
            <button
              type="button"
              onClick={clearDeveloper}
              className="hover:bg-primary/10 grid size-5 place-items-center rounded-full"
              aria-label={t('common.removeItem', { item: developer })}
            >
              <X className="size-3.5" />
            </button>
          </span>
        </div>
      )}

      <ServicesToolbar
        search={search}
        onSearchChange={setSearch}
        technologies={technologies}
        selectedTechnologies={selectedTechnologies}
        onSelectedTechnologiesChange={setSelectedTechnologies}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAdd={canManage ? openCreate : undefined}
      />

      {renderContent()}

      <ServiceFormDialog
        open={formState.open}
        service={formState.service}
        knownTechnologies={technologies}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
      />

      <DeleteServiceDialog
        open={deleteState.open}
        service={deleteState.service}
        onOpenChange={(open) => setDeleteState((state) => ({ ...state, open }))}
      />
    </div>
  );
}

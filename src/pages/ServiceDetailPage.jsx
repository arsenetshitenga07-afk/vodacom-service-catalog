import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Download,
  FileText,
  FlaskConical,
  FolderGit2,
  Globe,
  Layers,
  Pencil,
  SearchX,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PersonAvatar, ServiceAvatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { DeleteServiceDialog } from '@/components/services/DeleteServiceDialog';
import { DepartmentLabel } from '@/components/services/DepartmentLabel';
import { ServiceFormDialog } from '@/components/services/ServiceFormDialog';
import { StatusBadge } from '@/components/services/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useServicesQuery } from '@/hooks/useServices';
import { selectCanManage, useAuthStore } from '@/store/authStore';
import { MAX_DOCUMENTS, ROUTES } from '@/utils/constants';
import { collectTechnologies } from '@/utils/filterServices';
import { formatDate, formatFileSize, formatRelativeDate } from '@/utils/format';
import { getServiceStatus } from '@/utils/serviceStatus';

const LINKS = [
  { key: 'liveUrl', labelKey: 'services.links.live', icon: Globe },
  { key: 'uatUrl', labelKey: 'services.links.uat', icon: FlaskConical },
  { key: 'githubUrl', labelKey: 'services.links.github', icon: FolderGit2 },
];

/** Fiche complète d'une application (`/applications/:id`). */
export default function ServiceDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const canManage = useAuthStore(selectCanManage);
  const { data: services = [], isPending } = useServicesQuery();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Garde le service affiché pendant l'animation de fermeture après suppression.
  const [lastSeen, setLastSeen] = useState(null);

  const found = services.find((item) => item.id === id);
  if (found && found !== lastSeen) setLastSeen(found);
  const service = found ?? (deleteOpen ? lastSeen : null);
  const lang = i18n.language;

  // Service supprimé depuis cette page : retour au catalogue une fois la boîte fermée.
  useEffect(() => {
    if (!isPending && !found && lastSeen && !deleteOpen) {
      navigate(ROUTES.applications, { replace: true });
    }
  }, [isPending, found, lastSeen, deleteOpen, navigate]);

  const backLink = (
    <Link
      to={ROUTES.applications}
      className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t('detail.back')}
    </Link>
  );

  if (isPending) {
    return (
      <div className="space-y-6">
        {backLink}
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6">
        {backLink}
        <EmptyState
          icon={SearchX}
          title={t('detail.notFound')}
          description={t('detail.notFoundDescription')}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.applications}>{t('detail.back')}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backLink}

      {/* En-tête */}
      <section className="bg-card shadow-card rounded-2xl border p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <ServiceAvatar name={service.name} className="size-14 rounded-2xl text-base" />
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight break-words">{service.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusBadge status={getServiceStatus(service)} />
                <DepartmentLabel id={service.department} />
                {service.updatedAt && (
                  <span className="text-muted-foreground text-xs">
                    {t('detail.updated', { date: formatRelativeDate(service.updatedAt, lang) })}
                  </span>
                )}
              </div>
            </div>
          </div>
          {canManage && (
            <div className="flex shrink-0 gap-2">
              <Button onClick={() => setEditOpen(true)}>
                <Pencil />
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(true)}
                className="text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
                {t('common.delete')}
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-5 text-sm leading-relaxed whitespace-pre-line">
          {service.description}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Environnements & liens */}
        <Panel title={t('detail.environments')}>
          <ul className="divide-y rounded-xl border">
            {LINKS.map(({ key, labelKey, icon: Icon }) => {
              const url = service[key];
              return (
                <li key={key} className="flex items-center gap-3 px-3.5 py-3">
                  <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t(labelKey)}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {url || t('common.notSet')}
                    </p>
                  </div>
                  {url && (
                    <Button asChild variant="ghost" size="icon-sm" className="hover:text-primary">
                      <a href={url} target="_blank" rel="noreferrer" aria-label={t(labelKey)}>
                        <ArrowUpRight />
                      </a>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Déploiements */}
        <Panel title={t('detail.deployments')}>
          <ol className="relative space-y-5 border-l pl-5">
            {[
              ['services.fields.lastDeployment', service.lastDeploymentDate, true],
              ['services.fields.firstDeployment', service.firstDeploymentDate, false],
            ].map(([labelKey, value, highlight]) => (
              <li key={labelKey} className="relative">
                <span
                  className={
                    highlight
                      ? 'border-card bg-primary ring-primary/15 absolute top-1 -left-[26px] size-3 rounded-full border-2 ring-4'
                      : 'border-card bg-muted-foreground/40 absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2'
                  }
                  aria-hidden="true"
                />
                <p className="text-muted-foreground text-xs">{t(labelKey)}</p>
                {value ? (
                  <p className="text-sm font-medium">
                    {formatDate(value, lang, { dateStyle: 'long' })}
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      {formatRelativeDate(value, lang)}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('common.notSet')}</p>
                )}
              </li>
            ))}
          </ol>
        </Panel>

        {/* Équipe */}
        <Panel title={t('services.fields.developers')} icon={Code2}>
          <ul className="flex flex-wrap gap-2">
            {service.developers.map((name) => (
              <li key={name}>
                <Link
                  to={`${ROUTES.applications}?developer=${encodeURIComponent(name)}`}
                  className="bg-card hover:border-primary/40 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors"
                  title={t('detail.otherApps', { name })}
                >
                  <PersonAvatar name={name} className="ring-0" />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Stack technique */}
        <Panel title={t('services.fields.techStack')} icon={Layers}>
          {service.techStack.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {service.techStack.map((tech) => (
                <li key={tech}>
                  <Link to={`${ROUTES.applications}?tech=${encodeURIComponent(tech)}`}>
                    <Badge variant="brand" className="hover:bg-primary/15 px-2.5 py-1">
                      {tech}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">{t('detail.noStack')}</p>
          )}
        </Panel>
      </div>

      {/* Documents */}
      <Panel
        title={t('services.fields.documents')}
        aside={t('services.documentsCount', {
          count: service.documents.length,
          max: MAX_DOCUMENTS,
        })}
      >
        {service.documents.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {service.documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5">
                <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  {doc.size != null && (
                    <p className="text-muted-foreground text-xs">{formatFileSize(doc.size)}</p>
                  )}
                </div>
                {doc.url && (
                  <Button asChild variant="ghost" size="icon-sm" className="hover:text-primary">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      download={doc.name}
                      aria-label={t('upload.open', { name: doc.name })}
                    >
                      <Download />
                    </a>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-sm">
            {t('services.noDocuments')}
          </p>
        )}
      </Panel>

      <ServiceFormDialog
        open={editOpen}
        service={service}
        knownTechnologies={collectTechnologies(services)}
        onOpenChange={setEditOpen}
      />
      <DeleteServiceDialog open={deleteOpen} service={service} onOpenChange={setDeleteOpen} />
    </div>
  );
}

function Panel({ title, icon: Icon, aside, children }) {
  return (
    <section className="bg-card shadow-card rounded-xl border p-5">
      <h2 className="text-muted-foreground mb-4 flex items-center justify-between gap-2 text-xs font-semibold tracking-wider uppercase">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="text-primary size-4" aria-hidden="true" />}
          {title}
        </span>
        {aside && <span className="font-medium normal-case tabular-nums">{aside}</span>}
      </h2>
      {children}
    </section>
  );
}

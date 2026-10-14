import { CalendarClock, FileText, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AvatarStack, ServiceAvatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { MAX_DOCUMENTS, ROUTES } from '@/utils/constants';
import { formatDate, formatRelativeDate } from '@/utils/format';
import { getServiceStatus } from '@/utils/serviceStatus';
import { DepartmentLabel } from './DepartmentLabel';
import { ServiceActionsMenu } from './ServiceActionsMenu';
import { ServiceLinks } from './ServiceLinks';
import { StatusBadge } from './StatusBadge';

export function ServiceCard({ service, onEdit, onDelete }) {
  const { t } = useTranslation();

  return (
    <article className="bg-card shadow-card hover:border-primary/30 relative flex h-full flex-col rounded-xl border transition-[border-color,box-shadow] duration-200 hover:shadow-md">
      <header className="flex items-start gap-3.5 p-5 pb-3">
        <ServiceAvatar name={service.name} />
        <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
          <h3
            className="truncate text-[15px] leading-tight font-semibold tracking-tight"
            title={service.name}
          >
            <Link
              to={ROUTES.applicationDetail(service.id)}
              className="hover:text-primary focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-hidden"
            >
              {service.name}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <StatusBadge status={getServiceStatus(service)} />
            <DepartmentLabel id={service.department} />
          </div>
        </div>
        {/* Actions réservées aux administrateurs (sans onEdit : consultation seule). */}
        {onEdit && (
          <div className="-mt-1 -mr-1.5">
            <ServiceActionsMenu service={service} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
      </header>

      <p className="text-muted-foreground line-clamp-2 min-h-10 px-5 text-sm leading-5">
        {service.description}
      </p>

      {service.techStack.length > 0 && (
        <ul
          className="flex flex-wrap gap-1.5 px-5 pt-4"
          aria-label={t('services.fields.techStack')}
        >
          {service.techStack.map((tech) => (
            <li key={tech}>
              <Badge variant="brand">{tech}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-4 px-5 pb-5">
        {/* Équipe */}
        <div className="flex items-center gap-2.5">
          <AvatarStack names={service.developers} />
          <p
            className="text-muted-foreground min-w-0 truncate text-xs"
            title={service.developers.join(', ')}
          >
            <span className="sr-only">{t('services.fields.developers')} : </span>
            {service.developers.join(', ')}
          </p>
        </div>

        {/* Déploiements */}
        <dl className="bg-muted grid grid-cols-2 divide-x rounded-lg border text-xs">
          <DateCell
            icon={Rocket}
            label={t('services.fields.firstDeployment')}
            value={service.firstDeploymentDate}
          />
          <DateCell
            icon={CalendarClock}
            label={t('services.fields.lastDeployment')}
            value={service.lastDeploymentDate}
            relative
          />
        </dl>

        {/* Documents */}
        <div className="space-y-1.5">
          <p className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
            <span>{t('services.fields.documents')}</span>
            <span className="tabular-nums">
              {t('services.documentsCount', {
                count: service.documents.length,
                max: MAX_DOCUMENTS,
              })}
            </span>
          </p>
          {service.documents.length > 0 ? (
            <ul className="grid gap-1">
              {service.documents.map((doc) => (
                <li key={doc.id}>
                  <DocumentLink document={doc} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">{t('services.noDocuments')}</p>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t px-5 py-3">
        <ServiceLinks service={service} />
      </footer>
    </article>
  );
}

function DateCell({ icon: Icon, label, value, relative = false }) {
  const { t, i18n } = useTranslation();
  const full = formatDate(value, i18n.language);
  const display = relative ? formatRelativeDate(value, i18n.language) : full;

  return (
    <div className="flex min-w-0 items-center gap-2 px-3 py-2.5">
      <Icon className="text-primary size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-muted-foreground truncate text-[11px]">{label}</dt>
        <dd className="truncate font-medium" title={full ?? undefined}>
          {display ?? <span className="text-muted-foreground">{t('common.notSet')}</span>}
        </dd>
      </div>
    </div>
  );
}

export function DocumentLink({ document }) {
  const content = (
    <>
      <FileText className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{document.name}</span>
    </>
  );
  const className = 'flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs';

  return document.url ? (
    <a
      href={document.url}
      target="_blank"
      rel="noreferrer"
      className={`${className} bg-card hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors`}
    >
      {content}
    </a>
  ) : (
    <span className={`${className} bg-card text-muted-foreground`}>{content}</span>
  );
}

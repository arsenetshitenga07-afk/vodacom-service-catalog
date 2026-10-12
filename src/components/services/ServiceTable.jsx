import { useTranslation } from 'react-i18next';
import { AvatarStack, ServiceAvatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { MAX_DOCUMENTS } from '@/utils/constants';
import { formatDate, formatRelativeDate } from '@/utils/format';
import { getServiceStatus } from '@/utils/serviceStatus';
import { DocumentLink } from './ServiceCard';
import { DepartmentLabel } from './DepartmentLabel';
import { ServiceActionsMenu } from './ServiceActionsMenu';
import { ServiceLinks } from './ServiceLinks';
import { StatusBadge } from './StatusBadge';

const MAX_VISIBLE_TECH = 2;

export function ServiceTable({ services, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[1240px] text-sm">
          <thead className="border-t-primary bg-muted/50 text-muted-foreground border-t-2 border-b text-left text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">
                {t('services.fields.name')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.department')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.status')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.techStack')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.developers')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.firstDeployment')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.lastDeployment')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.documents')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('services.fields.links')}
              </th>
              {onEdit && (
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => {
              const hiddenTech = service.techStack.length - MAX_VISIBLE_TECH;
              return (
                <tr key={service.id} className="group hover:bg-muted/40 transition-colors">
                  <td className="max-w-sm px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ServiceAvatar name={service.name} className="size-9 rounded-lg text-xs" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold" title={service.name}>
                          {service.name}
                        </p>
                        <p
                          className="text-muted-foreground truncate text-xs"
                          title={service.description}
                        >
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-44 px-4 py-3.5">
                    <DepartmentLabel id={service.department} className="flex" />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={getServiceStatus(service)} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex max-w-52 flex-wrap gap-1">
                      {service.techStack.slice(0, MAX_VISIBLE_TECH).map((tech) => (
                        <Badge key={tech} variant="brand">
                          {tech}
                        </Badge>
                      ))}
                      {hiddenTech > 0 && (
                        <Badge variant="muted" title={service.techStack.join(', ')}>
                          +{hiddenTech}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <AvatarStack names={service.developers} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">
                    {formatDate(service.firstDeploymentDate, i18n.language) ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {service.lastDeploymentDate ? (
                      <>
                        <p className="font-medium tabular-nums">
                          {formatDate(service.lastDeploymentDate, i18n.language)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatRelativeDate(service.lastDeploymentDate, i18n.language)}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="max-w-52 px-4 py-3.5">
                    {service.documents.length > 0 ? (
                      <details className="group/docs">
                        <summary className="text-muted-foreground hover:text-primary cursor-pointer list-none text-xs font-medium tabular-nums">
                          {t('services.documentsCount', {
                            count: service.documents.length,
                            max: MAX_DOCUMENTS,
                          })}{' '}
                          <span className="inline-block transition group-open/docs:rotate-90">
                            ›
                          </span>
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {service.documents.map((doc) => (
                            <li key={doc.id}>
                              <DocumentLink document={doc} />
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <ServiceLinks service={service} compact className="flex-nowrap" />
                  </td>
                  {onEdit && (
                    <td className="px-3 py-3.5 text-right">
                      <ServiceActionsMenu service={service} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

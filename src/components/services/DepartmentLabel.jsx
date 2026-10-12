import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { getDepartment } from '@/utils/departments';

/** Nom du département d'un service, précédé de son icône. Rien si non renseigné. */
export function DepartmentLabel({ id, className }) {
  const { t } = useTranslation();
  const department = getDepartment(id);
  if (!department) return null;
  const Icon = department.icon;
  const name = t(`departments.${department.id}`);

  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex min-w-0 items-center gap-1.5 text-xs font-medium',
        className,
      )}
    >
      <Icon className="text-primary size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate" title={name}>
        {name}
      </span>
    </span>
  );
}

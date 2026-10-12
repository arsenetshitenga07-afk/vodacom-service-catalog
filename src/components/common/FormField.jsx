import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';

/**
 * Libellé + champ + message d'erreur/aide, avec les attributs ARIA reliés.
 * `error` est une clé i18n (les schémas Zod renvoient des clés, pas du texte).
 */
export function FormField({ id, label, required, optional, hint, error, className, children }) {
  const { t } = useTranslation();
  const messageId = `${id}-message`;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-primary" aria-hidden="true">
              *
            </span>
          )}
          {optional && (
            <span className="text-muted-foreground ml-auto text-xs font-normal">
              {t('common.optional')}
            </span>
          )}
        </Label>
      )}

      {typeof children === 'function'
        ? children({
            id,
            'aria-invalid': Boolean(error),
            'aria-describedby': error || hint ? messageId : undefined,
          })
        : children}

      {error ? (
        <p id={messageId} role="alert" className="text-destructive text-xs font-medium">
          {t(error)}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

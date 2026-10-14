import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { selectCanManage, useAuthStore } from '@/store/authStore';

/**
 * Bandeau affiché aux comptes sans droit de gestion (rôle `user`) :
 * explique pourquoi les boutons d'ajout / modification n'apparaissent pas.
 */
export function ReadOnlyNotice() {
  const { t } = useTranslation();
  const canManage = useAuthStore(selectCanManage);
  if (canManage) return null;

  return (
    <p className="bg-muted text-muted-foreground flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm">
      <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="text-foreground font-medium">{t('readOnly.title')}</span>{' '}
        {t('readOnly.description')}
      </span>
    </p>
  );
}

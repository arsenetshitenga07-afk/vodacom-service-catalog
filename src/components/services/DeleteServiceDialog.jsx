import { Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteService } from '@/hooks/useServices';
import { getErrorMessage } from '@/utils/errors';

/** `service` reste défini pendant l'animation de fermeture : seul `open` change. */
export function DeleteServiceDialog({ open, service, onOpenChange }) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteService();
  const isPending = deleteMutation.isPending;

  const handleConfirm = (event) => {
    // On garde la boîte ouverte jusqu'à la réponse du serveur.
    event.preventDefault();
    if (!service) return;
    const { name } = service;
    deleteMutation.mutate(service.id, {
      onSuccess: () => {
        toast.success(t('services.toast.deleted', { name }));
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="bg-destructive/10 text-destructive ring-destructive/5 mb-2 grid size-12 place-items-center rounded-full ring-8">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <AlertDialogTitle>{t('services.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('services.delete.description', { name: service?.name ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t('common.deleting')}
              </>
            ) : (
              t('services.delete.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

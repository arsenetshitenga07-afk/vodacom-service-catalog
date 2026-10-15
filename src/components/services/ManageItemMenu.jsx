import { useState } from 'react';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDeleteDeveloper, useUpdateDeveloper } from '@/hooks/useDevelopers';
import { useDeleteTechnology, useUpdateTechnology } from '@/hooks/useTechnologies';
import { getErrorMessage } from '@/utils/errors';

/**
 * Menu « ⋯ » d'une technologie ou d'un développeur.
 * Avec les nouveaux endpoints, le renommage et la suppression sont des opérations
 * directes sur l'entité (`PATCH /technologies/{id}` et `DELETE /technologies/{id}`).
 *
 * `entityId` = UUID backend (obligatoire pour PATCH/DELETE).
 * `name` = nom affiché dans le menu et les dialogues.
 */
export function ManageItemMenu({ kind, entityId, name }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState(null); // 'rename' | 'remove' | null
  const prefix = `manage.${kind}`;
  const disabled = !entityId;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground data-[state=open]:bg-accent -mt-1 -mr-1.5 shrink-0"
            aria-label={`${t('common.moreActions')} — ${name}`}
            disabled={disabled}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => setDialog('rename')}>
            <Pencil />
            {t('manage.rename')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog('remove')}>
            <Trash2 />
            {t(`${prefix}.remove`)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        open={dialog === 'rename'}
        onOpenChange={(open) => !open && setDialog(null)}
        kind={kind}
        entityId={entityId}
        name={name}
      />
      <RemoveDialog
        open={dialog === 'remove'}
        onOpenChange={(open) => !open && setDialog(null)}
        kind={kind}
        entityId={entityId}
        name={name}
      />
    </>
  );
}

/** Sélectionne les bons hooks de mutation selon le `kind`. */
function useEntityMutations(kind) {
  if (kind === 'technology') {
    return { useUpdate: useUpdateTechnology, useDelete: useDeleteTechnology };
  }
  return { useUpdate: useUpdateDeveloper, useDelete: useDeleteDeveloper };
}

function RenameDialog({ open, onOpenChange, kind, entityId, name }) {
  const { t } = useTranslation();
  const { useUpdate } = useEntityMutations(kind);
  const updateMutation = useUpdate();
  const [value, setValue] = useState(name);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t('manage.errorNameRequired'));
      return;
    }
    if (trimmed === name) {
      onOpenChange(false);
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: entityId, name: trimmed });
      toast.success(t('manage.success', { name, newName: trimmed }));
      onOpenChange(false);
    } catch (err) {
      if (err?.status === 409) setError(t('manage.errorNameTaken'));
      else setError(getErrorMessage(err, t) || t('manage.error'));
    }
  };

  const isSaving = updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        if (next) {
          setValue(name);
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={t('common.close')} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(`manage.${kind}.renameTitle`, { name })}</DialogTitle>
          <DialogDescription>{t(`manage.${kind}.renameDescription`)}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`rename-${kind}-${entityId}`} className="text-sm font-medium">
              {t('manage.newName')}
            </label>
            <Input
              id={`rename-${kind}-${entityId}`}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
              }}
              autoFocus
              disabled={isSaving}
              aria-invalid={Boolean(error)}
              className="h-11"
            />
            {error && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveDialog({ open, onOpenChange, kind, entityId, name }) {
  const { t } = useTranslation();
  const { useDelete } = useEntityMutations(kind);
  const deleteMutation = useDelete();

  const handleConfirm = async (event) => {
    event.preventDefault();
    try {
      await deleteMutation.mutateAsync(entityId);
      toast.success(t(`manage.${kind}.removed`, { name }));
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, t) || t('manage.error'));
    }
  };

  const isSaving = deleteMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="bg-destructive/10 text-destructive ring-destructive/5 mb-2 grid size-12 place-items-center rounded-full ring-8">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <AlertDialogTitle>{t(`manage.${kind}.removeTitle`, { name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`manage.${kind}.removeDescription`, { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {t(`manage.${kind}.remove`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { serviceKeys } from '@/hooks/useServices';
import { servicesApi } from '@/services';
import { listFormData, planListChange } from '@/utils/bulkListUpdate';
import { getErrorMessage } from '@/utils/errors';

const FIELD = { technology: 'techStack', developer: 'developers' };

/**
 * Menu « ⋯ » d'une technologie ou d'un développeur : renommer partout, ou retirer
 * de toutes les applications. Chaque application concernée est mise à jour
 * (PATCH partiel de la seule liste modifiée).
 */
export function ManageItemMenu({ kind, name, services }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState(null); // 'rename' | 'remove' | null
  const prefix = `manage.${kind}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground data-[state=open]:bg-accent -mt-1 -mr-1.5 shrink-0"
            aria-label={`${t('common.moreActions')} — ${name}`}
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
        name={name}
        services={services}
      />
      <RemoveDialog
        open={dialog === 'remove'}
        onOpenChange={(open) => !open && setDialog(null)}
        kind={kind}
        name={name}
        services={services}
      />
    </>
  );
}

/** Applique un plan de modification et rafraîchit le catalogue. */
function useApplyPlan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const apply = async (field, plan, messages) => {
    setIsSaving(true);
    try {
      for (const { service, list } of plan.updates) {
        await servicesApi.update({ id: service.id, formData: listFormData(field, list) });
      }
      if (plan.updates.length > 0) toast.success(messages.success);
      if (plan.skipped.length > 0) {
        toast.warning(messages.skipped, {
          description: plan.skipped.map((service) => service.name).join(', '),
        });
      }
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, t));
      return false;
    } finally {
      await queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      setIsSaving(false);
    }
  };

  return { apply, isSaving };
}

function RenameDialog({ open, onOpenChange, kind, name, services }) {
  const { t } = useTranslation();
  const { apply, isSaving } = useApplyPlan();
  const [value, setValue] = useState(name);
  const [error, setError] = useState(null);
  const field = FIELD[kind];
  const prefix = `manage.${kind}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return setError(t('validation.required'));
    if (next === name) return onOpenChange(false);

    const plan = planListChange(services, field, name, next);
    const ok = await apply(field, plan, {
      success: t(`${prefix}.renamed`, { from: name, to: next, count: plan.updates.length }),
      skipped: t('manage.skipped'),
    });
    if (ok) onOpenChange(false);
  };

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
          <DialogTitle>{t(`${prefix}.renameTitle`, { name })}</DialogTitle>
          <DialogDescription>{t(`${prefix}.renameDescription`)}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`rename-${kind}`} className="text-sm font-medium">
              {t('manage.newName')}
            </label>
            <Input
              id={`rename-${kind}`}
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

function RemoveDialog({ open, onOpenChange, kind, name, services }) {
  const { t } = useTranslation();
  const { apply, isSaving } = useApplyPlan();
  const field = FIELD[kind];
  const prefix = `manage.${kind}`;
  const usedBy = services.filter((service) =>
    service[field].some((item) => item.toLowerCase() === name.toLowerCase()),
  ).length;

  const handleConfirm = async (event) => {
    event.preventDefault();
    const plan = planListChange(services, field, name);
    const ok = await apply(field, plan, {
      success: t(`${prefix}.removed`, { name, count: plan.updates.length }),
      skipped: t(`${prefix}.skippedLast`),
    });
    if (ok) onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="bg-destructive/10 text-destructive ring-destructive/5 mb-2 grid size-12 place-items-center rounded-full ring-8">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <AlertDialogTitle>{t(`${prefix}.removeTitle`, { name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`${prefix}.removeDescription`, { name, count: usedBy })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {t(`${prefix}.remove`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

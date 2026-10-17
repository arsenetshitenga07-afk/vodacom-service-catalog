import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield, ShieldCheck, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateUser } from '@/hooks/useUsers';
import { getErrorMessage } from '@/utils/errors';

const buildCreateUserSchema = (t) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t('admin.users.errorNameRequired'))
      .max(120, t('admin.users.errorNameTooLong')),
    email: z
      .string()
      .trim()
      .min(1, t('admin.users.errorEmailInvalid'))
      .email(t('admin.users.errorEmailInvalid')),
    password: z.string().min(8, t('admin.users.passwordLabel')).max(120),
    role: z.enum(['admin', 'user'], {
      errorMap: () => ({ message: t('admin.users.errorAdminRequired') }),
    }),
  });

/**
 * Dialog admin « Nouvel utilisateur ». Crée un compte avec un rôle choisi.
 * Reset à l'ouverture, succès = toast + fermeture, erreur = toast détaillé.
 */
export function CreateUserDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const createMutation = useCreateUser();
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(buildCreateUserSchema(t)),
    defaultValues: { name: '', email: '', password: '', role: 'user' },
  });

  // Reset propre à l'ouverture du dialog.
  useEffect(() => {
    if (open) {
      reset({ name: '', email: '', password: '', role: 'user' });
      setServerError(null);
    }
  }, [open, reset]);

  const currentRole = watch('role');

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const created = await createMutation.mutateAsync(values);
      toast.success(t('admin.users.created', { name: created.name }));
      onOpenChange(false);
    } catch (err) {
      if (err?.status === 409) setServerError(t('admin.users.errorEmailTaken'));
      else setServerError(getErrorMessage(err, t) || t('admin.users.errorCreate'));
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        if (!next) setServerError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={t('common.close')} className="max-w-md">
        <DialogHeader>
          <div className="bg-primary/10 text-primary mb-3 grid size-11 place-items-center rounded-xl">
            <UserPlus className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>{t('admin.users.createTitle')}</DialogTitle>
          <DialogDescription>{t('admin.users.createDescription')}</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="create-user-name" className="text-sm font-medium">
              {t('admin.users.columns.name')}
            </label>
            <Input
              id="create-user-name"
              {...register('name')}
              autoComplete="name"
              autoFocus
              disabled={isPending}
              aria-invalid={Boolean(errors.name)}
              className="h-11"
            />
            {errors.name && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.name.message)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-user-email" className="text-sm font-medium">
              {t('admin.users.columns.email')}
            </label>
            <Input
              id="create-user-email"
              type="email"
              {...register('email')}
              autoComplete="email"
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              className="h-11"
            />
            {errors.email && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.email.message)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-user-password" className="text-sm font-medium">
              {t('admin.users.passwordLabel')}
            </label>
            <Input
              id="create-user-password"
              type="password"
              {...register('password')}
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={Boolean(errors.password)}
              className="h-11"
            />
            <p className="text-muted-foreground text-xs">{t('admin.users.passwordHint')}</p>
            {errors.password && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.password.message)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">{t('admin.users.roleLabel')}</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'user', icon: Shield, label: t('admin.users.roles.user') },
                { value: 'admin', icon: ShieldCheck, label: t('admin.users.roles.admin') },
              ].map(({ value, icon: Icon, label }) => {
                const isActive = currentRole === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isPending}
                    onClick={() => setValue('role', value, { shouldValidate: true })}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input bg-card hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.role.message)}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-destructive text-xs font-medium">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-36">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('admin.users.createButton')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

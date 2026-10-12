import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormField } from '@/components/common/FormField';
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
import { authApi } from '@/services';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/errors';

/** Règles du nouveau mot de passe (affichées en direct sous le champ). */
const RULES = [
  { key: 'length', test: (value) => value.length >= 8 },
  { key: 'letter', test: (value) => /[A-Za-z]/.test(value) },
  { key: 'number', test: (value) => /\d/.test(value) },
];

const schema = z
  .object({
    currentPassword: z.string().min(1, 'validation.required'),
    newPassword: z
      .string()
      .min(1, 'validation.required')
      .refine((value) => RULES.every((rule) => rule.test(value)), {
        message: 'password.validation.weak',
      }),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'password.validation.mismatch',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'password.validation.same',
  });

const DEFAULTS = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ChangePasswordDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent closeLabel={t('common.close')} className="max-w-md">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <span className="bg-primary text-primary-foreground shadow-brand grid size-11 shrink-0 place-items-center rounded-xl">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <DialogTitle>{t('password.title')}</DialogTitle>
            <DialogDescription>{t('password.description')}</DialogDescription>
          </div>
        </DialogHeader>
        {/* Monté à l'ouverture : le formulaire repart vide à chaque fois. */}
        {open && (
          <ChangePasswordForm
            onPendingChange={setIsPending}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordForm({ onPendingChange, onCancel, onSuccess }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: DEFAULTS, mode: 'onTouched' });

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  const onSubmit = async ({ currentPassword, newPassword: next }) => {
    onPendingChange(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword: next });
      toast.success(t('password.success'));
      onSuccess();
    } catch (error) {
      if (error.status === 401 || error.status === 400) {
        setError('currentPassword', { message: 'password.validation.wrongCurrent' });
      } else {
        toast.error(getErrorMessage(error, t));
      }
    } finally {
      onPendingChange(false);
    }
  };

  const fieldProps = (name, autoComplete) => ({
    ...register(name),
    type: visible ? 'text' : 'password',
    autoComplete,
    disabled: isSubmitting,
    className: 'h-11',
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id="current-password"
        label={t('password.current')}
        error={errors.currentPassword?.message}
      >
        {(aria) => (
          <Input {...aria} {...fieldProps('currentPassword', 'current-password')} autoFocus />
        )}
      </FormField>

      <FormField id="new-password" label={t('password.new')} error={errors.newPassword?.message}>
        {(aria) => <Input {...aria} {...fieldProps('newPassword', 'new-password')} />}
      </FormField>

      {/* Exigences, cochées au fur et à mesure de la saisie */}
      <ul className="grid gap-1.5 sm:grid-cols-3" aria-label={t('password.rulesLabel')}>
        {RULES.map(({ key, test }) => {
          const ok = test(newPassword);
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                ok ? 'text-success' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-4 place-items-center rounded-full border',
                  ok ? 'border-success bg-success text-white' : 'border-border',
                )}
                aria-hidden="true"
              >
                {ok && <Check className="size-3" />}
              </span>
              {t(`password.rules.${key}`)}
            </li>
          );
        })}
      </ul>

      <FormField
        id="confirm-password"
        label={t('password.confirm')}
        error={errors.confirmPassword?.message}
      >
        {(aria) => <Input {...aria} {...fieldProps('confirmPassword', 'new-password')} />}
      </FormField>

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-medium"
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {visible ? t('auth.hidePassword') : t('auth.showPassword')}
      </button>

      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-40">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            t('password.submit')
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

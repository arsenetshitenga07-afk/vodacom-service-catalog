import { useEffect, useState } from 'react';
import { ArrowLeft, Info, Loader2, MailCheck, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useVerifyCode } from '@/hooks/useAuth';
import { authApi } from '@/services';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import { getInitials } from '@/utils/format';
import { OtpInput } from './OtpInput';

/**
 * Deuxième étape de la connexion : un code à 4 chiffres est envoyé par e-mail
 * à l'adresse identifiée ; la session n'est ouverte qu'une fois ce code vérifié.
 * `demoCode` : en mode démo uniquement, code à afficher (aucun e-mail réel n'est envoyé).
 */
export function ConfirmIdentity({
  email,
  user,
  demoCode: initialDemoCode,
  clientGenerated: initialClientGenerated = false,
  onBack,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(OTP_RESEND_SECONDS);
  const [demoCode, setDemoCode] = useState(initialDemoCode);
  const [isResending, setIsResending] = useState(false);
  // Le code est-il généré côté frontend (démo uniquement) ?
  // Le backend peut renvoyer `__clientGenerated: true` quand il a lui-même généré
  // le code (mode démo) ou quand il n'a pas pu (et le front prend le relais).
  const [clientGenerated, setClientGenerated] = useState(initialClientGenerated);

  const displayName = user?.name || email;

  const verifyMutation = useVerifyCode({
    onSuccess: (session) => onSuccess(session),
    onError: (err) => {
      setCode('');
      setError(
        err.status === 410
          ? t('auth.otp.expired')
          : err.status === 401 || err.status === 400
            ? t('auth.otp.wrong')
            : getErrorMessage(err, t),
      );
    },
  });
  const isPending = verifyMutation.isPending;

  // Compte à rebours avant de pouvoir renvoyer un code.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = (value) => {
    if (value.length !== OTP_LENGTH) {
      setError(t('auth.otp.incomplete', { count: OTP_LENGTH }));
      return;
    }
    setError(null);
    verifyMutation.mutate({ email, code: value });
  };

  const handleChange = (value) => {
    setCode(value);
    if (error) setError(null);
    // Validation automatique dès que les 4 chiffres sont saisis.
    if (value.length === OTP_LENGTH && !isPending) submit(value);
  };

  const resend = async () => {
    setIsResending(true);
    try {
      const result = await authApi.sendCode({ email });
      const newDemoCode = result?.demoCode;
      setDemoCode(newDemoCode);
      setClientGenerated(Boolean(result?.__clientGenerated));
      setCode('');
      setError(null);
      setCooldown(OTP_RESEND_SECONDS);
      toast.success(
        newDemoCode
          ? t('auth.otp.sentWithCode', { email, code: newDemoCode })
          : t('auth.otp.resent'),
        { duration: 8000 },
      );
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="bg-primary/10 text-primary dark:bg-primary/20 mb-5 grid size-14 place-items-center rounded-2xl">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight">{t('auth.otp.title')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('auth.otp.subtitle', { count: OTP_LENGTH })}
        </p>
      </div>

      {/* Compte identifié à l'étape 1 */}
      <div className="bg-muted mb-6 flex items-center gap-3 rounded-xl border px-4 py-3">
        <span className="from-primary to-brand-dark text-primary-foreground grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br text-sm font-semibold">
          {getInitials(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          {user?.name && <p className="truncate text-sm font-semibold">{user.name}</p>}
          <p className="text-muted-foreground truncate text-sm">{email}</p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit(code);
        }}
        className="space-y-5"
      >
        <div className="space-y-2">
          <p className="text-center text-sm font-medium">{t('auth.otp.label')}</p>
          <OtpInput
            value={code}
            onChange={handleChange}
            length={OTP_LENGTH}
            disabled={isPending}
            invalid={Boolean(error)}
            autoFocus
            label={t('auth.otp.label')}
          />
          {error && (
            <p role="alert" className="text-destructive text-center text-xs font-medium">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="xl" className="h-12 w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              {t('auth.otp.checking')}
            </>
          ) : (
            t('auth.otp.submit')
          )}
        </Button>
      </form>

      {/* Renvoi du code */}
      <p className="text-muted-foreground mt-5 flex flex-col items-center gap-1 text-center text-sm">
        <span>{t('auth.otp.notReceived')}</span>
        {cooldown > 0 ? (
          <span className="tabular-nums">{t('auth.otp.resendIn', { count: cooldown })}</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={isResending || isPending}
            className="text-primary inline-flex items-center gap-1 font-semibold hover:underline disabled:opacity-50"
          >
            <RotateCw className="size-3.5" aria-hidden="true" />
            {t('auth.otp.resend')}
          </button>
        )}
      </p>

      {demoCode && (
        <div className="mt-5 space-y-2">
          <p className="border-warning/25 bg-warning/10 text-foreground/80 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
            <Info className="text-warning mt-px size-4 shrink-0" aria-hidden="true" />
            <span>
              {t('auth.otp.demo')}{' '}
              <strong className="font-mono text-sm tracking-[0.3em]">{demoCode}</strong>
            </span>
          </p>
          {clientGenerated && (
            <p className="border-destructive/25 bg-destructive/10 text-destructive/90 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
              <Info className="mt-px size-4 shrink-0" aria-hidden="true" />
              <span>{t('auth.otp.clientGenerated')}</span>
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={isPending}
        className="text-muted-foreground hover:text-foreground mx-auto mt-6 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('auth.confirm.back')}
      </button>
    </div>
  );
}

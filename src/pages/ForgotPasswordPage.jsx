import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { OtpInput } from '@/components/auth/OtpInput';
import { FormField } from '@/components/common/FormField';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi, USE_MOCK_API } from '@/services';
import { OTP_LENGTH, OTP_RESEND_SECONDS, ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import loginPattern from '@/assets/login-pattern.png';

const passwordRule = /(?=.*[A-Z])(?=.*\d).*/;

const emailSchema = () =>
  z.object({
    email: z.string().trim().min(1, 'validation.required').email('validation.email'),
  });

const resetSchema = () =>
  z
    .object({
      newPassword: z
        .string()
        .min(8, 'auth.forgot.passwordWeak')
        .regex(passwordRule, 'auth.forgot.passwordWeak'),
      confirmPassword: z.string().min(1, 'validation.required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'auth.forgot.passwordsDontMatch',
      path: ['confirmPassword'],
    });

/**
 * Flux « mot de passe oublié » en deux étapes :
 *   1) l'utilisateur saisit son e-mail et reçoit un code à {{OTP_LENGTH}} chiffres ;
 *   2) il saisit ce code + un nouveau mot de passe (et sa confirmation) → réinitialisation.
 * Une étape "succès" finale propose de revenir à la connexion.
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [demoCode, setDemoCode] = useState(null);
  const [cooldown, setCooldown] = useState(OTP_RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  // Forms séparés : un par étape (chacun son reset à la navigation).
  const emailForm = useForm({
    resolver: zodResolver(emailSchema()),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });
  const resetForm = useForm({
    resolver: zodResolver(resetSchema()),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  // Étape 1 : envoi du code.
  const requestMutation = useMutation({
    mutationFn: ({ email }) => authApi.requestPasswordReset({ email }),
    onSuccess: (data, variables) => {
      const newDemoCode = data?.demoCode ?? null;
      setEmail(variables.email);
      setDemoCode(newDemoCode);
      toast.success(
        newDemoCode
          ? t('auth.otp.sentWithCode', { email: variables.email, code: newDemoCode })
          : t('auth.forgot.codeSent', { email: variables.email }),
        { duration: 8000 },
      );
      setCode('');
      setCodeError(null);
      setCooldown(OTP_RESEND_SECONDS);
      setStep(2);
    },
    onError: (error) => {
      if (error?.status === 404) toast.error(t('auth.forgot.userNotFound'));
      else toast.error(getErrorMessage(error, t));
    },
  });

  // Étape 2 : validation du code et enregistrement du nouveau mot de passe.
  const resetMutation = useMutation({
    mutationFn: ({ email, code, newPassword }) =>
      authApi.resetPassword({ email, code, newPassword }),
    onSuccess: () => {
      toast.success(t('auth.forgot.success'));
      setStep(3);
    },
    onError: (error) => {
      if (error?.status === 410 || error?.status === 401) {
        setCodeError(t('auth.forgot.codeInvalid'));
      } else {
        toast.error(getErrorMessage(error, t));
      }
    },
  });

  // Compte à rebours du renvoi de code.
  useEffect(() => {
    if (step !== 2 || cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown, step]);

  const onRequestCode = ({ email }) => {
    requestMutation.mutate({ email: email.trim() });
  };

  const onSubmitNewPassword = (values) => {
    if (code.length !== OTP_LENGTH) {
      setCodeError(t('auth.otp.incomplete', { count: OTP_LENGTH }));
      return;
    }
    setCodeError(null);
    resetMutation.mutate({ email, code, newPassword: values.newPassword });
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (codeError) setCodeError(null);
  };

  const resendCode = async () => {
    setIsResending(true);
    try {
      const data = await authApi.requestPasswordReset({ email });
      const newDemoCode = data?.demoCode ?? null;
      setDemoCode(newDemoCode);
      setCode('');
      setCodeError(null);
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

  const isRequestPending = requestMutation.isPending;
  const isResetPending = resetMutation.isPending;
  const year = new Date().getFullYear();

  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="bg-brand relative isolate hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.28]"
          style={{ backgroundImage: `url(${loginPattern})` }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-transparent via-transparent to-[#B00000]/35"
          aria-hidden="true"
        />
        <div className="relative">
          <Logo inverse />
        </div>
        <div className="relative space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <KeyRound className="size-3.5" aria-hidden="true" />
            {t('app.name')}
          </span>
          <h1 className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
            {t('auth.forgot.title')}
          </h1>
          <p className="max-w-md text-base text-white/85">{t('auth.forgot.subtitle')}</p>
        </div>
        <p className="relative text-xs text-white/70">{t('layout.copyright', { year })}</p>
      </aside>

      <main className="bg-background flex flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-end gap-1 px-6 pt-4 sm:px-10 sm:pt-5">
          <LanguageSwitcher />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-4 sm:px-10 sm:py-6">
          <div className="w-full max-w-md">
            <div className="bg-card ring-border/60 rounded-2xl p-5 shadow-sm ring-1 sm:p-7">
              {/* En-tête commun */}
              <div className="mb-5 flex flex-col items-center text-center">
                <span className="bg-primary/10 text-primary dark:bg-primary/20 mb-4 grid size-12 place-items-center rounded-2xl">
                  {step === 3 ? (
                    <CheckCircle2 className="size-6" aria-hidden="true" />
                  ) : (
                    <KeyRound className="size-6" aria-hidden="true" />
                  )}
                </span>
                <h2 className="text-xl font-bold tracking-tight">
                  {step === 3 ? t('auth.forgot.success') : t('auth.forgot.title')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">{t('auth.forgot.subtitle')}</p>
              </div>

              {/* Étape 1 : saisie de l'e-mail */}
              {step === 1 && (
                <form
                  noValidate
                  onSubmit={emailForm.handleSubmit(onRequestCode)}
                  className="space-y-4"
                >
                  <FormField
                    id="forgot-email"
                    label={t('auth.email')}
                    error={emailForm.formState.errors.email?.message}
                  >
                    {(aria) => (
                      <div className="relative">
                        <Mail
                          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <Input
                          {...aria}
                          {...emailForm.register('email')}
                          type="email"
                          autoComplete="email"
                          placeholder={t('auth.emailPlaceholder')}
                          disabled={isRequestPending}
                          className="h-11 pl-10"
                        />
                      </div>
                    )}
                  </FormField>

                  <Button
                    type="submit"
                    size="xl"
                    className="h-11 w-full"
                    disabled={isRequestPending}
                  >
                    {isRequestPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {t('auth.forgot.submitting')}
                      </>
                    ) : (
                      t('auth.forgot.submit')
                    )}
                  </Button>
                </form>
              )}

              {/* Étape 2 : code + nouveau mot de passe */}
              {step === 2 && (
                <form
                  noValidate
                  onSubmit={resetForm.handleSubmit(onSubmitNewPassword)}
                  className="space-y-4"
                >
                  <div className="bg-muted mb-1 flex items-center gap-3 rounded-xl border px-4 py-2.5">
                    <span className="from-primary to-brand-dark text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br">
                      <MailCheck className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground text-[11px] font-medium">
                        {t('auth.forgot.step1Title')}
                      </p>
                      <p className="truncate text-sm font-semibold">{email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-center text-sm font-medium">{t('auth.forgot.codeLabel')}</p>
                    <OtpInput
                      value={code}
                      onChange={handleCodeChange}
                      length={OTP_LENGTH}
                      disabled={isResetPending}
                      invalid={Boolean(codeError)}
                      autoFocus
                      label={t('auth.forgot.codeLabel')}
                    />
                    {codeError && (
                      <p role="alert" className="text-destructive text-center text-xs font-medium">
                        {codeError}
                      </p>
                    )}
                  </div>

                  <FormField
                    id="newPassword"
                    label={t('auth.forgot.newPassword')}
                    hint={t('auth.register.passwordHint')}
                    error={resetForm.formState.errors.newPassword?.message}
                  >
                    {(aria) => (
                      <div className="relative">
                        <Lock
                          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <Input
                          {...aria}
                          {...resetForm.register('newPassword')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder={t('auth.forgot.newPasswordPlaceholder')}
                          disabled={isResetPending}
                          className="h-11 pr-11 pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md transition focus-visible:ring-2 focus-visible:outline-hidden"
                          aria-label={
                            showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                          }
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </FormField>

                  <FormField
                    id="confirmPassword"
                    label={t('auth.forgot.confirmPassword')}
                    error={resetForm.formState.errors.confirmPassword?.message}
                  >
                    {(aria) => (
                      <div className="relative">
                        <KeyRound
                          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <Input
                          {...aria}
                          {...resetForm.register('confirmPassword')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder={t('auth.forgot.confirmPlaceholder')}
                          disabled={isResetPending}
                          className="h-11 pl-10"
                        />
                      </div>
                    )}
                  </FormField>

                  <Button type="submit" size="xl" className="h-11 w-full" disabled={isResetPending}>
                    {isResetPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {t('auth.forgot.resetting')}
                      </>
                    ) : (
                      t('auth.forgot.reset')
                    )}
                  </Button>

                  <p className="text-muted-foreground flex flex-col items-center gap-1 text-center text-sm">
                    <span>{t('auth.otp.notReceived')}</span>
                    {cooldown > 0 ? (
                      <span className="tabular-nums">
                        {t('auth.otp.resendIn', { count: cooldown })}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={resendCode}
                        disabled={isResending || isResetPending}
                        className="text-primary font-semibold hover:underline disabled:opacity-50"
                      >
                        {t('auth.otp.resend')}
                      </button>
                    )}
                  </p>

                  {demoCode && (
                    <p className="border-warning/25 bg-warning/10 text-foreground/80 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
                      <Info className="text-warning mt-px size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {t('auth.otp.demo')}{' '}
                        <strong className="font-mono text-sm tracking-[0.3em]">{demoCode}</strong>
                      </span>
                    </p>
                  )}
                </form>
              )}

              {/* Étape 3 : confirmation */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-muted-foreground text-center text-sm">
                    {t('auth.forgot.success')}
                  </p>
                  <Button
                    type="button"
                    size="xl"
                    className="h-12 w-full"
                    onClick={() => navigate(ROUTES.login, { replace: true })}
                  >
                    {t('auth.forgot.goLogin')}
                  </Button>
                </div>
              )}

              {USE_MOCK_API && step === 1 && (
                <p className="border-warning/25 bg-warning/10 text-foreground/80 mt-6 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
                  <Info className="text-warning mt-px size-4 shrink-0" aria-hidden="true" />
                  {t('auth.mockNotice')}
                </p>
              )}

              <Link
                to={ROUTES.login}
                className="text-muted-foreground hover:text-foreground mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t('auth.backToLogin')}
              </Link>
            </div>

            <p className="text-muted-foreground mt-6 text-center text-xs">
              {t('layout.version', { version: '1.0.0' })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

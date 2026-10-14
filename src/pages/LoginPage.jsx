import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Info, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { ConfirmIdentity } from '@/components/auth/ConfirmIdentity';
import { FormField } from '@/components/common/FormField';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandMark, Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi, FEATURES, USE_MOCK_API } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import loginPattern from '@/assets/login-pattern.png';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'validation.required').email('validation.email'),
  password: z.string().min(1, 'validation.required'),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  // Étape 2 : compte identifié, en attente du code reçu par e-mail.
  const [pending, setPending] = useState(null);

  const logoutReason = useAuthStore((state) => state.logoutReason);
  const clearLogoutReason = useAuthStore((state) => state.clearLogoutReason);

  // Informe l'utilisateur de la raison de la déconnexion (expiration, action volontaire).
  useEffect(() => {
    if (!logoutReason) return;
    if (logoutReason === 'sessionExpired') toast.warning(t('auth.sessionExpired'));
    else toast.info(t('auth.loggedOut'));
    clearLogoutReason();
  }, [logoutReason, clearLogoutReason, t]);

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  /**
   * Étape 1 : vérifie les identifiants (`POST /auth/login`).
   * - Vérification par code activée (FEATURES.otpLogin) : la session n'est pas encore
   *   ouverte, un code est envoyé par e-mail et l'étape 2 s'affiche.
   * - Sinon (contrat endpoints.json) : la session est ouverte directement.
   */
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const session = await authApi.login({ email, password });
      if (!FEATURES.otpLogin) return { session };
      const sent = await authApi.sendCode({ email: email.trim() });
      return { user: session.user, demoCode: sent?.demoCode };
    },
    onSuccess: ({ session, user, demoCode }, variables) => {
      if (session) {
        queryClient.clear();
        setSession(session);
        handleConfirmed(session);
        return;
      }
      setPending({ email: variables.email.trim(), user, demoCode });
      toast.success(t('auth.otp.sent', { email: variables.email.trim() }));
    },
    onError: (error) => {
      const message =
        error.status === 401 || error.status === 400
          ? t('auth.invalidCredentials')
          : getErrorMessage(error, t);
      toast.error(message);
    },
  });

  const isPending = loginMutation.isPending;

  const backToCredentials = () => {
    resetField('password');
    setPending(null);
  };

  const handleConfirmed = ({ user }) => {
    toast.success(t('auth.welcome', { name: user?.name || user?.email }));
    navigate(location.state?.from?.pathname ?? ROUTES.home, { replace: true });
  };
  const year = new Date().getFullYear();

  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Panneau de marque */}
      <aside className="bg-brand relative isolate hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Motif de logos Vodacom répétés, en filigrane */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.28]"
          style={{ backgroundImage: `url(${loginPattern})` }}
          aria-hidden="true"
        />
        {/* Dégradé pour la lisibilité du texte */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-transparent via-transparent to-[#B00000]/35"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-white shadow-lg">
            <BrandMark className="size-8" title="Vodacom" />
          </span>
          <span className="text-xl font-bold tracking-tight">Vodacom</span>
        </div>

        <div className="max-w-md space-y-4">
          <p className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-sm">
            {t('app.name')}
          </p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance xl:text-[34px]">
            {t('auth.headline')}
          </h1>
        </div>

        <p className="text-[11px] text-white/70">{t('layout.copyright', { year })}</p>
      </aside>

      {/* Formulaire */}
      <main className="bg-background flex flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between p-4 sm:p-5">
          <Logo className="lg:invisible" />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-10">
          <div className="animate-fade-up w-full max-w-[460px]">
            <div className="border-t-primary bg-card shadow-elevated rounded-2xl border border-t-4 px-6 py-7 sm:px-10 sm:py-9">
              {pending ? (
                <ConfirmIdentity
                  email={pending.email}
                  user={pending.user}
                  demoCode={pending.demoCode}
                  onBack={backToCredentials}
                  onSuccess={handleConfirmed}
                />
              ) : (
                <>
                  <div className="mb-7 space-y-1.5">
                    <BrandMark className="mb-4 size-12" title="Vodacom" />
                    <h2 className="text-xl font-bold tracking-tight">{t('auth.title')}</h2>
                    <p className="text-muted-foreground text-sm">{t('auth.formSubtitle')}</p>
                  </div>

                  <form
                    noValidate
                    onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
                    className="space-y-4"
                  >
                    <FormField id="email" label={t('auth.email')} error={errors.email?.message}>
                      {(aria) => (
                        <div className="relative">
                          <Mail
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                            aria-hidden="true"
                          />
                          <Input
                            {...aria}
                            {...register('email')}
                            type="email"
                            autoComplete="email"
                            autoFocus
                            placeholder={t('auth.emailPlaceholder')}
                            disabled={isPending}
                            className="h-12 pl-10"
                          />
                        </div>
                      )}
                    </FormField>

                    <FormField
                      id="password"
                      label={t('auth.password')}
                      error={errors.password?.message}
                    >
                      {(aria) => (
                        <div className="relative">
                          <Lock
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                            aria-hidden="true"
                          />
                          <Input
                            {...aria}
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder={t('auth.passwordPlaceholder')}
                            disabled={isPending}
                            className="h-12 pr-11 pl-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
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

                    <div className="flex justify-end">
                      <Link
                        to={ROUTES.forgotPassword}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      size="xl"
                      className="mt-2 h-11 w-full"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          {t('auth.submitting')}
                        </>
                      ) : (
                        <>
                          {t('auth.submit')}
                          <ArrowRight />
                        </>
                      )}
                    </Button>

                    <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
                      <span>{t('auth.signupPrompt')}</span>
                      <Link
                        to={ROUTES.signup}
                        className="text-primary font-semibold hover:underline"
                      >
                        {t('auth.signupCta')}
                      </Link>
                    </p>
                  </form>

                  {USE_MOCK_API && (
                    <p className="border-warning/25 bg-warning/10 text-foreground/80 mt-8 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
                      <Info className="text-warning mt-px size-4 shrink-0" aria-hidden="true" />
                      {t('auth.mockNotice')}
                    </p>
                  )}
                </>
              )}
            </div>

            <p className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-center text-xs">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t('auth.footer')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

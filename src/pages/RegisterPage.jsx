import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info, KeyRound, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormField } from '@/components/common/FormField';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi, USE_MOCK_API } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import loginPattern from '@/assets/login-pattern.png';

// Règle de mot de passe : 8 caractères min., au moins 1 majuscule et 1 chiffre.
const passwordRule = /(?=.*[A-Z])(?=.*\d).*/;

const buildSchema = () =>
  z
    .object({
      name: z.string().trim().min(2, 'validation.required').max(120, 'validation.tooLong'),
      email: z.string().trim().min(1, 'validation.required').email('validation.email'),
      password: z
        .string()
        .min(8, 'auth.register.passwordHint')
        .regex(passwordRule, 'auth.register.passwordHint'),
      confirmPassword: z.string().min(1, 'validation.required'),
      accept: z.literal(true, { errorMap: () => ({ message: 'validation.required' }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'auth.forgot.passwordsDontMatch',
      path: ['confirmPassword'],
    });

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema()),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', accept: false },
    mode: 'onTouched',
  });

  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: (payload) => authApi.register(payload),
    onSuccess: (session) => {
      queryClient.clear();
      setSession(session);
      toast.success(t('auth.welcome', { name: session?.user?.name || session?.user?.email }));
      navigate(ROUTES.home, { replace: true });
    },
    onError: (error) => {
      if (error?.status === 409 || error?.status === 422) {
        toast.error(t('auth.register.emailExists'));
      } else {
        toast.error(getErrorMessage(error, t) || t('auth.register.genericError'));
      }
    },
  });

  const onSubmit = ({ name, email, password }) => {
    registerMutation.mutate({ name, email: email.trim(), password });
  };

  const isPending = registerMutation.isPending;
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
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
          <span className="bg-white/15 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <UserPlus className="size-3.5" aria-hidden="true" />
            {t('app.name')}
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            {t('auth.register.title')}
          </h1>
          <p className="max-w-md text-base text-white/85">{t('auth.register.subtitle')}</p>
        </div>
        <p className="relative text-xs text-white/70">{t('layout.copyright', { year })}</p>
      </aside>

      <main className="bg-background flex flex-col">
        <header className="flex items-center justify-end gap-1 px-6 pt-6 sm:px-10">
          <LanguageSwitcher />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="bg-card ring-border/60 rounded-2xl p-7 shadow-sm ring-1 sm:p-9">
              <div className="mb-7 flex flex-col items-center text-center">
                <span className="bg-primary/10 text-primary dark:bg-primary/20 mb-5 grid size-14 place-items-center rounded-2xl">
                  <UserPlus className="size-7" aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-bold tracking-tight">{t('auth.register.title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('auth.register.subtitle')}
                </p>
              </div>

              <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField id="name" label={t('auth.register.name')} error={errors.name?.message}>
                  {(aria) => (
                    <div className="relative">
                      <UserPlus
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <Input
                        {...aria}
                        {...register('name')}
                        type="text"
                        autoComplete="name"
                        placeholder={t('auth.register.namePlaceholder')}
                        disabled={isPending}
                        className="h-12 pl-10"
                      />
                    </div>
                  )}
                </FormField>

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
                        placeholder={t('auth.emailPlaceholder')}
                        disabled={isPending}
                        className="h-12 pl-10"
                      />
                    </div>
                  )}
                </FormField>

                <FormField
                  id="password"
                  label={t('auth.register.password')}
                  hint={t('auth.register.passwordHint')}
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
                        autoComplete="new-password"
                        placeholder={t('auth.passwordPlaceholder')}
                        disabled={isPending}
                        className="h-12 pr-11 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md transition focus-visible:ring-2 focus-visible:outline-hidden"
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  )}
                </FormField>

                <FormField
                  id="confirmPassword"
                  label={t('auth.forgot.confirmPassword')}
                  error={errors.confirmPassword?.message}
                >
                  {(aria) => (
                    <div className="relative">
                      <KeyRound
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <Input
                        {...aria}
                        {...register('confirmPassword')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={t('auth.forgot.confirmPlaceholder')}
                        disabled={isPending}
                        className="h-12 pl-10"
                      />
                    </div>
                  )}
                </FormField>

                <label className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
                  <input
                    type="checkbox"
                    {...register('accept')}
                    className="text-primary focus-visible:ring-ring mt-0.5 size-4 rounded border-input"
                    disabled={isPending}
                  />
                  <span>{t('auth.footer')}</span>
                </label>
                {errors.accept && (
                  <p role="alert" className="text-destructive -mt-3 text-xs font-medium">
                    {t(errors.accept.message)}
                  </p>
                )}

                <Button
                  type="submit"
                  size="xl"
                  className="h-12 w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {t('auth.register.submitting')}
                    </>
                  ) : (
                    t('auth.register.submit')
                  )}
                </Button>
              </form>

              {USE_MOCK_API && (
                <p className="border-warning/25 bg-warning/10 text-foreground/80 mt-6 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs">
                  <Info className="text-warning mt-px size-4 shrink-0" aria-hidden="true" />
                  {t('auth.mockNotice')}
                </p>
              )}

              <p className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-sm">
                <Link to={ROUTES.login} className="text-primary font-semibold hover:underline">
                  {t('auth.backToLogin')}
                </Link>
              </p>
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

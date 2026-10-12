import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { MAX_UNLOCK_ATTEMPTS } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errors';
import { getInitials } from '@/utils/format';
import { BrandMark } from './Logo';

/**
 * Écran de verrouillage : recouvre l'application et redemande le mot de passe.
 * Le mot de passe est vérifié auprès de l'API d'authentification ; en cas de
 * succès, la session (jeton) est renouvelée. Trop d'échecs → déconnexion.
 */
export function LockScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const setSession = useAuthStore((state) => state.setSession);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const displayName = user?.name || user?.email || '';
  const remaining = MAX_UNLOCK_ATTEMPTS - attempts;

  // Empêche le défilement de la page derrière l'écran de verrouillage.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError(t('validation.required'));
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const session = await authApi.login({ email: user.email, password });
      setSession({ token: session.token, user: { ...user, ...session.user } });
      toast.success(t('lock.unlocked'));
    } catch (err) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPassword('');
      if (nextAttempts >= MAX_UNLOCK_ATTEMPTS) {
        logout('loggedOut');
        toast.error(t('lock.tooManyAttempts'));
        return;
      }
      setError(
        err.status === 401 || err.status === 400
          ? t('lock.wrongPassword', { count: MAX_UNLOCK_ATTEMPTS - nextAttempts })
          : getErrorMessage(err, t),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
      className="bg-background/95 fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4 backdrop-blur-xl"
    >
      <div className="w-full max-w-sm">
        <div className="bg-card border-t-primary shadow-elevated rounded-2xl border border-t-4 px-6 py-8 text-center sm:px-8">
          <BrandMark className="mx-auto size-10" title="Vodacom" />

          <div className="mt-6 flex flex-col items-center">
            <span className="relative">
              <span className="from-primary to-brand-dark text-primary-foreground grid size-16 place-items-center rounded-full bg-linear-to-br text-lg font-semibold">
                {getInitials(displayName)}
              </span>
              <span className="bg-card absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border">
                <Lock className="text-primary size-3.5" aria-hidden="true" />
              </span>
            </span>
            <h2 id="lock-title" className="mt-4 text-lg font-semibold tracking-tight">
              {t('lock.title')}
            </h2>
            <p className="text-sm font-medium">{displayName}</p>
            {user?.name && user?.email && (
              <p className="text-muted-foreground text-xs">{user.email}</p>
            )}
            <p className="text-muted-foreground mt-3 text-sm">{t('lock.description')}</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="lock-password" className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="lock-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  disabled={isPending}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'lock-error' : undefined}
                  className="h-11 pr-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-hidden"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {error && (
                <p id="lock-error" role="alert" className="text-destructive text-xs font-medium">
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" size="xl" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t('lock.unlocking')}
                </>
              ) : (
                t('lock.unlock')
              )}
            </Button>
          </form>

          {attempts > 0 && remaining > 0 && (
            <p className="text-muted-foreground mt-3 text-xs">
              {t('lock.attemptsLeft', { count: remaining })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => logout('loggedOut')}
          className="text-muted-foreground hover:text-foreground mx-auto mt-5 flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t('lock.switchAccount')}
        </button>
      </div>
    </div>
  );
}

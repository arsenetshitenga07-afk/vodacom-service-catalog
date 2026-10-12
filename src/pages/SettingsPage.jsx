import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  KeyRound,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ChangePasswordDialog } from '@/components/layout/ChangePasswordDialog';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { useAuth } from '@/hooks/useAuth';
import { serviceKeys } from '@/hooks/useServices';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { API_BASE_URL, checkHealth, FEATURES, resetDemoData, USE_MOCK_API } from '@/services';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { LOCK_DELAY_OPTIONS } from '@/utils/constants';
import { getInitials } from '@/utils/format';

/** Paramètres : profil, apparence, sécurité, données et session. */
export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const lock = useAuthStore((state) => state.lock);
  const queryClient = useQueryClient();
  // État du backend (`GET /health`), seulement avec la vraie API.
  const health = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    enabled: !USE_MOCK_API,
    refetchInterval: 30_000,
  });

  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const lockAfterMinutes = useAppStore((state) => state.lockAfterMinutes);
  const setLockAfterMinutes = useAppStore((state) => state.setLockAfterMinutes);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const displayName = user?.name || user?.email || '';

  const handleReset = () => {
    resetDemoData?.();
    queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    toast.success(t('settings.data.resetDone'));
    setResetOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader icon={Settings} title={t('nav.settings')} description={t('settings.subtitle')} />

      {/* Profil */}
      <Section icon={UserRound} title={t('settings.profile.title')}>
        <div className="flex items-center gap-4">
          <span className="from-primary to-brand-dark text-primary-foreground grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br text-lg font-semibold">
            {getInitials(displayName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user?.name || '—'}</p>
            <p className="text-muted-foreground truncate text-sm">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoRow label={t('settings.profile.name')} value={user?.name || '—'} />
          <InfoRow label={t('settings.profile.email')} value={user?.email || '—'} />
        </dl>
        <p className="text-muted-foreground mt-3 text-xs">{t('settings.profile.managed')}</p>
      </Section>

      {/* Apparence */}
      <Section icon={Palette} title={t('settings.appearance.title')}>
        <Row label={t('settings.appearance.theme')} hint={t('settings.appearance.themeHint')}>
          <Segmented
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: t('settings.appearance.light'), icon: Sun },
              { value: 'dark', label: t('settings.appearance.dark'), icon: Moon },
              { value: 'system', label: t('settings.appearance.system'), icon: Monitor },
            ]}
          />
        </Row>
        <Row label={t('header.language')} hint={t('settings.appearance.languageHint')}>
          <Segmented
            value={language}
            onChange={setLanguage}
            options={SUPPORTED_LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label }))}
          />
        </Row>
        <Row label={t('settings.appearance.view')} hint={t('settings.appearance.viewHint')}>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'grid', label: t('services.viewGrid'), icon: LayoutGrid },
              { value: 'table', label: t('services.viewTable'), icon: List },
            ]}
          />
        </Row>
        <Row label={t('settings.appearance.sidebar')} hint={t('settings.appearance.sidebarHint')}>
          <Switch
            checked={sidebarOpen}
            onChange={setSidebarOpen}
            label={t('settings.appearance.sidebar')}
          />
        </Row>
      </Section>

      {/* Sécurité */}
      <Section icon={ShieldCheck} title={t('settings.security.title')}>
        {FEATURES.changePassword && (
          <Row label={t('settings.security.password')} hint={t('settings.security.passwordHint')}>
            <Button variant="outline" onClick={() => setPasswordOpen(true)}>
              <KeyRound />
              {t('header.changePassword')}
            </Button>
          </Row>
        )}
        <Row label={t('settings.security.autoLock')} hint={t('settings.security.autoLockHint')}>
          <Segmented
            value={lockAfterMinutes}
            onChange={setLockAfterMinutes}
            options={LOCK_DELAY_OPTIONS.map((minutes) => ({
              value: minutes,
              label: minutes
                ? t('settings.security.minutes', { count: minutes })
                : t('settings.security.never'),
            }))}
          />
        </Row>
        <Row label={t('settings.security.lockNow')} hint={t('settings.security.lockNowHint')}>
          <Button variant="outline" onClick={() => lock()}>
            <Lock />
            {t('header.lock')}
          </Button>
        </Row>
      </Section>

      {/* Données & application */}
      <Section icon={Database} title={t('settings.data.title')}>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label={t('settings.data.version')} value={`v${__APP_VERSION__}`} />
          <InfoRow
            label={t('settings.data.mode')}
            value={USE_MOCK_API ? t('settings.data.mock') : t('settings.data.live')}
          />
          <InfoRow label={t('settings.data.api')} value={USE_MOCK_API ? '—' : API_BASE_URL} mono />
          <InfoRow
            label={t('settings.data.status')}
            value={
              USE_MOCK_API
                ? '—'
                : health.isPending
                  ? t('settings.data.checking')
                  : health.data
                    ? t('settings.data.online')
                    : t('settings.data.offline')
            }
          />
        </dl>
        {resetDemoData && (
          <Row
            className="mt-2"
            label={t('settings.data.reset')}
            hint={t('settings.data.resetHint')}
          >
            <Button
              variant="outline"
              onClick={() => setResetOpen(true)}
              className="text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw />
              {t('settings.data.resetAction')}
            </Button>
          </Row>
        )}
      </Section>

      {/* Session */}
      <Section icon={LogOut} title={t('settings.session.title')}>
        <Row label={t('header.signedInAs')} hint={user?.email}>
          <Button variant="destructive" onClick={() => logout()}>
            <LogOut />
            {t('header.logout')}
          </Button>
        </Row>
      </Section>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.data.resetConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.data.resetConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleReset}>
              {t('settings.data.resetAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-card shadow-card rounded-xl border">
      <h2 className="flex items-center gap-3 border-b px-5 py-4 text-base font-semibold">
        <span className="bg-primary/10 text-primary dark:bg-primary/20 grid size-8 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="divide-y px-5 py-2 [&>*]:py-4">{children}</div>
    </section>
  );
}

/** Ligne de réglage : libellé + explication à gauche, contrôle à droite. */
function Row({ label, hint, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="bg-muted min-w-0 rounded-lg border px-3 py-2.5">
      <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd
        className={cn('mt-0.5 truncate text-sm font-medium', mono && 'font-mono text-xs')}
        title={String(value)}
      >
        {value}
      </dd>
    </div>
  );
}

/** Groupe de boutons à choix unique. */
function Segmented({ value, onChange, options }) {
  return (
    <div className="bg-background inline-flex flex-wrap gap-1 rounded-lg border p-1">
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const active = optionValue === value;
        return (
          <button
            key={String(optionValue)}
            type="button"
            onClick={() => onChange(optionValue)}
            aria-pressed={active}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden',
              active
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Interrupteur on / off. */
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5.5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

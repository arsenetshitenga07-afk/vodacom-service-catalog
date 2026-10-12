import { useState } from 'react';
import { ChevronDown, KeyRound, Lock, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/utils/format';
import { ChangePasswordDialog } from './ChangePasswordDialog';

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const lock = useAuthStore((state) => state.lock);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const displayName = user?.name || user?.email || '';
  const initials = getInitials(displayName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="group ring-offset-background hover:bg-accent focus-visible:ring-ring flex items-center gap-2.5 rounded-full p-0.5 pr-0.5 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden md:pr-2.5"
          aria-label={t('header.userMenu')}
        >
          <span className="from-primary to-brand-dark text-primary-foreground grid size-8 place-items-center rounded-full bg-linear-to-br text-xs font-semibold">
            {initials}
          </span>
          <span className="hidden max-w-40 flex-col items-start text-left leading-tight md:flex">
            <span className="w-full truncate text-[13px] font-semibold">{displayName}</span>
            {user?.name && user?.email && (
              <span className="text-muted-foreground w-full truncate text-[11px]">
                {user.email}
              </span>
            )}
          </span>
          <ChevronDown
            className="text-muted-foreground hidden size-4 transition group-data-[state=open]:rotate-180 md:block"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
            <span className="from-primary to-brand-dark text-primary-foreground grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br text-sm font-semibold">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="text-muted-foreground block text-[11px] tracking-wide uppercase">
                {t('header.signedInAs')}
              </span>
              {user?.name && (
                <span className="text-foreground mt-0.5 block truncate text-sm font-semibold">
                  {user.name}
                </span>
              )}
              <span className="text-muted-foreground block truncate text-xs">{user?.email}</span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FEATURES.changePassword && (
            <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
              <KeyRound />
              {t('header.changePassword')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => lock()}>
            <Lock />
            {t('header.lock')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
            <LogOut />
            {t('header.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { EmptyState } from '@/components/common/EmptyState';
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
import { PersonAvatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteUser, useUpdateUser, useUpdateUserRole, useUsersQuery } from '@/hooks/useUsers';
import { selectUser, useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/errors';

const USERS_PAGE_SIZE = 20;

/**
 * Page admin de gestion des utilisateurs (`/admin/users`).
 * Affiche la liste paginée, permet d'éditer le profil, changer le rôle, supprimer.
 *
 * Garde-fous :
 * - Un user ne peut pas se modifier / supprimer lui-même (UI guard).
 * - Le backend refuse le déclassement du dernier admin (409) → on l'affiche en toast.
 */
export default function AdminUsersPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore(selectUser);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isPending, isError, error, isFetching } = useUsersQuery({ page, limit: USERS_PAGE_SIZE });
  const roleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const isAdmin = currentUser?.role === 'admin';
  const selfId = currentUser?.id;

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={UsersIcon} title={t('admin.users.title')} />
        <EmptyState icon={Shield} title={t('admin.users.notAllowed')} description="" />
      </div>
    );
  }

  const handleRoleToggle = async (user) => {
    if (user.id === selfId) {
      toast.error(t('admin.users.selfAction'));
      return;
    }
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await roleMutation.mutateAsync({ id: user.id, role: nextRole });
      toast.success(
        nextRole === 'admin'
          ? t('admin.users.promoted', { name: user.name })
          : t('admin.users.demoted', { name: user.name }),
      );
    } catch (err) {
      if (err?.status === 409) toast.error(t('admin.users.lastAdmin'));
      else toast.error(getErrorMessage(err, t));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t('admin.users.deleted', { name: deleteTarget.name }));
      setDeleteTarget(null);
    } catch (err) {
      if (err?.status === 409) toast.error(t('admin.users.lastAdmin'));
      else toast.error(getErrorMessage(err, t));
    }
  };

  // Le backend ne supporte pas encore la recherche via query string — on filtre côté client.
  const users = (data?.data ?? []).filter((user) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UsersIcon}
        title={t('admin.users.title')}
        description={
          isPending
            ? t('admin.users.loading')
            : t('admin.users.subtitle', { count: total })
        }
      />

      <div className="bg-card shadow-card flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.users.search')}
            aria-label={t('admin.users.search')}
            className="bg-background h-11 pl-10 shadow-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {['all', 'admin', 'user'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === role
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`admin.users.roleFilter.${role}`)}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : isError ? (
        <EmptyState
          icon={Shield}
          title={getErrorMessage(error, t) || t('admin.users.errorLoad')}
          description=""
        />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title={t('admin.users.empty')} description="" />
      ) : (
        <div className="bg-card shadow-card overflow-hidden rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.users.columns.name')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.users.columns.email')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.users.columns.role')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.users.columns.createdAt')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('admin.users.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === selfId;
                  const isAdminUser = user.role === 'admin';
                  return (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <PersonAvatar name={user.name} className="size-8 text-xs" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {user.name}
                              {isSelf && (
                                <span className="text-muted-foreground ml-2 text-xs font-normal">
                                  {t('admin.users.you')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3.5" aria-hidden="true" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isAdminUser ? 'brand' : 'muted'}>
                          {isAdminUser ? (
                            <ShieldCheck className="size-3" />
                          ) : (
                            <Shield className="size-3" />
                          )}
                          {t(`admin.users.roles.${user.role ?? 'user'}`)}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserActions
                          user={user}
                          isSelf={isSelf}
                          onEdit={() => setEditTarget(user)}
                          onToggleRole={() => handleRoleToggle(user)}
                          onDelete={() => setDeleteTarget(user)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isPending && totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {t('admin.users.pagination.page', { page, total: totalPages })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft />
              {t('admin.users.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              {t('admin.users.pagination.next')}
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <EditUserDialog
        open={Boolean(editTarget)}
        user={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSaved={() => setEditTarget(null)}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <span className="bg-destructive/10 text-destructive ring-destructive/5 mb-2 grid size-12 place-items-center rounded-full ring-8">
              <Trash2 className="size-5" aria-hidden="true" />
            </span>
            <AlertDialogTitle>
              {t('admin.users.deleteTitle', { name: deleteTarget?.name ?? '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('admin.users.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('admin.users.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserActions({ user, isSelf, onEdit, onToggleRole, onDelete }) {
  const { t } = useTranslation();
  const isAdminUser = user.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('common.moreActions')} — ${user.name}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil />
          {t('admin.users.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleRole} disabled={isSelf}>
          {isAdminUser ? <UserMinus /> : <UserPlus />}
          {isAdminUser ? t('admin.users.demote') : t('admin.users.promote')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete} disabled={isSelf}>
          <Trash2 />
          {t('admin.users.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const editSchema = (t) =>
  z.object({
    name: z.string().trim().min(2, t('admin.users.errorNameRequired')),
    email: z
      .string()
      .trim()
      .min(1, t('admin.users.errorEmailInvalid'))
      .email(t('admin.users.errorEmailInvalid')),
  });

function EditUserDialog({ open, onOpenChange, user, onSaved }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateUser();
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema(t)),
    defaultValues: { name: '', email: '' },
  });

  // À chaque ouverture (ou changement de cible), on repeuple le formulaire.
  useEffect(() => {
    if (open && user) {
      reset({ name: user.name ?? '', email: user.email ?? '' });
      setError(null);
    }
  }, [open, user, reset]);

  const submit = async (values) => {
    if (!user) return;
    setError(null);
    try {
      await updateMutation.mutateAsync({ id: user.id, ...values });
      toast.success(t('admin.users.saved'));
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      if (err?.status === 409) setError(t('admin.users.errorEmailTaken'));
      else setError(getErrorMessage(err, t));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (updateMutation.isPending) return;
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={t('common.close')} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.users.editTitle', { name: user?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('admin.users.editDescription')}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-user-name" className="text-sm font-medium">
              {t('admin.users.nameLabel')}
            </label>
            <Input
              id="edit-user-name"
              {...register('name')}
              autoFocus
              autoComplete="name"
              disabled={updateMutation.isPending}
              aria-invalid={Boolean(errors.name || error)}
              className="h-11"
            />
            {errors.name && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.name.message)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-user-email" className="text-sm font-medium">
              {t('admin.users.emailLabel')}
            </label>
            <Input
              id="edit-user-email"
              type="email"
              {...register('email')}
              autoComplete="email"
              disabled={updateMutation.isPending}
              aria-invalid={Boolean(errors.email || error)}
              className="h-11"
            />
            {errors.email && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t(errors.email.message)}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="text-destructive text-xs font-medium">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="min-w-32">
              {updateMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


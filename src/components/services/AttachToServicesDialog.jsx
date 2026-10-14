import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Code2, Layers, Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ServiceAvatar } from '@/components/common/Avatar';
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
import { serviceKeys } from '@/hooks/useServices';
import { servicesApi } from '@/services';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/errors';

/**
 * Ajoute une technologie ou un développeur à une ou plusieurs applications.
 * Dans le backend, technologies et développeurs n'existent pas seuls : ce sont des
 * listes portées par chaque service. On met donc à jour chaque application choisie
 * (`PATCH /services/{id}` avec la liste complétée, en champs répétés).
 *
 * `kind` : 'technology' | 'developer'.
 */
const CONFIG = {
  technology: { field: 'techStack', icon: Layers, prefix: 'attach.technology' },
  developer: { field: 'developers', icon: Code2, prefix: 'attach.developer' },
};

export function AttachToServicesDialog({ kind, open, onOpenChange, services, suggestions = [] }) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const { icon: Icon, prefix } = CONFIG[kind];

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent closeLabel={t('common.close')} className="flex max-h-[90vh] max-w-lg flex-col">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <span className="bg-primary text-primary-foreground shadow-brand grid size-11 shrink-0 place-items-center rounded-xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <DialogTitle>{t(`${prefix}.title`)}</DialogTitle>
            <DialogDescription>{t(`${prefix}.description`)}</DialogDescription>
          </div>
        </DialogHeader>
        {open && (
          <AttachForm
            kind={kind}
            services={services}
            suggestions={suggestions}
            onSavingChange={setIsSaving}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AttachForm({ kind, services, suggestions, onSavingChange, onDone }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { field, prefix } = CONFIG[kind];

  const [value, setValue] = useState('');
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = value.trim();
  const has = (service) =>
    trimmed !== '' && service[field].some((item) => item.toLowerCase() === trimmed.toLowerCase());

  const visibleServices = useMemo(
    () =>
      services.filter((service) =>
        service.name.toLowerCase().includes(filter.trim().toLowerCase()),
      ),
    [services, filter],
  );

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trimmed) {
      setError(t('validation.required'));
      return;
    }
    const targets = services.filter((service) => selected.includes(service.id) && !has(service));
    if (targets.length === 0) {
      setError(t(`${prefix}.noTarget`));
      return;
    }

    setError(null);
    setIsSaving(true);
    onSavingChange(true);
    try {
      // Une mise à jour partielle par application : uniquement la liste concernée.
      for (const service of targets) {
        const formData = new FormData();
        [...service[field], trimmed].forEach((item) => formData.append(field, item));
        await servicesApi.update({ id: service.id, formData });
      }
      await queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success(t(`${prefix}.success`, { name: trimmed, count: targets.length }));
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
      await queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    } finally {
      setIsSaving(false);
      onSavingChange(false);
    }
  };

  const listId = `attach-${kind}-suggestions`;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1.5">
        <label htmlFor={`attach-${kind}-name`} className="text-sm font-medium">
          {t(`${prefix}.nameLabel`)} <span className="text-primary">*</span>
        </label>
        <Input
          id={`attach-${kind}-name`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder={t(`${prefix}.namePlaceholder`)}
          list={listId}
          autoComplete="off"
          autoFocus
          disabled={isSaving}
          className="h-11"
        />
        <datalist id={listId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {t(`${prefix}.servicesLabel`)} <span className="text-primary">*</span>
          </p>
          <span className="text-muted-foreground text-xs tabular-nums">
            {t('attach.selected', { count: selected.length })}
          </span>
        </div>
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t('attach.filter')}
            aria-label={t('attach.filter')}
            className="h-9 pl-9"
          />
        </div>
        <ul
          className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-lg border p-1"
          style={{ maxHeight: 280 }}
        >
          {visibleServices.map((service) => {
            const already = has(service);
            const checked = already || selected.includes(service.id);
            return (
              <li key={service.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={already || isSaving}
                  onClick={() => toggle(service.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden',
                    checked && !already ? 'bg-primary/10' : 'hover:bg-accent',
                    already && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-4 shrink-0 place-items-center rounded border',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input',
                    )}
                    aria-hidden="true"
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  <ServiceAvatar name={service.name} className="size-7 rounded-md text-[10px]" />
                  <span className="min-w-0 flex-1 truncate">{service.name}</span>
                  {already && (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {t('attach.already')}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={isSaving}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSaving} className="min-w-36">
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            t(`${prefix}.submit`)
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, FileStack, Info, Link2, Loader2, Pencil, Plus, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateService, useUpdateService } from '@/hooks/useServices';
import { FEATURES, toServiceFormData } from '@/services';
import { cn } from '@/utils/cn';
import { COMMON_TECHNOLOGIES, MAX_DOCUMENTS } from '@/utils/constants';
import { DEPARTMENTS } from '@/utils/departments';
import { getErrorMessage } from '@/utils/errors';
import { FileUploader } from './FileUploader';
import { TagInput } from './TagInput';
import { getServiceFormDefaults, serviceSchema } from './serviceSchema';

/**
 * Modal de création / édition d'un service.
 * `service` absent → création ; présent → édition.
 */
export function ServiceFormDialog({ open, onOpenChange, service, knownTechnologies = [] }) {
  const { t } = useTranslation();
  const isEdit = Boolean(service);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (next) => {
    if (!isSubmitting) onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        closeLabel={t('common.close')}
        className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => isSubmitting && event.preventDefault()}
        onEscapeKeyDown={(event) => isSubmitting && event.preventDefault()}
      >
        <DialogHeader className="flex-row items-center gap-4 space-y-0 border-b px-6 py-5">
          <span className="bg-primary text-primary-foreground shadow-brand grid size-11 shrink-0 place-items-center rounded-xl">
            {isEdit ? <Pencil className="size-5" /> : <Plus className="size-5" />}
          </span>
          <div className="min-w-0 space-y-1">
            <DialogTitle>
              {isEdit ? t('services.form.editTitle') : t('services.form.createTitle')}
            </DialogTitle>
            <DialogDescription className="truncate">
              {isEdit
                ? t('services.form.editDescription', { name: service.name })
                : t('services.form.createDescription')}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Monté uniquement à l'ouverture : l'état du formulaire repart de zéro à chaque fois. */}
        {open && (
          <ServiceForm
            key={service?.id ?? 'new'}
            service={service}
            knownTechnologies={knownTechnologies}
            onPendingChange={setIsSubmitting}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ServiceForm({ service, knownTechnologies, onPendingChange, onCancel, onSuccess }) {
  const { t } = useTranslation();
  const isEdit = Boolean(service);

  const [newFiles, setNewFiles] = useState([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: getServiceFormDefaults(service),
    mode: 'onTouched',
  });

  const mutationOptions = {
    onMutate: () => onPendingChange(true),
    onSettled: () => onPendingChange(false),
    onError: (error) => toast.error(getErrorMessage(error, t)),
  };

  const createMutation = useCreateService({
    ...mutationOptions,
    onSuccess: (created) => {
      toast.success(t('services.toast.created', { name: created.name }));
      onSuccess();
    },
  });

  const updateMutation = useUpdateService({
    ...mutationOptions,
    onSuccess: (updated) => {
      toast.success(t('services.toast.updated', { name: updated.name }));
      onSuccess();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const existingDocuments = useMemo(
    () => (service?.documents ?? []).filter((doc) => !removedDocumentIds.includes(doc.id)),
    [service, removedDocumentIds],
  );

  const techSuggestions = useMemo(
    () => [...new Set([...knownTechnologies, ...COMMON_TECHNOLOGIES])].sort(),
    [knownTechnologies],
  );

  const onSubmit = (values) => {
    // Garde-fou : la limite est déjà imposée par l'uploader.
    if (existingDocuments.length + newFiles.length > MAX_DOCUMENTS) {
      toast.error(t('upload.limitReached', { max: MAX_DOCUMENTS }));
      return;
    }

    const formData = toServiceFormData(values, {
      newFiles,
      removedDocumentIds,
      includeDepartment: FEATURES.departments,
    });

    if (isEdit) updateMutation.mutate({ id: service.id, formData });
    else createMutation.mutate(formData);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
        {/* Informations générales */}
        <FormSection icon={Info} title={t('services.form.sectionGeneral')}>
          <FormField
            id="service-name"
            label={t('services.fields.name')}
            required
            error={errors.name?.message}
          >
            {(aria) => (
              <Input
                {...aria}
                {...register('name')}
                placeholder={t('services.placeholders.name')}
                disabled={isPending}
                autoFocus
              />
            )}
          </FormField>

          {FEATURES.departments && (
            <FormField
              id="service-department"
              label={t('services.fields.department')}
              required
              error={errors.department?.message}
            >
              {(aria) => (
                <div className="relative">
                  <select
                    {...aria}
                    {...register('department')}
                    disabled={isPending}
                    className={cn(
                      'border-input bg-card flex h-9 w-full appearance-none rounded-lg border px-3 pr-9 text-sm shadow-xs transition-colors',
                      'hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-primary/10 focus-visible:ring-4 focus-visible:outline-hidden',
                      'aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                  >
                    <option value="" disabled>
                      {t('services.placeholders.department')}
                    </option>
                    {DEPARTMENTS.map(({ id }) => (
                      <option key={id} value={id}>
                        {t(`departments.${id}`)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
              )}
            </FormField>
          )}

          <FormField
            id="service-description"
            label={t('services.fields.description')}
            required
            error={errors.description?.message}
          >
            {(aria) => (
              <Textarea
                {...aria}
                {...register('description')}
                rows={3}
                placeholder={t('services.placeholders.description')}
                disabled={isPending}
              />
            )}
          </FormField>

          <FormField
            id="service-developers"
            label={t('services.fields.developers')}
            required
            hint={t('services.hints.developers')}
            error={errors.developers?.message}
          >
            {(aria) => (
              <Controller
                name="developers"
                control={control}
                render={({ field }) => (
                  <TagInput
                    {...aria}
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('services.placeholders.developers')}
                    disabled={isPending}
                  />
                )}
              />
            )}
          </FormField>

          <FormField
            id="service-tech"
            label={t('services.fields.techStack')}
            optional
            hint={t('services.hints.techStack')}
            error={errors.techStack?.message}
          >
            {(aria) => (
              <Controller
                name="techStack"
                control={control}
                render={({ field }) => (
                  <TagInput
                    {...aria}
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('services.placeholders.techStack')}
                    suggestions={techSuggestions}
                    variant="brand"
                    disabled={isPending}
                  />
                )}
              />
            )}
          </FormField>
        </FormSection>

        {/* Liens */}
        <FormSection icon={Link2} title={t('services.form.sectionLinks')}>
          <FormField
            id="service-github"
            label={t('services.fields.githubUrl')}
            optional
            error={errors.githubUrl?.message}
          >
            {(aria) => (
              <Input
                {...aria}
                {...register('githubUrl')}
                type="url"
                inputMode="url"
                placeholder="https://github.com/…"
                disabled={isPending}
              />
            )}
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="service-live"
              label={t('services.fields.liveUrl')}
              optional
              error={errors.liveUrl?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('liveUrl')}
                  type="url"
                  inputMode="url"
                  placeholder={t('services.placeholders.url')}
                  disabled={isPending}
                />
              )}
            </FormField>
            <FormField
              id="service-uat"
              label={t('services.fields.uatUrl')}
              optional
              error={errors.uatUrl?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('uatUrl')}
                  type="url"
                  inputMode="url"
                  placeholder={t('services.placeholders.url')}
                  disabled={isPending}
                />
              )}
            </FormField>
          </div>
        </FormSection>

        {/* Déploiement */}
        <FormSection icon={Rocket} title={t('services.form.sectionDeployment')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="service-first-deploy"
              label={t('services.fields.firstDeployment')}
              error={errors.firstDeploymentDate?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('firstDeploymentDate')}
                  type="date"
                  disabled={isPending}
                />
              )}
            </FormField>
            <FormField
              id="service-last-deploy"
              label={t('services.fields.lastDeployment')}
              error={errors.lastDeploymentDate?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('lastDeploymentDate')}
                  type="date"
                  disabled={isPending}
                />
              )}
            </FormField>
          </div>
        </FormSection>

        {/* Documents */}
        <FormSection icon={FileStack} title={t('services.form.sectionDocuments')}>
          <FileUploader
            existingDocuments={existingDocuments}
            onRemoveExisting={(id) => setRemovedDocumentIds((ids) => [...ids, id])}
            files={newFiles}
            onFilesChange={setNewFiles}
            disabled={isPending}
          />
        </FormSection>
      </div>

      <DialogFooter className="bg-muted/40 border-t px-6 py-4">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-36">
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              {t('common.saving')}
            </>
          ) : isEdit ? (
            t('services.form.submitEdit')
          ) : (
            t('services.form.submitCreate')
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-2.5 text-sm font-semibold">
        <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
        <span className="bg-border h-px flex-1" aria-hidden="true" />
      </h3>
      {children}
    </section>
  );
}

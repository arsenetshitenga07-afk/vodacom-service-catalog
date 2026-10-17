import { z } from 'zod';
import { FEATURES } from '@/services/apiConfig';
import { toDateInputValue } from '@/utils/format';

/** Les messages sont des clés i18n, traduites par <FormField>. */
const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || isHttpUrl(value), { message: 'validation.url' });

export const serviceSchema = z
  .object({
    name: z.string().trim().min(1, 'validation.required').max(120, 'validation.tooLong'),
    description: z.string().trim().min(1, 'validation.required').max(2000, 'validation.tooLong'),
    // Le département est obligatoire côté feature flag. La validation se fait
    // contre la liste du backend (source de vérité) — récupérée par `useServiceDepartmentsQuery`.
    // On ne vérifie plus contre `DEPARTMENT_IDS` (constante locale obsolète).
    department: FEATURES.departments
      ? z.string().trim().min(1, 'validation.required')
      : z.string().optional(),
    developers: z.array(z.string()).min(1, 'validation.developersRequired'),
    githubUrl: optionalUrl,
    liveUrl: optionalUrl,
    uatUrl: optionalUrl,
    firstDeploymentDate: z.string(),
    lastDeploymentDate: z.string(),
    techStack: z.array(z.string()),
  })
  .refine(
    ({ firstDeploymentDate, lastDeploymentDate }) =>
      !firstDeploymentDate || !lastDeploymentDate || lastDeploymentDate >= firstDeploymentDate,
    { path: ['lastDeploymentDate'], message: 'validation.dateOrder' },
  );

/** Valeurs initiales du formulaire, à partir d'un service existant ou à vide. */
export function getServiceFormDefaults(service) {
  return {
    name: service?.name ?? '',
    description: service?.description ?? '',
    department: service?.department ?? '',
    developers: service?.developers ?? [],
    githubUrl: service?.githubUrl ?? '',
    liveUrl: service?.liveUrl ?? '',
    uatUrl: service?.uatUrl ?? '',
    firstDeploymentDate: toDateInputValue(service?.firstDeploymentDate),
    lastDeploymentDate: toDateInputValue(service?.lastDeploymentDate),
    techStack: service?.techStack ?? [],
  };
}

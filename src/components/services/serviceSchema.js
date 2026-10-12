import { z } from 'zod';
import { FEATURES } from '@/services/apiConfig';
import { DEPARTMENT_IDS } from '@/utils/departments';
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
    // Obligatoire seulement si le backend gère les départements (FEATURES.departments).
    department: FEATURES.departments
      ? z.string().refine((value) => DEPARTMENT_IDS.includes(value), {
          message: 'validation.required',
        })
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

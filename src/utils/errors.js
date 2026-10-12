/**
 * Erreur API normalisée : tous les appels réseau rejettent avec cette classe,
 * quel que soit le format de réponse du backend.
 */
export class ApiError extends Error {
  constructor(
    message,
    { status = null, code = null, details = null, isNetworkError = false } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

/** Extrait un message lisible depuis les formats d'erreur courants (NestJS, Express, Laravel…). */
function extractServerMessage(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  const message = data.message ?? data.error?.message ?? data.error ?? data.detail;
  if (Array.isArray(message)) return message.join(' ');
  return typeof message === 'string' ? message : null;
}

/** Convertit une erreur Axios (ou autre) en ApiError. */
export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    const { status, data } = error.response;
    return new ApiError(extractServerMessage(data) ?? error.message, {
      status,
      code: data?.code ?? null,
      details: data?.errors ?? null,
    });
  }

  if (error?.request) {
    return new ApiError(error.message || 'Network Error', { isNetworkError: true });
  }

  return new ApiError(error?.message ?? 'Unknown error');
}

/** Message traduit à afficher à l'utilisateur pour une erreur donnée. */
export function getErrorMessage(error, t) {
  if (!error) return t('errors.generic');
  if (error.isNetworkError) return t('errors.network');
  if (error.status === 403) return t('errors.unauthorized');
  if (error.status === 404) return t('errors.notFound');
  if (error.status === 429) return t('errors.tooManyRequests');
  if (error.status >= 500) return t('errors.generic');
  return error.message || t('errors.generic');
}

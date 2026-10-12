/**
 * Statut d'un service, déduit de ses environnements :
 * - `live` : une URL de production est renseignée
 * - `uat`  : seulement une URL de recette (UAT)
 * - `none` : aucun environnement accessible
 */
export const SERVICE_STATUSES = /** @type {const} */ (['live', 'uat', 'none']);

export function getServiceStatus(service) {
  if (service.liveUrl) return 'live';
  if (service.uatUrl) return 'uat';
  return 'none';
}

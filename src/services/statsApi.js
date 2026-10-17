import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapDashboardStatsFromApi, unwrapEntity } from './mappers';

/**
 * Statistiques agrégées pour le dashboard (admin).
 * Une route unique — `GET /stats/dashboard` — renvoie counts, breakdowns par
 * département / rôle, et un compteur d'activité récente.
 */
export const statsApi = {
  /**
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<import('./mappers').DashboardStats>}
   */
  async dashboard({ signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.stats.dashboard, { signal });
    return mapDashboardStatsFromApi(unwrapEntity(data));
  },

  /**
   * Liste des départements acceptés par le backend (synchro avec l'admin).
   * @returns {Promise<string[]>}
   */
  async departments({ signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.serviceDepartments.list, { signal });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },
};

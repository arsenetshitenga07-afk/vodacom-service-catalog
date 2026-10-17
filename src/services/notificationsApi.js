import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapNotificationFromApi, unwrapCollection } from './mappers';

/**
 * Fil d'activité (notifications). Le backend alimente la table à chaque
 * create/update/delete sur services, users, developers, technologies.
 */
export const notificationsApi = {
  /**
   * @param {{ page?: number, limit?: number, signal?: AbortSignal }} [params]
   * @returns {Promise<{ data: import('./mappers').Notification[], meta: { total: number, page: number, limit: number, totalPages: number } }>}
   */
  async list({ page = 1, limit = 20, signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.notifications.list, {
      params: { page, limit },
      signal,
    });
    const payload = data ?? {};
    return {
      data: unwrapCollection(payload).map(mapNotificationFromApi),
      meta: payload.meta ?? { total: 0, page, limit, totalPages: 1 },
    };
  },
};

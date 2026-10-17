import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapUserFromApi, unwrapCollection, unwrapEntity } from './mappers';

/**
 * API Users — réservée au rôle `admin` côté backend.
 * Le `lastAdminCheck(payload)` côté frontend ne sert qu'à afficher un message
 * d'erreur plus tôt ; la vraie protection est dans le backend (erreur 409).
 *
 * @typedef {Object} UsersListParams
 * @property {number} [page]   1-based
 * @property {number} [limit]  max 100
 * @property {string} [search] pas supporté par le backend actuel — placeholder
 *
 * @typedef {{ data: import('./mappers').User[], meta: { total: number, page: number, limit: number, totalPages: number } }} UsersList
 */
export const usersApi = {
  /**
   * @param {UsersListParams & { signal?: AbortSignal }} [params]
   * @returns {Promise<UsersList>}
   */
  async list({ page = 1, limit = 20, signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.users.list, {
      params: { page, limit },
      signal,
    });
    const payload = data ?? {};
    return {
      data: unwrapCollection(payload).map(mapUserFromApi),
      meta: payload.meta ?? { total: 0, page, limit, totalPages: 1 },
    };
  },

  /** @param {string} id */
  async get(id) {
    const { data } = await httpClient.get(API_ENDPOINTS.users.detail(id));
    return mapUserFromApi(unwrapEntity(data));
  },

  /**
   * Crée un nouvel utilisateur (admin only). Génère automatiquement une entrée
   * dans le fil d'activité côté backend.
   * @param {{ name: string, email: string, password: string, role: 'admin' | 'user' }} payload
   */
  async create(payload) {
    const { data } = await httpClient.post(API_ENDPOINTS.users.create, payload);
    return mapUserFromApi(unwrapEntity(data));
  },

  /**
   * Modifie nom/email. Ne touche pas le rôle.
   * @param {{ id: string, name?: string, email?: string }} params
   */
  async update({ id, ...payload }) {
    const { data } = await httpClient.patch(API_ENDPOINTS.users.update(id), payload);
    return mapUserFromApi(unwrapEntity(data));
  },

  /**
   * Change le rôle (user → admin ou admin → user).
   * @param {{ id: string, role: 'admin' | 'user' }} params
   */
  async updateRole({ id, role }) {
    const { data } = await httpClient.patch(API_ENDPOINTS.users.updateRole(id), { role });
    return mapUserFromApi(unwrapEntity(data));
  },

  /** @param {string} id */
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.users.remove(id));
    return id;
  },
};

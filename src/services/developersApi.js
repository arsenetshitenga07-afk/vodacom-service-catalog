import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapDeveloperFromApi, unwrapCollection, unwrapEntity } from './mappers';

/**
 * API Developers — entités 1ʳᵉ classe côté backend. Avant, la liste était
 * dérivée côté client depuis les services ; maintenant on dispose d'un CRUD
 * complet (`/developers`).
 *
 * @typedef {Object} DeveloperPayload
 * @property {string} name
 * @property {string} [email]
 * @property {string} [role]
 * @property {string} [userId]
 */
export const developersApi = {
  /** @returns {Promise<import('./mappers').Developer[]>} */
  async list({ signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.developers.list, { signal });
    return unwrapCollection(data).map(mapDeveloperFromApi);
  },

  /** @param {string} id */
  async get(id) {
    const { data } = await httpClient.get(API_ENDPOINTS.developers.detail(id));
    return mapDeveloperFromApi(unwrapEntity(data));
  },

  /** @param {DeveloperPayload} payload */
  async create(payload) {
    const { data } = await httpClient.post(API_ENDPOINTS.developers.create, payload);
    return mapDeveloperFromApi(unwrapEntity(data));
  },

  /** @param {{ id: string } & DeveloperPayload} params */
  async update({ id, ...payload }) {
    const { data } = await httpClient.patch(API_ENDPOINTS.developers.update(id), payload);
    return mapDeveloperFromApi(unwrapEntity(data));
  },

  /** @param {string} id */
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.developers.remove(id));
    return id;
  },
};

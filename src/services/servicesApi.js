import { API_ENDPOINTS, SERVICES_PAGE_SIZE, UPDATE_METHOD } from './apiConfig';
import { httpClient } from './httpClient';
import { mapServiceFromApi, unwrapCollection, unwrapEntity } from './mappers';

export const servicesApi = {
  /**
   * Catalogue complet. `GET /services` est paginé ({ data, meta }) : on enchaîne
   * les pages jusqu'à `meta.totalPages` pour que la recherche et les filtres
   * côté client portent sur tous les services.
   * @returns {Promise<import('./mappers').Service[]>}
   */
  async list({ signal } = {}) {
    const all = [];
    let page = 1;
    let totalPages = 1;
    do {
      const { data } = await httpClient.get(API_ENDPOINTS.services.list, {
        params: { page, limit: SERVICES_PAGE_SIZE },
        signal,
      });
      all.push(...unwrapCollection(data));
      totalPages = Number(data?.meta?.totalPages) || 1;
      page += 1;
    } while (page <= totalPages);
    return all.map(mapServiceFromApi);
  },

  /** @param {string} id */
  async get(id) {
    const { data } = await httpClient.get(API_ENDPOINTS.services.detail(id));
    return mapServiceFromApi(unwrapEntity(data));
  },

  /** Liste unique des technologies utilisées. @returns {Promise<string[]>} */
  async technologies() {
    const { data } = await httpClient.get(API_ENDPOINTS.services.technologies);
    return Array.isArray(data) ? data : unwrapCollection(data);
  },

  /** @param {FormData} formData */
  async create(formData) {
    const { data } = await httpClient.post(API_ENDPOINTS.services.list, formData);
    return mapServiceFromApi(unwrapEntity(data));
  },

  /** @param {{ id: string, formData: FormData }} params */
  async update({ id, formData }) {
    const { data } = await httpClient[UPDATE_METHOD](API_ENDPOINTS.services.detail(id), formData);
    return mapServiceFromApi(unwrapEntity(data));
  },

  /** @param {string} id */
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.services.detail(id));
    return id;
  },
};

/** État du backend (`GET /health`). @returns {Promise<boolean>} */
export async function checkHealth() {
  try {
    const { data } = await httpClient.get(API_ENDPOINTS.health, { timeout: 5000 });
    return data?.status === 'ok';
  } catch {
    return false;
  }
}

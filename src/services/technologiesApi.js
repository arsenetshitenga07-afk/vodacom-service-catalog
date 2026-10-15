import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapTechnologyFromApi, unwrapCollection, unwrapEntity } from './mappers';

/**
 * API Technologies — entités 1ʳᵉ classe côté backend (depuis le déploiement
 * des nouveaux endpoints). Avant, la liste venait de `GET /services/technologies`
 * (dérivée des services) ; maintenant on a une vraie ressource CRUD.
 */
export const technologiesApi = {
  /** @returns {Promise<import('./mappers').Technology[]>} */
  async list({ signal } = {}) {
    const { data } = await httpClient.get(API_ENDPOINTS.technologies.list, { signal });
    return unwrapCollection(data).map(mapTechnologyFromApi);
  },

  /** @param {string} id */
  async get(id) {
    const { data } = await httpClient.get(API_ENDPOINTS.technologies.detail(id));
    return mapTechnologyFromApi(unwrapEntity(data));
  },

  /** @param {string} name */
  async create({ name }) {
    const { data } = await httpClient.post(API_ENDPOINTS.technologies.create, { name });
    return mapTechnologyFromApi(unwrapEntity(data));
  },

  /** @param {{ id: string, name: string }} params */
  async update({ id, name }) {
    const { data } = await httpClient.patch(API_ENDPOINTS.technologies.update(id), { name });
    return mapTechnologyFromApi(unwrapEntity(data));
  },

  /** @param {string} id */
  async remove(id) {
    await httpClient.delete(API_ENDPOINTS.technologies.remove(id));
    return id;
  },
};

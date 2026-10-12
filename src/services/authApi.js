import { ApiError } from '@/utils/errors';
import { API_ENDPOINTS } from './apiConfig';
import { httpClient } from './httpClient';
import { mapSessionFromApi, unwrapEntity } from './mappers';

export const authApi = {
  /** @returns {Promise<{ token: string, user: { id: string, name: string, email: string } | null }>} */
  async login({ email, password }) {
    const { data } = await httpClient.post(API_ENDPOINTS.auth.login, { email, password });
    const session = mapSessionFromApi(data);
    if (!session.token) {
      throw new ApiError('Missing access token in login response');
    }
    return { ...session, user: session.user ?? { id: '', name: '', email } };
  },

  /** Profil de l'utilisateur connecté (`GET /auth/me`). */
  async me() {
    const { data } = await httpClient.get(API_ENDPOINTS.auth.me);
    const user = unwrapEntity(data) ?? {};
    return {
      id: String(user.id ?? ''),
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role ?? null,
    };
  },

  /** Demande l'envoi d'un code de vérification à 4 chiffres par e-mail. */
  async sendCode({ email }) {
    await httpClient.post(API_ENDPOINTS.auth.sendCode, { email });
  },

  /** Vérifie le code reçu par e-mail et ouvre la session. */
  async verifyCode({ email, code }) {
    const { data } = await httpClient.post(API_ENDPOINTS.auth.verifyCode, { email, code });
    const session = mapSessionFromApi(data);
    if (!session.token) {
      throw new ApiError('Missing access token in verification response');
    }
    return { ...session, user: session.user ?? { id: '', name: '', email } };
  },

  /** Modifie le mot de passe de l'utilisateur connecté. */
  async changePassword({ currentPassword, newPassword }) {
    await httpClient.post(API_ENDPOINTS.auth.changePassword, { currentPassword, newPassword });
  },
};

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { normalizeApiError } from '@/utils/errors';
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS } from './apiConfig';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

// Ajoute le jeton d'accès à chaque requête.
httpClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise les erreurs et déconnecte l'utilisateur si la session a expiré.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 sur ces routes signifie « mot de passe incorrect », pas « session expirée ».
    const isLoginRequest = [
      API_ENDPOINTS.auth.login,
      API_ENDPOINTS.auth.changePassword,
      API_ENDPOINTS.auth.verifyCode,
    ].includes(error.config?.url);
    const { token, logout } = useAuthStore.getState();

    if (error.response?.status === 401 && token && !isLoginRequest) {
      logout('sessionExpired');
    }

    return Promise.reject(normalizeApiError(error));
  },
);

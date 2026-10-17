import { USE_MOCK_API } from './apiConfig';
import { authApi as realAuthApi } from './authApi';
import { developersApi as realDevelopersApi } from './developersApi';
import { notificationsApi as realNotificationsApi } from './notificationsApi';
import { servicesApi as realServicesApi } from './servicesApi';
import { statsApi as realStatsApi } from './statsApi';
import { technologiesApi as realTechnologiesApi } from './technologiesApi';
import { usersApi as realUsersApi } from './usersApi';
import { mockAuthApi, mockServicesApi, resetMockData } from './mock/mockApi';

/**
 * Point d'entrée unique des appels API.
 * Bascule automatiquement vers l'API simulée si VITE_USE_MOCK_API=true.
 */
export const authApi = USE_MOCK_API ? mockAuthApi : realAuthApi;
export const servicesApi = USE_MOCK_API ? mockServicesApi : realServicesApi;
export const technologiesApi = realTechnologiesApi;
export const developersApi = realDevelopersApi;
export const notificationsApi = realNotificationsApi;
export const statsApi = realStatsApi;
// usersApi n'est pas mocké — l'écran admin requiert le vrai backend.
export const usersApi = realUsersApi;

/** Réinitialisation des données de démo (mode simulé uniquement, sinon `null`). */
export const resetDemoData = USE_MOCK_API ? resetMockData : null;

export { API_BASE_URL, FEATURES, USE_MOCK_API } from './apiConfig';
export { checkHealth } from './servicesApi';
export { toServiceFormData } from './mappers';

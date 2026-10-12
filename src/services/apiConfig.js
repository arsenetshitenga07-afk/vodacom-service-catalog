/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTRAT API — point unique de configuration
 * ─────────────────────────────────────────────────────────────────────────
 *  Routes alignées sur `endpoints.json` (Portal Vodacom API v1.0.0, NestJS).
 *  Si une route change côté backend, c'est le seul fichier à modifier.
 *  Les noms de champs, eux, sont adaptés dans `mappers.js`.
 */

/**
 * Préfixe des appels. Par défaut `/api` : en développement, Vite redirige `/api`
 * vers le backend (voir `server.proxy` dans vite.config.js), ce qui évite tout
 * problème de CORS quel que soit le port du frontend.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const API_TIMEOUT_MS = 30_000;

/** Taille de page demandée à `GET /services` (maximum autorisé par le backend : 100). */
export const SERVICES_PAGE_SIZE = 100;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login', // POST { email, password } → { accessToken, user }
    me: '/auth/me', // GET → user
    // Hors contrat endpoints.json : actifs seulement si le backend les fournit (voir FEATURES).
    changePassword: '/auth/change-password', // POST { currentPassword, newPassword } → 204
    sendCode: '/auth/send-code', // POST { email } → 204 (code à 4 chiffres par e-mail)
    verifyCode: '/auth/verify-code', // POST { email, code } → { accessToken, user }
  },
  health: '/health', // GET → { status: 'ok' } | 503
  services: {
    list: '/services', // GET ?page&limit&search&tech → { data, meta } | POST (multipart) → Service
    technologies: '/services/technologies', // GET → string[]
    detail: (id) => `/services/${encodeURIComponent(id)}`, // GET | PATCH (multipart) | DELETE → 204
    document: (id, docId) =>
      `/services/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}`, // DELETE → 204
    downloadDocument: (id, docId) =>
      `/services/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}/download`, // GET → 302
  },
};

/** Méthode HTTP utilisée pour la mise à jour d'un service. */
export const UPDATE_METHOD = 'patch';

const flag = (name) => import.meta.env[name] === 'true';

/**
 * Fonctionnalités qui dépendent de routes absentes de `endpoints.json`.
 * Toujours actives en mode démo ; avec le vrai backend, activées via .env
 * uniquement quand le backend les fournit.
 */
export const FEATURES = {
  /** Connexion en deux étapes avec code envoyé par e-mail (/auth/send-code, /auth/verify-code). */
  otpLogin: USE_MOCK_API || flag('VITE_FEATURE_OTP_LOGIN'),
  /** Changement de mot de passe (/auth/change-password). */
  changePassword: USE_MOCK_API || flag('VITE_FEATURE_CHANGE_PASSWORD'),
  /** Champ « Département » sur les services (non prévu par le schéma `service`). */
  departments: USE_MOCK_API || flag('VITE_FEATURE_DEPARTMENTS'),
};

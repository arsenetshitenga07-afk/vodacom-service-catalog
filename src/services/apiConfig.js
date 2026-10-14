/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTRAT API — point unique de configuration
 * ─────────────────────────────────────────────────────────────────────────
 *  Routes alignées sur `endpoints.json` (Portal Vodacom API v1.0.0, NestJS).
 *  Si une route change côté backend, c'est le seul fichier à modifier.
 *  Les noms de champs, eux, sont adaptés dans `mappers.js`.
 */

/**
 * URL de base de l'API.
 *
 * - En production (Vercel) : on pointe vers le même domaine que le frontend
 *   (`/api/...`), où Vercel exécute les serverless functions. Pas de CORS,
 *   pas de préfixe supplémentaire.
 * - En développement local : on garde `/api` (relayé par le proxy Vite vers
 *   `VITE_API_PROXY_TARGET`, voir `vite.config.js`).
 *
 * Vite n'expose au code client QUE les variables d'environnement préfixées
 * par `VITE_`. Si vous voulez surcharger cette valeur, déclarez-la donc
 * sous le nom `VITE_API_BASE_URL` dans votre `.env` (le préfixe est imposé
 * par Vite, ce n'est pas un choix du projet).
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://catalogue-portail-interne-des-appli-iota.vercel.app/api'
).replace(/\/+$/, '');

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
    register: '/auth/register', // POST { name, email, password } → 201 { accessToken, user }
    requestPasswordReset: '/auth/forgot-password', // POST { email } → 204
    resetPassword: '/auth/reset-password', // POST { email, code, newPassword } → 204
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
  /** Inscription publique de compte (/auth/register). Réservé à un futur portail ouvert. */
  selfSignup: USE_MOCK_API || flag('VITE_FEATURE_SELF_SIGNUP'),
  /** Mot de passe oublié : envoi de code puis réinitialisation (/auth/forgot-password + /auth/reset-password). */
  passwordReset: USE_MOCK_API || flag('VITE_FEATURE_PASSWORD_RESET'),
};

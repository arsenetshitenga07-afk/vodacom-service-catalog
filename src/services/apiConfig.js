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
 * Ordre de résolution :
 *   1) `VITE_API_BASE_URL` (variable d'env Vercel ou `.env.local` en dev)
 *   2) URL Render codée en dur (repli : portail Vodacom NestJS déployé)
 *   3) `/api` (chemin relatif — proxy Vite en dev, ou API Vercel same-origin)
 *
 * ⚠️ Les endpoints déclarés plus bas (`API_ENDPOINTS.auth.login`, etc.) ne
 * contiennent PAS le préfixe `/api`. Si vous changez la valeur par défaut,
 * incluez `/api` à la fin, sinon les requêtes partiront vers `/auth/login`
 * au lieu de `/api/auth/login` → 404 sur Render.
 *
 * Le slash final est stripé automatiquement.
 */
const FALLBACK_API_BASE_URL = 'https://catalogue-portail-interne-des.onrender.com/api';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  FALLBACK_API_BASE_URL
).replace(/\/+$/, '');

// Mode démo : `true` par défaut en dev (offline, aucune dépendance),
// `false` en production (utilise l'API réelle). Override possible via
// `VITE_USE_MOCK_API=true|false` dans `.env` ou sur Vercel.
export const USE_MOCK_API = (() => {
  const flag = import.meta.env.VITE_USE_MOCK_API;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return import.meta.env.DEV;
})();

export const API_TIMEOUT_MS = 30_000;

/** Taille de page demandée à `GET /services` (maximum autorisé par le backend : 100). */
export const SERVICES_PAGE_SIZE = 100;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login', // POST { email, password } → { accessToken, user }
    me: '/auth/me', // GET → user
    // Hors contrat endpoints.json : actifs seulement si le backend les fournit (voir FEATURES).
    changePassword: '/auth/change-password', // POST { currentPassword, newPassword } → 204
    sendCode: '/auth/send-code', // POST { email } → { sent, devCode? } (204 en prod sans devCode)
    verifyCode: '/auth/verify-code', // POST { email, code } → { accessToken, user }
    register: '/auth/register', // POST { name, email, password } → 201 { accessToken, user }
    requestPasswordReset: '/auth/forgot-password', // POST { email } → 204 (ou { sent, devCode? } en mock)
    resetPassword: '/auth/reset-password', // POST { email, code, newPassword } → 204
  },
  health: '/health', // GET → { status: 'ok' } | 503
  services: {
    list: '/services', // GET ?page&limit&search&tech → { data, meta } | POST (multipart) → Service
    // Conservé pour rétro-compat : le backend expose désormais /technologies, mais
    // /services/technologies reste un raccourci. Voir technologiesApi ci-dessous.
    technologies: '/services/technologies', // GET → string[]
    detail: (id) => `/services/${encodeURIComponent(id)}`, // GET | PATCH (multipart) | DELETE → 204
    document: (id, docId) =>
      `/services/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}`, // DELETE → 204
    downloadDocument: (id, docId) =>
      `/services/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}/download`, // GET → 302
  },
  // Nouvelles ressources indépendantes (entités 1ʳᵉ classe côté backend).
  technologies: {
    list: '/technologies', // GET → Technology[] (trié par nom)
    detail: (id) => `/technologies/${encodeURIComponent(id)}`, // GET → Technology
    create: '/technologies', // POST { name } → 201 Technology (admin)
    update: (id) => `/technologies/${encodeURIComponent(id)}`, // PATCH { name } → Technology (admin)
    remove: (id) => `/technologies/${encodeURIComponent(id)}`, // DELETE → 204 (admin)
  },
  developers: {
    list: '/developers', // GET → Developer[] (trié par nom)
    detail: (id) => `/developers/${encodeURIComponent(id)}`, // GET → Developer
    create: '/developers', // POST { name, email?, role?, userId? } → 201 Developer (admin)
    update: (id) => `/developers/${encodeURIComponent(id)}`, // PATCH → Developer (admin)
    remove: (id) => `/developers/${encodeURIComponent(id)}`, // DELETE → 204 (admin)
  },
  // Gestion des utilisateurs — strictement admin. Le backend protège par rôle.
  users: {
    list: '/users', // GET ?page&limit → { data: User[], meta: { total, page, limit, totalPages } }
    detail: (id) => `/users/${encodeURIComponent(id)}`, // GET → User (sans hash)
    create: '/users', // POST { name, email, password, role } → 201 User (admin)
    update: (id) => `/users/${encodeURIComponent(id)}`, // PATCH { name?, email? } → User (admin)
    updateRole: (id) => `/users/${encodeURIComponent(id)}/role`, // PATCH { role: 'admin' | 'user' } → User (admin)
    remove: (id) => `/users/${encodeURIComponent(id)}`, // DELETE → 204 (admin)
  },
  // Fil d'activité : automatiquement alimenté par le backend à chaque
  // create/update/delete de service, developer, technology, user.
  notifications: {
    list: '/notifications', // GET ?page&limit → { data: Notification[], meta: {…} }
  },
  // Statistiques agrégées (admin). Une seule route, lisible par tout connecté.
  stats: {
    dashboard: '/stats/dashboard', // GET → { counts, servicesByDepartment, usersByRole, recentActivity }
  },
  // Liste des départements. Valeurs identiques au backend, à appeler pour rester synchro.
  serviceDepartments: {
    list: '/services/departments', // GET → string[]
  },
};

/** Méthode HTTP utilisée pour la mise à jour d'un service. */
export const UPDATE_METHOD = 'patch';

/**
 * Fonctionnalités qui dépendent de routes hors contrat `endpoints.json`.
 *
 * Résolution :
 *   - En mode démo (USE_MOCK_API=true) : toujours actives (le mock les supporte).
 *   - En mode prod (USE_MOCK_API=false) :
 *       * par défaut ACTIVES (le backend Render les fournit) ;
 *       * on peut forcer OFF en passant `VITE_FEATURE_X=false` côté Vercel.
 */
const isProd = !USE_MOCK_API;
const feature = (envName) => {
  if (USE_MOCK_API) return true;
  const v = import.meta.env[envName];
  if (v === 'true') return true;
  if (v === 'false') return false;
  return isProd; // prod → activé par défaut
};

export const FEATURES = {
  /** Connexion en deux étapes avec code envoyé par e-mail (/auth/send-code, /auth/verify-code). */
  otpLogin: feature('VITE_FEATURE_OTP_LOGIN'),
  /** Changement de mot de passe (/auth/change-password). */
  changePassword: feature('VITE_FEATURE_CHANGE_PASSWORD'),
  /** Champ « Département » sur les services (non prévu par le schéma `service`). */
  departments: feature('VITE_FEATURE_DEPARTMENTS'),
  /** Inscription publique de compte (/auth/register). */
  selfSignup: feature('VITE_FEATURE_SELF_SIGNUP'),
  /** Mot de passe oublié : envoi de code puis réinitialisation (/auth/forgot-password + /auth/reset-password). */
  passwordReset: feature('VITE_FEATURE_PASSWORD_RESET'),
};

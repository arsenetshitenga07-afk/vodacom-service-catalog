/**
 * Helper CORS partagé pour toutes les serverless functions `/api/*`.
 *
 * Pourquoi ce fichier existe :
 *   - Le navigateur envoie systématiquement une requête OPTIONS (pre-flight)
 *     avant toute requête cross-origin non triviale (POST/PATCH avec JSON,
 *     headers custom Authorization, etc.).
 *   - Si on ne répond pas 204 à OPTIONS, le navigateur bloque la vraie requête
 *     et l'utilisateur voit "CORS Missing Allow Origin" dans la console.
 *   - Si on ne renvoie pas Access-Control-Allow-Origin sur les réponses
 *     normales (200/201/4xx/5xx), le navigateur rejette aussi.
 *
 * Variables d'env lues :
 *   - CORS_ORIGINS : CSV des origines autorisées. Si vide, on autorise
 *     localhost:5173 (Vite dev) et localhost:3000 (NestJS local) en secours.
 *
 * Utilisation dans une function :
 *   import { withCors } from '../_lib/cors';
 *   export default withCors(async (req, res) => {
 *     if (req.method === 'POST') { ... }
 *   });
 */

// Origines autorisées. En production, configurez CORS_ORIGINS sur Vercel
// (Settings → Environment Variables) avec votre domaine frontend.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  // Repli : origines de dev (Vite + NestJS local). Surchargez en prod.
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000');
}

function resolveOrigin(requestOrigin) {
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  // Écho de la première origine whitelistée (Vercel et la plupart des
  // navigateurs acceptent une origine unique, pas `*`, quand on a des
  // headers credentials/Authorization).
  return ALLOWED_ORIGINS[0];
}

/** Renvoie les en-têtes CORS à appliquer à une réponse. */
export function corsHeadersFor(origin) {
  return {
    'Access-Control-Allow-Origin': resolveOrigin(origin),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/**
 * Wrapper qui ajoute automatiquement les en-têtes CORS à chaque réponse,
 * gère le pre-flight OPTIONS, puis délègue au handler métier.
 *
 *   export default withCors(async (req, res) => {
 *     if (req.method !== 'POST') {
 *       return res.status(405).json({ message: 'Method not allowed' });
 *     }
 *     return res.status(200).json({ ok: true });
 *   });
 */
export function withCors(handler, { methods = null } = {}) {
  return async function corsWrapped(req, res) {
    const origin = req.headers.origin || '';
    const headers = corsHeadersFor(origin);
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

    // 1) Pre-flight CORS : on accepte toutes les méthodes HTTP "safe" + celles
    //    explicitement listées par l'endpoint si fournies.
    if (req.method === 'OPTIONS') {
      if (methods) res.setHeader('Access-Control-Allow-Methods', methods);
      return res.status(204).end();
    }

    // 2) Si l'endpoint a déclaré ses méthodes, on rejette les autres.
    if (methods && !methods.split(',').map((m) => m.trim()).includes(req.method)) {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // 3) Délègue au handler métier. On attrape ses erreurs pour garantir
    //    que les headers CORS sont toujours présents (même sur 500).
    try {
      return await handler(req, res);
    } catch (err) {
      console.error(`[api] ${req.method} ${req.url} crashed:`, err);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      return undefined;
    }
  };
}

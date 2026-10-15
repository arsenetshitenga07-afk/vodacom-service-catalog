# Serverless functions (`/api`)

Ce dossier contient les fonctions serverless Vercel qui implémentent le contrat
`endpoints.json` à la racine du projet. Elles sont servies sous le même
domaine que le frontend (Vercel), donc **pas de CORS** côté navigateur.

## Endpoints disponibles

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion email + mot de passe |
| `GET`  | `/api/auth/me` | Profil de l'utilisateur courant |
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/change-password` | Changement de mot de passe (utilisateur connecté) |
| `POST` | `/api/auth/send-code` | Envoi d'un code à 4 chiffres par e-mail (2FA) |
| `POST` | `/api/auth/verify-code` | Vérification du code et ouverture de session |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation de mot de passe |
| `POST` | `/api/auth/reset-password` | Validation du code + nouveau mot de passe |
| `GET`  | `/api/health` | Health check (`{ status: 'ok' }`) |

Les endpoints `/api/services/*` ne sont pas fournis ici (placeholders). Le
frontend fonctionne en mode démo tant qu'ils ne sont pas branchés — voir
`VITE_USE_MOCK_API`.

## CORS

Toutes les functions utilisent le wrapper `withCors` (voir [`_lib/cors.js`](./_lib/cors.js)).
Ce wrapper :

1. Répond `204` aux requêtes `OPTIONS` (pre-flight CORS).
2. Ajoute les headers `Access-Control-Allow-*` à **toutes** les réponses.
3. Garantit que même les erreurs 500 renvoient les headers CORS.

### Origines autorisées

Configurez la variable d'environnement `CORS_ORIGINS` (CSV) sur Vercel :

```
CORS_ORIGINS=https://vodacom-service-catalog.vercel.app,http://localhost:5173,http://localhost:3000
```

Si la variable n'est pas définie, le helper autorise par défaut
`http://localhost:5173` et `http://localhost:3000` (utile en dev local).

## TODO : brancher la vraie logique métier

Chaque endpoint contient un placeholder qui renvoie une réponse cohérente
avec le contrat `endpoints.json`. **Avant la production**, remplacez chaque
`// TODO` par :

- La connexion à votre base de données (Postgres, MongoDB, etc.).
- Le hash des mots de passe (`bcrypt` ou `argon2`).
- La génération / validation des JWT (`jsonwebtoken`).
- L'envoi d'e-mails (`@sendgrid/mail`, `nodemailer`, etc.).
- L'upload de fichiers pour `/api/services` (multipart, Cloudinary, etc.).

## Test local

```bash
# Démarre Vite (frontend) + Vercel CLI (functions) en parallèle.
npx vercel dev
```

Ou testez une function isolée :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@vodacom.cd","password":"demo"}'
```

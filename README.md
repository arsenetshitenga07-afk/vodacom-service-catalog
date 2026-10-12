# Vodacom · Service Catalog — Frontend

Portail interne permettant de recenser, suivre et gérer l'ensemble des applications et services déployés au sein de Vodacom.

> **Légende :** ☑ fait · ☐ pas encore fait.
> Les points marqués **[Ajout]** vont au-delà du cahier des charges.

---

## Sommaire

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Comptes de démonstration](#2-comptes-de-démonstration)
3. [Conformité au cahier des charges](#3-conformité-au-cahier-des-charges)
4. [Fonctionnalités supplémentaires](#4-fonctionnalités-supplémentaires-ajout)
5. [Reste à faire / pistes d'amélioration](#5-reste-à-faire--pistes-damélioration)
6. [Connexion au backend](#6-connexion-au-backend)
7. [Structure du code](#7-structure-du-code)
8. [Historique des étapes réalisées](#8-historique-des-étapes-réalisées)

---

## 1. Démarrage rapide

Prérequis : **Node.js 20.19 ou plus récent**.

```bash
npm install
npm run dev        # serveur de développement → ouvrir l'adresse affichée dans le terminal
```

| Commande          | Rôle                                                      |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Serveur de développement (Vite)                           |
| `npm run build`   | Build de production dans `dist/`                          |
| `npm run preview` | Sert le build de production (le plus rapide pour une démo) |
| `npm run lint`    | Vérification ESLint                                       |
| `npm run format`  | Formatage Prettier                                        |

> Si le port 5173 est déjà occupé, Vite prend le suivant (5174, 5175…). Ouvrez toujours **l'adresse exacte affichée dans le terminal**.

---

## 2. Comptes de démonstration

Par défaut, l'application fonctionne avec une **API simulée** (`VITE_USE_MOCK_API=true` dans `.env`). Aucun backend n'est nécessaire, et les données sont conservées dans le navigateur.

Connexion avec **n'importe quel e-mail et mot de passe** (ex. `jean.mukendi@vodacom.cd`). Le catalogue de démonstration contient 12 applications.

---

## 3. Conformité au cahier des charges

### 3.1 Stack technique (section 2)

- [x] JavaScript ES6+
- [x] ReactJS avec Vite
- [x] `@tanstack/react-query` pour les données serveur et le cache
- [x] Zustand pour la session, la langue et le thème (`src/store/authStore.js`, `src/store/appStore.js`)
- [x] TailwindCSS (version 4)
- [x] shadcn/ui (Radix UI + Tailwind) : Button, Dialog, AlertDialog, DropdownMenu, Input, Label, Badge, Card, Skeleton, Sheet, Toaster
- [x] i18next / react-i18next
- [x] Gestion du thème clair / sombre
- [x] Sécurité des dépendances : `npm audit` → **0 vulnérabilité** (migration de Tailwind 3 vers Tailwind 4, qui n'utilise plus les paquets `braces` / `postcss-selector-parser` signalés)

### 3.2 Charte graphique Vodacom (section 3)

- [x] Rouge de marque **#E60000** sur les boutons d'action, accents, états actifs et badges clés
- [x] Mode clair : fond **#FFFFFF / #F8F9FA**, textes **#111111 / #333333**
- [x] Mode clair : cartes blanches, bordures **#E5E7EB**, ombres minimalistes (`shadow-sm`)
- [x] Mode sombre : fond **#0F0F12 / #18181B**, cartes **#27272A**, textes **#FAFAFA / #A1A1AA**
- [x] Direction artistique épurée et professionnelle
- [x] Logo officiel Vodacom (`src/assets/vodacom-logo.png`) et favicon

> Les valeurs sont centralisées et commentées dans `src/index.css`. Les bordures du mode sombre (non précisées dans le cahier) utilisent **#3F3F46**, de la même famille de gris (zinc) que #18181B et #27272A.

### 3.3 Internationalisation (section 4.1)

- [x] Anglais par défaut (`en`)
- [x] Français (`fr`)
- [x] Sélecteur discret EN / FR dans le header, bascule instantanée
- [x] Langue sauvegardée (Zustand + localStorage)
- [x] Aucun texte en dur : même les libellés lus par les lecteurs d'écran (chargement des pages, écran de démarrage) suivent la langue choisie

### 3.4 Mode sombre (section 4.2)

- [x] Suit la préférence système par défaut
- [x] Bouton Soleil / Lune dans le header
- [x] Préférence sauvegardée
- [x] Pas de flash clair → sombre au chargement (script dans `index.html`)
- [x] Rendu vérifié dans les deux modes (variables CSS shadcn + classes `dark:` de Tailwind)

> **Comment le mode sombre est appliqué :** le cahier demande « l'utilisation systématique des classes préfixées `dark:` de Tailwind ». Le projet utilise la méthode officielle de **shadcn/ui**, qui repose sur ce même mécanisme `dark:` de Tailwind (`darkMode: ['class']` dans `tailwind.config.js`) :
>
> 1. **Couleurs de la charte → variables CSS.** Les couleurs du cahier sont déclarées deux fois dans `src/index.css` : une fois pour le mode clair (`:root`) et une fois pour le mode sombre (`.dark`). Exemple : `--card` vaut #FFFFFF en clair et #27272A en sombre.
> 2. **Composants → classes sémantiques.** Les composants utilisent `bg-card`, `text-foreground`, `border-border`… qui changent automatiquement de valeur quand la classe `dark` est posée sur `<html>`. Écrire `bg-white dark:bg-[#27272A]` sur chaque élément serait équivalent, mais répété des centaines de fois.
> 3. **Cas particuliers → classes `dark:` explicites.** Quand un élément doit se comporter différemment en sombre, on utilise directement `dark:` (ex. `dark:bg-[#18181B]` pour le header et le pied de page, `dark:bg-card` pour le bandeau d'accueil, `dark:text-red-300` pour les badges).
>
> Résultat : une seule source de vérité pour les couleurs du cahier, aucun oubli possible entre clair et sombre, et des classes `dark:` partout où un comportement spécifique est nécessaire.

### 3.5 Données d'un service (section 5)

- [x] 1. Nom de l'application (obligatoire)
- [x] 2. Description (obligatoire)
- [x] 3. Développeurs associés, saisis en puces (obligatoire, au moins un)
- [x] 4. Lien GitHub (URL optionnelle, validée)
- [x] 5. Lien Live / Production (URL optionnelle, validée)
- [x] 6. Lien UAT / Staging (URL optionnelle, validée)
- [x] 7. Date du premier déploiement
- [x] 8. Date du dernier déploiement (refusée si antérieure à la première)
- [x] 9. Stack technique en tags / badges, avec suggestions (React, NestJS, Docker…)
- [x] 10. Documents joints (PDF, Office, images, diagrammes `.drawio` / `.vsdx`…)
- [x] **Limite stricte de 4 documents** par service, contrôlée côté client

### 3.6 Page de connexion (section 6.1)

- [x] Authentification par e-mail et mot de passe, avec validation des champs
- [x] Design aux couleurs de la marque
- [x] Erreurs affichées par des toasts (Sonner, le composant toast recommandé par shadcn/ui)
- [x] Message en cas de session expirée et à la déconnexion
- [x] Afficher / masquer le mot de passe
- [x] **[Ajout] Vérification en deux étapes** : après e-mail + mot de passe, un code à 4 chiffres est envoyé par e-mail. Un second écran affiche le compte identifié (nom, e-mail) et 4 cases pour saisir le code (passage automatique d'une case à l'autre, collage du code, validation au 4ᵉ chiffre). La session n'est ouverte qu'après vérification du code. Code valable 5 min, renvoi possible après 30 s, lien « Changer de compte ». En mode démo, le code est affiché à l'écran (aucun e-mail réel).

### 3.7 Tableau de bord / Catalogue (section 6.2)

- [x] Header : logo Vodacom, sélecteur EN / FR, bouton Dark / Light, menu utilisateur
- [x] Recherche textuelle instantanée (nom, description, développeurs, technologies ; insensible aux accents)
- [x] Filtre par technologie (sélection multiple)
- [x] Bouton **« Add Service »** rouge Vodacom dans la barre d'outils
- [x] Vue en **grille de cartes**
- [x] Vue en **tableau** épuré
- [x] Bascule grille / tableau mémorisée
- [x] Toutes les métadonnées, les liens rapides et les documents affichés

### 3.8 Formulaire d'ajout / édition (section 6.3)

- [x] Modal fluide, sections claires (informations, liens, déploiement, documents)
- [x] Zone d'upload par **glisser-déposer**, ou bouton « parcourir »
- [x] Contrôle strict : impossible de dépasser 4 documents (jauge 0/4, fichiers en trop refusés)
- [x] Contrôle du type et de la taille des fichiers (10 Mo maximum), détection des doublons
- [x] Envoi au format **FormData** via une mutation React Query
- [x] Édition : suppression de documents existants et ajout de nouveaux
- [x] Confirmation avant suppression d'un service
- [ ] Confirmation « Abandonner les modifications ? » en fermant un formulaire modifié (textes déjà traduits, logique à brancher)

### 3.9 Organisation du code (section 7)

- [x] `src/assets/` : logo, motif de la page de connexion
- [x] `src/components/ui/` : composants shadcn
- [x] `src/components/layout/` : Header, navigation, ThemeToggle, LanguageSwitcher
- [x] `src/components/services/` : ServiceCard, ServiceForm, FileUploader…
- [x] `src/hooks/` : `useAuth`, `useServices`
- [x] `src/i18n/` : configuration, `en.json`, `fr.json`
- [x] `src/store/` : `authStore`, `appStore`
- [x] `src/services/` : appels API (Axios + React Query)
- [x] `src/utils/` : fonctions utilitaires

---

## 4. Fonctionnalités supplémentaires [Ajout]

Ces éléments ne figurent pas dans le cahier des charges. Ils améliorent le confort d'utilisation sans modifier le fonctionnement demandé.

- [x] Statut d'environnement sur chaque service (En production / UAT uniquement / Non déployé)
- [x] **Barre latérale de navigation** (menu mobile sous 1024 px) avec compteurs et bouton « Ajouter un service » :
  - **Tableau de bord** : bandeau, graphiques, derniers déploiements ;
  - **Applications** : catalogue complet (recherche, filtres, ajout / édition / suppression) ;
  - **Technologies** : chaque technologie, sa part du catalogue et ses applications ;
  - **Développeurs** : chaque développeur, ses applications et ses technologies.
  Tout est relié : « Voir ces applications » ouvre la page Applications déjà filtrée (`/applications?tech=React`, `/applications?developer=Nom`).
- [x] **Bouton ☰** pour masquer / afficher la barre latérale (choix mémorisé) ; barre latérale sur toute la hauteur de l'écran.
- [x] **Paramètres** (`/settings`, en bas de la barre latérale) : profil ; apparence (thème, langue, affichage par défaut, barre latérale) ; sécurité (changer le mot de passe, délai de verrouillage automatique de 1 à 30 min ou jamais, verrouiller maintenant) ; données (version, source des données, adresse de l'API, réinitialisation des données de démo) ; déconnexion.
- [x] **Département de rattachement** sur chaque service (10 départements Vodacom : Technologie & SI, Réseau, Commercial & Marketing, Service Client, M-Pesa, Vodacom Business, Finance, RH, Juridique, Supply Chain) : champ obligatoire du formulaire, affiché sur les cartes et dans une colonne du tableau.
- [x] **Écran de verrouillage** : la session se verrouille après 5 minutes d'inactivité (ou via « Verrouiller la session » dans le menu utilisateur). Le mot de passe est revérifié auprès de l'API ; après 5 échecs, l'utilisateur est déconnecté. Le verrouillage résiste au rechargement de la page.
- [x] **Changement de mot de passe** (menu utilisateur) : mot de passe actuel, nouveau mot de passe avec exigences affichées en direct (8 caractères, une lettre, un chiffre) et confirmation.
- [x] **Graphiques du tableau de bord** (calculés à partir des données réelles du catalogue) :
  - bandeau : chiffres clés (applications, en production, déployées sur 30 jours) et courbe des déploiements sur 12 mois ;
  - déploiements par mois (courbe avec aire) ;
  - technologies les plus utilisées (colonnes verticales, top 5) ;
  - répartition par environnement (anneau avec légende, valeurs et pourcentages).
  Couleurs vérifiées pour le daltonisme et le contraste en clair et en sombre ; info-bulles au survol ; tableau des valeurs pour les lecteurs d'écran.
- [x] Dates relatives (« il y a 5 jours »)
- [x] Bandeau d'accueil avec salutation personnalisée
- [x] Page de connexion avec un motif de logos Vodacom en filigrane
- [x] Écran de chargement aux couleurs Vodacom (plus de page blanche)
- [x] Squelettes de chargement, états vides et messages d'erreur avec bouton « Réessayer »
- [x] Page 404 personnalisée
- [x] Responsive (mobile, tablette, desktop)
- [x] Accessibilité : libellés ARIA, navigation au clavier, focus visibles
- [x] API simulée complète, avec 12 applications de démonstration

### Ajouts retirés

Pour rester au plus près du cahier des charges, les éléments suivants ont été développés puis **retirés** :

- Rôles administrateur / collaborateur et espace `/admin` réservé
- Organisation par département (accueil par département, pages de département, champ « Département »)
- Indicateurs clés (tuiles de statistiques) et onglets de filtre par statut
- Fiche détaillée d'un service dans un panneau latéral

---

## 5. Reste à faire / pistes d'amélioration

### 5.1 À finaliser

- [ ] Confirmation « Abandonner les modifications ? » à la fermeture d'un formulaire modifié
- [ ] Tests avec le **vrai backend** (`VITE_USE_MOCK_API=false`) : routes, format des réponses, upload multipart

### 5.2 Pistes d'amélioration

- [ ] Tests automatisés (Vitest + React Testing Library)
- [ ] Tri des colonnes du tableau
- [ ] Pagination ou recherche côté serveur pour un catalogue très volumineux
- [ ] Barre de progression pendant l'upload des documents
- [ ] Aperçu des documents (PDF, images) sans les télécharger
- [ ] Rôles (administrateur / lecture seule) et organisation des applications par département
- [ ] Fiche détaillée d'un service et indicateurs clés
- [ ] Historique des modifications (qui a modifié quoi, et quand)
- [ ] Export du catalogue (CSV / Excel)
- [ ] Connexion unique (SSO / Azure AD) et « mot de passe oublié »
- [ ] Conteneurisation (Dockerfile) et pipeline CI / CD

---

## 6. Connexion au backend

Le frontend est aligné sur le contrat **`endpoints.json`** (Portal Vodacom API v1.0.0, NestJS), présent à la racine du projet.

### 6.1 Passer du mode démo au vrai backend

1. Démarrer le backend (par défaut sur `http://localhost:3000`, préfixe `/api`).
2. Dans `.env` :

   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=/api
   VITE_API_PROXY_TARGET=http://localhost:3000
   ```

3. Relancer `npm run dev`.

En développement, Vite relaie les appels `/api` vers `VITE_API_PROXY_TARGET` (`server.proxy` dans `vite.config.js`), ce qui évite tout problème de **CORS**, quel que soit le port du frontend. En production, `VITE_API_BASE_URL` doit contenir l'URL complète (ex. `https://portal.vodacom.com/api`).

### 6.2 Routes utilisées

| Méthode | Route | Utilisation dans le frontend |
| ------- | ----- | ---------------------------- |
| POST | `/auth/login` | Connexion → `{ accessToken, user: { id, email, name, role } }` |
| GET | `/auth/me` | Profil et rôle rechargés à l'ouverture de l'application |
| GET | `/health` | État de l'API affiché dans **Paramètres** |
| GET | `/services?page&limit` | Catalogue : toutes les pages sont chargées (`limit=100`), puis recherche et filtres côté client |
| POST | `/services` | Création (multipart) |
| PATCH | `/services/{id}` | Modification (multipart) |
| DELETE | `/services/{id}` | Suppression (204) |

Les routes `/services/technologies`, `/services/{id}`, `/services/{id}/documents/{docId}` et `.../download` sont déclarées dans `src/services/apiConfig.js` pour un usage futur.

### 6.3 Format des données

- **Lecture** (`src/services/mappers.js`) : `firstDeployedAt` / `lastDeployedAt`, `documents[].originalName` / `cloudinaryUrl`, réponses paginées `{ data, meta }`.
- **Envoi** (FormData) : `name`, `description`, `developers` et `techStack` en **champs répétés**, `githubUrl`, `liveUrl`, `uatUrl`, `firstDeployedAt`, `lastDeployedAt` en date-time ISO (champs vides non envoyés), `documents` (fichiers, 4 maximum), et en édition `removeDocumentIds` (répété).
- **Erreurs** : format `{ statusCode, message }` (message texte ou liste), 401 → déconnexion (session expirée), 403 → « action non autorisée », 429 → « trop de tentatives ».

### 6.4 Rôles

Le rôle vient de `user.role` (`admin` | `user`). Comme le backend réserve création, modification et suppression aux administrateurs, ces boutons sont **masqués pour le rôle `user`**, qui consulte le catalogue en lecture seule.

### 6.5 Fonctionnalités hors contrat

Ces fonctionnalités n'existent pas dans `endpoints.json`. Elles sont actives en mode démo et **désactivées automatiquement** avec le vrai backend, jusqu'à ce qu'il les fournisse (variables dans `.env`) :

| Variable | Routes attendues | Effet si `false` |
| -------- | ---------------- | ---------------- |
| `VITE_FEATURE_OTP_LOGIN` | `POST /auth/send-code`, `POST /auth/verify-code` | Connexion en une seule étape |
| `VITE_FEATURE_CHANGE_PASSWORD` | `POST /auth/change-password` | Option « Changer le mot de passe » masquée |
| `VITE_FEATURE_DEPARTMENTS` | champ `department` sur les services | Champ « Département » masqué |

L'intégration a été vérifiée avec un serveur de test conforme à `endpoints.json` : connexion (erreur 401 et succès), rôle `admin` / `user`, pagination sur 2 pages, création multipart, état de l'API.

---

## 7. Structure du code

```
src/
├── assets/                 # Logo Vodacom, motif de la page de connexion
├── components/
│   ├── common/             # Avatar, EmptyState, FormField, PageLoader, RouteGuards
│   ├── layout/             # AppLayout, Header, Logo, PageHero, ThemeToggle, LanguageSwitcher, UserMenu
│   ├── services/           # ServiceCard, ServiceTable, ServiceFormDialog, ServicesToolbar,
│   │                       # FileUploader, TagInput, DeleteServiceDialog…
│   └── ui/                 # Composants shadcn/ui
├── hooks/                  # useAuth, useServices, useTheme, useDebouncedValue
├── i18n/                   # index.js, en.json, fr.json
├── pages/                  # LoginPage, DashboardPage, ApplicationsPage, TechnologiesPage, DevelopersPage, NotFoundPage
├── services/               # apiConfig, httpClient, authApi, servicesApi, mappers, mock/
├── store/                  # authStore, appStore (Zustand)
└── utils/                  # constants, filterServices, format, serviceStatus, errors
```

| Route           | Accès    | Contenu                                                        |
| --------------- | -------- | -------------------------------------------------------------- |
| `/login`        | Public   | Connexion                                                      |
| `/`             | Connecté | Tableau de bord : chiffres clés, graphiques, derniers déploiements |
| `/applications` | Connecté | Catalogue : recherche, filtres (`?tech=`, `?developer=`), ajout / édition / suppression |
| `/technologies` | Connecté | Technologies et applications qui les utilisent                 |
| `/developers`   | Connecté | Développeurs, leurs applications et technologies               |
| `/settings`     | Connecté | Paramètres : profil, apparence, sécurité, données, session     |

---

## 8. Historique des étapes réalisées

- [x] **Étape 1 : correction du démarrage.** L'import `./logoData` vers un fichier inexistant empêchait la compilation.
- [x] **Étape 2 : refonte visuelle.** Design system Vodacom, header, page de connexion, cartes, tableau, formulaires, mode sombre, mobile.
- [x] **Étape 3 : nouveaux composants.** Avatars, dates relatives, statut d'environnement.
- [x] **Étape 4 : logo officiel.** Détourage du logo fourni, favicon, logos dans `src/assets/`.
- [x] **Étape 5 : alignement sur le cahier des charges.** Couleurs exactes, anglais par défaut, bouton « Add Service » dans la barre d'outils, cartes affichant toutes les métadonnées et les documents.
- [x] **Étape 6 : page de connexion.** Motif de logos Vodacom en filigrane, textes allégés.
- [x] **Étape 7 : chargement.** Écran de chargement Vodacom, police non bloquante, pré-compilation des pages par Vite.
- [x] **Étape 8 : documentation.** Ce README.
- [x] **Étape 9 : retour au périmètre du cahier.** Retrait des rôles, des départements, des indicateurs, du filtre par statut et de la fiche détaillée ; un seul tableau de bord sur `/`.
- [x] **Étape 10 : sécurité.** Migration vers Tailwind 4 (outil officiel `@tailwindcss/upgrade`) ; `npm audit` passe de 7 vulnérabilités à 0.
- [x] **Étape 11 : graphiques.** Bandeau avec chiffres clés et tendance, trois graphiques de synthèse du catalogue.
- [ ] **Étape 12 :** finaliser les points de la section 5.1.

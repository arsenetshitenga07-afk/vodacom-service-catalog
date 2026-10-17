/**
 * ─────────────────────────────────────────────────────────────────────────
 *  ADAPTATEURS DE DONNÉES (backend ⇄ frontend)
 * ─────────────────────────────────────────────────────────────────────────
 *  Les composants manipulent uniquement le modèle `Service` défini ci-dessous.
 *  Si le backend nomme ses champs autrement (snake_case, _id, etc.), on
 *  l'adapte ici, sans toucher aux composants.
 *
 *  @typedef {Object} ServiceDocument
 *  @property {string} id
 *  @property {string} name
 *  @property {string|null} url
 *  @property {number|null} size
 *  @property {string} mimeType
 *
 *  @typedef {Object} Service
 *  @property {string} id
 *  @property {string} name
 *  @property {string} description
 *  @property {string} department   Identifiant du département (voir utils/departments.js)
 *  @property {string[]} developers
 *  @property {string} githubUrl
 *  @property {string} liveUrl
 *  @property {string} uatUrl
 *  @property {string|null} firstDeploymentDate
 *  @property {string|null} lastDeploymentDate
 *  @property {string[]} techStack
 *  @property {ServiceDocument[]} documents
 *  @property {string|null} updatedAt
 */

const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      /* chaîne séparée par des virgules */
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

/** Certains backends enveloppent la réponse : { data: … } ou { items: … }. */
export const unwrapEntity = (payload) => payload?.data ?? payload;
export const unwrapCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  const inner = payload?.data ?? payload?.items ?? payload?.results;
  return Array.isArray(inner) ? inner : [];
};

/** @returns {ServiceDocument} */
export function mapDocumentFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id ?? raw.filename ?? raw.url),
    name: raw.originalName ?? raw.original_name ?? raw.name ?? raw.filename ?? 'document',
    url: raw.cloudinaryUrl ?? raw.url ?? raw.path ?? null,
    size: raw.size ?? null,
    mimeType: raw.mimeType ?? raw.mimetype ?? raw.mime_type ?? '',
  };
}

/** @returns {Service} */
export function mapServiceFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id),
    name: raw.name ?? '',
    description: raw.description ?? '',
    department: raw.department ?? raw.departmentId ?? raw.department_id ?? '',
    developers: toStringArray(raw.developers),
    githubUrl: raw.githubUrl ?? raw.github_url ?? '',
    liveUrl: raw.liveUrl ?? raw.live_url ?? '',
    uatUrl: raw.uatUrl ?? raw.uat_url ?? '',
    // Backend : firstDeployedAt / lastDeployedAt (date-time ISO).
    firstDeploymentDate:
      raw.firstDeployedAt ?? raw.firstDeploymentDate ?? raw.first_deployment_date ?? null,
    lastDeploymentDate:
      raw.lastDeployedAt ?? raw.lastDeploymentDate ?? raw.last_deployment_date ?? null,
    techStack: toStringArray(raw.techStack ?? raw.tech_stack),
    documents: (raw.documents ?? []).map(mapDocumentFromApi),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  };
}

/** Réponse de connexion → { token, user }. */
export function mapSessionFromApi(raw) {
  const payload = unwrapEntity(raw) ?? {};
  const user = payload.user ?? null;
  return {
    token: payload.accessToken ?? payload.access_token ?? payload.token ?? null,
    user: user && {
      id: String(user.id ?? user._id ?? ''),
      name: user.name ?? user.fullName ?? user.username ?? '',
      email: user.email ?? '',
      role: user.role ?? null, // 'admin' | 'user' (endpoints.json)
    },
  };
}

/**
 * @typedef {Object} Technology
 * @property {string} id
 * @property {string} name
 * @property {string} [createdAt]
 */

/** Backend Technology → Technology. */
export function mapTechnologyFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? '').trim(),
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

/**
 * @typedef {Object} Developer
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string|null} userId
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/** Backend Developer → Developer. */
export function mapDeveloperFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? '').trim(),
    email: String(raw.email ?? '').trim(),
    role: String(raw.role ?? '').trim(),
    userId: raw.userId ?? raw.user_id ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  };
}

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'admin' | 'user' | null} role
 * @property {string} [createdAt]
 */

/** Backend User → User. Le hash du mot de passe n'est jamais renvoyé. */
export function mapUserFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    email: String(raw.email ?? '').trim(),
    name: String(raw.name ?? '').trim(),
    role: raw.role ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} actorId
 * @property {string} actorName
 * @property {'create' | 'update' | 'delete'} action
 * @property {'service' | 'user' | 'developer' | 'technology'} targetType
 * @property {string} targetId
 * @property {string} targetLabel
 * @property {string} createdAt
 */

/** Backend Notification → Notification. */
export function mapNotificationFromApi(raw) {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    actorId: String(raw.actorId ?? raw.actor_id ?? ''),
    actorName: String(raw.actorName ?? raw.actor_name ?? 'Quelqu’un').trim(),
    action: raw.action ?? 'create',
    targetType: raw.targetType ?? raw.target_type ?? 'service',
    targetId: String(raw.targetId ?? raw.target_id ?? ''),
    targetLabel: String(raw.targetLabel ?? raw.target_label ?? '').trim(),
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

/**
 * @typedef {Object} DashboardStats
 * @property {{ services: number, users: number, developers: number, technologies: number, documents: number }} counts
 * @property {Record<string, number>} servicesByDepartment
 * @property {Record<'admin' | 'user', number>} usersByRole
 * @property {number} recentActivity
 */

/** Backend Stats → DashboardStats. */
export function mapDashboardStatsFromApi(raw) {
  const counts = raw?.counts ?? {};
  const byDept = raw?.servicesByDepartment ?? raw?.services_by_department ?? {};
  const byRole = raw?.usersByRole ?? raw?.users_by_role ?? {};
  return {
    counts: {
      services: Number(counts.services ?? 0),
      users: Number(counts.users ?? 0),
      developers: Number(counts.developers ?? 0),
      technologies: Number(counts.technologies ?? 0),
      documents: Number(counts.documents ?? 0),
    },
    servicesByDepartment: Object.fromEntries(
      Object.entries(byDept).map(([k, v]) => [String(k), Number(v) || 0]),
    ),
    usersByRole: Object.fromEntries(
      Object.entries(byRole).map(([k, v]) => [String(k), Number(v) || 0]),
    ),
    recentActivity: Number(raw?.recentActivity ?? raw?.recent_activity ?? 0),
  };
}

/**
 * Construit le FormData envoyé à la création / mise à jour, au format de
 * `POST /services` et `PATCH /services/{id}` (voir endpoints.json) :
 * - `developers` et `techStack` : champ répété (une valeur par entrée) ;
 * - `firstDeployedAt` / `lastDeployedAt` : date-time ISO ;
 * - champs optionnels vides : non envoyés ;
 * - nouveaux fichiers : clé `documents` (répétée, 4 maximum) ;
 * - en édition, `removeDocumentIds` : UUID des documents à supprimer (répété).
 * `department` n'est envoyé que si le backend le gère (FEATURES.departments).
 */

/** « YYYY-MM-DD » (champ date) → date-time ISO attendue par le backend. */
const toIsoDateTime = (value) => {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00.000Z` : trimmed;
};
export function toServiceFormData(
  values,
  { newFiles = [], removedDocumentIds = [], includeDepartment = false } = {},
) {
  const formData = new FormData();
  const appendIfFilled = (key, value) => {
    if (value) formData.append(key, value);
  };

  formData.append('name', values.name.trim());
  formData.append('description', values.description.trim());
  if (includeDepartment) appendIfFilled('department', values.department);
  values.developers.forEach((developer) => formData.append('developers', developer));
  values.techStack.forEach((tech) => formData.append('techStack', tech));

  appendIfFilled('githubUrl', values.githubUrl?.trim());
  appendIfFilled('liveUrl', values.liveUrl?.trim());
  appendIfFilled('uatUrl', values.uatUrl?.trim());
  appendIfFilled('firstDeployedAt', toIsoDateTime(values.firstDeploymentDate));
  appendIfFilled('lastDeployedAt', toIsoDateTime(values.lastDeploymentDate));

  newFiles.forEach((file) => formData.append('documents', file, file.name));
  removedDocumentIds.forEach((id) => formData.append('removeDocumentIds', id));

  return formData;
}

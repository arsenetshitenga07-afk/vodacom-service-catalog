/**
 * API simulée — activée avec VITE_USE_MOCK_API=true.
 * Permet de développer l'interface sans backend. Elle consomme exactement
 * le même FormData que l'API réelle, ce qui valide aussi `toServiceFormData`.
 * Les données sont conservées dans le localStorage (sauf le contenu des fichiers).
 */
import { ApiError } from '@/utils/errors';
import { MAX_DOCUMENTS, OTP_LENGTH, OTP_TTL_MINUTES } from '@/utils/constants';
import { mapServiceFromApi } from '../mappers';
import { seedServices } from './seed';

const STORAGE_KEY = 'vsc-mock-services-v5';
const LATENCY_MS = 450;

const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

// URLs blob des fichiers uploadés pendant la session (non persistées).
const blobUrls = new Map();

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* stockage corrompu : on repart des données de démonstration */
  }
  writeAll(seedServices);
  return seedServices;
}

function writeAll(services) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

const withBlobUrls = (service) =>
  mapServiceFromApi({
    ...service,
    documents: service.documents.map((doc) => ({ ...doc, url: blobUrls.get(doc.id) ?? doc.url })),
  });

function parseFormData(formData) {
  // Même format que le backend : champs répétés pour les listes.
  const list = (key) =>
    formData
      .getAll(key)
      .map((value) => value.toString().trim())
      .filter(Boolean);
  const text = (key) => (formData.get(key) ?? '').toString();
  const files = formData.getAll('documents').filter((entry) => entry instanceof File);

  return {
    fields: {
      name: text('name'),
      description: text('description'),
      department: text('department'),
      developers: list('developers'),
      techStack: list('techStack'),
      githubUrl: text('githubUrl'),
      liveUrl: text('liveUrl'),
      uatUrl: text('uatUrl'),
      firstDeployedAt: text('firstDeployedAt') || null,
      lastDeployedAt: text('lastDeployedAt') || null,
    },
    removedDocumentIds: list('removeDocumentIds'),
    documents: files.map((file) => {
      const id = uid();
      blobUrls.set(id, URL.createObjectURL(file));
      return { id, name: file.name, size: file.size, mimeType: file.type, url: null };
    }),
  };
}

function assertDocumentLimit(count) {
  if (count > MAX_DOCUMENTS) {
    throw new ApiError(`A service cannot have more than ${MAX_DOCUMENTS} documents.`, {
      status: 422,
    });
  }
}

/** Supprime les données de démonstration modifiées : le catalogue d'exemple est rechargé. */
export function resetMockData() {
  localStorage.removeItem(STORAGE_KEY);
}

// Codes de vérification envoyés (mode démo) : email → { code, expiresAt }.
const pendingCodes = new Map();

const displayName = (email) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const mockAuthApi = {
  /**
   * Démo : aucun e-mail n'est réellement envoyé. Le code est renvoyé à l'appelant
   * (`demoCode`) pour pouvoir l'afficher ; l'API réelle ne le renvoie jamais.
   */
  async sendCode({ email }) {
    await wait();
    const code = String(Math.floor(Math.random() * 10_000)).padStart(OTP_LENGTH, '0');
    pendingCodes.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + OTP_TTL_MINUTES * 60 * 1000,
    });
    return { demoCode: code };
  },

  async verifyCode({ email, code }) {
    await wait();
    const entry = pendingCodes.get(email.toLowerCase());
    if (!entry || entry.expiresAt < Date.now()) {
      throw new ApiError('Code expired', { status: 410 });
    }
    if (entry.code !== code) throw new ApiError('Invalid code', { status: 401 });
    pendingCodes.delete(email.toLowerCase());
    return { token: `mock-${uid()}`, user: { id: 'mock-user', name: displayName(email), email } };
  },

  async changePassword({ currentPassword, newPassword }) {
    await wait();
    if (!currentPassword) throw new ApiError('Invalid credentials', { status: 401 });
    if (!newPassword) throw new ApiError('New password required', { status: 422 });
  },

  async login({ email, password }) {
    await wait();
    if (!email || !password) {
      throw new ApiError('Invalid credentials', { status: 401 });
    }
    return { token: `mock-${uid()}`, user: { id: 'mock-user', name: displayName(email), email } };
  },

  /**
   * Démo : aucun e-mail n'est réellement envoyé. Le code est renvoyé à l'appelant
   * (`demoCode`) pour pouvoir l'afficher ; l'API réelle ne le renvoie jamais.
   */
  async register({ name, email, password }) {
    await wait();
    if (!email || !password) {
      throw new ApiError('Invalid payload', { status: 422 });
    }
    if (password.length < 8) {
      throw new ApiError('Password too short', { status: 422 });
    }
    return {
      token: `mock-${uid()}`,
      user: { id: 'mock-user', name: name?.trim() || displayName(email), email },
    };
  },

  /**
   * Démo : génère un code à `OTP_LENGTH` chiffres, le mémorise, et le renvoie pour affichage.
   * L'API réelle n'expose jamais le code.
   */
  async requestPasswordReset({ email }) {
    await wait();
    if (!email) throw new ApiError('Invalid payload', { status: 422 });
    const code = String(Math.floor(Math.random() * 10_000)).padStart(OTP_LENGTH, '0');
    pendingCodes.set(`reset:${email.toLowerCase()}`, {
      code,
      expiresAt: Date.now() + OTP_TTL_MINUTES * 60 * 1000,
    });
    return { demoCode: code };
  },

  async resetPassword({ email, code, newPassword }) {
    await wait();
    if (!newPassword || newPassword.length < 8) {
      throw new ApiError('Password too short', { status: 422 });
    }
    const entry = pendingCodes.get(`reset:${email.toLowerCase()}`);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new ApiError('Code expired', { status: 410 });
    }
    if (entry.code !== code) throw new ApiError('Invalid code', { status: 401 });
    pendingCodes.delete(`reset:${email.toLowerCase()}`);
    return { ok: true };
  },
};

export const mockServicesApi = {
  async list() {
    await wait();
    return readAll()
      .slice()
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      .map(withBlobUrls);
  },

  async create(formData) {
    await wait();
    const { fields, documents } = parseFormData(formData);
    assertDocumentLimit(documents.length);
    const service = { id: uid(), ...fields, documents, updatedAt: new Date().toISOString() };
    writeAll([service, ...readAll()]);
    return withBlobUrls(service);
  },

  async update({ id, formData }) {
    await wait();
    const services = readAll();
    const index = services.findIndex((service) => service.id === id);
    if (index === -1) throw new ApiError('Service not found', { status: 404 });

    const { fields, documents, removedDocumentIds } = parseFormData(formData);
    const kept = services[index].documents.filter((doc) => !removedDocumentIds.includes(doc.id));
    assertDocumentLimit(kept.length + documents.length);

    const updated = {
      ...services[index],
      ...fields,
      documents: [...kept, ...documents],
      updatedAt: new Date().toISOString(),
    };
    services[index] = updated;
    writeAll(services);
    return withBlobUrls(updated);
  },

  async remove(id) {
    await wait();
    writeAll(readAll().filter((service) => service.id !== id));
    return id;
  },
};

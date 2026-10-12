import { getLocale } from '@/i18n';

/**
 * Formate une date ISO (ou YYYY-MM-DD) selon la langue active.
 * Retourne `null` si la valeur est vide ou invalide.
 */
export function formatDate(value, language, options = { dateStyle: 'medium' }) {
  const date = parseDate(value);
  return date && new Intl.DateTimeFormat(getLocale(language), options).format(date);
}

/** Convertit une date ISO (ou YYYY-MM-DD) en `Date`, ou `null` si invalide. */
export function parseDate(value) {
  if (!value) return null;
  // Une date "YYYY-MM-DD" est interprétée en local pour éviter le décalage UTC.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Nombre de jours entre `value` et aujourd'hui (négatif = passé). */
export function daysFromToday(value) {
  const date = parseDate(value);
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
}

/** Date relative lisible : « hier », « il y a 3 semaines »… */
export function formatRelativeDate(value, language) {
  const days = daysFromToday(value);
  if (days == null) return null;
  const rtf = new Intl.RelativeTimeFormat(getLocale(language), { numeric: 'auto' });
  const abs = Math.abs(days);
  if (abs < 7) return rtf.format(days, 'day');
  if (abs < 30) return rtf.format(Math.round(days / 7), 'week');
  if (abs < 365) return rtf.format(Math.round(days / 30), 'month');
  return rtf.format(Math.round(days / 365), 'year');
}

/** Convertit une date ISO en valeur compatible avec <input type="date">. */
export function toDateInputValue(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

/** Affiche une taille de fichier lisible (Ko, Mo…). */
export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}

/** Initiales à partir d'un nom complet ou d'un e-mail. */
export function getInitials(nameOrEmail = '') {
  const source = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const initials =
    parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
}

/** Extension d'un nom de fichier, en minuscules et avec le point. */
export function getFileExtension(fileName = '') {
  const index = fileName.lastIndexOf('.');
  return index >= 0 ? fileName.slice(index).toLowerCase() : '';
}

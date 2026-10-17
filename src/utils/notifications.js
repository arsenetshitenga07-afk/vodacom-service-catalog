import { ROUTES } from '@/utils/constants';

/**
 * Formate une notification en phrase lisible :
 * "Randy a ajouté un service : Portail RH"
 *
 * Utilise les clés i18n pour rester cohérent avec le reste de l'app.
 */
export function formatNotification(notif, t) {
  const actor = notif.actorName?.trim() || t('notifications.actor.default');
  const action = t(`notifications.action.${notif.action}`) || notif.action;
  const target = t(`notifications.target.${notif.targetType}`) || notif.targetType;
  return `${actor} ${action} ${target} : ${notif.targetLabel}`;
}

/**
 * Construit le lien interne vers la cible d'une notification.
 * Convention backend : targetType au singulier (`service`), URL au pluriel (`services`).
 */
export function getNotificationLink(notif) {
  const pluralRoutes = {
    service: ROUTES.applicationDetail(notif.targetId),
    user: ROUTES.adminUsers,
    developer: ROUTES.developers,
    technology: ROUTES.technologies,
  };
  return pluralRoutes[notif.targetType] ?? '/';
}

/** Petite icône sémantique par type d'action, pour l'UI. */
export function getNotificationIcon(action) {
  if (action === 'create') return 'Plus';
  if (action === 'update') return 'Pencil';
  if (action === 'delete') return 'Trash2';
  return 'Activity';
}

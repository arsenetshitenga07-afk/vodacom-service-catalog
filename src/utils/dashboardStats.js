import { parseDate } from './format';
import { getServiceStatus, SERVICE_STATUSES } from './serviceStatus';

/**
 * Nombre de déploiements par mois (date du dernier déploiement) sur les `months`
 * derniers mois, du plus ancien au plus récent. Chaque entrée : { date, count }.
 */
export function deploymentsByMonth(services, months = 12, now = new Date()) {
  const buckets = Array.from({ length: months }, (_, index) => ({
    date: new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1),
    count: 0,
  }));

  services.forEach((service) => {
    const date = parseDate(service.lastDeploymentDate);
    if (!date) return;
    const bucket = buckets.find(
      (item) =>
        item.date.getFullYear() === date.getFullYear() && item.date.getMonth() === date.getMonth(),
    );
    if (bucket) bucket.count += 1;
  });

  return buckets;
}

/** Technologies les plus utilisées : [{ name, count }], triées par usage décroissant. */
export function topTechnologies(services, limit = 6) {
  const usage = new Map();
  services.forEach((service) =>
    service.techStack.forEach((tech) => usage.set(tech, (usage.get(tech) ?? 0) + 1)),
  );
  return [...usage.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Répartition par statut d'environnement : [{ status, count }] dans un ordre fixe. */
export function statusBreakdown(services) {
  const counts = Object.fromEntries(SERVICE_STATUSES.map((status) => [status, 0]));
  services.forEach((service) => {
    counts[getServiceStatus(service)] += 1;
  });
  return SERVICE_STATUSES.map((status) => ({ status, count: counts[status] }));
}

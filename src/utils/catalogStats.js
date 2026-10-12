import { parseDate } from './format';

const byCountThenName = (a, b) =>
  b.services.length - a.services.length || a.name.localeCompare(b.name);

/**
 * Technologies du catalogue : [{ name, services }], triées par nombre d'applications.
 * Les variantes de casse (« react » / « React ») sont regroupées.
 */
export function technologyUsage(services) {
  const map = new Map();
  services.forEach((service) =>
    service.techStack.forEach((tech) => {
      const key = tech.toLowerCase();
      if (!map.has(key)) map.set(key, { name: tech, services: [] });
      map.get(key).services.push(service);
    }),
  );
  return [...map.values()].sort(byCountThenName);
}

/**
 * Développeurs du catalogue : [{ name, services, technologies }], triés par nombre d'applications.
 * `technologies` = technologies des applications sur lesquelles ils travaillent.
 */
export function developerDirectory(services) {
  const map = new Map();
  services.forEach((service) =>
    service.developers.forEach((developer) => {
      const key = developer.toLowerCase();
      if (!map.has(key)) map.set(key, { name: developer, services: [], technologies: new Set() });
      const entry = map.get(key);
      entry.services.push(service);
      service.techStack.forEach((tech) => entry.technologies.add(tech));
    }),
  );
  return [...map.values()]
    .map((entry) => ({ ...entry, technologies: [...entry.technologies].sort() }))
    .sort(byCountThenName);
}

/** Les `limit` applications déployées le plus récemment. */
export function recentlyDeployed(services, limit = 5) {
  return services
    .filter((service) => parseDate(service.lastDeploymentDate))
    .sort((a, b) => parseDate(b.lastDeploymentDate) - parseDate(a.lastDeploymentDate))
    .slice(0, limit);
}

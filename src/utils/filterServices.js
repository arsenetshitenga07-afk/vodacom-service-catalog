const normalize = (value) =>
  (value ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Filtre côté client : recherche textuelle (insensible aux accents), technologies
 * (le service doit contenir toutes celles sélectionnées) et développeur (nom exact).
 */
export function filterServices(services, { search = '', technologies = [], developer = '' } = {}) {
  const query = normalize(search.trim());
  const selected = technologies.map(normalize);
  const dev = normalize(developer);

  return services.filter((service) => {
    if (dev && !service.developers.some((name) => normalize(name) === dev)) return false;

    if (selected.length > 0) {
      const stack = service.techStack.map(normalize);
      if (!selected.every((tech) => stack.includes(tech))) return false;
    }

    if (!query) return true;

    const haystack = normalize(
      [service.name, service.description, ...service.developers, ...service.techStack].join(' '),
    );
    return haystack.includes(query);
  });
}

/** Liste triée et dédoublonnée de toutes les technologies présentes dans le catalogue. */
export function collectTechnologies(services) {
  const map = new Map();
  services.forEach((service) =>
    service.techStack.forEach((tech) => {
      const key = normalize(tech);
      if (!map.has(key)) map.set(key, tech);
    }),
  );
  return [...map.values()].sort((a, b) => a.localeCompare(b));
}

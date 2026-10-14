/**
 * Prépare la modification d'une liste (`techStack` ou `developers`) sur plusieurs
 * applications : renommer une valeur ou la retirer partout.
 *
 * Contrainte du backend (multipart) : une liste vide ne peut pas être envoyée
 * (aucun champ = « inchangé »). Les applications qui se retrouveraient sans
 * aucune valeur sont donc écartées (`skipped`) au lieu d'être modifiées.
 *
 * @returns {{ updates: { service: object, list: string[] }[], skipped: object[] }}
 */
export function planListChange(services, field, from, to = null) {
  const key = from.trim().toLowerCase();
  const updates = [];
  const skipped = [];

  services.forEach((service) => {
    const list = service[field];
    if (!list.some((item) => item.toLowerCase() === key)) return;

    let next = list.filter((item) => item.toLowerCase() !== key);
    if (to) {
      const target = to.trim();
      if (!next.some((item) => item.toLowerCase() === target.toLowerCase())) {
        // Le nouveau nom prend la place de l'ancien dans la liste.
        const index = list.findIndex((item) => item.toLowerCase() === key);
        next = [...next.slice(0, index), target, ...next.slice(index)];
      }
    }

    if (next.length === 0) skipped.push(service);
    else updates.push({ service, list: next });
  });

  return { updates, skipped };
}

/** FormData de mise à jour partielle : uniquement la liste concernée, en champs répétés. */
export function listFormData(field, list) {
  const formData = new FormData();
  list.forEach((item) => formData.append(field, item));
  return formData;
}

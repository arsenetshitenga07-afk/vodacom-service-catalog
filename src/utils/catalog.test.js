import { describe, expect, it } from 'vitest';
import { listFormData, planListChange } from './bulkListUpdate';
import { developerDirectory, technologyUsage } from './catalogStats';
import { collectTechnologies, filterServices } from './filterServices';
import { getServiceStatus } from './serviceStatus';

const service = (overrides) => ({
  id: overrides.name,
  description: '',
  developers: [],
  techStack: [],
  githubUrl: '',
  liveUrl: '',
  uatUrl: '',
  documents: [],
  ...overrides,
});

const catalog = [
  service({
    name: 'Portail RH',
    description: 'Gestion des congés',
    developers: ['Alice', 'Bob'],
    techStack: ['React', 'NestJS'],
    liveUrl: 'https://rh.example.com',
  }),
  service({
    name: 'Réseau NOC',
    description: 'Supervision réseau',
    developers: ['Bob'],
    techStack: ['React', 'Go'],
    uatUrl: 'https://uat.example.com',
  }),
  service({
    name: 'ETL',
    description: 'Entrepôt de données',
    developers: ['Chloé'],
    techStack: ['Python'],
  }),
];

describe('filterServices', () => {
  it('recherche sans tenir compte des accents ni de la casse', () => {
    expect(filterServices(catalog, { search: 'reseau' }).map((s) => s.name)).toEqual([
      'Réseau NOC',
    ]);
    expect(filterServices(catalog, { search: 'CONGÉS' }).map((s) => s.name)).toEqual([
      'Portail RH',
    ]);
  });

  it('exige toutes les technologies sélectionnées', () => {
    expect(filterServices(catalog, { technologies: ['React'] })).toHaveLength(2);
    expect(filterServices(catalog, { technologies: ['React', 'Go'] }).map((s) => s.name)).toEqual([
      'Réseau NOC',
    ]);
  });

  it('filtre par développeur (nom exact)', () => {
    expect(filterServices(catalog, { developer: 'bob' })).toHaveLength(2);
    expect(filterServices(catalog, { developer: 'Bo' })).toHaveLength(0);
  });

  it('liste les technologies sans doublon, triées', () => {
    expect(collectTechnologies(catalog)).toEqual(['Go', 'NestJS', 'Python', 'React']);
  });
});

describe('getServiceStatus', () => {
  it('déduit le statut des environnements', () => {
    expect(catalog.map(getServiceStatus)).toEqual(['live', 'uat', 'none']);
  });
});

describe('statistiques du catalogue', () => {
  it('compte les applications par technologie', () => {
    const usage = technologyUsage(catalog);
    expect(usage[0]).toMatchObject({ name: 'React' });
    expect(usage[0].services).toHaveLength(2);
  });

  it('regroupe les applications et technologies par développeur', () => {
    const bob = developerDirectory(catalog).find((dev) => dev.name === 'Bob');
    expect(bob.services).toHaveLength(2);
    expect(bob.technologies).toEqual(['Go', 'NestJS', 'React']);
  });
});

describe('planListChange (renommer / retirer partout)', () => {
  it('renomme une technologie à la même position', () => {
    const { updates } = planListChange(catalog, 'techStack', 'react', 'React.js');
    expect(updates).toHaveLength(2);
    expect(updates[0].list).toEqual(['React.js', 'NestJS']);
  });

  it('ne crée pas de doublon si le nouveau nom existe déjà', () => {
    const { updates } = planListChange(catalog, 'techStack', 'NestJS', 'React');
    expect(updates[0].list).toEqual(['React']);
  });

  it('écarte les applications qui se retrouveraient sans aucun développeur', () => {
    const { updates, skipped } = planListChange(catalog, 'developers', 'Bob');
    expect(updates.map((u) => u.service.name)).toEqual(['Portail RH']);
    expect(skipped.map((s) => s.name)).toEqual(['Réseau NOC']);
  });

  it('produit un FormData en champs répétés', () => {
    const formData = listFormData('developers', ['Alice', 'Bob']);
    expect(formData.getAll('developers')).toEqual(['Alice', 'Bob']);
  });
});

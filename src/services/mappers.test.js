import { describe, expect, it } from 'vitest';
import {
  mapServiceFromApi,
  mapSessionFromApi,
  toServiceFormData,
  unwrapCollection,
} from './mappers';

/** Formats tirés de endpoints.json (Portal Vodacom API). */
describe('lecture des réponses du backend', () => {
  it('convertit un service du backend', () => {
    const service = mapServiceFromApi({
      id: 'b6a1…',
      name: 'Portail RH',
      description: 'Application RH',
      githubUrl: null,
      firstDeployedAt: '2026-01-15T00:00:00.000Z',
      lastDeployedAt: '2026-09-01T00:00:00.000Z',
      developers: ['Alice'],
      techStack: ['React'],
      documents: [{ id: 'd1', originalName: 'arch.pdf', cloudinaryUrl: 'https://cdn/arch.pdf' }],
    });
    expect(service.firstDeploymentDate).toBe('2026-01-15T00:00:00.000Z');
    expect(service.githubUrl).toBe('');
    expect(service.documents[0]).toMatchObject({ name: 'arch.pdf', url: 'https://cdn/arch.pdf' });
  });

  it('extrait la liste d’une réponse paginée { data, meta }', () => {
    expect(unwrapCollection({ data: [{ id: 1 }], meta: { totalPages: 1 } })).toEqual([{ id: 1 }]);
  });

  it('lit le jeton et le rôle de la connexion', () => {
    const session = mapSessionFromApi({
      accessToken: 'jwt',
      user: { id: 'u1', email: 'admin@vodacom.cd', name: 'Admin', role: 'admin' },
    });
    expect(session).toMatchObject({ token: 'jwt', user: { role: 'admin' } });
  });
});

describe('toServiceFormData (POST / PATCH /services)', () => {
  const values = {
    name: '  Portail RH ',
    description: 'Application RH',
    department: 'human-resources',
    developers: ['Alice', 'Bob'],
    techStack: ['React'],
    githubUrl: '',
    liveUrl: 'https://rh.example.com',
    uatUrl: '',
    firstDeploymentDate: '2026-01-15',
    lastDeploymentDate: '',
  };

  it('envoie les listes en champs répétés et les dates en ISO', () => {
    const formData = toServiceFormData(values);
    expect(formData.get('name')).toBe('Portail RH');
    expect(formData.getAll('developers')).toEqual(['Alice', 'Bob']);
    expect(formData.get('firstDeployedAt')).toBe('2026-01-15T00:00:00.000Z');
    expect(formData.get('liveUrl')).toBe('https://rh.example.com');
  });

  it('n’envoie pas les champs optionnels vides ni le département par défaut', () => {
    const formData = toServiceFormData(values);
    expect(formData.has('githubUrl')).toBe(false);
    expect(formData.has('lastDeployedAt')).toBe(false);
    expect(formData.has('department')).toBe(false);
    expect(toServiceFormData(values, { includeDepartment: true }).get('department')).toBe(
      'human-resources',
    );
  });

  it('liste les documents à supprimer avec la clé du backend', () => {
    const formData = toServiceFormData(values, { removedDocumentIds: ['d1', 'd2'] });
    expect(formData.getAll('removeDocumentIds')).toEqual(['d1', 'd2']);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { query } from './teacherClient';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, p), 'utf8');

describe('services enseignant', () => {
  it('construit les filtres sans chaînes vides', () => {
    expect(query({ tab: 'students', page: 1, x: '' })).toBe('?tab=students&page=1');
    expect(query({})).toBe('');
  });

  it('n’envoie jamais d’identifiant d’enseignant : le serveur résout tout depuis le jeton', () => {
    const source = read('./classGroupService.js');
    expect(source).not.toMatch(/teacherId/);
    expect(source).not.toMatch(/teacher_id/);
  });

  it('rejoindre ne prend qu’un code ou le jeton du lien, jamais un identifiant de classe', () => {
    const source = read('../studyContextService.js');
    expect(source).toMatch(/joinClassGroup\(token, by\)/);
    expect(source).not.toMatch(/classroomId.*join/);
  });

  it('le lien de classe se renouvelle par sa route, sans identifiant d’enseignant', () => {
    const source = read('./classGroupService.js');
    expect(source).toMatch(/\/join-link\/rotate/);
    expect(source).not.toMatch(/\/invitations/);
  });

  it('le message rendu vient du catalogue arabe, jamais du serveur', () => {
    const client = read('./teacherClient.js');
    expect(client).toContain('apiMessage(messageKey, data, status)');
    expect(client).not.toMatch(/data\?\.message \|\|/);
  });

  it('« mon offre » ne connaît aucun paiement', () => {
    const source = read('./subscriptionService.js');
    expect(source).not.toMatch(/checkout|billing|stripe/i);
    expect(source).toContain("'/me/subscription-requests'");
  });
});

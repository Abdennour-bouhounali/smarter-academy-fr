import { describe, it, expect } from 'vitest';
import { hasRequiredRole, canPresentClassroom, CLASSROOM_PRESENTER_ROLES } from './auth';

describe('hasRequiredRole', () => {
  it('allows a user whose role is in the allowed list', () => {
    expect(hasRequiredRole({ role: 'admin' }, ['admin'])).toBe(true);
  });

  it('rejects a user whose role is not in the allowed list', () => {
    expect(hasRequiredRole({ role: 'student' }, ['admin'])).toBe(false);
  });

  it('rejects when there is no user', () => {
    expect(hasRequiredRole(null, ['admin'])).toBe(false);
    expect(hasRequiredRole(undefined, ['admin'])).toBe(false);
  });

  it('supports more than one allowed role', () => {
    expect(hasRequiredRole({ role: 'student' }, ['admin', 'student'])).toBe(true);
    expect(hasRequiredRole({ role: 'guest' }, ['admin', 'student'])).toBe(false);
  });
});

describe('canPresentClassroom — qui voit les commandes du mode classe', () => {
  // Ces tests portent sur le MÉCANISME, pas sur la composition de la liste :
  // `CLASSROOM_PRESENTER_ROLES` est un réglage de produit qui change (un rôle
  // enseignant y est depuis le 2026-09-22 ; `student` en a été retiré le
  // 2026-10-01, et le test ci-dessous garde CETTE décision du propriétaire). Un test qui fige son contenu casserait à chaque
  // ajustement légitime, sans rien protéger — alors que la règle à tenir est
  // « la question passe par cette liste, et par elle seule ».
  it('accorde la présentation à tout rôle de la liste, et à lui seul', () => {
    for (const role of CLASSROOM_PRESENTER_ROLES) {
      expect(canPresentClassroom({ role })).toBe(true);
    }
    expect(canPresentClassroom({ role: 'role-absent-de-la-liste' })).toBe(false);
  });

  it('un élève ne présente jamais (décision du propriétaire, 2026-10-01)', () => {
    expect(canPresentClassroom({ role: 'student' })).toBe(false);
    expect(canPresentClassroom({ role: 'teacher' })).toBe(true);
  });

  it('refuse un visiteur non connecté', () => {
    expect(canPresentClassroom(null)).toBe(false);
    expect(canPresentClassroom(undefined)).toBe(false);
  });

  it('la liste est gelée : on la modifie dans le code, jamais à l’exécution', () => {
    expect(Object.isFrozen(CLASSROOM_PRESENTER_ROLES)).toBe(true);
    expect(CLASSROOM_PRESENTER_ROLES.length).toBeGreaterThan(0);
  });

  it('délègue à hasRequiredRole — une seule mécanique d’autorisation', () => {
    for (const role of ['admin', 'student', 'autre']) {
      expect(canPresentClassroom({ role })).toBe(hasRequiredRole({ role }, CLASSROOM_PRESENTER_ROLES));
    }
  });
});

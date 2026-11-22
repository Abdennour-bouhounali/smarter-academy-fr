import { describe, it, expect } from 'vitest';
import { getNextIncompleteModule } from './getNextIncompleteModule';

describe('getNextIncompleteModule', () => {
  it('returns the first gap in the completed set', () => {
    expect(getNextIncompleteModule(new Set([1, 2, 4]), 5)).toBe(3);
  });

  it('returns 1 when nothing is completed', () => {
    expect(getNextIncompleteModule(new Set(), 5)).toBe(1);
  });

  it('returns 1 when everything is completed (caller decides what "done" means)', () => {
    expect(getNextIncompleteModule(new Set([1, 2, 3]), 3)).toBe(1);
  });

  it('takes the real module count from the caller — no fabricated default', () => {
    // With totalModules required, a 5-module lesson and a 9-module lesson
    // resume differently for the same completed set.
    const completed = new Set([1, 2, 3, 4, 5]);
    expect(getNextIncompleteModule(completed, 9)).toBe(6);
    expect(getNextIncompleteModule(completed, 5)).toBe(1);
  });
});

describe('getNextIncompleteModule — les leçons qui commencent au module 0', () => {
  // Deux leçons de l'unité 1 ouvrent sur « أستعدّ », numéroté 0. Balayer
  // 1..total proposait de « continuer » au module 1 en sautant le module 0
  // que l'élève n'avait pas encore fait.
  it('propose le module 0 quand rien n’est fait', () => {
    expect(getNextIncompleteModule(new Set(), 5, 0)).toBe(0);
  });

  it('passe au module 1 une fois le 0 terminé', () => {
    expect(getNextIncompleteModule(new Set([0]), 5, 0)).toBe(1);
  });

  it('trouve le trou au milieu d’une numérotation depuis 0', () => {
    expect(getNextIncompleteModule(new Set([0, 1, 3]), 5, 0)).toBe(2);
  });

  it('balaie exactement les modules 0..4 d’une leçon de 5 modules', () => {
    // Tout est fait : on retombe sur le premier, comme pour une leçon 1..N.
    expect(getNextIncompleteModule(new Set([0, 1, 2, 3, 4]), 5, 0)).toBe(0);
    // Le module 5 n'existe pas : il ne doit jamais être proposé.
    expect(getNextIncompleteModule(new Set([0, 1, 2, 3]), 5, 0)).toBe(4);
  });

  it('garde le comportement historique quand le premier module n’est pas donné', () => {
    expect(getNextIncompleteModule(new Set([1, 2, 4]), 5)).toBe(3);
    expect(getNextIncompleteModule(new Set(), 5)).toBe(1);
  });

  it('ignore un premier module aberrant plutôt que de boucler de travers', () => {
    expect(getNextIncompleteModule(new Set([1, 2]), 5, -3)).toBe(3);
    expect(getNextIncompleteModule(new Set([1, 2]), 5, null)).toBe(3);
  });
});

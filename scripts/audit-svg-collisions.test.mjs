// Ce que l'auditeur doit SAVOIR IGNORER.
//
// Un détecteur qui signale les étiquettes voulues est pire qu'aucun
// détecteur : on cesse de le lire. Ces tests fixent la frontière entre une
// vraie collision et une superposition délibérée.

import { describe, it, expect } from 'vitest';
import { overlaps, contains, hasHalo, isDecor } from './audit-svg-collisions.mjs';

const box = (x, y, width, height) => ({ x, y, width, height });

describe('overlaps', () => {
  it('voit un chevauchement, et seulement un vrai', () => {
    expect(overlaps(box(0, 0, 10, 10), box(5, 5, 10, 10))).toBe(true);
    expect(overlaps(box(0, 0, 10, 10), box(20, 0, 10, 10))).toBe(false);
  });

  it('le padding exige un écart réel autour d’un point', () => {
    expect(overlaps(box(0, 0, 10, 10), box(11, 0, 5, 5))).toBe(false);
    expect(overlaps(box(0, 0, 10, 10), box(11, 0, 5, 5), 2)).toBe(true);
  });
});

describe('contains — l’étiquette de donnée', () => {
  it('un texte posé DANS sa case n’est pas une collision', () => {
    expect(contains(box(0, 0, 40, 20), box(8, 5, 20, 10))).toBe(true);
  });

  it('un texte qui franchit le bord en est une', () => {
    expect(contains(box(0, 0, 40, 20), box(30, 5, 20, 10))).toBe(false);
  });
});

describe('hasHalo — la plaque assumée', () => {
  it('reconnaît un texte détouré', () => {
    expect(hasHalo({ paintOrder: 'stroke', strokeWidth: 2.5 })).toBe(true);
  });

  it('un halo d’épaisseur nulle n’en est pas un', () => {
    expect(hasHalo({ paintOrder: 'stroke', strokeWidth: 0 })).toBe(false);
    expect(hasHalo({})).toBe(false);
  });
});

describe('isDecor — ce qui ne porte pas de sens', () => {
  it('écarte le quadrillage et les traits fantômes', () => {
    expect(isDecor({ stroke: '#e2e8f0' })).toBe(true);
    expect(isDecor({ strokeOpacity: 0.1 })).toBe(true);
    expect(isDecor({ role: 'grid' })).toBe(true);
  });

  it('garde un trait porteur de sens', () => {
    expect(isDecor({ stroke: '#4f46e5' })).toBe(false);
    expect(isDecor({ role: 'graph', stroke: '#059669' })).toBe(false);
  });
});

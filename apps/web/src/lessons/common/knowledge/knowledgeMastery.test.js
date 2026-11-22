import { describe, it, expect } from 'vitest';
import { moduleMasteryOverlay } from './knowledgeMastery';

const modules = [
  { number: 1, teachesLearningPointIds: ['P1'] },
  { number: 2, teachesLearningPointIds: ['P2', 'P3'] },
  { number: 3 },
];

describe('moduleMasteryOverlay — une surcouche, jamais un filtre', () => {
  it('colore les points que chaque module enseigne ; inconnu = non évalué', () => {
    const rowsByCode = new Map([['P1', { status: 'mastered' }], ['P2', { status: 'gap' }]]);
    const overlay = moduleMasteryOverlay({ moduleNumbers: [1, 2, 3], modules, rowsByCode });
    expect(overlay.get(1).dots.map((d) => d.state)).toEqual(['mastered']);
    expect(overlay.get(2).dots.map((d) => d.state)).toEqual(['gap', 'unassessed']);
    expect(overlay.has(3)).toBe(false);
  });

  it('« راجع » seulement pour une lacune dans un module déjà parcouru', () => {
    const rowsByCode = new Map([['P1', { status: 'gap' }], ['P2', { status: 'gap' }]]);
    const modulePath = (n) => `/m${n}`;
    const overlay = moduleMasteryOverlay({ moduleNumbers: [1, 2], modules, rowsByCode, completedModules: new Set([1]), modulePath });
    expect(overlay.get(1).reviewPath).toBe('/m1');
    expect(overlay.get(2).reviewPath).toBeNull();
  });

  it('tolère une entrée vide', () => {
    expect(moduleMasteryOverlay().size).toBe(0);
  });
});

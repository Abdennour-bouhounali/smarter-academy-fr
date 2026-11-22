import { describe, it, expect } from 'vitest';
import { assertRegistryComplete } from './manipulationRegistry.js';
import { plausibleChoices } from './useManipulation.js';

describe('registre des manipulations', () => {
  it('chaque type du registre pur a son composant, et réciproquement', () => {
    expect(assertRegistryComplete()).toEqual({ missing: [], extra: [] });
  });
});

describe('plausibleChoices', () => {
  it('contient la bonne réponse, sans doublon, en nombre demandé, de façon déterministe', () => {
    const a = plausibleChoices(26, [8, 208, 26]);
    expect(a).toHaveLength(3);
    expect(a).toContain(26);
    expect(new Set(a).size).toBe(3);
    expect(plausibleChoices(26, [8, 208, 26])).toEqual(a);
  });
  it('ignore les distracteurs négatifs et complète', () => {
    expect(plausibleChoices(0, [-1])).toHaveLength(3);
  });
});

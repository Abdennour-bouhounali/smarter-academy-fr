import { describe, it, expect } from 'vitest';
import { chipsAround, buildTiles } from './divisionChecks';

describe('chipsAround / buildTiles — les réponses d’un toucher du lecteur (pilote 2026-11-07)', () => {
  it('quatre nombres consécutifs, la valeur dedans, jamais sous le minimum', () => {
    for (const v of [0, 1, 2, 3, 4, 5, 7, 8, 14, 142]) {
      const c = chipsAround(v);
      expect(c).toHaveLength(4);
      expect(c).toContain(v);
      expect(Math.min(...c)).toBeGreaterThanOrEqual(0);
      c.forEach((x, i) => { if (i) expect(x).toBe(c[i - 1] + 1); });
    }
  });
  it('la bonne réponse change de place selon la valeur', () => {
    const at = (v) => chipsAround(v).indexOf(v);
    expect(new Set([at(4), at(5), at(6), at(7)]).size).toBe(4);
  });
  it('les tuiles sont les quatre nombres, jamais dans l’ordre de l’égalité', () => {
    const t = buildTiles({ n: 16, g: 3, q: 5, r: 1 });
    expect([...t].sort((a, b) => a - b)).toEqual([1, 3, 5, 16]);
    expect(t).not.toEqual([16, 3, 5, 1]);
  });
});

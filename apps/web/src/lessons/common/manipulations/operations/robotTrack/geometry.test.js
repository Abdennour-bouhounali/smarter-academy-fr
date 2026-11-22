import { describe, it, expect } from 'vitest';
import { matGeometry, ticksOf, arcHeight, PAD } from './geometry';

describe('robot-track — la géométrie du tapis', () => {
  it('le poteau 0 est au milieu ; ±M aux extrémités ; une position hors tapis est clampée', () => {
    const g = matGeometry({ width: 600, max: 30 });
    expect(g.x(0)).toBe(300);
    expect(g.x(30)).toBe(600 - PAD);
    expect(g.x(-30)).toBe(PAD);
    expect(g.x(1000)).toBeLessThanOrEqual(600 - PAD + 0.04 * g.half + 1e-9);
    expect(g.off(31.5)).toBe(true);
    expect(g.off(24)).toBe(false);
  });
  it('les graduations : 61 pour M = 30 par 1 ; étiquettes tous les 5', () => {
    const t = ticksOf({ max: 10, tick: 1, label: 5 });
    expect(t.length).toBe(21);
    expect(t.filter((x) => x.labelled).map((x) => x.v)).toEqual([-10, -5, 0, 5, 10]);
  });
  it('arcHeight reste dans ses bornes', () => {
    expect(arcHeight(0)).toBe(26);
    expect(arcHeight(10000)).toBe(88);
  });
});

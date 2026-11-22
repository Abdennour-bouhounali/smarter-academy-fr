import { describe, it, expect } from 'vitest';
import { brickLayout, measureLayout } from './brickLayout';

/* Les cas de l'activité 3 : (18, 12, 3), (35, 15, 5), (56, 21, 7) et le
   niveau avancé (900, 90, 9). */

describe('brickLayout — un mur en briques de n', () => {
  it('18 en briques de 3 : six briques entières, pas de morceau', () => {
    const w = brickLayout({ value: 18, unit: 3 });
    expect(w.count).toBe(6);
    expect(w.partial).toBe(0);
    expect(w.whole).toBe(true);
    expect(w.bricks[5]).toEqual([15, 18]);
  });

  it('la somme, la différence et le reste sont des murs entiers quand n | a et n | b', () => {
    for (const [a, b, n] of [[18, 12, 3], [35, 15, 5], [56, 21, 7], [900, 90, 9]]) {
      expect(brickLayout({ value: a + b, unit: n }).whole, `${a}+${b}`).toBe(true);
      expect(brickLayout({ value: a - b, unit: n }).whole, `${a}-${b}`).toBe(true);
      expect(brickLayout({ value: a % b, unit: n }).whole, `${a} mod ${b}`).toBe(true);
    }
  });

  it('un mur qui ne tombe pas juste garde son morceau, dessiné à part', () => {
    const w = brickLayout({ value: 20, unit: 3 });
    expect([w.count, w.partial]).toEqual([6, 2]);
    expect(w.partialSpan).toEqual([18, 20]);
    expect(w.whole).toBe(false);
  });

  it('les briques couvrent exactement la longueur, sans trou ni chevauchement', () => {
    const w = brickLayout({ value: 900, unit: 9 });
    expect(w.bricks).toHaveLength(100);
    for (let i = 1; i < w.bricks.length; i += 1) expect(w.bricks[i][0]).toBe(w.bricks[i - 1][1]);
    expect(w.bricks[w.bricks.length - 1][1]).toBe(900);
  });
});

describe('measureLayout — a mesuré par des panneaux de b, le bout est le reste', () => {
  it('56 par 21 : deux panneaux, reste 14 = deux briques de 7', () => {
    const m = measureLayout({ a: 56, b: 21, unit: 7 });
    expect(m.q).toBe(2);
    expect(m.r).toBe(14);
    expect(m.rest).toEqual([42, 56]);
    expect(m.restBricks.count).toBe(2);
    expect(m.restBricks.whole).toBe(true);
  });

  it('900 par 90 : dix panneaux, aucun reste', () => {
    const m = measureLayout({ a: 900, b: 90, unit: 9 });
    expect(m.q).toBe(10);
    expect(m.rest).toBeNull();
    expect(m.restBricks.count).toBe(0);
  });
});

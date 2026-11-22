import { describe, it, expect } from 'vitest';
import { divide, clampStep, equalityLine, fenceFits, fencePostCount, tileGrid, fenceVertices, fenceEdges, validateScene } from './problemScene';

describe('problemScene — la logique des scènes interactives', () => {
  it('divide / equalityLine : l\'égalité affichée est toujours vraie', () => {
    for (const [t, d] of [[3090, 7], [3090, 618], [612, 6], [183, 4], [99, 100]]) {
      const { q, r } = divide(t, d);
      expect(d * q + r).toBe(t);
      expect(r).toBeLessThan(d);
      expect(equalityLine(t, d)).toBe(`${t} = ${d} × ${q} + ${r}`);
    }
    expect(divide(3090, 618)).toEqual({ q: 5, r: 0, exact: true });
  });

  it('clampStep : un entier de [1, max]', () => {
    expect(clampStep('0', 50)).toBe(1);
    expect(clampStep(999, 50)).toBe(50);
    expect(clampStep('7.4', 50)).toBe(7);
    expect(clampStep('abc', 50)).toBe(1);
  });

  it('fence : un poteau à chaque coin seulement si d divise chaque côté ; contour fermé = autant de poteaux que d\'intervalles', () => {
    expect(fenceFits([612, 174], 6)).toBe(true);
    expect(fenceFits([612, 174], 4)).toBe(false);
    expect(fenceFits([183, 135, 99], 3)).toBe(true);
    expect(fenceFits([183, 135, 99], 9)).toBe(false);
    expect(fencePostCount([612, 174, 612, 174], 6)).toBe(262);
    expect(fencePostCount([183, 135, 99], 3)).toBe(139);
    expect(fencePostCount([612, 174], 4)).toBe(null);
  });

  it('fence : seuls les diviseurs communs des côtés font « tomber juste » — exactement les diviseurs du PGCD', () => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    for (const sides of [[612, 174], [183, 135, 99]]) {
      const g = sides.reduce(gcd);
      for (let d = 1; d <= 200; d += 1) expect(fenceFits(sides, d), `${sides} ${d}`).toBe(g % d === 0);
    }
  });

  it('tiles : le plus grand carreau qui tombe juste est le PGCD', () => {
    expect(tileGrid(220, 140, 20)).toEqual({ cols: 11, rows: 7, restLength: 0, restWidth: 0, exact: true, tiles: 77 });
    expect(tileGrid(220, 140, 30)).toMatchObject({ cols: 7, rows: 4, restLength: 10, restWidth: 20, exact: false });
    expect(tileGrid(840, 440, 40)).toMatchObject({ cols: 21, rows: 11, exact: true, tiles: 231 });
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    for (const [L, W] of [[220, 140], [840, 440]]) {
      const exact = []; for (let s = 1; s <= W; s += 1) if (tileGrid(L, W, s).exact) exact.push(s);
      expect(Math.max(...exact)).toBe(gcd(L, W));
    }
  });

  it('géométrie du contour : les côtés dessinés ont les longueurs demandées', () => {
    const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    for (const [shape, sides] of [['rect', [612, 174]], ['triangle', [183, 135, 99]]]) {
      expect(fenceVertices(shape, sides).length).toBe(shape === 'rect' ? 4 : 3);
      for (const [p, q, len] of fenceEdges(shape, sides)) expect(dist(p, q)).toBeCloseTo(len, 6);
    }
  });

  it('validateScene : refuse ce qui est incomplet', () => {
    const ok = { kind: 'tiles', length: 220, width: 140, unit: 'سم', stepLabel: 'الضلع', max: 140, ariaLabel: 'صفيحة' };
    expect(validateScene(ok)).toEqual([]);
    expect(validateScene({ ...ok, ariaLabel: 'plate' })).toContain('ariaLabel arabe obligatoire');
    expect(validateScene({ ...ok, kind: 'x' }).length).toBeGreaterThan(0);
    expect(validateScene({ kind: 'fence', shape: 'triangle', sides: [1, 1, 9], unit: 'م', stepLabel: 'a', max: 5, ariaLabel: 'مثلث' })).toContain('sides : inégalité triangulaire');
    expect(validateScene({ kind: 'share', items: [], groupLabel: 'x', max: 3, ariaLabel: 'تقسيم' })).toContain('items : au moins un');
    expect(validateScene({ ...ok, tone: 'pink' })).toContain('ton inconnu « pink »');
  });
});

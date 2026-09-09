/**
 * Le noyau du second degré, vérifié AVANT toute JSX.
 *
 * On ne teste pas « la fonction ne plante pas » : on teste les PROPRIÉTÉS
 * mathématiques dont les leçons dépendent — le tri des racines, la
 * redéveloppabilité de la forme factorisée, le comportement pour a < 0, et
 * le fait qu'un discriminant nul rende exactement une racine.
 */
import { describe, it, expect } from 'vitest';
import {
  discriminant, roots, factoredForm, vertex, trinomialSign, rootCount, evalTrinome,
} from './quadratic';

describe('discriminant', () => {
  it('vaut b² − 4ac', () => {
    expect(discriminant(1, -4, 3)).toBe(4);
    expect(discriminant(1, -4, 4)).toBe(0);
    expect(discriminant(1, -4, 5)).toBe(-4);
    expect(discriminant(2, 3, -5)).toBe(49);
  });

  it('refuse a = 0 : ce ne serait pas un trinôme du second degré', () => {
    expect(() => discriminant(0, 2, 1)).toThrow();
    expect(() => roots(0, 2, 1)).toThrow();
    expect(() => vertex(0, 2, 1)).toThrow();
    expect(() => trinomialSign(0, 2, 1)).toThrow();
  });
});

describe('roots — le contrat : [], [x0] ou [x1 < x2]', () => {
  it('Δ > 0 rend deux racines TRIÉES croissantes', () => {
    expect(roots(1, -4, 3)).toEqual([1, 3]);
    expect(roots(1, -5, 6)).toEqual([2, 3]);
  });

  it('Δ = 0 rend UNE seule racine, la racine double', () => {
    expect(roots(1, -4, 4)).toEqual([2]);
    expect(roots(1, 6, 9)).toEqual([-3]);
    expect(roots(4, -4, 1)).toEqual([0.5]);
  });

  it('Δ < 0 rend le tableau VIDE : pas de solution réelle', () => {
    expect(roots(1, -4, 5)).toEqual([]);
    expect(roots(1, 0, 1)).toEqual([]);
    expect(roots(2, 1, 3)).toEqual([]);
  });

  it('a < 0 : les racines restent triées croissantes malgré le signe du dénominateur', () => {
    // Sans le tri explicite, (−b − √Δ)/(2a) serait la PLUS GRANDE.
    expect(roots(-1, 0, 4)).toEqual([-2, 2]);
    expect(roots(-2, 4, 6)).toEqual([-1, 3]);
    const rs = roots(-3, 5, 2);
    expect(rs[0]).toBeLessThan(rs[1]);
    for (const x of rs) expect(evalTrinome(-3, 5, 2, x)).toBeCloseTo(0, 10);
  });

  it('racines IRRATIONNELLES : elles annulent bien le trinôme', () => {
    const rs = roots(1, -2, -1);           // 1 ± √2
    expect(rs).toHaveLength(2);
    expect(rs[0]).toBeCloseTo(1 - Math.SQRT2, 12);
    expect(rs[1]).toBeCloseTo(1 + Math.SQRT2, 12);
    for (const x of rs) expect(evalTrinome(1, -2, -1, x)).toBeCloseTo(0, 10);
  });

  it('toute racine rendue annule le trinôme — balayé sur une grille de coefficients', () => {
    for (let a = -3; a <= 3; a += 1) {
      if (a === 0) continue;
      for (let b = -4; b <= 4; b += 1) {
        for (let c = -4; c <= 4; c += 1) {
          for (const x of roots(a, b, c)) {
            expect(Math.abs(evalTrinome(a, b, c, x))).toBeLessThan(1e-9);
          }
        }
      }
    }
  });
});

describe('rootCount — compter AVANT de résoudre', () => {
  it('donne le même nombre que roots(), sur toute la grille', () => {
    for (let a = -3; a <= 3; a += 1) {
      if (a === 0) continue;
      for (let b = -5; b <= 5; b += 1) {
        for (let c = -5; c <= 5; c += 1) {
          expect(rootCount(a, b, c)).toBe(roots(a, b, c).length);
        }
      }
    }
  });
});

describe('factoredForm — a(x − x₁)(x − x₂) redéveloppe ax² + bx + c', () => {
  /** Redéveloppe la forme factorisée et rend ses coefficients. */
  const redeveloppe = ({ a, roots: rs }) => {
    if (rs.length === 1) return { a, b: -2 * a * rs[0], c: a * rs[0] * rs[0] };
    const [x1, x2] = rs;
    return { a, b: -a * (x1 + x2), c: a * x1 * x2 };
  };

  it('sur des racines entières', () => {
    const f = factoredForm(1, -4, 3);
    expect(f.factorable).toBe(true);
    expect(f.roots).toEqual([1, 3]);
    const { a, b, c } = redeveloppe(f);
    expect([a, b, c]).toEqual([1, -4, 3]);
  });

  it('sur a < 0', () => {
    const f = factoredForm(-2, 4, 6);
    const { a, b, c } = redeveloppe(f);
    expect(a).toBe(-2);
    expect(b).toBeCloseTo(4, 12);
    expect(c).toBeCloseTo(6, 12);
  });

  it('sur Δ = 0 : la forme est a(x − x₀)² et redéveloppe juste', () => {
    const f = factoredForm(1, -4, 4);
    expect(f.roots).toEqual([2]);
    const { a, b, c } = redeveloppe(f);
    expect([a, b, c]).toEqual([1, -4, 4]);
  });

  it('sur des racines IRRATIONNELLES, le redéveloppement retrouve les coefficients', () => {
    const f = factoredForm(1, -2, -1);
    const { a, b, c } = redeveloppe(f);
    expect(a).toBe(1);
    expect(b).toBeCloseTo(-2, 10);
    expect(c).toBeCloseTo(-1, 10);
  });

  it('Δ < 0 : pas de factorisation sur ℝ', () => {
    const f = factoredForm(1, -4, 5);
    expect(f.factorable).toBe(false);
    expect(f.roots).toEqual([]);
  });

  it('BALAYÉ : partout où Δ ≥ 0, le redéveloppement retrouve (a, b, c)', () => {
    for (let a = -3; a <= 3; a += 1) {
      if (a === 0) continue;
      for (let b = -4; b <= 4; b += 1) {
        for (let c = -4; c <= 4; c += 1) {
          const f = factoredForm(a, b, c);
          if (!f.factorable) continue;
          const r = redeveloppe(f);
          expect(r.a).toBe(a);
          expect(r.b).toBeCloseTo(b, 9);
          expect(r.c).toBeCloseTo(c, 9);
        }
      }
    }
  });
});

describe('vertex — le sommet de la parabole', () => {
  it('est en −b/(2a), et son ordonnée est l’image de cette abscisse', () => {
    expect(vertex(1, -4, 3)).toEqual({ x: 2, y: -1 });
    expect(vertex(1, 0, 0)).toEqual({ x: 0, y: 0 });
  });

  it('est le MINIMUM quand a > 0, le MAXIMUM quand a < 0 — balayé', () => {
    for (const [a, b, c] of [[1, -4, 3], [2, 6, 1], [-1, 0, 4], [-3, 5, 2]]) {
      const v = vertex(a, b, c);
      for (let d = -3; d <= 3; d += 0.25) {
        if (d === 0) continue;
        const y = evalTrinome(a, b, c, v.x + d);
        if (a > 0) expect(y).toBeGreaterThan(v.y - 1e-12);
        else expect(y).toBeLessThan(v.y + 1e-12);
      }
    }
  });

  it('est à égale distance des deux racines quand elles existent', () => {
    for (const [a, b, c] of [[1, -4, 3], [-2, 4, 6], [1, -2, -1]]) {
      const rs = roots(a, b, c);
      const v = vertex(a, b, c);
      expect((rs[0] + rs[1]) / 2).toBeCloseTo(v.x, 10);
    }
  });

  it('quand Δ = 0, le sommet EST sur l’axe des abscisses', () => {
    for (const [a, b, c] of [[1, -4, 4], [1, 6, 9], [-2, 4, -2]]) {
      expect(discriminant(a, b, c)).toBe(0);
      expect(vertex(a, b, c).y).toBeCloseTo(0, 12);
      expect(vertex(a, b, c).x).toBeCloseTo(roots(a, b, c)[0], 12);
    }
  });
});

describe('trinomialSign — « du signe de a, sauf entre les racines »', () => {
  it('Δ < 0 : un seul intervalle, du signe de a', () => {
    expect(trinomialSign(1, -4, 5)).toEqual([{ from: null, to: null, sign: 1 }]);
    expect(trinomialSign(-1, 0, -1)).toEqual([{ from: null, to: null, sign: -1 }]);
  });

  it('Δ = 0 : le signe de a partout, sauf un zéro ponctuel', () => {
    const t = trinomialSign(1, -4, 4);
    expect(t.map((s) => s.sign)).toEqual([1, 0, 1]);
    expect(t[1].from).toBe(2);
  });

  it('Δ > 0 : le signe s’inverse ENTRE les racines', () => {
    const t = trinomialSign(1, -4, 3);
    expect(t.map((s) => s.sign)).toEqual([1, 0, -1, 0, 1]);
    expect([t[2].from, t[2].to]).toEqual([1, 3]);
  });

  it('a < 0 inverse tout le tableau', () => {
    const t = trinomialSign(-1, 0, 4);
    expect(t.map((s) => s.sign)).toEqual([-1, 0, 1, 0, -1]);
  });

  it('le tableau annoncé est VRAI : on l’évalue en des points de chaque intervalle', () => {
    for (const [a, b, c] of [[1, -4, 3], [-1, 0, 4], [2, -8, 8], [1, 1, 3]]) {
      for (const seg of trinomialSign(a, b, c)) {
        if (seg.sign === 0) {
          expect(Math.abs(evalTrinome(a, b, c, seg.from))).toBeLessThan(1e-9);
          continue;
        }
        const lo = seg.from ?? (seg.to ?? 0) - 5;
        const hi = seg.to ?? (seg.from ?? 0) + 5;
        // STRICTEMENT à l'intérieur : une borne EST une racine, le trinôme y
        // vaut 0 et n'a donc pas le signe de l'intervalle ouvert.
        for (let k = 1; k <= 9; k += 1) {
          const x = lo + ((hi - lo) * k) / 10;
          expect(Math.sign(evalTrinome(a, b, c, x))).toBe(seg.sign);
        }
      }
    }
  });
});

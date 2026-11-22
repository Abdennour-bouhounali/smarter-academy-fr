import { describe, it, expect } from 'vitest';
import * as P from './powers.js';

const t = (x) => P.ratText(x);

describe('powers — aⁿ exact (3AM « قوة عدد نسبي »)', () => {
  it('rationnels irréductibles, signe au numérateur, lecture des écritures', () => {
    expect(t(P.rat(6, -4))).toBe('-3/2');
    expect(t(P.parseRat('−1/27'))).toBe('-1/27');
    expect(t(P.parseRat('0,25'))).toBe('1/4');
    expect(t(P.parseRat('-12'))).toBe('-12');
    expect(() => P.parseRat('abc')).toThrow();
  });

  it('les exemples du manuel (معارف 6, p. 44) : 3⁴ = 81, a¹ = a, a⁰ = 1, 5⁻² = 1/25 = 0,04', () => {
    expect(t(P.pow(3, 4))).toBe('81');
    expect(t(P.pow(-7, 1))).toBe('-7');
    expect(t(P.pow(-7, 0))).toBe('1');
    expect(t(P.pow(5, -2))).toBe('1/25');
    expect(P.eq(P.pow(5, -2), P.parseRat('0,04'))).toBe(true);
  });

  it('le signe : négatif ⇔ base négative ET exposant impair (n relatif) — balayé', () => {
    for (const a of [-5, -3, -2, -1, 1, 2, 3, P.rat(-2, 3), P.rat(1, 2)]) {
      for (let n = -6; n <= 7; n += 1) {
        const v = P.pow(a, n);
        expect(P.sign(v), `${t(a)}^${n}`).toBe(P.powSign(a, n));
      }
    }
    expect(t(P.pow(-2, 5))).toBe('-32');
    expect(t(P.pow(-2, 4))).toBe('16');
    expect(t(P.pow(-3, -3))).toBe('-1/27');
    expect(t(P.pow(-3, -2))).toBe('1/9');
  });

  it('0ⁿ = 0 pour n > 0 ; 0⁰ et 0⁻ⁿ refusent ; exposant non entier refusé', () => {
    expect(t(P.pow(0, 3))).toBe('0');
    expect(() => P.pow(0, 0)).toThrow();
    expect(() => P.pow(0, -2)).toThrow();
    expect(() => P.pow(2, 1.5)).toThrow();
  });

  it('les règles, balayées : aᵐ·aⁿ = aᵐ⁺ⁿ, aᵐ/aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, (ab)ⁿ = aⁿbⁿ, (a/b)ⁿ = aⁿ/bⁿ', () => {
    const bases = [-3, -2, 2, 5, P.rat(-1, 2), P.rat(2, 3)];
    for (const a of bases) for (const b of bases) for (let m = -3; m <= 4; m += 1) for (let n = -3; n <= 4; n += 1) {
      expect(P.eq(P.mul(P.pow(a, m), P.pow(a, n)), P.pow(a, m + n))).toBe(true);
      expect(P.eq(P.div(P.pow(a, m), P.pow(a, n)), P.pow(a, m - n))).toBe(true);
      expect(P.eq(P.pow(P.pow(a, m), n), P.pow(a, m * n))).toBe(true);
      expect(P.eq(P.pow(P.mul(a, b), n), P.mul(P.pow(a, n), P.pow(b, n)))).toBe(true);
      expect(P.eq(P.pow(P.div(a, b), n), P.div(P.pow(a, n), P.pow(b, n)))).toBe(true);
    }
  });

  it('le TRAIN : charges successives à partir de 1 — × a puis ÷ a', () => {
    expect(P.trainLoads(-2, 5).map(t)).toEqual(['-2', '4', '-8', '16', '-32']);
    expect(P.trainLoads(-3, -3).map(t)).toEqual(['-1/3', '1/9', '-1/27']);
    expect(P.trainLoads(7, 0)).toEqual([]);
    for (const a of [-3, 2, P.rat(-1, 2)]) for (let n = -5; n <= 6; n += 1) {
      const loads = P.trainLoads(a, n);
      expect(loads.length).toBe(Math.abs(n));
      expect(P.eq(loads.at(-1) ?? P.rat(1), P.pow(a, n))).toBe(true);
    }
  });

  it('deux trains attelés : wagons × et ÷ s’annulent par paires, l’exposant est m + n (ou m − n en division)', () => {
    const c = P.couple(-2, 3, 4);
    expect(c.exponent).toBe(7);
    expect(c.cancelled).toBe(0);
    expect(t(c.load)).toBe('-128');
    const d = P.couple(2, 4, -6);
    expect(d.exponent).toBe(-2);
    expect(d.cancelled).toBe(4);
    expect(d.wagons.filter((w) => w.cancelled).length).toBe(8);
    expect(d.wagons.filter((w) => !w.cancelled).every((w) => w.kind === 'divide')).toBe(true);
    const q = P.couple(3, 5, 2, 'divide');
    expect(q.exponent).toBe(3);
    expect(q.cancelled).toBe(2);
    for (let m = -4; m <= 5; m += 1) for (let n = -4; n <= 5; n += 1) {
      const x = P.couple(-3, m, n);
      expect(x.exponent).toBe(m + n);
      expect(x.wagons.filter((w) => !w.cancelled).length).toBe(Math.abs(m + n));
      expect(P.couple(-3, m, n, 'divide').exponent).toBe(m - n);
    }
  });

  it('écriture LaTeX : parenthèses autour d’une base négative ou fractionnaire', () => {
    expect(P.powTex(-2, 5)).toBe('(-2)^{5}');
    expect(P.powTex(3, -2)).toBe('3^{-2}');
    expect(P.powTex(P.rat(-2, 3), 2)).toBe('\\left(-\\frac{2}{3}\\right)^{2}');
    expect(P.ratTex(P.rat(-1, 27))).toBe('-\\frac{1}{27}');
    expect(P.factorsTex(-2, 3)).toBe('(-2) \\times (-2) \\times (-2)');
    expect(P.factorsTex(3, -2)).toBe('\\frac{1}{3 \\times 3}');
    expect(P.factorsTex(3, 0)).toBe('1');
  });

  it('exponentOf : la cible d’une tâche a un exposant unique dans la plage', () => {
    expect(P.exponentOf(-2, '16')).toBe(4);
    expect(P.exponentOf(-2, '-32')).toBe(5);
    expect(P.exponentOf(-2, '1')).toBe(0);
    expect(P.exponentOf(-3, '1/9')).toBe(-2);
    expect(P.exponentOf(-3, '-1/27')).toBe(-3);
    expect(P.exponentOf(-2, '3')).toBeNull();
    // ±1 : plusieurs exposants donnent la même charge — exponentOf rend le premier
    expect(P.exponentOf(-1, '1', -2, 2)).toBe(-2);
  });
});

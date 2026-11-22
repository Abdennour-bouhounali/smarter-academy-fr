import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : fractions en BigInt (entiers et décimaux). */
const frac = (n, d = 1n) => ({ n: d < 0n ? -n : n, d: d < 0n ? -d : d });
const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const div = (a, b) => frac(a.n * b.d, a.d * b.n);
const R = (n, d = 1) => frac(BigInt(n), BigInt(d));
const eq = (a, b) => a.n * b.d === b.n * a.d;
const asR = (x) => { const s = String(x); const dot = s.indexOf('.'); return dot < 0 ? R(s) : frac(BigInt(s.replace('.', '')), 10n ** BigInt(s.length - dot - 1)); };
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');

describe('les وضعيات تدريبية de « أدمج تعلّماتي — الأعداد النسبية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — 12 − 1,5 t : 4,5 à 23:00, 0 °C après 8 h, −3 °C à 4:00, amplitude 21, 270,15 K, moyenne 7,5', () => {
    const at = (h) => add(R(12), mul(asR('-1.5'), R(h)));
    expect(eq(at(5), asR(nums('wadiya-1', 0)[1]))).toBe(true);
    expect(nums('wadiya-1', 0)[1]).toBe(4.5);
    const h = div(R(-12), asR('-1.5'));
    expect(eq(h, asR(nums('wadiya-1', 1)[0]))).toBe(true);
    expect(eq(at(8), R(0))).toBe(true);
    expect(nums('wadiya-1', 2)[0]).toBe(10);
    expect(eq(at(10), asR(nums('wadiya-1', 2)[1]))).toBe(true);
    expect(eq(add(R(18), mul(R(-1), at(10))), asR(nums('wadiya-1', 2)[2]))).toBe(true);
    expect(nums('wadiya-1', 2)[2]).toBe(21);
    expect(eq(add(at(10), asR('273.15')), asR(nums('wadiya-1', 3)[0]))).toBe(true);
    expect(eq(div(add(R(18), at(10)), R(2)), asR(nums('wadiya-1', 4)[1]))).toBe(true);
    expect(nums('wadiya-1', 4)).toEqual([15, 7.5]);
  });

  it('situation 2 — −750 + 450 = −300 ; 3600 dans 6 semaines ; 7200 il y a 6 semaines ; 18 semaines', () => {
    const w = add(R(-750), R(450));
    expect(eq(w, asR(nums('wadiya-2', 0)[0]))).toBe(true);
    expect(eq(mul(w, R(6)), asR(nums('wadiya-2', 1)[0]))).toBe(true);
    expect(eq(add(R(5400), mul(w, R(6))), asR(nums('wadiya-2', 1)[1]))).toBe(true);
    expect(eq(add(R(5400), mul(w, R(-6))), asR(nums('wadiya-2', 2)[0]))).toBe(true);
    expect(eq(div(R(-5400), w), asR(nums('wadiya-2', 3)[0]))).toBe(true);
    expect(eq(add(R(5400), mul(w, R(18))), R(0))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([18]);
  });

  it('situation 3 — A(−3 ; 2), B(4 ; −1), C(−2 ; −5) : A′(3 ; −2), A″(3 ; 2), T(3 ; 5) ; la figure porte les points', () => {
    const fig = PROBLEM['wadiya-3'].figure;
    expect(fig.points).toMatchObject({ A: [-3, 2], B: [4, -1], C: [-2, -5] });
    expect(nums('wadiya-3', 0)).toEqual([4, -5]);
    expect(nums('wadiya-3', 1)).toEqual([3, -2]);
    expect(eq(mul(R(-3), R(-1)), R(3))).toBe(true);
    const tx = mul(R(-3), R(-1));
    const num = mul(R(2), R(-5));
    const ty = div(num, R(-2));
    expect(eq(tx, R(3)) && eq(ty, R(5))).toBe(true);
    expect(nums('wadiya-3', 3)).toEqual([3, -10, 5]);
    expect(choices('wadiya-3', 3)[0].options[choices('wadiya-3', 3)[0].correct]).toContain('T(3\\,;\\,5)');
    expect(choices('wadiya-3', 1)[1].options[0]).toContain('المبدأ');
    expect(choices('wadiya-3', 2)[1].options[0]).toContain('محور التراتيب');
  });

  it('situation 4 — 5 et −3 : 42, 52, 40 ; (−6) ÷ (−3) = 2 ; moyenne 32 ; 20 questions par feuille', () => {
    const pts = (ok, ko) => add(mul(R(ok), R(5)), mul(R(ko), R(-3)));
    expect(12 + 6 + 2).toBe(20); expect(14 + 6).toBe(20); expect(11 + 5 + 4).toBe(20);
    expect(eq(pts(12, 6), asR(nums('wadiya-4', 0)[2]))).toBe(true);
    expect(eq(pts(14, 6), asR(nums('wadiya-4', 1)[0]))).toBe(true);
    expect(eq(pts(11, 5), asR(nums('wadiya-4', 1)[1]))).toBe(true);
    expect(eq(div(R(-6), R(-3)), asR(nums('wadiya-4', 2)[0]))).toBe(true);
    const total = [pts(12, 6), pts(14, 6), pts(11, 5), R(-6)].reduce(add, R(0));
    expect(eq(total, asR(nums('wadiya-4', 3)[0]))).toBe(true);
    expect(eq(div(total, R(4)), asR(nums('wadiya-4', 3)[1]))).toBe(true);
  });

  it('situation 5 — −36 : neuf décompositions, somme minimale −35, somme nulle (−6) × 6, trois négatifs', () => {
    const pairs = [];
    for (let d = 1; d <= 36; d += 1) if (36 % d === 0) pairs.push([-d, 36 / d]);
    expect(pairs.length).toBe(9);
    expect(pairs.every(([a, b]) => a * b === -36)).toBe(true);
    expect(nums('wadiya-5', 0)).toEqual([9]);
    expect(Math.min(...pairs.map(([a, b]) => a + b))).toBe(-35);
    expect(nums('wadiya-5', 1)).toEqual([-35]);
    expect(pairs.filter(([a, b]) => a + b === 0)).toEqual([[-6, 6]]);
    expect(nums('wadiya-5', 2)).toEqual([6]);
    expect((-1) * (-4) * (-9)).toBe(-36);
    const ch = choices('wadiya-5', 0)[1]; // « ليس تفكيكًا »
    expect(ch.options[ch.correct]).toBe('$(-5) \\times 8$');
    const sums = choices('wadiya-5', 1)[0];
    expect(sums.options[sums.correct]).toBe('$1 \\times (-36)$');
    const three = choices('wadiya-5', 3)[1];
    expect(three.options[three.correct]).toBe('$(-1) \\times (-4) \\times (-9)$');
    expect((-1) * (-4) * 9).toBe(36); expect((-3) * (-3) * (-5)).toBe(-45);
  });

  it('situation 6 — (a) 15, (b) 4, (c) vrai, (d) 12 (priorité), (e) vrai ; note 2', () => {
    const rows = PROBLEM['wadiya-6'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([1, 1, 0, 1, 0]); // 0 = صحيح
    expect(-3 * -5).toBe(15); expect((-2) ** 2).toBe(4); expect(-24 / -6).toBe(4); expect(6 - 2 * -3).toBe(12); expect((6 - 2) * -3).toBe(-12); expect((-1) ** 5).toBe(-1);
    expect(nums('wadiya-6', 1)).toEqual([15, 4, 12]);
    expect(nums('wadiya-6', 2)).toEqual([2]);
    expect(rows.filter((r) => r.correct === 0).length).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle : décimaux en centièmes (BigInt), carrés en dix-millièmes. */
const H = (s) => { const [i, f = ''] = String(s).replace('.', ',').split(','); return BigInt(i + (f + '00').slice(0, 2)); };
const sq = (s) => H(s) * H(s);
const isqrt = (n) => { let x = BigInt(Math.floor(Math.sqrt(Number(n)))); while (x * x > n) x -= 1n; while ((x + 1n) * (x + 1n) <= n) x += 1n; return x; };
const num = (n) => Number(n) / 10000; // dix-millièmes → nombre
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « خاصية فيثاغورس »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — AC² = 225, AC = 15, 15 × 850 = 12 750 ; le parterre : 4,41 ≠ 4', () => {
    const ac2 = sq(12) + sq(9);
    expect(num(ac2)).toBe(225);
    expect(isqrt(ac2) * isqrt(ac2)).toBe(ac2);
    expect(expectedOf('masala-1', 0)).toEqual([225, Number(isqrt(ac2)) / 100]);
    expect(expectedOf('masala-1', 1)).toEqual([15 * 850]);
    expect(expectedOf('masala-1', 2)).toEqual([num(sq('1,2') + sq('1,6')), num(sq('2,1'))]);
    expect(sq('2,1')).not.toBe(sq('1,2') + sq('1,6'));
    expect(sq(2)).toBe(sq('1,2') + sq('1,6')); // l'ajustement proposé : FG = 2 m
  });

  it('مسألة 2 — le cric : OR = 20 puis 24, PR = 40 puis 48, +8', () => {
    const or1 = isqrt(sq(25) - sq(15)); const or2 = isqrt(sq(25) - sq(7));
    expect(or1 * or1).toBe(sq(25) - sq(15));
    expect(or2 * or2).toBe(sq(25) - sq(7));
    expect(expectedOf('masala-2', 0)).toEqual([Number(or1) / 100, 2 * Number(or1) / 100]);
    expect(expectedOf('masala-2', 1)).toEqual([Number(or2) / 100, 2 * Number(or2) / 100]);
    expect(expectedOf('masala-2', 2)).toEqual([2 * (Number(or2) - Number(or1)) / 100]);
  });

  it('مسألة 3 — l\'écran : AC² = 218 sans racine décimale, ≈ 14,8 < 15,24', () => {
    const ac2 = sq(7) + sq(13);
    expect(num(ac2)).toBe(218);
    const r = isqrt(ac2); expect(r * r).not.toBe(ac2);
    // arrondi au dixième : ⌊(⌊2·√(AC²)·10⌋ + 1) / 2⌋
    const twice = isqrt(ac2 * 400n / 10000n * 1n);
    expect(Number((twice + 1n) / 2n) / 10).toBe(14.8);
    expect(expectedOf('masala-3', 0)).toEqual([218]);
    expect(expectedOf('masala-3', 1)).toEqual([14.8]);
    expect(expectedOf('masala-3', 2)).toEqual([15.24]);
    expect(Math.sqrt(218) < 6 * 2.54).toBe(true);
  });
});

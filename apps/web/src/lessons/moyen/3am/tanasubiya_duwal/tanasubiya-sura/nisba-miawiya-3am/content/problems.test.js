import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de percent3.js / linear.js) : un nombre est { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const same = (p, q) => p.n === q.n && p.d === q.d;
const pc = (t) => R(100n + BigInt(t), 100n); // 1 + t/100
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « النسبة المئوية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 2400 : −15 % = 360, 2040, puis +15 % = 2346 ≠ 2400', () => {
    expect(answerOf('masala-1', 0, 0)).toBe(Number(mul(R(2400n), R(15n, 100n)).n));
    const season = mul(R(2400n), pc(-15));
    expect(season.n).toBe(2040n); expect(answerOf('masala-1', 1, 0)).toBe(2040);
    const after = mul(season, pc(15));
    expect(same(after, R(2346n))).toBe(true); expect(answerOf('masala-1', 2, 0)).toBe(2346);
    expect(same(after, R(2400n))).toBe(false);
  });

  it('مسألة 2 — 40 × 35 % = 14, 60 × 55 % = 33, 47 sur 100 ; la moyenne 45 % est fausse', () => {
    expect(answerOf('masala-2', 0, 0)).toBe(Number(mul(R(40n), R(35n, 100n)).n));
    expect(answerOf('masala-2', 0, 1)).toBe(Number(mul(R(60n), R(55n, 100n)).n));
    expect(14 + 33).toBe(47);
    expect(answerOf('masala-2', 1, 0)).toBe(47); // 47 sur 40 + 60 = 100
    expect(same(R(47n, 100n), R(45n, 100n))).toBe(false);
  });

  it('مسألة 3 — 23000 = 1,15 × 20000 ; hausse 3000 ; × 0,9 × 0,95 = 0,855 → 19665 et 14,5 %', () => {
    expect(same(mul(R(20000n), pc(15)), R(23000n))).toBe(true);
    expect(answerOf('masala-3', 0, 0)).toBe(20000);
    expect(answerOf('masala-3', 1, 0)).toBe(3000);
    const k = mul(R(9n, 10n), R(95n, 100n));
    expect(same(k, R(855n, 1000n))).toBe(true);
    expect(same(mul(R(23000n), k), R(19665n))).toBe(true);
    expect(answerOf('masala-3', 2, 0)).toBe(19665);
    expect(answerOf('masala-3', 2, 1)).toBe(14.5);
  });
});

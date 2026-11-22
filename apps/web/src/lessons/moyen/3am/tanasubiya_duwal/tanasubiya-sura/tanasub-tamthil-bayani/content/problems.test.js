import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de graphs3.js / linear.js) : un nombre est { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « التناسبية والتمثيل البياني »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 900/2 = 1800/4 = 2700/6 = 450 ; 9 علب = 4050', () => {
    const a = div(R(900n), R(2n));
    expect(same(a, div(R(1800n), R(4n)))).toBe(true);
    expect(same(a, div(R(2700n), R(6n)))).toBe(true);
    expect(answerOf('masala-1', 2, 0)).toBe(Number(mul(a, R(9n)).n));
  });

  it('مسألة 2 — (2 ; 14), (4 ; 24), (6 ; 34) : alignés (+10 par 2) mais 14/2 ≠ 24/4', () => {
    expect(24 - 14).toBe(34 - 24);
    expect(same(div(R(14n), R(2n)), div(R(24n), R(4n)))).toBe(false);
    expect(same(div(R(34n), R(6n)), div(R(24n), R(4n)))).toBe(false);
  });

  it('مسألة 3 — 350/2 = 700/4 = 1750/10 = 175 ; 6 kg = 1050 ≠ 1100 ; 2800 = 16 kg', () => {
    const a = div(R(350n), R(2n));
    expect(same(a, div(R(700n), R(4n)))).toBe(true);
    expect(same(a, div(R(1750n), R(10n)))).toBe(true);
    expect(answerOf('masala-3', 0, 0)).toBe(Number(a.n));
    expect(answerOf('masala-3', 0, 1)).toBe(1050); expect(same(mul(a, R(6n)), R(1050n))).toBe(true); expect(same(mul(a, R(6n)), R(1100n))).toBe(false);
    expect(answerOf('masala-3', 2, 0)).toBe(16); expect(same(div(R(2800n), a), R(16n))).toBe(true);
  });
});

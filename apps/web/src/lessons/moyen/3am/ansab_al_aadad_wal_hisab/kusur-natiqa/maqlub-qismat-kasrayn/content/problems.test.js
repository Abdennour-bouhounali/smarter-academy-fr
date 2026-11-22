import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js / powers.js) : un nombre est { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « مقلوب عدد وقسمة كسرين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 45/4 ÷ 3/4 = 15 ; ÷ 5/8 = 18 ; 3 × 5/8 = 15/8 = 1,875', () => {
    expect(same(div(R(45n, 4n), R(3n, 4n)), R(15n))).toBe(true); expect(answerOf('masala-1', 0, 0)).toBe(15);
    expect(same(div(R(45n, 4n), R(5n, 8n)), R(18n))).toBe(true); expect(answerOf('masala-1', 1, 0)).toBe(18);
    const gift = mul(R(3n), R(5n, 8n));
    expect(same(gift, R(15n, 8n))).toBe(true); expect(answerOf('masala-1', 2, 0)).toBe(1.875); expect(1.875 * 8).toBe(15);
  });

  it('مسألة 2 — 35/6 ÷ 7/4 = 10/3 (clé du choix) ; 7/4 ÷ 7/12 = 3', () => {
    const length = div(R(35n, 6n), R(7n, 4n));
    expect(same(length, R(10n, 3n))).toBe(true);
    const step = PROBLEM['masala-2'].parts[0].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(step.options[step.correct]).toBe('$\\frac{10}{3}$');
    step.options.forEach((o, k) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(o); expect(same(R(BigInt(m[1]), BigInt(m[2])), length), o).toBe(k === step.correct); });
    expect(same(mul(length, R(7n, 4n)), R(35n, 6n))).toBe(true); // longueur × largeur = aire
    expect(same(div(R(7n, 4n), R(7n, 12n)), R(3n))).toBe(true); expect(answerOf('masala-2', 1, 0)).toBe(3);
  });

  it('مسألة 3 — 3/5 × 5/6 = 1/2 ; 18 ÷ 1/2 = 36 ; 36 − 18 = 18', () => {
    const frac = mul(R(3n, 5n), R(5n, 6n));
    expect(same(frac, R(1n, 2n))).toBe(true);
    const step = PROBLEM['masala-3'].parts[0].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    step.options.forEach((o, k) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(o); expect(same(R(BigInt(m[1]), BigInt(m[2])), frac), o).toBe(k === step.correct); });
    expect(same(div(R(18n), frac), R(36n))).toBe(true); expect(answerOf('masala-3', 1, 0)).toBe(36);
    expect(answerOf('masala-3', 2, 0)).toBe(36 - 18);
    expect(same(mul(R(36n), frac), R(18n))).toBe(true);
  });
});

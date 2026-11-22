import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle, en BigInt (indépendante de linear.js) : x est un rationnel { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const lin = (a, b) => (x) => R(a * x.n + b * x.d, x.d);
const eq = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choiceOf = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];

describe('les مسائل du درس « المعادلات من الدرجة الأولى »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 8x − 160 = 6x + 120 : x = 140, le montant 960 ; seule la première équation est vraie en 140', () => {
    const x = R(140n);
    const c = choiceOf('masala-1', 0);
    expect(c.options[c.correct]).toBe('$8x - 160 = 6x + 120$');
    const forms = [[8n, -160n, 6n, 120n], [8n, 160n, 6n, -120n], [8n, -160n, 6n, -120n], [8n, 160n, 6n, 120n]];
    forms.forEach(([a, b, c2, d], i) => expect(eq(lin(a, b)(x), lin(c2, d)(x)), c.options[i]).toBe(i === c.correct));
    expect(BigInt(answerOf('masala-1', 1, 0))).toBe(140n);
    expect(BigInt(answerOf('masala-1', 2, 0))).toBe(8n * 140n - 160n);
    expect(8n * 140n - 160n).toBe(6n * 140n + 120n);
  });

  it('مسألة 2 — 150n + 1200 = 200n − 800 : n = 40, coût 7200', () => {
    const n = R(40n);
    const c = choiceOf('masala-2', 0);
    expect(c.options[c.correct]).toBe('$150n + 1200 = 200n - 800$');
    const forms = [[150n, 1200n, 200n, -800n], [150n, -1200n, 200n, 800n], [150n, 1200n, 200n, 800n], [150n, -1200n, 200n, -800n]];
    forms.forEach(([a, b, c2, d], i) => expect(eq(lin(a, b)(n), lin(c2, d)(n)), c.options[i]).toBe(i === c.correct));
    expect(BigInt(answerOf('masala-2', 1, 0))).toBe(40n);
    expect(BigInt(answerOf('masala-2', 2, 0))).toBe(150n * 40n + 1200n);
    expect(150n * 40n + 1200n).toBe(200n * 40n - 800n);
  });

  it('مسألة 3 — x + (x+1) + (x+2) = 63 : 20, 21, 22', () => {
    const x = R(20n);
    const c = choiceOf('masala-3', 0);
    expect(c.options[c.correct]).toBe('$x + (x + 1) + (x + 2) = 63$');
    expect(eq(lin(3n, 3n)(x), R(63n))).toBe(true);
    expect(eq(lin(1n, 3n)(x), R(63n))).toBe(false); // x + 1 + 2
    expect(eq(lin(3n, 0n)(x), R(63n))).toBe(false); // 3x
    expect(eq(lin(6n, 0n)(x), R(63n))).toBe(false); // x + 2x + 3x
    expect(BigInt(answerOf('masala-3', 1, 0))).toBe(20n);
    expect(BigInt(answerOf('masala-3', 2, 0))).toBe(22n);
    expect(20n + 21n + 22n).toBe(63n);
  });
});

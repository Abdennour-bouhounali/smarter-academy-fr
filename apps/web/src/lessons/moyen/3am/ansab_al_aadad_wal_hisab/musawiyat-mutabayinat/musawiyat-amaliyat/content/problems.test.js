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

describe('les مسائل du درس « المساويات والعمليات »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 3x − 40 = 200 : x = 80, 3x = 240, 6x = 480 ; la division de 3x − 40 seulement par 3 est fausse', () => {
    const x = R(80n);
    expect(eq(lin(3n, -40n)(x), R(200n))).toBe(true);
    const c = choiceOf('masala-1', 0);
    expect(c.options[c.correct]).toBe('$3x = 240$');
    for (const [i, o] of c.options.entries()) {
      const k = o.replace(/\$/g, '');
      const lhs = k.startsWith('3x - 40') ? lin(3n, -40n)(x) : k.startsWith('3x - 80') ? lin(3n, -80n)(x) : lin(3n, 0n)(x);
      const rhs = R(BigInt(k.split('=')[1].trim()));
      expect(eq(lhs, rhs), o).toBe(i === c.correct);
    }
    expect(answerOf('masala-1', 1, 0)).toBe(6 * 80);
    expect(eq(R(2n * 240n), R(480n))).toBe(true);
    const v = choiceOf('masala-1', 2);
    expect(v.options[v.correct]).toContain('\\frac{40}{3}');
    // x − 40 = 200/3 faux : 80 − 40 = 40 ≠ 66,67
    expect(eq(R(80n - 40n), R(200n, 3n))).toBe(false);
  });

  it('مسألة 2 — 5x + 2 = 27 : x = 5 ; 5x = 25 ; 50x + 20 = 270 et les autres fausses', () => {
    const x = R(5n);
    expect(eq(lin(5n, 2n)(x), R(27n))).toBe(true);
    const c1 = choiceOf('masala-2', 0);
    expect(c1.options[c1.correct]).toBe('$5x = 25$');
    expect(eq(lin(5n, 0n)(x), R(25n))).toBe(true);
    expect(eq(lin(5n, 0n)(x), R(29n))).toBe(false);
    expect(eq(lin(5n, 2n)(x), R(25n))).toBe(false);
    expect(answerOf('masala-2', 1, 0)).toBe(5);
    const c3 = choiceOf('masala-2', 2);
    expect(c3.options[c3.correct]).toBe('$50x + 20 = 270$');
    expect(eq(lin(50n, 20n)(x), R(270n))).toBe(true);
    expect(eq(lin(50n, 2n)(x), R(270n))).toBe(false);
    expect(eq(lin(50n, 20n)(x), R(27n))).toBe(false);
  });

  it('مسألة 3 — 4 − 3x = 7 : x = −1 ; −3x = 3 ; 12 − 9x = 21 vraie, les autres fausses', () => {
    const x = R(-1n);
    expect(eq(lin(-3n, 4n)(x), R(7n))).toBe(true);
    const c1 = choiceOf('masala-3', 0);
    expect(c1.options[c1.correct]).toBe('$-3x = 3$');
    expect(eq(lin(-3n, 0n)(x), R(3n))).toBe(true);
    expect(eq(lin(-3n, 0n)(x), R(11n))).toBe(false);
    expect(eq(lin(3n, 0n)(x), R(3n))).toBe(false);
    expect(answerOf('masala-3', 1, 0)).toBe(-1);
    expect(eq(lin(-9n, 12n)(x), R(21n))).toBe(true);
    const c3 = choiceOf('masala-3', 2);
    expect(c3.options[c3.correct]).toContain('في $3$');
  });
});

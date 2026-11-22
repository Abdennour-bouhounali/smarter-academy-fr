import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle, en BigInt (indépendante de tenPowers.js) : un rationnel est { n, d }. */
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a || 1n; }; const k = g(n, d); return { n: n / k, d: d / k }; };
const mul = (a, b) => R(a.n * b.n, a.d * b.d);
const div = (a, b) => R(a.n * b.d, a.d * b.n);
const p10 = (e) => (e >= 0 ? R(10n ** BigInt(e)) : R(1n, 10n ** BigInt(-e)));
const eq = (a, b) => a.n === b.n && a.d === b.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « قواعد الحساب على قوى العدد 10 »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 1 Go = 10⁹ octets ; 1 To = 10¹² ; 128 Go / 4 Mo = 32 000 ; 1 To = 10³ Go', () => {
    const [go, to, photos, ratio] = [answerOf('masala-1', 0, 0), answerOf('masala-1', 1, 0), answerOf('masala-1', 2, 0), answerOf('masala-1', 3, 0)];
    expect(eq(p10(go), mul(mul(p10(3), p10(3)), p10(3)))).toBe(true);
    expect(eq(p10(to), mul(p10(3), p10(go)))).toBe(true);
    expect(eq(R(BigInt(photos)), div(mul(R(128n), p10(go)), mul(R(4n), p10(6))))).toBe(true);
    expect(eq(p10(ratio), div(p10(to), p10(go)))).toBe(true);
  });

  it('مسألة 2 — 1 m³ = 10³ L = 10⁶ cm³ ; 10⁶ / (5 × 10⁻²) = 20 000 000 ; 1 km² = 10⁶ m² = 100 ha', () => {
    expect(eq(p10(answerOf('masala-2', 0, 0)), mul(mul(p10(1), p10(1)), p10(1)))).toBe(true);
    expect(eq(p10(answerOf('masala-2', 1, 0)), mul(mul(p10(2), p10(2)), p10(2)))).toBe(true);
    expect(eq(R(BigInt(answerOf('masala-2', 2, 0))), div(p10(6), mul(R(5n), p10(-2))))).toBe(true);
    expect(eq(R(BigInt(answerOf('masala-2', 3, 0))), div(mul(p10(3), p10(3)), p10(4)))).toBe(true);
  });

  it('مسألة 3 — le programme est un produit par 10¹ : 2 → 20 ; 0,35 → 3,5 ; 10⁻¹ → 1', () => {
    const factor = div(mul(p10(6), p10(-8)), p10(-3));
    expect(eq(factor, p10(1))).toBe(true);
    expect(answerOf('masala-3', 2, 0)).toBe(1);
    expect(eq(mul(R(2n), factor), R(answerOf('masala-3', 0, 0) === 20 ? 20n : -1n))).toBe(true);
    expect(eq(mul(R(35n, 100n), factor), R(35n, 10n))).toBe(true);
    expect(answerOf('masala-3', 1, 0)).toBe(3.5);
    expect(eq(mul(p10(-1), factor), R(1n))).toBe(true);
    const c = PROBLEM['masala-3'].parts[3].steps.find((s) => s.kind === 'choice');
    expect(c.correct).toBe(0);
    expect(c.options[0].startsWith('صحيح')).toBe(true);
  });
});

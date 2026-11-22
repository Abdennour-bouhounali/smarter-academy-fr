import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle, en BigInt (indépendante de powers.js). */
const p = (b, e) => BigInt(b) ** BigInt(e);
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const numerics = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];

describe('les مسائل du درس « قوة عدد نسبي »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 1, 3, 9, … : le jour n compte 3ⁿ⁻¹ élèves', () => {
    const day = (n) => p(3, n - 1);
    expect([day(1), day(2), day(3)]).toEqual([1n, 3n, 9n]);
    expect(BigInt(answerOf('masala-1', 0, 0))).toBe(day(4));
    expect(p(3, answerOf('masala-1', 0, 1))).toBe(day(4));
    const c = choiceOf('masala-1', 1);
    expect(c.options[c.correct]).toBe('$3^6$');
    expect(BigInt(answerOf('masala-1', 1, 1))).toBe(day(7));
    expect(BigInt(numerics('masala-1', 2)[0])).toBe(day(10));
    expect(day(10) > 300n).toBe(true);
    const v = choiceOf('masala-1', 2);
    expect(v.options[v.correct]).toContain('19683');
  });

  it('مسألة 2 — 0,1 mm × 2ⁿ : 0,8 ; 102,4 ; au-delà d’un mètre à 14 plis', () => {
    // en dixièmes de mm : 1 × 2ⁿ
    expect(BigInt(answerOf('masala-2', 0, 0))).toBe(p(2, 3));
    expect(answerOf('masala-2', 0, 1)).toBe(Number(p(2, 3)) / 10);
    expect(answerOf('masala-2', 1, 0)).toBe(10);
    expect(answerOf('masala-2', 1, 1)).toBe(Number(p(2, 10)) / 10);
    let n = 0;
    while (p(2, n) <= 10000n) n += 1; // 0,1 × 2ⁿ > 1000 ⇔ 2ⁿ > 10000
    expect(answerOf('masala-2', 2, 0)).toBe(n);
    expect(n).toBe(14);
  });

  it('مسألة 3 — A = (−2)², B = 6, C = 4 = A', () => {
    // A = (−2)³ × (−2)⁵ / (−2)⁶
    const A = (p(-2, 3) * p(-2, 5)) / p(-2, 6);
    expect(A).toBe(4n);
    expect(p(-2, answerOf('masala-3', 0, 0))).toBe(A);
    expect(BigInt(answerOf('masala-3', 0, 1))).toBe(A);
    const B = 3n - 2n * p(-1, 7) + 1n;
    expect(BigInt(answerOf('masala-3', 1, 0))).toBe(B);
    const inner = p(2, 3) * p(5, 2);
    expect(BigInt(numerics('masala-3', 2)[0])).toBe(inner);
    const C = (inner * inner) / p(10, 4);
    expect(BigInt(answerOf('masala-3', 2, 0))).toBe(C);
    const cmp = choiceOf('masala-3', 2);
    expect(cmp.options[cmp.correct]).toBe(A === C ? '$A = C$' : A < C ? '$A < C$' : '$A > C$');
  });
});

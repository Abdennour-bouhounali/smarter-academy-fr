import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : fractions en BigInt (entiers et décimaux d'un chiffre). */
const frac = (n, d = 1n) => ({ n: d < 0n ? -n : n, d: d < 0n ? -d : d });
const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const div = (a, b) => frac(a.n * b.d, a.d * b.n);
const R = (n, d = 1) => frac(BigInt(n), BigInt(d));
const eq = (a, b) => a.n * b.d === b.n * a.d;
const stepsOf = (id, part, kind) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === kind);
const numeric = (id, part, k) => stepsOf(id, part, 'numeric')[k].expected;
const asR = (x) => { const s = String(x); const dot = s.indexOf('.'); return dot < 0 ? R(s) : frac(BigInt(s.replace('.', '')), 10n ** BigInt(s.length - dot - 1)); };

describe('les مسائل du درس « حاصل قسمة عددين نسبيين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — températures −3, −5, 2, −4, −5 : somme −15, moyenne −3 ; avec −9 : somme −24, moyenne −4 ; le moyenne a baissé', () => {
    const t = [-3, -5, 2, -4, -5].map((x) => R(x));
    const sum = t.reduce(add, R(0));
    expect(eq(sum, asR(numeric('masala-1', 0, 0)))).toBe(true);
    expect(eq(div(sum, R(5)), asR(numeric('masala-1', 1, 0)))).toBe(true);
    const sum6 = add(sum, R(-9));
    expect(eq(sum6, asR(numeric('masala-1', 2, 0)))).toBe(true);
    const mean6 = div(sum6, R(6));
    expect(eq(mean6, asR(numeric('masala-1', 2, 1)))).toBe(true);
    expect(mean6.n * R(-3).d < R(-3).n * mean6.d).toBe(true); // −4 < −3
    const c = stepsOf('masala-1', 3, 'choice')[0];
    expect(c.options[c.correct]).toContain('انخفض');
    c.options.forEach((o, i) => { if (i !== c.correct) expect(/انخفض/.test(o)).toBe(false); });
    expect(PROBLEM['masala-1'].table.rows[0]).toEqual(['−3', '−5', '2', '−4', '−5']);
  });

  it('مسألة 2 — ((x + 3) × (−4) + 12) ÷ (−2) vaut 2x : 10, −7, −40 pour 5, −3,5, −20', () => {
    const prog = (x) => div(add(mul(add(x, R(3)), R(-4)), R(12)), R(-2));
    expect(eq(prog(R(5)), asR(numeric('masala-2', 0, 0)))).toBe(true);
    expect(eq(prog(asR('-3.5')), asR(numeric('masala-2', 1, 0)))).toBe(true);
    expect(eq(prog(R(-20)), asR(numeric('masala-2', 2, 0)))).toBe(true);
    for (const x of [R(5), asR('-3.5'), R(-20), R(0), R(1), asR('2.5')]) expect(eq(prog(x), mul(R(2), x))).toBe(true);
    const c = stepsOf('masala-2', 3, 'choice')[0];
    expect(c.options[c.correct]).toBe('ضعف العدد المختار');
  });

  it('مسألة 3 — (9 + 3×(−5)) ÷ (1 + 2×(−2)) = 2 ; la machine sans parenthèses donne −10 ; 190 et −261', () => {
    const top = add(R(9), mul(R(3), R(-5)));
    const bottom = add(R(1), mul(R(2), R(-2)));
    expect([top.n, bottom.n]).toEqual([-6n, -3n]);
    expect(eq(div(top, bottom), asR(numeric('masala-3', 0, 1)))).toBe(true);
    expect(numeric('masala-3', 0, 1)).toBe(2);
    // ce que calcule la machine : 9 + ((3 × (−5)) ÷ 1) + (2 × (−2))
    const machine = add(add(R(9), div(mul(R(3), R(-5)), R(1))), mul(R(2), R(-2)));
    expect(eq(machine, asR(numeric('masala-3', 1, 0)))).toBe(true);
    expect(numeric('masala-3', 1, 0)).toBe(-10);
    expect(eq(add(mul(R(-16), R(-25)), mul(R(-14), R(15))), asR(numeric('masala-3', 3, 0)))).toBe(true);
    expect(eq(mul(add(R(16), R(-25)), add(R(14), R(15))), asR(numeric('masala-3', 3, 1)))).toBe(true);
    expect([numeric('masala-3', 3, 0), numeric('masala-3', 3, 1)]).toEqual([190, -261]);
  });
});

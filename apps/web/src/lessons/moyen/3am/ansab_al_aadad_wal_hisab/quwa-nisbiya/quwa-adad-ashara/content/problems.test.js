import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle, en BigInt (indépendante de tenPowers.js). Un décimal « 0,0001 » est lu en (chiffres, nombre de décimales). */
const dec = (text) => { const [w, f = ''] = text.replace(/\s/g, '').split(','); return { n: BigInt(w + f), d: 10n ** BigInt(f.length) }; };
const eqDec = (a, b) => a.n * b.d === b.n * a.d;
const p10 = (e) => (e >= 0 ? { n: 10n ** BigInt(e), d: 1n } : { n: 1n, d: 10n ** BigInt(-e) });
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choiceOf = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];

describe('les مسائل du درس « قوى العدد 10 »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 0,0001 = 10⁻⁴ ; 0,00001 = 10⁻⁵ ; 0,0000001 = 10⁻⁷ ; 7 zéros ; −7 < −5 < −4', () => {
    expect(eqDec(dec('0,0001'), p10(answerOf('masala-1', 0, 0)))).toBe(true);
    expect(eqDec(dec('0,00001'), p10(answerOf('masala-1', 1, 0)))).toBe(true);
    expect(eqDec(dec('0,0000001'), p10(answerOf('masala-1', 1, 1)))).toBe(true);
    const virus = '0,0000001';
    expect(virus.replace(',', '').indexOf('1')).toBe(answerOf('masala-1', 2, 0)); // zéros avant le 1, zéro des unités compris
    const [a, b, c] = [-4, -5, -7];
    expect(c < b && b < a).toBe(true);
    const v = PROBLEM['masala-1'].parts[3].steps.find((s) => s.kind === 'choice');
    expect(v.correct).toBe(0);
    expect(v.options[0].startsWith('صحيح')).toBe(true);
    // le 10⁻⁷ est bien plus petit que les deux autres, en valeurs exactes
    expect(p10(-7).n * p10(-5).d < p10(-5).n * p10(-7).d).toBe(true);
  });

  it('مسألة 2 — 2 000 km = 2 000 000 m = 2 × 10⁶ ; 40 000 km = 40 000 000 m = 4 × 10⁷ ; مفكوك 40 075', () => {
    expect(BigInt(answerOf('masala-2', 0, 0))).toBe(2000n * 1000n);
    expect(BigInt(answerOf('masala-2', 0, 0))).toBe(2n * 10n ** BigInt(answerOf('masala-2', 1, 0)));
    expect(BigInt(answerOf('masala-2', 2, 0))).toBe(40000n * 1000n);
    expect(BigInt(answerOf('masala-2', 2, 0))).toBe(4n * 10n ** BigInt(answerOf('masala-2', 2, 1)));
    const expand = (txt) => [...txt.matchAll(/(\d+) \\times 10\^(?:\{(-?\d+)\}|(-?\d+))/g)].reduce((acc, m) => acc + BigInt(m[1]) * 10n ** BigInt(m[2] ?? m[3]), 0n);
    const c = choiceOf('masala-2', 3);
    c.options.forEach((o, k) => expect(expand(o) === 40075n, o).toBe(k === c.correct));
  });

  it('مسألة 3 — مفكوك 1 207,035 ; 0,035 m³ = 35 L ; 18 m³ = 18 × 10³ = 18 000 L', () => {
    // en millièmes : 1 207,035 = 1 207 035 / 1 000
    const expandMilli = (txt) => [...txt.matchAll(/(\d+) \\times 10\^\{(-?\d+)\}|(\d+) \\times 10\^(\d)/g)].reduce((acc, m) => {
      const dg = BigInt(m[1] ?? m[3]); const e = Number(m[2] ?? m[4]);
      return acc + dg * 10n ** BigInt(e + 3);
    }, 0n);
    const c = choiceOf('masala-3', 0);
    c.options.forEach((o, k) => expect(expandMilli(o) === 1207035n, o).toBe(k === c.correct));
    // 0,035 m³ en litres : 35 millièmes de m³ = 35 L (1 L = 0,001 m³)
    expect(answerOf('masala-3', 1, 0)).toBe(35);
    expect(BigInt(answerOf('masala-3', 2, 1))).toBe(18n * 10n ** BigInt(answerOf('masala-3', 2, 0)));
    expect(answerOf('masala-3', 2, 1)).toBe(18000);
  });
});

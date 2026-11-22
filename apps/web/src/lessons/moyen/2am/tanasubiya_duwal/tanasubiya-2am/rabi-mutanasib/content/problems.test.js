import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle (fractions BigInt), indépendante de fourthProportional.js. */
const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const fr = (n, d = 1n) => { const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const fourth = (a, b, c) => fr(BigInt(b) * BigInt(c), BigInt(a));
const val = (p) => Number(p.n) / Number(p.d);
const numeric = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const choice = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];

describe('les مسائل du درس « حساب الرابع المتناسب »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — le tissu : 700 DA le mètre', () => {
    const [h, r] = [LESSON_CONFIG.lessonProblem.table.head.slice(1).map(Number), LESSON_CONFIG.lessonProblem.table.rows[0].slice(1).map(Number)];
    expect(h.map((x, i) => r[i] / x)).toEqual([700, 700]);
    expect(numeric('masala-1', 0)[0].expected).toBe(r[0] + r[1]);
    expect(val(fourth(1, 700, 8))).toBe(5600);
    expect(numeric('masala-1', 1)[0].expected).toBe(val(fourth(700, 1, 9100)));
    expect(numeric('masala-1', 2)[0].expected).toBe(28 * 700);
    expect(28 * 700 < 20000).toBe(true);
    expect(choice('masala-1', 2).options[choice('masala-1', 2).correct]).toBe('نعم، تكفي');
  });

  it('مسألة 2 — le couscous : 1250 g, 300 g, 24 et 22,5 personnes', () => {
    const n = (p, i) => numeric('masala-2', p)[i].expected;
    expect(n(0, 0)).toBe(val(fourth(6, 500, 15)));
    expect(n(1, 0)).toBe(val(fourth(6, 120, 15)));
    expect(n(2, 0)).toBe(val(fourth(500, 6, 2000)));
    expect(n(2, 1)).toBe(val(fourth(120, 6, 450)));
    expect(n(2, 2)).toBe(Math.floor(Math.min(n(2, 0), n(2, 1))));
  });

  it('مسألة 3 — le robinet : 600 L, 27 min, 200 L', () => {
    const n = (p, i) => numeric('masala-3', p)[i].expected;
    expect(n(0, 0)).toBe(val(fourth(9, 150, 36)));
    expect(n(1, 0)).toBe(val(fourth(150, 9, 450)));
    expect(n(2, 0)).toBe(val(fourth(9, 150, 12)));
    expect(val(fourth(9, 150, 3))).toBe(50);
  });
});

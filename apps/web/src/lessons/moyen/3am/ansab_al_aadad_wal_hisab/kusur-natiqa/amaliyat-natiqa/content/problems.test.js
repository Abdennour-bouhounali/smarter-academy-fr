import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js) : des rationnels { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d); return d < 0n ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }; };
const eq = (x, y) => x.n === y.n && x.d === y.d;
const add = (x, y) => R(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => add(x, R(-y.n, y.d));
const mul = (x, y) => R(x.n * y.n, x.d * y.d);
const div = (x, y) => R(x.n * y.d, x.d * y.n);
const texList = (s) => [...String(s).replace(/\$/g, '').matchAll(/(-?)\\frac\{(\d+)\}\{(\d+)\}|(-?\d+)/g)].map((m) => (m[2] ? R(BigInt(m[1] + m[2]), BigInt(m[3])) : R(BigInt(m[4]))));
const concl = (id, part, ask = 0) => { const st = PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.role === 'conclude' && s.ask === ask); return { st, key: st.options[st.correct], others: st.options.filter((_, i) => i !== st.correct) }; };
const first = (s) => texList(s)[0];

describe('les مسائل du درس « العمليات على الأعداد الناطقة »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 3/4 → 1/3 ؛ −5/4 → 5/3 ؛ 5/4 → 0', () => {
    const prog = (n) => add(mul(n, R(-2, 3)), R(5, 6));
    expect(eq(prog(R(3, 4)), R(1, 3))).toBe(true);
    expect(eq(prog(R(-5, 4)), R(5, 3))).toBe(true);
    expect(eq(prog(R(5, 4)), R(0))).toBe(true);
    for (const [part, n] of [[0, R(3, 4)], [1, R(-5, 4)]]) {
      const { key, others } = concl('masala-1', part);
      expect(eq(first(key), prog(n))).toBe(true);
      others.forEach((o) => expect(eq(first(o), prog(n))).toBe(false));
    }
    const c3 = concl('masala-1', 2);
    expect(eq(first(c3.key), R(5, 4))).toBe(true);
    c3.others.forEach((o) => expect(eq(prog(first(o)), R(0))).toBe(false));
    expect(eq(div(R(-5, 6), R(-2, 3)), R(5, 4))).toBe(true);        // une seule opération inverse
  });

  it('مسألة 2 — A = 1 ، B = −1/2 ، C = −1/3', () => {
    const x = R(-2, 3); const y = R(3, 4); const z = R(-1, 6);
    const A = sub(add(x, mul(R(2), y)), z); const B = div(add(x, y), z); const C = sub(mul(x, y), z);
    expect([A, B, C].map((v) => `${v.n}/${v.d}`)).toEqual(['1/1', '-1/2', '-1/3']);
    [[0, A], [1, B], [2, C]].forEach(([p, v]) => {
      const { key, others } = concl('masala-2', p);
      expect(eq(first(key), v)).toBe(true);
      others.forEach((o) => expect(eq(first(o), v)).toBe(false));
    });
  });

  it('مسألة 3 — D = −2 ، E = 4 ، D × E = −8 ؛ la vérification à la calculatrice', () => {
    const D = div(sub(R(5, 6), R(3, 4)), R(-1, 24)); const E = mul(add(R(-7, 10), R(1, 5)), R(-8));
    expect(eq(D, R(-2)) && eq(E, R(4)) && eq(mul(D, E), R(-8))).toBe(true);
    [[0, D], [1, E], [2, mul(D, E)]].forEach(([p, v]) => {
      const { key, others } = concl('masala-3', p);
      expect(eq(first(key), v)).toBe(true);
      others.forEach((o) => expect(eq(first(o), v)).toBe(false));
    });
    expect(D.d === 1n && E.d === 1n && E.n > 0n).toBe(true);     // relatif ; naturel
    // la calculatrice : 5/6 − 3/4 = 1/12 = 0,08333… (non décimal) ; sans parenthèses on calcule autre chose
    expect(eq(sub(R(5, 6), R(3, 4)), R(1, 12))).toBe(true);
    const noBrackets = sub(R(5, 6), div(div(R(3, 4), R(-1)), R(24)));       // 5÷6 − 3÷4÷(−1)÷24
    expect(eq(noBrackets, D)).toBe(false);
    const k4 = PROBLEM['masala-3'].parts[3].steps.filter((s) => s.kind === 'choice');
    expect(k4[0].options[k4[0].correct]).toBe('$(5\\div6-3\\div4)\\div(-1\\div24)$');
    expect(k4[1].options[k4[1].correct]).toContain('\\frac{1}{12}');
  });

  it('aucun `$` dans les `data` (texte brut) et aucune addition au programme (substitution, équations)', () => {
    for (const pb of PROBLEMS) pb.data.forEach((d) => expect(d.text).not.toContain('$'));
  });
});

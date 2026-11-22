import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js) : des rationnels { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d); return d < 0n ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }; };
const eq = (x, y) => x.n === y.n && x.d === y.d;
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l > r ? 1 : l === r ? 0 : -1; };
const texList = (s) => [...String(s).replace(/\$/g, '').matchAll(/(-?)\\frac\{(\d+)\}\{(\d+)\}|(-?\d+)/g)].map((m) => (m[2] ? R(BigInt(m[1] + m[2]), BigInt(m[3])) : R(BigInt(m[4]))));
const concl = (id, part, ask = 0) => { const st = PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.role === 'conclude' && s.ask === ask); return { st, key: st.options[st.correct], others: st.options.filter((_, i) => i !== st.correct) }; };

describe('les مسائل du درس « العدد الناطق »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — −7/3 ، −9/4 ، −13/6 ؛ −28/12 < −27/12 < −26/12 ؛ سطيف أسرع', () => {
    const cities = [[3, -4, 3], [1, -8, 4], [0, -13, 6]];
    const rates = cities.map(([a, b, h]) => R(b - a, h));
    expect(rates.map((r) => `${r.n}/${r.d}`)).toEqual(['-7/3', '-9/4', '-13/6']);
    const key = texList(concl('masala-1', 0).key);
    expect(key.every((v, i) => eq(v, rates[i]))).toBe(true);
    concl('masala-1', 0).others.forEach((o) => { const v = texList(o); expect(v.every((x, i) => eq(x, rates[i]))).toBe(false); });
    // l'ordre : la clé est triée, les autres non
    const ordered = (o) => { const v = texList(o); return v.length === 3 && v.every((x, i) => i === 0 || cmp(v[i - 1], x) < 0); };
    expect(ordered(concl('masala-1', 1).key)).toBe(true);
    concl('masala-1', 1).others.forEach((o) => expect(ordered(o)).toBe(false));
    expect(rates.map((r) => Number(r.n * 12n / r.d))).toEqual([-28, -27, -26]);
    const fastest = rates.reduce((best, r, i) => (cmp(r, rates[best]) < 0 ? i : best), 0);
    expect(PROBLEM['masala-1'].parts[2].steps.find((s) => s.role === 'conclude').options[0]).toBe(['سطيف', 'باتنة', 'خنشلة'][fastest]);
  });

  it('مسألة 2 — −20/6 = −10/3 ؛ بين −4 و −3 ؛ ليس عشريًّا ؛ −3,33', () => {
    const rate = R(-20, 6);
    expect(eq(rate, R(-10, 3))).toBe(true);
    expect(eq(texList(concl('masala-2', 0).key)[0], rate)).toBe(true);
    concl('masala-2', 0).others.forEach((o) => expect(eq(texList(o)[0], rate)).toBe(false));
    const k = rate.n / rate.d - 1n;                         // plancher d'un négatif non entier
    expect(k).toBe(-4n);
    expect(concl('masala-2', 1).key).toBe('$-4$ و $-3$');
    let d = rate.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n;
    expect(d === 1n).toBe(false);
    expect(concl('masala-2', 2).key).toContain('-3{,}33');
    expect(Math.round(-10 / 3 * 100) / 100).toBe(-3.33);
    expect(concl('masala-2', 2).others.join(' ')).toContain('-3{,}34');
  });

  it('مسألة 3 — −7/4 و 5/6 ؛ 21/12 > 10/12 ؛ −7/4 < −3/2 < 0 < 5/6', () => {
    const a = R(-7, 4); const b = R(5, 6);
    expect(eq(texList(concl('masala-3', 0).key)[0], a) && eq(texList(concl('masala-3', 0).key)[1], b)).toBe(true);
    expect(cmp(R(7, 4), R(5, 6))).toBe(1);
    expect(concl('masala-3', 1).key).toBe('$-\\frac{7}{4}$');
    const ordered = (o) => { const v = texList(o); return v.length === 4 && v.every((x, i) => i === 0 || cmp(v[i - 1], x) < 0); };
    expect(ordered(concl('masala-3', 2).key)).toBe(true);
    concl('masala-3', 2).others.forEach((o) => expect(ordered(o)).toBe(false));
    expect(eq(texList(concl('masala-3', 2).key)[1], R(-3, 2))).toBe(true);
  });

  it('aucun `$` dans les `data` (texte brut) et aucune opération sur les ناطقة', () => {
    for (const pb of PROBLEMS) pb.data.forEach((d) => expect(d.text).not.toContain('$'));
  });
});

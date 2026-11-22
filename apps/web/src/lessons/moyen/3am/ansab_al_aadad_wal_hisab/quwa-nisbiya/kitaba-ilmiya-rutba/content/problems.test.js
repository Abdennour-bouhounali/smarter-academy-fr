import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle, en BigInt (indépendante de tenPowers.js) : un rationnel est { n, d }. */
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a || 1n; }; const k = g(n, d); return { n: n / k, d: d / k }; };
const mul = (a, b) => R(a.n * b.n, a.d * b.d);
const div = (a, b) => R(a.n * b.d, a.d * b.n);
const p10 = (e) => (e >= 0 ? R(10n ** BigInt(e)) : R(1n, 10n ** BigInt(-e)));
const D = (txt) => { const [i, f = ''] = txt.split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
const eq = (a, b) => a.n === b.n && a.d === b.d;
const num = (x) => D(String(x));
const steps = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const ans = (id, part, ask) => steps(id, part).find((s) => s.ask === ask).expected;
/** n tel que 10^n ≤ v < 10^(n+1). */
const bracket = (v) => { for (let n = -30; n < 30; n += 1) { const lo = p10(n); const hi = p10(n + 1); if (lo.n * v.d <= v.n * lo.d && v.n * hi.d < hi.n * v.d) return n; } throw new Error('plage'); };
const sci = (v) => { const n = bracket(v); return { a: div(v, p10(n)), n }; };

describe('les مسائل du درس « الكتابة العلمية ورتبة القدر »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 36 000 km = 3,6 × 10⁷ m ; 10⁷ ≤ h < 10⁸ ; t = 0,12 s ; رتبة القدر 1 × 10⁻¹', () => {
    const h = mul(R(36000n), R(1000n));
    const s = sci(h);
    expect(eq(s.a, num(ans('masala-1', 0, 0)))).toBe(true);
    expect(s.n).toBe(ans('masala-1', 0, 1));
    expect(bracket(h)).toBe(ans('masala-1', 1, 0));
    const t = div(mul(num(3.6), p10(7)), mul(R(3n), p10(8)));
    expect(eq(t, num(ans('masala-1', 2, 0)))).toBe(true);
    const st = sci(t);
    expect(eq(st.a, D('1.2')) && st.n === -1).toBe(true);
    expect(ans('masala-1', 3, 0)).toBe(1); // 1,2 → 1
  });

  it('مسألة 2 — −5, −6, −7 ; ordre croissant ; 12,5 bactéries (rang 1 × 10¹) ; 10⁻⁷ ≤ virus < 10⁻⁶', () => {
    const pollen = D('0.000025'); const bact = D('0.000002'); const virus = D('0.00000012');
    expect([ans('masala-2', 0, 0), ans('masala-2', 0, 1), ans('masala-2', 0, 2)]).toEqual([sci(pollen).n, sci(bact).n, sci(virus).n]);
    expect(virus.n * bact.d < bact.n * virus.d && bact.n * pollen.d < pollen.n * bact.d).toBe(true);
    const c = PROBLEM['masala-2'].parts[1].steps.find((s) => s.kind === 'choice');
    expect(c.correct).toBe(0);
    expect(c.options[0].startsWith('الفيروس ثم البكتيريا')).toBe(true);
    const k = div(pollen, bact);
    expect(eq(k, num(ans('masala-2', 2, 0)))).toBe(true);
    const sk = sci(k);
    expect(eq(sk.a, D('1.25')) && sk.n === 1).toBe(true);
    expect(ans('masala-2', 2, 1)).toBe(1); // 1,25 → 1, n = 1
    expect(bracket(virus)).toBe(ans('masala-2', 3, 0));
  });

  it('مسألة 3 — A = 4 × 10³ ; B = 3,25 × 10⁵ ; 10⁵ ≤ B < 10⁶ ; rangs 4 × 10³ et 3 × 10⁵ ; A × B = 1,3 × 10⁹ → 1 × 10⁹', () => {
    const A = div(mul(mul(D('2.4'), p10(-3)), mul(R(5n), p10(8))), mul(R(3n), p10(2)));
    const B = mul(D('0.000325'), p10(9));
    expect(sci(A)).toMatchObject({ n: ans('masala-3', 0, 0) });
    expect(eq(sci(A).a, R(4n))).toBe(true);
    expect(sci(B).n).toBe(ans('masala-3', 0, 1));
    expect(eq(sci(B).a, D('3.25'))).toBe(true);
    expect(bracket(B)).toBe(ans('masala-3', 1, 0));
    expect(ans('masala-3', 2, 0)).toBe(3); // 3,25 → 3
    expect(ans('masala-3', 2, 1)).toBe(4);
    const AB = mul(A, B);
    expect(eq(AB, R(1300000000n))).toBe(true);
    const sab = sci(AB);
    expect(eq(sab.a, D('1.3')) && sab.n === 9).toBe(true);
    expect(ans('masala-3', 3, 0)).toBe(9); // 1,3 → 1 : 1 × 10⁹
  });
});

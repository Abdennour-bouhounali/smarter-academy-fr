import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt (les puissances de 10 aussi). */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
/** x = n / 10^k écrit comme un rationnel : dec('2,381741'). */
const dec = (s) => { const [i, f = ''] = s.split(','); return F(BigInt(i + f), 10n ** BigInt(f.length)); };
/** 10^k pour k entier relatif. */
const T = (k) => (k >= 0 ? F(10n ** BigInt(k)) : F(1n, 10n ** BigInt(-k)));
/** a^k pour une base rationnelle et k entier relatif. */
const pw = (a, k) => { let r = I(1); const base = k >= 0 ? a : F(a.d, a.n); for (let i = 0; i < Math.abs(k); i++) r = mul(r, base); return r; };
/** L'écriture scientifique d'un rationnel positif : { a, n } avec 1 ≤ a < 10. */
const sci = (x) => { for (let n = -40; n <= 40; n++) { const a = div(x, T(n)); if (!lt(a, I(1)) && lt(a, I(10))) return { a, n }; } throw new Error('sci'); };
/** Rang de grandeur : a arrondi à l'unité (demi supérieur), a = 10 devient 1 × 10^(n+1). */
const order = (x) => { const { a, n } = sci(x); const r = (2n * a.n + a.d) / (2n * a.d); return r === 10n ? { a: 1n, n: n + 1 } : { a: r, n }; };
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const answers = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];
const text = (id) => JSON.stringify(PROBLEM[id]);
const asNum = (x) => Number(x.n) / Number(x.d);

describe('les وضعيات تدريبية de « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — 2^10 = 1024 ; exposants 10 et 63 ; 2^60 ≈ 10^18 ; 1,8·10^19 × 0,04 g = 7,2 × 10^14 kg', () => {
    expect(eq(pw(I(2), 10), I(1024))).toBe(true);
    expect(answers('wadiya-1', 0)).toEqual([10, 1024]);
    expect(11 - 1).toBe(10); expect(64 - 1).toBe(63);
    expect(answers('wadiya-1', 1)).toEqual([63]);
    // (2^10)^6 = 2^60 et la rangée de grandeur exacte
    expect(eq(pw(pw(I(2), 10), 6), pw(I(2), 60))).toBe(true);
    expect(order(pw(I(2), 60))).toEqual({ a: 1n, n: 18 });
    expect(eq(pw(F(10n ** 3n), 6), T(18))).toBe(true);
    expect(eq(mul(I(3), I(6)), I(18)) && eq(F(3 + 6), I(9))).toBe(true); // 10^9 = additionner 3 et 6 : faux
    expect(eq(T(9), T(18))).toBe(false); expect(eq(T(60), T(18))).toBe(false);
    expect(right(choices('wadiya-1', 2)[1])).toBe('$10^{18}$');
    // le total exact 2^64 − 1 ≈ 1,8 × 10^19
    const total = F(2n ** 64n - 1n);
    expect(sci(total).n).toBe(19);
    expect(lt(dec('1,8'), sci(total).a) && lt(sci(total).a, dec('1,85'))).toBe(true);
    // la masse
    expect(eq(mul(dec('0,04'), T(-3)), mul(I(4), T(-5)))).toBe(true);
    expect(eq(mul(mul(dec('1,8'), T(19)), mul(I(4), T(-5))), mul(dec('7,2'), T(14)))).toBe(true);
    expect(answers('wadiya-1', 3)).toEqual([7.2, 14]);
    expect(right(choices('wadiya-1', 3)[0])).toContain('4 \\times 10^{-5}');
    expect(eq(mul(I(4), T(-2)), mul(I(4), T(-5)))).toBe(false); expect(eq(mul(I(4), T(-3)), mul(I(4), T(-5)))).toBe(false);
  });

  it('situation 2 — 3·10^2 × 10^5 = 3·10^7 ; 3·10^(2+h) ; 10 h pour 10^12 ; rapport 10^5', () => {
    expect(eq(mul(mul(I(3), T(2)), T(5)), mul(I(3), T(7)))).toBe(true);
    expect(answers('wadiya-2', 0)).toEqual([3, 7]);
    for (let h = 0; h <= 12; h++) expect(eq(mul(mul(I(3), T(2)), T(h)), mul(I(3), T(2 + h)))).toBe(true);
    // les distracteurs sont faux dès h = 1
    expect(eq(mul(I(3), T(2)), mul(I(3), T(3)))).toBe(false); // 3·10^(2h) en h = 1
    expect(eq(pw(I(30), 1), mul(I(3), T(3)))).toBe(false);
    expect(right(choices('wadiya-2', 1)[0])).toBe('$3 \\times 10^{2 + h}$');
    let first = 0; while (lt(mul(I(3), T(2 + first)), T(12))) first++;
    expect(first).toBe(10);
    expect(lt(mul(I(3), T(2 + 9)), T(12))).toBe(true); // h = 9 : 3·10^11 < 10^12
    expect(nums('wadiya-2', 2)).toEqual([11, 10]);
    expect(eq(div(mul(I(3), T(10)), mul(I(3), T(5))), T(5))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([5]);
  });

  it('situation 3 — (a) faux, (b) faux, (c) vrai, (d) faux, (e) vrai, (f) vrai ; 16, 0,001, 4,5 × 10^4 ; note 3', () => {
    const rows = PROBLEM['wadiya-3'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([1, 1, 0, 1, 0, 0]); // 0 = صحيح
    expect(eq(pw(I(-2), 4), I(16)) && !eq(pw(I(-2), 4), I(-16))).toBe(true);
    expect(eq(pw(I(10), -3), dec('0,001')) && !eq(pw(I(10), -3), I(-1000))).toBe(true);
    expect(eq(mul(T(5), T(3)), T(8))).toBe(true);
    expect(sci(I(45000))).toEqual({ a: dec('4,5'), n: 4 });
    expect(eq(mul(I(45), T(3)), I(45000))).toBe(true); expect(lt(I(45), I(10))).toBe(false); // même valeur, mais 45 n'est pas dans [1, 10[
    expect(order(mul(dec('6,7'), T(5)))).toEqual({ a: 7n, n: 5 });
    expect(eq(pw(I(3), -2), F(1, 9))).toBe(true);
    expect(rows.filter((r) => r.correct === 0).length).toBe(3);
    expect(nums('wadiya-3', 1)).toEqual([16, 0.001, 4.5, 4]);
    expect(nums('wadiya-3', 2)).toEqual([3]);
  });

  it('situation 4 — 5·10^6 mm³ ; 2,5 × 10^13 ; 6,25 × 10^7 m ; 6 × 10^4 km', () => {
    const volume = mul(I(5), T(6));
    expect(nums('wadiya-4', 0)).toEqual([5, 6]);
    const cells = mul(volume, mul(I(5), T(6)));
    expect(eq(mul(I(25), T(12)), cells)).toBe(true);
    expect(sci(cells)).toEqual({ a: dec('2,5'), n: 13 });
    expect(nums('wadiya-4', 1)).toEqual([25, 2.5, 13]);
    const height = mul(cells, mul(dec('2,5'), T(-6)));
    expect(sci(height)).toEqual({ a: dec('6,25'), n: 7 });
    expect(nums('wadiya-4', 2)).toEqual([6.25, 7]);
    const km = mul(height, T(-3));
    expect(sci(km)).toEqual({ a: dec('6,25'), n: 4 });
    expect(order(km)).toEqual({ a: 6n, n: 4 });
    expect(PROBLEM['wadiya-4'].parts[3].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected)).toEqual([4, 6]);
  });

  it('situation 5 — A = 0,49 = 4,9 × 10^-1 ; B = 10^2 ; C = 15 ; A < 1/2', () => {
    const A = mul(F(9), T(-2)); const A2 = mul(I(4), T(-1));
    const a = F(A.n * A2.d + A2.n * A.d, A.d * A2.d);
    expect(eq(a, dec('0,49'))).toBe(true);
    expect(nums('wadiya-5', 0)).toEqual([9, 0.49]);
    expect(sci(a)).toEqual({ a: dec('4,9'), n: -1 });
    expect(nums('wadiya-5', 1)).toEqual([4.9, -1]);
    expect(eq(mul(pw(I(2), 3), pw(I(5), 3)), T(3))).toBe(true);
    const B = div(pw(mul(pw(I(2), 3), pw(I(5), 3)), 2), T(4));
    expect(eq(B, T(2))).toBe(true);
    expect(nums('wadiya-5', 2)).toEqual([3, 2]);
    const C = F(-1n - 2n * (-8n));
    expect(eq(pw(I(-2), 3), I(-8)) && eq(pw(I(-1), 7), I(-1))).toBe(true);
    expect(eq(C, I(15))).toBe(true);
    expect(nums('wadiya-5', 3)).toEqual([-8, 15]);
    expect(lt(a, F(1, 2))).toBe(true);
    expect(right(choices('wadiya-5', 4)[0])).toBe('$A < \\frac{1}{2}$');
  });

  it('situation 6 — 2,381741 × 10^6 km² = 2,381741 × 10^12 m² ; 4,7 × 10^7 ; ≈ 5,07 × 10^4 m² par habitant', () => {
    const area = I(2381741);
    expect(sci(area)).toEqual({ a: dec('2,381741'), n: 6 });
    expect(nums('wadiya-6', 0)).toEqual([2.381741, 6]);
    const m2 = mul(area, T(6));
    expect(sci(m2)).toEqual({ a: dec('2,381741'), n: 12 });
    expect(order(m2)).toEqual({ a: 2n, n: 12 });
    expect(nums('wadiya-6', 1)).toEqual([12, 2]);
    const pop = mul(I(47), T(6));
    expect(sci(pop)).toEqual({ a: dec('4,7'), n: 7 });
    expect(nums('wadiya-6', 2)).toEqual([4.7, 7]);
    const per = div(m2, pop);
    expect(asNum(per)).toBeGreaterThan(50000);
    expect(asNum(per)).toBeLessThan(51000);
    expect(order(per)).toEqual({ a: 5n, n: 4 });
    expect(sci(per).n).toBe(4);
    expect(asNum(div(dec('2,381741'), dec('4,7')))).toBeCloseTo(0.507, 3);
    expect(nums('wadiya-6', 3)).toEqual([5]);
    expect(right(choices('wadiya-6', 3)[0])).toContain('5 \\times 10^{4}');
    expect(eq(mul(I(5), T(5)), mul(I(5), T(4)))).toBe(false); expect(eq(T(5), mul(I(5), T(4)))).toBe(false);
  });

  it('aucune situation ne contient de pourcentage ni de renvoi au manuel', () => {
    for (const pb of PROBLEMS) {
      const t = text(pb.id);
      expect(t).not.toMatch(/%|بالمئة|النسبة المئوية|الكتاب(?!ة)/);
    }
  });
});

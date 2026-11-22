import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : fractions exactes en BigInt. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];
/** Une seule bonne option, et c'est celle de l'indice `correct`. */
const text = (id) => JSON.stringify(PROBLEM[id]);

describe('les وضعيات تدريبية de « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — bassin 5 × 3 × 3/2 : 39 m², 13, 26, 39/4, 65/4, 5/12', () => {
    const h = F(3, 2);
    const floor = mul(I(5), I(3));
    const walls = add(mul(mul(I(2), I(5)), h), mul(mul(I(2), I(3)), h));
    const total = add(floor, walls);
    expect(eq(floor, I(15)) && eq(walls, I(24)) && eq(total, I(39))).toBe(true);
    expect(nums('wadiya-1', 0)).toEqual([15, 24, 39]);
    const d1 = mul(F(1, 3), total);
    expect(eq(d1, I(13))).toBe(true); expect(nums('wadiya-1', 1)).toEqual([13]);
    const rest = sub(total, d1);
    expect(nums('wadiya-1', 2)[0]).toBe(26);
    const d2 = mul(F(3, 8), rest);
    expect(eq(d2, F(39, 4))).toBe(true);
    const d3 = sub(rest, d2);
    expect(eq(d3, F(65, 4))).toBe(true);
    const frac = mul(sub(I(1), F(1, 3)), sub(I(1), F(3, 8)));
    expect(eq(frac, F(5, 12))).toBe(true);
    expect(eq(div(d3, total), F(5, 12))).toBe(true);
    // les distracteurs sont faux
    expect(eq(mul(F(3, 8), total), F(39, 4))).toBe(false); expect(eq(mul(F(3, 8), total), F(117, 8))).toBe(true);
    expect(eq(mul(F(3, 8), d1), F(39, 4))).toBe(false);
    expect(eq(sub(total, d2), F(65, 4))).toBe(false); expect(eq(sub(total, d2), F(117, 4))).toBe(true);
    expect(eq(sub(rest, F(3, 8)), F(205, 8))).toBe(true);
    expect(eq(sub(sub(I(1), F(1, 3)), F(3, 8)), F(7, 24))).toBe(true);
    expect(right(choices('wadiya-1', 2)[0])).toContain('\\frac{39}{4}');
    expect(right(choices('wadiya-1', 3)[0])).toContain('\\frac{65}{4}');
    expect(right(choices('wadiya-1', 4)[0])).toContain('\\frac{5}{12}');
  });

  it('situation 2 — 2/5, la moitié du reste, deux sœurs : 3/10, y = 3/20 (x = 1/20, z = 1/5 faux), prix 6000, 2400 et 1800', () => {
    const rest1 = sub(I(1), F(2, 5));
    const second = mul(F(1, 2), rest1);
    expect(eq(rest1, F(3, 5)) && eq(second, F(3, 10))).toBe(true);
    const sisters = sub(rest1, second);
    expect(eq(sisters, F(3, 10))).toBe(true);
    const half = F(1, 2);
    const x = div(sub(sub(I(1), F(2, 5)), half), I(2));
    const y = mul(sub(sub(I(1), F(2, 5)), mul(half, F(3, 5))), half);
    const z = mul(sub(F(3, 5), half), I(2));
    expect(eq(x, F(1, 20))).toBe(true); expect(eq(y, F(3, 20))).toBe(true); expect(eq(z, F(1, 5))).toBe(true);
    expect(eq(y, div(sisters, I(2)))).toBe(true);
    const ch = choices('wadiya-2', 1)[0];
    expect(ch.correct).toBe(1);
    expect(ch.options[1]).toContain('y =');
    const prize = div(I(1800), sisters);
    expect(eq(prize, I(6000))).toBe(true);
    expect(nums('wadiya-2', 2)).toEqual([6000]);
    expect(eq(mul(F(2, 5), prize), I(2400)) && eq(mul(second, prize), I(1800))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([2400, 1800]);
    expect(eq(add(add(mul(F(2, 5), prize), mul(second, prize)), I(1800)), prize)).toBe(true);
    expect(eq(mul(half, F(2, 5)), F(1, 5))).toBe(true); // distracteur « la moitié de la part de l'aîné »
    expect(right(choices('wadiya-2', 0)[1])).toContain('\\frac{3}{10}');
  });

  it('situation 3 — 27/4 kg : 18 petits pots ; 10 grands pots pleins (54/5), reste 1/2 kg ; 2400 et 2320 DA/kg ; le grand pot est plus économique', () => {
    const honey = F(27, 4);
    expect(eq(div(honey, F(3, 8)), I(18))).toBe(true); expect(nums('wadiya-3', 0)).toEqual([18]);
    const big = div(honey, F(5, 8));
    expect(eq(big, F(54, 5))).toBe(true);
    expect(big.n / big.d).toBe(10n); // partie entière
    expect(nums('wadiya-3', 1)).toEqual([10]);
    const left = sub(honey, mul(I(10), F(5, 8)));
    expect(eq(left, F(1, 2))).toBe(true);
    expect(eq(sub(honey, F(5, 8)), F(49, 8))).toBe(true);
    const pSmall = div(I(900), F(3, 8)); const pBig = div(I(1450), F(5, 8));
    expect(eq(pSmall, I(2400)) && eq(pBig, I(2320))).toBe(true);
    expect(nums('wadiya-3', 2)).toEqual([2400, 2320]);
    expect(lt(pBig, pSmall)).toBe(true);
    expect(right(choices('wadiya-3', 3)[0])).toContain('الكبيرة');
    expect(right(choices('wadiya-3', 1)[0])).toContain('\\frac{1}{2}');
  });

  it('situation 4 — 2/5 + 1/3 = 11/15 ; reste 4/15 ; 16 ÷ 4/15 = 60 km ; 24 et 20 km ; le matin est plus long', () => {
    const done = add(F(2, 5), F(1, 3));
    expect(eq(done, F(11, 15))).toBe(true);
    const left = sub(I(1), done);
    expect(eq(left, F(4, 15))).toBe(true);
    const route = div(I(16), left);
    expect(eq(route, I(60))).toBe(true); expect(nums('wadiya-4', 2)).toEqual([60]);
    expect(eq(mul(F(2, 5), route), I(24)) && eq(mul(F(1, 3), route), I(20))).toBe(true); expect(nums('wadiya-4', 3)).toEqual([24, 20]);
    expect(24 + 20 + 16).toBe(60);
    expect(lt(F(1, 3), F(2, 5))).toBe(true);
    expect(eq(F(3, 8), done)).toBe(false); expect(eq(mul(F(2, 5), F(1, 3)), F(2, 15))).toBe(true); expect(eq(sub(I(1), F(3, 8)), F(5, 8))).toBe(true);
    expect(right(choices('wadiya-4', 0)[0])).toContain('\\frac{11}{15}');
    expect(right(choices('wadiya-4', 1)[0])).toContain('\\frac{4}{15}');
  });

  it('situation 5 — 4 + 4 × (−5/4) = −1 ; −1 + 3 × (−1/3) = −2 ; (−2 − 4) ÷ 7 = −6/7 < −5/6 = −35/42', () => {
    const t22 = add(I(4), mul(I(4), F(-5, 4)));
    expect(eq(t22, I(-1))).toBe(true); expect(nums('wadiya-5', 0)).toEqual([-5, -1]);
    const t1 = add(t22, mul(I(3), F(-1, 3)));
    expect(eq(t1, I(-2))).toBe(true); expect(nums('wadiya-5', 1)).toEqual([-1, -2]);
    expect(4 + 3).toBe(7); // 4 h puis 3 h : 18:00 -> 1:00 = 7 h
    const avg = div(sub(t1, I(4)), I(7));
    expect(eq(avg, F(-6, 7))).toBe(true); expect(nums('wadiya-5', 2)).toEqual([7, -6]);
    expect(eq(F(-6, 7), F(-36, 42)) && eq(F(-5, 6), F(-35, 42))).toBe(true);
    expect(nums('wadiya-5', 3)).toEqual([-36]);
    expect(lt(avg, F(-5, 6))).toBe(true);
    expect(right(choices('wadiya-5', 2)[0])).toBe('$-\\frac{6}{7}$');
    expect(eq(div(I(7), I(-6)), F(-7, 6))).toBe(true);
  });

  it('situation 6 — (a) 23/20, (b) 2/3, (c) vrai, (d) 0 (priorité), (e) vrai ; note 2 ; pyramide 7/12', () => {
    const rows = PROBLEM['wadiya-6'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([1, 1, 0, 1, 0]); // 0 = صحيح
    expect(eq(add(F(3, 4), F(2, 5)), F(23, 20))).toBe(true); expect(eq(F(5, 9), F(23, 20))).toBe(false);
    expect(eq(F(-6, -9), F(2, 3))).toBe(true);
    expect(eq(mul(sub(F(5, 6), F(3, 2)), F(9, 4)), F(-3, 2))).toBe(true);
    expect(eq(sub(F(1, 2), mul(F(3, 4), F(2, 3))), I(0))).toBe(true);
    expect(eq(mul(sub(F(1, 2), F(3, 4)), F(2, 3)), F(-1, 6))).toBe(true); // ce que Sara a calculé
    expect(eq(div(F(14, 5), F(7, 10)), I(4))).toBe(true);
    expect(rows.filter((r) => r.correct === 0).length).toBe(2);
    expect(right(choices('wadiya-6', 1)[0])).toBe('$\\frac{23}{20}$');
    expect(right(choices('wadiya-6', 1)[1])).toBe('$\\frac{2}{3}$');
    expect(nums('wadiya-6', 1)).toEqual([0]); expect(nums('wadiya-6', 2)).toEqual([2]);
    const m1 = add(F(-1, 2), F(2, 3)); const m2 = add(F(2, 3), F(-1, 4));
    expect(eq(m1, F(1, 6)) && eq(m2, F(5, 12)) && eq(add(m1, m2), F(7, 12))).toBe(true);
    expect(eq(F(6, 18), F(7, 12))).toBe(false);
  });

  it('aucune situation ne contient de pourcentage ni de renvoi au manuel', () => {
    for (const pb of PROBLEMS) {
      const t = text(pb.id);
      expect(t).not.toMatch(/%|بالمئة|النسبة المئوية|الكتاب(?!ة)/);
    }
  });
});

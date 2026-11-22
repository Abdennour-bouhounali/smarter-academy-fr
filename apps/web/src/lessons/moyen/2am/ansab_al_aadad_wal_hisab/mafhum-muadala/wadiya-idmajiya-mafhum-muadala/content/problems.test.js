import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt (les décimaux sont écrits en dixièmes ou centièmes entiers). */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const le = (a, b) => a.n * b.d <= b.n * a.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
const D = (n, k) => F(n, 10n ** BigInt(k)); // décimal : D(15, 1) = 1,5
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];
const asNum = (q) => Number(q.n) / Number(q.d);

describe('les وضعيات تدريبية de « أدمج تعلّماتي — مفهوم معادلة »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — A = 1200 + 150n, B = 600 + 180n ; 2700, 2400, 4950, 5100 ; égalité en n = 20 ; 15 seul ; n = 12 : B', () => {
    const A = (n) => add(I(1200), mul(I(150), I(n)));
    const B = (n) => add(I(600), mul(I(180), I(n)));
    expect([10, 25].flatMap((n) => [A(n), B(n)]).map(asNum)).toEqual([2700, 2400, 4950, 5100]);
    expect(nums('wadiya-1', 1)).toEqual([2700, 2400, 4950, 5100]);
    expect(eq(A(20), B(20)) && eq(A(20), I(4200))).toBe(true);
    expect(nums('wadiya-1', 2)).toEqual([4200, 4200]);
    expect([15, 20, 25].filter((n) => lt(B(n), A(n)))).toEqual([15]);
    expect(nums('wadiya-1', 3)).toEqual([3300, 3450]);
    expect(asNum(B(15))).toBe(3300); expect(asNum(A(15))).toBe(3450);
    expect(nums('wadiya-1', 4)).toEqual([3000, 2760]);
    expect(lt(B(12), A(12))).toBe(true);
    for (const n of [10, 15, 25]) expect(eq(A(n), B(n))).toBe(false); // le seul n de cette liste où ils sont égaux est 20
    expect(1350 * 10).not.toBe(Number(asNum(A(10)))); // ADDCOEF : 1350n ≠ 1200 + 150n
    expect(right(choices('wadiya-1', 0)[0])).toContain('1200+150n');
    expect(right(choices('wadiya-1', 3)[0])).toContain('15$ فقط');
  });

  it('situation 2 — P = 1,5 L + 2 : 38 ; L = 26 ; 39,5 ≤ 40 ; 41 ≤ 40 faux ; L = 0', () => {
    const P = (L) => add(mul(D(15, 1), L), I(2));
    expect(eq(P(I(24)), I(38))).toBe(true);
    expect(nums('wadiya-2', 0)).toEqual([36, 38]);
    expect(eq(div(sub(I(41), I(2)), D(15, 1)), I(26))).toBe(true);
    expect(eq(P(I(26)), I(41))).toBe(true);
    expect(nums('wadiya-2', 1)).toEqual([26]);
    expect(le(P(I(25)), I(40)) && !le(P(I(26)), I(40))).toBe(true);
    expect(eq(P(I(25)), D(395, 1))).toBe(true);
    expect(nums('wadiya-2', 2)).toEqual([37.5, 41]);
    expect(eq(sub(I(2), I(2)), I(0))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([0]);
  });

  it('situation 3 — 2(x + 20) + 2x = 4x + 40 ; x = 30 ; 50 m et 30 m ; 1500 m² ; 160 m', () => {
    const peri = (x) => add(mul(I(2), add(x, I(20))), mul(I(2), x));
    for (const x of [0, 1, 5, 30]) expect(eq(peri(I(x)), add(mul(I(4), I(x)), I(40)))).toBe(true);
    expect(eq(peri(I(30)), I(160))).toBe(true);
    expect(eq(peri(I(30)), peri(I(20)))).toBe(false);
    expect(eq(add(mul(I(4), I(5)), I(20)), peri(I(5)))).toBe(false); // 4x + 20 est faux
    expect(eq(add(mul(I(2), I(5)), I(40)), peri(I(5)))).toBe(false); // 2x + 40 est faux
    expect(nums('wadiya-3', 1)).toEqual([120, 30]);
    expect(nums('wadiya-3', 2)).toEqual([50, 30]);
    expect(eq(mul(I(50), I(30)), I(1500))).toBe(true);
    expect(nums('wadiya-3', 3)).toEqual([1500]);
    expect(nums('wadiya-3', 4)).toEqual([160]);
    expect(right(choices('wadiya-3', 0)[0])).toContain('4x+40');
  });

  it('situation 4 — la feuille de Sara : (a) ✓ ; (b) ✗ 36 ; (c) ✗ 8 ; (d) ✓ ; (e) ✗ contre-exemple x = 0 ; point 2', () => {
    expect(eq(mul(I(4), mul(I(3), I(3))), I(36)) && eq(mul(mul(I(4), I(3)), mul(I(4), I(3))), I(144))).toBe(true);
    expect(eq(div(D(72, 1), D(9, 1)), I(8))).toBe(true);
    expect(eq(mul(D(72, 1), D(9, 1)), D(648, 2))).toBe(true); // 6,48 : MULTDIV
    expect(eq(div(D(72, 1), D(648, 2)), D(9, 1))).toBe(false);
    expect(eq(div(D(72, 1), I(8)), D(9, 1))).toBe(true);
    expect(eq(add(mul(I(2), I(3)), I(5)), sub(mul(I(4), I(3)), I(1)))).toBe(true);
    expect(eq(add(I(2), I(6)), add(mul(I(3), I(2)), I(2)))).toBe(true); // 8 = 8 en x = 2
    expect(eq(add(I(0), I(6)), add(mul(I(3), I(0)), I(2)))).toBe(false); // 6 ≠ 2 en x = 0
    const rows = PROBLEM['wadiya-4'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([0, 1, 1, 0, 1]);
    expect(nums('wadiya-4', 1)).toEqual([36, 8]);
    expect(nums('wadiya-4', 2)).toEqual([2]);
    expect(rows.filter((r) => r.correct === 0).length).toBe(2);
    expect(right(choices('wadiya-4', 1)[0])).toContain('x=0');
  });

  it('situation 5 — 5n + 1 : 6, 11 ; 201 ; n = 30 ; 231 > 230', () => {
    const cells = (n) => add(mul(I(5), I(n)), I(1));
    expect([1, 2].map((n) => asNum(cells(n)))).toEqual([6, 11]);
    expect(eq(cells(40), I(201))).toBe(true);
    expect(eq(cells(2), mul(I(6), I(2)))).toBe(false); // 6n est faux
    expect(nums('wadiya-5', 1)).toEqual([201]);
    expect(eq(cells(30), I(151))).toBe(true);
    expect(nums('wadiya-5', 2)).toEqual([150, 30]);
    expect(eq(cells(46), I(231)) && !le(cells(46), I(230))).toBe(true);
    expect(nums('wadiya-5', 3)).toEqual([231]);
    expect(right(choices('wadiya-5', 0)[0])).toBe('$5n+1$');
  });

  it('situation 6 — 2(x + 5) + 3x = 5x + 10 ; 50…70 ; x = 11 ; 2 × 16 + 33 = 65', () => {
    const prog = (x) => add(mul(I(2), add(x, I(5))), mul(I(3), x));
    for (const x of [0, 3, 8, 11]) expect(eq(prog(I(x)), add(mul(I(5), I(x)), I(10)))).toBe(true);
    expect([8, 9, 10, 11, 12].map((x) => asNum(prog(I(x))))).toEqual([50, 55, 60, 65, 70]);
    expect(nums('wadiya-6', 2)).toEqual([50, 60, 70]);
    expect(eq(prog(I(11)), I(65))).toBe(true);
    expect(eq(add(add(mul(I(2), I(11)), I(5)), mul(I(3), I(11))), I(65))).toBe(false); // 2x + 5 + 3x : le crochet oublié
    expect(nums('wadiya-6', 3)).toEqual([55, 11]);
    expect(nums('wadiya-6', 4)).toEqual([65]);
    expect(right(choices('wadiya-6', 1)[1])).toBe('$5x+10$');
  });

  it('aucune ligne ne renvoie au manuel ; l\'islam est respecté', () => {
    const all = JSON.stringify(PROBLEMS);
    expect(all).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    expect(all).not.toMatch(/خنزير|🐷|خمر|قمار|ميسر|(^|[^ء-ي])(ربا|ساحر|سحر|نرد)([^ء-ي]|$)|فائدة بنكية|ورق اللعب/);
  });
});

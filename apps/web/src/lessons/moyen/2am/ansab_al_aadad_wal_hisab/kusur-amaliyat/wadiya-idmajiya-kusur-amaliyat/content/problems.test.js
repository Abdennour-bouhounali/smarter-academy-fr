import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : fractions exactes en BigInt (les décimaux sont écrits en centièmes ou dixièmes entiers). */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
const ONE = I(1);
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];
const between = (x, lo, hi) => lt(lo, x) && lt(x, hi);

describe('les وضعيات تدريبية de « أدمج تعلّماتي — الكسور والعمليات عليها »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — 4800 familles, 3/8 puis 1/4 : 5/8, plus de la moitié, 1800 + 1200 = 3000, 3/8, 1800, 0,83 < 5/6 < 0,84', () => {
    const f = I(4800);
    const s1 = mul(F(3, 8), f); const s2 = mul(F(1, 4), f);
    expect(eq(s1, I(1800)) && eq(s2, I(1200))).toBe(true);
    expect(nums('wadiya-1', 2)).toEqual([1800, 1200, 3000]);
    const frac = add(F(3, 8), F(1, 4));
    expect(eq(frac, F(5, 8))).toBe(true);
    expect(eq(F(3 + 1, 8 + 4), F(1, 3))).toBe(true); // ACROSS ≠ 5/8
    expect(eq(F(3 + 1, 8 + 4), frac)).toBe(false);
    expect(nums('wadiya-1', 0)).toEqual([2]); // 1/4 = 2/8
    expect(nums('wadiya-1', 1)).toEqual([4]); // 1/2 = 4/8
    expect(lt(F(1, 2), frac)).toBe(true);
    expect(eq(mul(frac, f), I(3000))).toBe(true);
    const rest = sub(ONE, frac);
    expect(eq(rest, F(3, 8)) && eq(mul(rest, f), I(1800)) && eq(sub(f, I(3000)), I(1800))).toBe(true);
    expect(nums('wadiya-1', 3)).toEqual([1800]);
    const share = F(2500, 3000);
    expect(eq(share, F(5, 6))).toBe(true);
    expect(between(share, F(83, 100), F(84, 100))).toBe(true);
    expect(mul(I(3000), F(83, 100)).n).toBe(2490n); expect(mul(I(3000), F(84, 100)).n).toBe(2520n);
    expect(nums('wadiya-1', 4)).toEqual([2490, 2520]);
    expect(between(share, F(84, 100), F(85, 100))).toBe(false);
    expect(between(share, F(82, 100), F(83, 100))).toBe(false);
    expect(eq(sub(ONE, F(1, 4)), F(3, 4)) && !eq(F(3, 4), rest)).toBe(true);
    expect(right(choices('wadiya-1', 4)[1])).toContain('0{,}83 < \\frac{5}{6} < 0{,}84');
  });

  it('situation 2 — 1/3 puis 3/4 du reste : 2/3, 1/2, 1/6, 3000 MB, 1000 MB', () => {
    const rest1 = sub(ONE, F(1, 3));
    expect(eq(rest1, F(2, 3))).toBe(true);
    const w2 = mul(F(3, 4), rest1);
    expect(eq(w2, F(1, 2))).toBe(true);
    expect(eq(add(F(3, 4), rest1), F(17, 12))).toBe(true); // somme pour produit
    expect(eq(add(F(1, 3), w2), F(5, 6))).toBe(true);
    expect(nums('wadiya-2', 2)).toEqual([5]);
    const left = sub(ONE, add(F(1, 3), w2));
    expect(eq(left, F(1, 6))).toBe(true);
    // 500 MB = 1/6 : le tout se trouve par MULTIPLICATION, jamais par division par une fraction
    expect(eq(mul(I(6), I(500)), I(3000)) && eq(mul(left, I(3000)), I(500))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([3000]);
    expect(eq(mul(F(1, 3), I(3000)), I(1000))).toBe(true);
    expect(nums('wadiya-2', 4)).toEqual([1000]);
    expect(1000 + 1500 + 500).toBe(3000);
    expect(right(choices('wadiya-2', 1)[1])).toContain('\\frac{1}{2}');
    expect(right(choices('wadiya-2', 2)[0])).toContain('\\frac{1}{6}');
    expect(JSON.stringify(PROBLEM['wadiya-2'])).not.toMatch(/\\div \\frac/);
  });

  it('situation 3 — les cartes : /12 = 6, 4, 3, 2, 1 ; ordre ; UN choix de quatre fait 1 ; trois cartes ; 16/12 − 1 = 1/3', () => {
    const cards = [F(1, 2), F(1, 3), F(1, 4), F(1, 6), F(1, 12)];
    expect(cards.map((c) => c.n * 12n / c.d)).toEqual([6n, 4n, 3n, 2n, 1n]);
    const total = cards.reduce(add, I(0));
    expect(eq(total, F(16, 12))).toBe(true);
    expect(nums('wadiya-3', 2)).toEqual([16, 4]);
    // exactement un choix de quatre cartes fait 1 (celui qui écarte 1/3) ; exactement un choix de trois
    const four = cards.map((_, skip) => cards.filter((__, i) => i !== skip).reduce(add, I(0)));
    expect(four.filter((s) => eq(s, ONE)).length).toBe(1);
    expect(eq(four[1], ONE)).toBe(true);
    let threes = 0;
    for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) for (let c = b + 1; c < 5; c++) if (eq(add(add(cards[a], cards[b]), cards[c]), ONE)) threes += 1;
    expect(threes).toBe(1);
    expect(eq(add(add(F(1, 2), F(1, 3)), F(1, 6)), ONE)).toBe(true);
    expect(eq(add(add(add(F(1, 2), F(1, 3)), F(1, 4)), F(1, 12)), F(14, 12))).toBe(true);
    expect(eq(add(add(add(F(1, 3), F(1, 4)), F(1, 6)), F(1, 12)), F(10, 12))).toBe(true);
    expect(eq(add(add(F(1, 2), F(1, 4)), F(1, 6)), F(11, 12))).toBe(true);
    expect(eq(add(add(F(1, 3), F(1, 4)), F(1, 6)), F(9, 12))).toBe(true);
    expect(eq(sub(total, ONE), F(1, 3))).toBe(true);
    const sorted = [...cards].sort((a, b) => (lt(a, b) ? -1 : 1));
    expect(sorted.map((c) => c.d)).toEqual([12n, 6n, 4n, 3n, 2n]);
    expect(right(choices('wadiya-3', 4)[0])).toContain('\\frac{1}{3}');
  });

  it('situation 4 — 500 = 26 × 19 + 6, 19 rideaux, 0,6 m, 19,2 < 50/2,6 < 19,3, 21 × 2,6 = 54,6, il manque 4,6', () => {
    expect(500n === 26n * 19n + 6n && 6n < 26n).toBe(true);
    expect(26n * 18n + 32n).toBe(500n); expect(32n < 26n).toBe(false);
    expect(26n * 19n + 16n).not.toBe(500n);
    expect(nums('wadiya-4', 0)).toEqual([500, 494]);
    expect(nums('wadiya-4', 1)).toEqual([19, 0.6]);
    const q = F(500, 26);
    expect(26n * 192n).toBe(4992n); expect(26n * 193n).toBe(5018n); // 499,2 et 501,8 (×10)
    expect(nums('wadiya-4', 2)).toEqual([499.2, 501.8]);
    expect(between(q, F(192, 10), F(193, 10))).toBe(true);
    expect(between(q, F(191, 10), F(192, 10))).toBe(false);
    expect(between(q, F(193, 10), F(194, 10))).toBe(false);
    expect(eq(mul(I(21), F(26, 10)), F(546, 10))).toBe(true);
    expect(eq(sub(F(546, 10), I(50)), F(46, 10))).toBe(true);
    expect(nums('wadiya-4', 3)).toEqual([54.6, 4.6]);
    expect(lt(I(50), F(546, 10))).toBe(true);
    expect(right(choices('wadiya-4', 2)[0])).toContain('19{,}2 < \\frac{50}{2{,}6} < 19{,}3');
  });

  it('situation 5 — 9600 DA : 3/8, 1/4, 5/16 et 1/16 ; 3600, 2400, 3000, 600 ; 5/8 > 1/2', () => {
    const t = I(9600);
    const shares = [F(3, 8), F(1, 4), F(5, 16)];
    const fourth = sub(ONE, shares.reduce(add, I(0)));
    expect(eq(fourth, F(1, 16))).toBe(true);
    expect(nums('wadiya-5', 0)).toEqual([6, 4]); // 3/8 = 6/16 ; 1/4 = 4/16
    expect(eq(add(add(F(6, 16), F(4, 16)), F(5, 16)), F(15, 16))).toBe(true);
    expect([...shares, fourth].map((s) => Number(mul(s, t).n))).toEqual([3600, 2400, 3000, 600]);
    expect(nums('wadiya-5', 2)).toEqual([3600, 2400, 3000, 600]);
    const order = [...shares, fourth].sort((a, b) => (lt(a, b) ? 1 : -1));
    expect(order.map((s) => `${s.n}/${s.d}`)).toEqual(['3/8', '5/16', '1/4', '1/16']);
    expect(eq(add(F(3, 8), F(1, 4)), F(5, 8))).toBe(true);
    expect(nums('wadiya-5', 3)).toEqual([5]);
    expect(lt(F(1, 2), F(5, 8))).toBe(true);
    expect(3600 + 2400).toBe(6000); expect(6000 > 4800).toBe(true);
  });

  it('situation 6 — la feuille de Riyad : (a) ✗ 7/10 ; (b) ✓ ; (c) ✗ ; (d) ✓ ; (e) ✗ 125 = 9 × 13 + 8 ; point 2', () => {
    expect(eq(add(F(2, 5), F(3, 10)), F(7, 10))).toBe(true);
    expect(eq(F(2 + 3, 5 + 10), F(1, 3))).toBe(true); // 5/15 ≠ 7/10
    expect(eq(F(5, 15), F(7, 10))).toBe(false);
    expect(eq(mul(F(3, 4), F(8, 9)), F(2, 3))).toBe(true);
    expect(lt(F(4, 7), F(4, 5))).toBe(true); // donc 4/7 > 4/5 est faux
    expect(314n * 7n < 2200n && 2200n < 315n * 7n).toBe(true);
    expect(9n * 12n + 17n).toBe(125n); expect(17n < 9n).toBe(false);
    expect(9n * 13n + 8n).toBe(125n); expect(8n < 9n).toBe(true);
    expect(9n * 14n + 1n).not.toBe(125n);
    const rows = PROBLEM['wadiya-6'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([1, 0, 1, 0, 1]);
    expect(rows.filter((r) => r.correct === 0).length).toBe(2);
    expect(nums('wadiya-6', 2)).toEqual([2]);
    expect(right(choices('wadiya-6', 1)[2])).toContain('9 \\times 13 + 8');
    expect(right(choices('wadiya-6', 1)[0])).toContain('\\frac{7}{10}');
  });

  it('aucune ligne ne renvoie au manuel ; les erreurs de nom sont réécrites ; l\'islam est respecté', () => {
    const all = JSON.stringify(PROBLEMS);
    expect(all).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    expect(all).not.toMatch(/خنزير|🐷|خمر|قمار|ميسر|(^|[^ء-ي])(ربا|ساحر|سحر|نرد)([^ء-ي]|$)|فائدة بنكية|ورق اللعب/);
  });
});

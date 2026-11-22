import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt (entiers et décimaux) et polynômes à une lettre {degré: coefficient rationnel}. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const D = (s) => { const neg = s.startsWith('-'); const t = neg ? s.slice(1) : s; const [i, f = ''] = String(t).split('.'); return Q((neg ? -1n : 1n) * BigInt(i + f), 10n ** BigInt(f.length)); };
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const div = (a, b) => Q(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const ZERO = Q(0);
const num = (x) => D(String(x));
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');

/* polynômes : { 0: c0, 1: c1, 2: c2 } */
const P = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? D(v) : Q(v)]));
const pAdd = (a, b) => { const r = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const v = add(a[k] ?? ZERO, b[k] ?? ZERO); if (v.n !== 0n) r[k] = v; } return r; };
const pNeg = (a) => Object.fromEntries(Object.entries(a).map(([k, v]) => [k, Q(-v.n, v.d)]));
const pSub = (a, b) => pAdd(a, pNeg(b));
const pMul = (a, b) => { let r = {}; for (const [i, x] of Object.entries(a)) for (const [j, y] of Object.entries(b)) r = pAdd(r, { [Number(i) + Number(j)]: mul(x, y) }); return r; };
const pEq = (a, b) => { const d = pSub(a, b); return Object.keys(d).length === 0; };
const pAt = (a, x) => Object.entries(a).reduce((s, [k, v]) => add(s, mul(v, Array.from({ length: Number(k) }).reduce((p) => mul(p, x), Q(1)))), ZERO);
const X = P({ 1: 1 });
const K = (v) => P({ 0: v });

describe('les وضعيات تدريبية de « أدمج تعلّماتي — الحساب الحرفي »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — le carré magique : 8 sommes égales à 3a − 3 pour a de −2 à 3 ; a = 2 donne la grille −6 9 0 / 7 1 −5 / 2 −7 8 ; a = −1 donne −6', () => {
    const g = [[P({ 0: -2, 1: -2 }), P({ 0: 3, 1: 3 }), P({ 0: -4, 1: 2 })], [P({ 0: -3, 1: 5 }), P({ 0: -1, 1: 1 }), P({ 0: 1, 1: -3 })], [K(2), P({ 0: -5, 1: -1 }), P({ 1: 4 })]];
    const S = P({ 0: -3, 1: 3 });
    const rows = g; const cols = [0, 1, 2].map((c) => g.map((r) => r[c]));
    const diags = [[0, 1, 2].map((i) => g[i][i]), [0, 1, 2].map((i) => g[i][2 - i])];
    for (const line of [...rows, ...cols, ...diags]) expect(pEq(line.reduce(pAdd), S)).toBe(true);
    for (const a of [-2, -1, 0, 1, 2, 3]) for (const line of [...rows, ...cols, ...diags]) expect(eq(pAt(line.reduce(pAdd), Q(a)), Q(3 * a - 3))).toBe(true);
    const at2 = g.map((r) => r.map((c) => pAt(c, Q(2))));
    expect(at2.map((r) => r.map((c) => Number(c.n / c.d)))).toEqual([[-6, 9, 0], [7, 1, -5], [2, -7, 8]]);
    expect(nums('wadiya-1', 3)).toEqual([7, -5, 3]);
    expect(eq(pAt(S, Q(2)), Q(3))).toBe(true);
    expect(eq(pAt(S, Q(-1)), num(nums('wadiya-1', 4)[0]))).toBe(true);
    expect(nums('wadiya-1', 4)).toEqual([-6]);
    // les distracteurs sont faux : 3a + 3, 7a − 3 ne valent pas S
    expect(pEq(P({ 0: 3, 1: 3 }), S)).toBe(false);
    expect(pEq(P({ 0: -3, 1: 7 }), S)).toBe(false);
  });

  it('situation 2 — (x+6)(x+3) = x²+9x+18 ; l\'herbe (x+6)(x+1,5) = x²+7,5x+9 ; en 3,5 : 61,75 / 47,5 / 14,25 ; 5700 DA', () => {
    const tot = pMul(P({ 0: 6, 1: 1 }), P({ 0: 3, 1: 1 }));
    expect(pEq(tot, P({ 0: 18, 1: 9, 2: 1 }))).toBe(true);
    const grass = pMul(P({ 0: 6, 1: 1 }), P({ 0: '1.5', 1: 1 }));
    expect(pEq(grass, P({ 0: 9, 1: '7.5', 2: 1 }))).toBe(true);
    const path = pMul(P({ 0: '1.5' }), P({ 0: 6, 1: 1 }));
    expect(pEq(pSub(tot, path), grass)).toBe(true);
    const x = D('3.5');
    expect(eq(pAt(tot, x), num(nums('wadiya-2', 2)[0]))).toBe(true);
    expect(eq(pAt(grass, x), num(nums('wadiya-2', 2)[1]))).toBe(true);
    expect(eq(pAt(path, x), num(nums('wadiya-2', 2)[2]))).toBe(true);
    expect(nums('wadiya-2', 2)).toEqual([61.75, 47.5, 14.25]);
    expect(eq(mul(pAt(grass, x), Q(120)), num(nums('wadiya-2', 3)[0]))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([5700]);
    expect(eq(add(pAt(grass, x), pAt(path, x)), num(nums('wadiya-2', 4)[0]))).toBe(true);
    // les distracteurs : x²+18 et x²+9x+16,5 et x²+1,5x+9 ne sont pas l'herbe
    expect(pEq(P({ 0: 18, 2: 1 }), tot)).toBe(false);
    expect(pEq(P({ 0: '16.5', 1: 9, 2: 1 }), grass)).toBe(false);
    expect(pEq(P({ 0: 9, 1: '1.5', 2: 1 }), grass)).toBe(false);
  });

  it('situation 3 — programmes : 0 donne −4 trois fois ; 2 donne 6, 6, 0 ; 1 = 2 (développement) ; 3 ≠ 1 ; −1/2 donne −5,25', () => {
    const p1 = pMul(pAdd(X, K(4)), pSub(X, K(1)));
    const p2 = pSub(pAdd(pMul(X, X), pMul(K(3), X)), K(4));
    const p3 = pSub(pMul(X, X), K(4));
    expect(pEq(p1, p2)).toBe(true);
    expect(pEq(p1, p3)).toBe(false);
    for (const p of [p1, p2, p3]) expect(eq(pAt(p, Q(0)), Q(-4))).toBe(true);
    expect([p1, p2, p3].map((p) => Number(pAt(p, Q(2)).n))).toEqual([6, 6, 0]);
    expect(nums('wadiya-3', 0)).toEqual([-4, -4, -4]);
    expect(nums('wadiya-3', 1)).toEqual([6, 6, 0]);
    const h = Q(-1, 2);
    expect(eq(pAt(p1, h), D('-5.25')) && eq(pAt(p2, h), D('-5.25'))).toBe(true);
    expect(nums('wadiya-3', 3)).toEqual([-5.25, -5.25]);
    expect(eq(pAt(p3, h), D('-3.75'))).toBe(true);
  });

  it('situation 4 — A − B = x − 25 ; 12 → 900 et 913 (A) ; 30 → 1350 et 1345 (B) ; égalité à 25 : 1225', () => {
    const A = pAdd(K(600), pMul(K(25), X)); const B = pAdd(K(625), pMul(K(24), X));
    expect(pEq(pSub(A, B), pSub(X, K(25)))).toBe(true);
    expect(pEq(pAdd(A, B), pSub(X, K(25)))).toBe(false);
    expect(pEq(pSub(A, B), pAdd(X, K(25)))).toBe(false); // x + 25
    expect(pEq(pSub(A, B), pSub(pMul(K(49), X), K(25)))).toBe(false);
    expect(nums('wadiya-4', 2)).toEqual([900, 913]);
    expect(eq(pAt(A, Q(12)), Q(900)) && eq(pAt(B, Q(12)), Q(913))).toBe(true);
    expect(eq(pAt(pSub(A, B), Q(12)), Q(-13))).toBe(true);
    expect(nums('wadiya-4', 3)).toEqual([1350, 1345]);
    expect(eq(pAt(A, Q(30)), Q(1350)) && eq(pAt(B, Q(30)), Q(1345))).toBe(true);
    expect(eq(pAt(pSub(A, B), Q(30)), Q(5))).toBe(true);
    expect(nums('wadiya-4', 4)).toEqual([25, 1225]);
    expect(eq(pAt(A, Q(25)), Q(1225)) && eq(pAt(B, Q(25)), Q(1225))).toBe(true);
    expect(Number(pAt(pSub(A, B), Q(12)).n) < 0).toBe(true);
  });

  it('situation 5 — AED = 4 ; EBF = 2x ; DFC = 12 − 3x ; somme 16 − x ; EDF = 8 + x ; x = 1 : 15 et 9 ; différence 2(4 − x) ≥ 0, nulle en 4', () => {
    const edb = K(4); const ebf = pMul(K(2), X); const dfc = pSub(K(12), pMul(K(3), X));
    expect(eq(Q(2 * 4, 2), num(nums('wadiya-5', 0)[0]))).toBe(true); // ½ · 2 · 4
    expect(pEq(ebf, pMul(P({ 0: '0.5' }), pMul(K(4), X)))).toBe(true);
    expect(pEq(dfc, pMul(P({ 0: '0.5' }), pMul(K(6), pSub(K(4), X))))).toBe(true);
    const sum = pAdd(pAdd(edb, ebf), dfc);
    expect(pEq(sum, pSub(K(16), X))).toBe(true);
    const edf = pSub(K(24), sum);
    expect(pEq(edf, pAdd(K(8), X))).toBe(true);
    expect(pEq(pAdd(K(16), X), sum)).toBe(false);
    expect(pEq(pSub(K(8), X), edf)).toBe(false);
    expect(eq(pAt(sum, Q(1)), Q(15)) && eq(pAt(edf, Q(1)), Q(9))).toBe(true);
    expect(nums('wadiya-5', 5)).toEqual([15, 9]);
    const diff = pSub(sum, edf);
    expect(pEq(diff, pMul(K(2), pSub(K(4), X)))).toBe(true);
    for (const v of ['0', '1', '2.5', '4']) expect(pAt(diff, D(v)).n >= 0n).toBe(true);
    expect(eq(pAt(diff, Q(4)), ZERO) && eq(pAt(sum, Q(4)), Q(12)) && eq(pAt(edf, Q(4)), Q(12))).toBe(true);
    // la figure : les mesures du dessin (AB = 6, AD = 4, AE = 2) sont celles de l'énoncé
    const f = PROBLEM['wadiya-5'].figure.points;
    expect([f.B[0] - f.A[0], f.D[1] - f.A[1], f.E[0] - f.A[0], f.C[1] - f.B[1]]).toEqual([6, 4, 2, 4]);
    expect(f.F[0]).toBe(6); expect(f.F[1] >= 0 && f.F[1] <= 4).toBe(true);
  });

  it('situation 6 — D_R = 5V/18 ; V = 72 : 20 ; sec 20,736 → 40,736 → 4,264 ; mouillé 41,472 → 61,472 → −16,472 ; V = 90 sec : 57,4', () => {
    const DR = (v) => div(mul(Q(5), v), Q(18));
    const DFs = (v) => div(mul(v, v), Q(250)); const DFw = (v) => div(mul(v, v), Q(125));
    const v = Q(72);
    expect(eq(DR(v), Q(20))).toBe(true);
    expect(eq(DFs(v), D('20.736'))).toBe(true);
    expect(eq(add(DR(v), DFs(v)), D('40.736'))).toBe(true);
    expect(eq(sub(Q(45), add(DR(v), DFs(v))), D('4.264'))).toBe(true);
    expect(eq(DFw(v), D('41.472'))).toBe(true);
    expect(eq(add(DR(v), DFw(v)), D('61.472'))).toBe(true);
    expect(eq(sub(Q(45), add(DR(v), DFw(v))), D('-16.472'))).toBe(true);
    expect(eq(add(DR(Q(90)), DFs(Q(90))), D('57.4'))).toBe(true);
    expect(nums('wadiya-6', 0)).toEqual([20]);
    expect(nums('wadiya-6', 1)).toEqual([20.736, 40.736]);
    expect(nums('wadiya-6', 2)).toEqual([4.264]);
    expect(nums('wadiya-6', 3)).toEqual([41.472, 61.472]);
    expect(nums('wadiya-6', 4)).toEqual([25, 32.4, 57.4]);
    expect(eq(DFs(Q(90)), D('32.4'))).toBe(true);
  });

  it('chaque question à choix a une bonne option unique et chaque situation a ses données utiles et inutiles', () => {
    for (const pb of PROBLEMS) {
      expect(pb.data.some((d) => d.useful) && pb.data.some((d) => !d.useful)).toBe(true);
      pb.parts.forEach((_, i) => { for (const c of choices(pb.id, i)) { expect(new Set(c.options).size).toBe(c.options.length); expect(c.correct).toBe(0); } });
    }
  });
});

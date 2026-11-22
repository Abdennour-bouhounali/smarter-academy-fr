// Oracle du banc « wadiya-idmajiya-muadalat » (أدمج تعلّماتي — المعادلات والمتراجحات), feuilles BEM
// (2026-10-07) — chaque réponse RECALCULÉE ici, sans lire le contenu ni le code testé. Fusionné dans
// scripts/practice-answer-oracle.test.mjs.
//
// Une petite arithmétique d'expressions est écrite ICI (analyseur récursif + rationnels exacts de
// helpers.mjs), indépendante de packages/core/arithmetic/linear.js. Les entrées portent les expressions
// TELLES QU'IMPRIMÉES sur la feuille (multiplication implicite « 3(x - 2) », puissances « ^2 »,
// fractions « \dfrac{1}{2} », virgule décimale « 2{,}5 ») ; elles ont été écrites avec la banque par le
// script de l'auteur : ne pas éditer une entrée sans recalculer l'autre côté.
//
// Conventions de saisie (feuilles BEM de l'unité 4) :
//   • « حلّ المتراجحة » = DEUX questions : bound (le حدّ k, solution de l'équation associée) puis sym
//     (A « x < k », B « x ≤ k », C « x > k », D « x ≥ k », ordre fixe) ;
//   • « حلّ المعادلة (…)(…) = 0 » = « الحلّ الأصغر » puis « الحلّ الأكبر » ;
//   • نشر / تحليل (unité 3) = les coefficients, un rationnel chacun (counted:false sur la feuille) ;
//   • les choix fermés (« ما هي الصيغة الأقل تكلفة؟ »، « هل … ؟ ») sont recalculés en évaluant les coûts.
import { R, C, q } from './helpers.mjs';

/* ── analyseur : nombres, x, + − × ÷, ^ entier, parenthèses, multiplication implicite ── */
function prep(src) {
  let s = String(src);
  for (let k = 0; k < 4; k += 1) s = s.replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  return s.replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\left|\\right/g, '').replace(/\s+/g, '');
}
function evaluate(src, xv) {
  const s = prep(src);
  let i = 0;
  const X = xv === undefined ? null : q(xv);
  const startsAtom = () => i < s.length && (s[i] === '(' || s[i] === 'x' || /\d/.test(s[i]));
  function atom() {
    if (s[i] === '(') { i += 1; const v = sum(); if (s[i] !== ')') throw new Error(`) attendue dans ${src}`); i += 1; return v; }
    if (s[i] === 'x') { if (!X) throw new Error(`x sans valeur dans ${src}`); i += 1; return X; }
    const m = s.slice(i).match(/^\d+(\.\d+)?/);
    if (!m) throw new Error(`terme illisible dans ${src} @${i}`);
    i += m[0].length;
    return q(m[0]);
  }
  function power() {
    let b = atom();
    if (s[i] === '^') { i += 1; const e = Number(s.slice(i).match(/^\d+/)[0]); i += String(e).length; let r = q(1); for (let k = 0; k < e; k += 1) r = r.mul(b); b = r; }
    return b;
  }
  function implicit() { let v = power(); while (startsAtom()) v = v.mul(power()); return v; }
  function unary() { if (s[i] === '-') { i += 1; return unary().neg(); } if (s[i] === '+') { i += 1; return unary(); } return implicit(); }
  function product() {
    let v = unary();
    while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); }
    return v;
  }
  function sum() {
    let v = product();
    while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = product(); v = op === '+' ? v.add(w) : v.sub(w); }
    return v;
  }
  const v = sum();
  if (i !== s.length) throw new Error(`reste illisible dans ${src}`);
  return v;
}

const sign = (v) => (v.n > 0n ? 1 : v.n < 0n ? -1 : 0);
const cmpQ = (a, b) => sign(q(a).sub(q(b)));
const truth = (a, rel, b) => { const c = cmpQ(a, b); return { '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0, '=': c === 0 }[rel]; };
const FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
const SYM = { '<': 'A', '<=': 'B', '>': 'C', '>=': 'D' };

/** Coefficients exacts (a, b, c) d'une expression de degré ≤ 2, vérifiés sur deux autres points. */
function quad(expr) {
  const c = evaluate(expr, 0); const p = evaluate(expr, 1); const m = evaluate(expr, -1);
  const a = p.add(m).div(2).sub(c); const b = p.sub(m).div(2);
  for (const t of [2, 7]) {
    const T = q(t);
    if (!a.mul(T).mul(T).add(b.mul(T)).add(c).sub(evaluate(expr, t)).isZero()) throw new Error(`degré > 2 : ${expr}`);
  }
  return { a, b, c };
}

/** L REL R → { rel, bound } (x rel bound) ; L − R doit être de degré 1 exactement. */
function rayOf(L, rel, Rr) {
  const l = quad(L); const r = quad(Rr);
  if (!l.a.sub(r.a).isZero()) throw new Error(`non linéaire : ${L} ${rel} ${Rr}`);
  const A = l.b.sub(r.b);
  if (A.isZero()) throw new Error(`sans x : ${L} ${rel} ${Rr}`);
  return { rel: rel === '=' ? '=' : sign(A) > 0 ? rel : FLIP[rel], bound: r.c.sub(l.c).div(A) };
}
const satisfies = (L, rel, Rr, v) => truth(evaluate(L, v), rel, evaluate(Rr, v));
/** Contrôle croisé : la borne trouvée sépare bien les solutions (au voisinage). */
function checkedRay(L, rel, Rr) {
  const r = rayOf(L, rel, Rr);
  const eps = q('1/1000');
  const got = [satisfies(L, rel, Rr, r.bound.sub(eps)), satisfies(L, rel, Rr, r.bound), satisfies(L, rel, Rr, r.bound.add(eps))];
  const want = { '<': [true, false, false], '<=': [true, true, false], '>': [false, false, true], '>=': [false, true, true], '=': [false, true, false] }[r.rel];
  if (got.some((g, k) => g !== want[k])) throw new Error(`oracle wadiya-idmajiya-muadalat : borne incohérente pour ${L} ${rel} ${Rr}`);
  return r;
}

/* ── les clés ─────────────────────────────────────────────────────────── */
const solveEq = (L, Rr) => R(checkedRay(L, '=', Rr).bound.toString());
const bound = (L, rel, Rr) => R(checkedRay(L, rel, Rr).bound.toString());
const sym = (L, rel, Rr) => C(SYM[checkedRay(L, rel, Rr).rel]);
/** Racines de (f1)(f2) = 0 : chaque facteur de degré 1, racine vérifiée en annulant le produit. */
const root = (f1, f2, which) => {
  const rs = [f1, f2].map((f) => checkedRay(f, '=', '0').bound);
  for (const r0 of rs) if (!evaluate(`(${f1})(${f2})`, r0).isZero()) throw new Error('oracle root');
  rs.sort((u, v) => cmpQ(u, v));
  if (cmpQ(rs[0], rs[1]) === 0) throw new Error('oracle root : racine double');
  return R((which === 'min' ? rs[0] : rs[1]).toString());
};
const coef = (expr, k) => R(quad(expr)[{ 2: 'a', 1: 'b', 0: 'c' }[k]].toString());
/** expr = (common)(m x + n) : m ou n, l'identité vérifiée sur plusieurs points. */
const factor = (expr, common, which) => {
  const pts = [3, 5, 11, 13].map((t) => q(t)).filter((t) => !evaluate(common, t).isZero());
  const o = (t) => evaluate(expr, t).div(evaluate(common, t));
  const [t0, t1] = pts;
  const m = o(t1).sub(o(t0)).div(t1.sub(t0)); const n = o(t0).sub(m.mul(t0));
  for (const t of pts) if (!o(t).sub(m.mul(t).add(n)).isZero()) throw new Error(`oracle factor : ${expr} ÷ ${common}`);
  return R((which === 'm' ? m : n).toString());
};
const val = (expr, v) => R(evaluate(expr, v).toString());
const calc = (expr) => R(evaluate(expr).toString());
/** Choix fermé « نعم / لا » : A si v vérifie L rel R. */
const test = (L, rel, Rr, v) => C(satisfies(L, rel, Rr, v) ? 'A' : 'B');
/** La moins chère des formules (dans l'ordre des options) pour x = v ; égalité ⇒ erreur. */
const cheapest = (costs, v) => {
  const vals = costs.map((c) => evaluate(c, v));
  const min = vals.reduce((a, b) => (cmpQ(a, b) <= 0 ? a : b));
  const at = vals.map((w, k) => (cmpQ(w, min) === 0 ? k : -1)).filter((k) => k >= 0);
  if (at.length !== 1) throw new Error('oracle cheapest : égalité');
  return C('ABCD'[at[0]]);
};
/** Plus petit / plus grand entier naturel vérifiant TOUTES les conditions [L, rel, R]. */
const nats = (conds) => { const out = []; for (let n = 0; n <= 20000; n += 1) if (conds.every(([L, rel, Rr]) => satisfies(L, rel, Rr, n))) out.push(n); return out; };
const firstNat = (...conds) => R(Math.min(...nats(conds)));
const lastNat = (...conds) => { const s = nats(conds); if (s.includes(20000)) throw new Error('oracle lastNat : non borné'); return R(Math.max(...s)); };
/** Nombre d'entiers relatifs (balayage −2000 … 2000) vérifiant toutes les conditions. */
const countInt = (...conds) => { let k = 0; for (let n = -2000; n <= 2000; n += 1) if (conds.every(([L, rel, Rr]) => satisfies(L, rel, Rr, n))) k += 1; return R(k); };
const maxInt = (...conds) => { let best = null; for (let n = -2000; n <= 2000; n += 1) if (conds.every(([L, rel, Rr]) => satisfies(L, rel, Rr, n))) best = n; return R(best); };
const minInt = (...conds) => { for (let n = -2000; n <= 2000; n += 1) if (conds.every(([L, rel, Rr]) => satisfies(L, rel, Rr, n))) return R(n); throw new Error('oracle minInt'); };

/** Côté de la représentation : A « على يمين » (x > k, x ≥ k), B « على يسار ». */
const side = (L, rel, Rr) => C(['>', '>='].includes(checkedRay(L, rel, Rr).rel) ? 'A' : 'B');
/** Ensemble des entiers NATURELS solutions (ensemble fini exigé), « 0, 1, 2 ». */
const natSet = (...conds) => { const s = nats(conds); if (s.includes(20000)) throw new Error('oracle natSet : non borné'); return R(s.join(', ')); };
/** Encadrement des solutions communes, comparé aux options [lo, loIn, hi, hiIn] (null = infini). */
const enc = (conds, opts) => {
  const rays = conds.map(([L, rel, Rr]) => checkedRay(L, rel, Rr));
  const lower = rays.filter((r) => r.rel === '>' || r.rel === '>=');
  const upper = rays.filter((r) => r.rel === '<' || r.rel === '<=');
  if (lower.length !== 1 || upper.length !== 1) throw new Error('oracle enc : pas un encadrement');
  const want = [lower[0].bound, lower[0].rel === '>=', upper[0].bound, upper[0].rel === '<='];
  const same = (o) => o[0] !== null && o[2] !== null && cmpQ(o[0], want[0]) === 0 && o[1] === want[1] && cmpQ(o[2], want[2]) === 0 && o[3] === want[3];
  const hits = opts.map((o, k) => (same(o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error('oracle enc : option introuvable');
  return C('ABCD'[hits[0]]);
};
/** Avec un budget, la formule qui donne le PLUS d'unités (plus grand n tel que coût(n) ≤ budget) ; égalité ⇒ erreur. */
const mostUnits = (costs, budget) => {
  const best = costs.map((c) => { let n = -1; for (let k = 0; k <= 20000; k += 1) if (truth(evaluate(c, k), '<=', budget)) n = k; return n; });
  const max = Math.max(...best);
  const at = best.map((b, k) => (b === max ? k : -1)).filter((k) => k >= 0);
  if (at.length !== 1) throw new Error('oracle mostUnits : égalité');
  return C('ABCD'[at[0]]);
};
/** Valeur approchée PAR DÉFAUT à 10^-d de a√n + b (a > 0, n, b entiers) : ⌊10^d·a√n⌋ (racine entière exacte) + 10^d·b. */
const isqrt = (N) => { if (N < 2n) return N; let x = N; let y = (x + 1n) / 2n; while (y < x) { x = y; y = (x + N / x) / 2n; } return x; };
const approxDown = (a, n, b, d) => {
  const p = 10n ** BigInt(d);
  const A = BigInt(a); const Nn = BigInt(n);
  const floorPart = isqrt(A * A * Nn * p * p);   // ⌊a√n · 10^d⌋
  return R(q(`${floorPart + BigInt(b) * p}/${p}`).toString());
};

const K = (s) => `ex-4am-wadiya-idmajiya-muadalat-${s}`;

export const ORACLE = {
  /* ── Niveau 1 ── */
  [K('l1-001:q1')]: solveEq("-2 + x", "5"),
  [K('l1-001:q2')]: test("-2 + x", "=", "5", 3),
  [K('l1-002:q1')]: solveEq("4x", "5x"),
  [K('l1-002:q2')]: solveEq("4x + 3", "5x"),
  [K('l1-003:q1')]: root("x - 3", "2x + 2", "min"),
  [K('l1-003:q2')]: root("x - 3", "2x + 2", "max"),
  [K('l1-004:q1')]: bound("-\\dfrac{1}{3}x", ">", "1"),
  [K('l1-004:q2')]: sym("-\\dfrac{1}{3}x", ">", "1"),
  [K('l1-005:q1')]: coef("300 + 5x", 1),
  [K('l1-005:q2')]: coef("300 + 5x", 0),
  [K('l1-005:q3')]: val("300 + 5x", 10),
  [K('l1-006:q1')]: coef("50 + 30x", 1),
  [K('l1-006:q2')]: coef("50 + 30x", 0),
  [K('l1-006:q3')]: val("50 + 30x", 7),
  [K('l1-007:q1')]: solveEq("3x - 4", "2x + 5"),
  [K('l1-008:q1')]: root("3x + 6", "2x - 7", "min"),
  [K('l1-008:q2')]: root("3x + 6", "2x - 7", "max"),
  [K('l1-009:q1')]: val("40x", 4),
  [K('l1-009:q2')]: val("150 + 10x", 4),
  [K('l1-009:q3')]: cheapest(["40x", "150 + 10x"], 4),
  [K('l1-010:q1')]: bound("2x + 9", ">=", "7x - 6"),
  [K('l1-010:q2')]: sym("2x + 9", ">=", "7x - 6"),
  /* ── Niveau 2 ── */
  [K('l2-001:q1')]: factor("x^2 - 1", "x - 1", "n"),
  [K('l2-001:q2')]: root("x - 1", "x + 1", "min"),
  [K('l2-001:q3')]: root("x - 1", "x + 1", "max"),
  [K('l2-002:q2')]: val("2x + 5", -1),
  [K('l2-003:q1')]: test("2x", "<", "-3", -1),
  [K('l2-003:q2')]: test("2x + 1", "<", "0", -1),
  [K('l2-003:q3')]: test("-x + 1", ">", "0", -1),
  [K('l2-003:q4')]: bound("2x + 1", "<", "0"),
  [K('l2-003:q5')]: sym("2x + 1", "<", "0"),
  [K('l2-004:q1')]: test("x", ">", "-3", -3),
  [K('l2-004:q2')]: side("x", ">", "-3"),
  [K('l2-004:q3')]: bound("2x + 7", ">", "1"),
  [K('l2-004:q4')]: sym("2x + 7", ">", "1"),
  [K('l2-005:q1')]: coef("150x", 1),
  [K('l2-005:q2')]: coef("1500 + 90x", 1),
  [K('l2-005:q3')]: coef("1500 + 90x", 0),
  [K('l2-005:q4')]: bound("150x", ">", "90x + 1500"),
  [K('l2-005:q5')]: sym("150x", ">", "90x + 1500"),
  [K('l2-006:q1')]: solveEq("3x", "x + 200"),
  [K('l2-006:q2')]: firstNat(["x + 200", "<", "3x"]),
  [K('l2-007:q1')]: solveEq("5(x - 2)", "3x + 4"),
  [K('l2-007:q2')]: val("5(x - 2)", solveEq("5(x - 2)", "3x + 4").value),
  [K('l2-008:q1')]: bound("-4x + 7", ">=", "19"),
  [K('l2-008:q2')]: sym("-4x + 7", ">=", "19"),
  [K('l2-008:q3')]: maxInt(["-4x + 7", ">=", "19"]),
  [K('l2-009:q2')]: factor("(3x - 1)^2 - 16", "3x - 5", "m"),
  [K('l2-009:q3')]: factor("(3x - 1)^2 - 16", "3x - 5", "n"),
  [K('l2-009:q4')]: root("3x - 5", "3x + 3", "min"),
  [K('l2-009:q5')]: root("3x - 5", "3x + 3", "max"),
  [K('l2-010:q1')]: solveEq("120x", "80x + 200"),
  [K('l2-010:q2')]: cheapest(["120x", "80x + 200"], 3),
  /* ── Niveau 3 ── */
  [K('l3-001:q1')]: coef("(5x - 1)^2 - (2x + 3)(5x - 1)", 2),
  [K('l3-001:q2')]: coef("(5x - 1)^2 - (2x + 3)(5x - 1)", 1),
  [K('l3-001:q3')]: coef("(5x - 1)^2 - (2x + 3)(5x - 1)", 0),
  [K('l3-001:q4')]: factor("(5x - 1)^2 - (2x + 3)(5x - 1)", "5x - 1", "m"),
  [K('l3-001:q5')]: factor("(5x - 1)^2 - (2x + 3)(5x - 1)", "5x - 1", "n"),
  [K('l3-001:q6')]: root("5x - 1", "3x - 4", "min"),
  [K('l3-001:q7')]: root("5x - 1", "3x - 4", "max"),
  [K('l3-001:q8')]: val("(5x - 1)^2 - (2x + 3)(5x - 1)", -1),
  [K('l3-002:q1')]: coef("(x + 4)^2 - x(x - 2)", 1),
  [K('l3-002:q2')]: coef("(x + 4)^2 - x(x - 2)", 0),
  [K('l3-002:q4')]: bound("(x + 4)^2 - x(x - 2)", ">=", "(3x - 1)(3x + 1) - (3x - 2)^2"),
  [K('l3-002:q5')]: sym("(x + 4)^2 - x(x - 2)", ">=", "(3x - 1)(3x + 1) - (3x - 2)^2"),
  [K('l3-002:q6')]: lastNat(["(x + 4)^2 - x(x - 2)", ">=", "(3x - 1)(3x + 1) - (3x - 2)^2"]),
  [K('l3-003:q1')]: bound("x + 1", ">", "-1"),
  [K('l3-003:q2')]: sym("x + 1", ">", "-1"),
  [K('l3-003:q3')]: test("x + 1", ">", "-1", -2),
  [K('l3-003:q4')]: side("x + 1", ">", "-1"),
  [K('l3-004:q1')]: coef("75x", 1),
  [K('l3-004:q2')]: coef("560 + 5x", 1),
  [K('l3-004:q3')]: coef("560 + 5x", 0),
  [K('l3-004:q4')]: val("75x", 8),
  [K('l3-004:q5')]: val("560 + 5x", 8),
  [K('l3-004:q6')]: solveEq("75x", "5x + 560"),
  [K('l3-005:q1')]: bound("1500 + 100x", "<", "250x"),
  [K('l3-005:q2')]: sym("1500 + 100x", "<", "250x"),
  [K('l3-005:q3')]: firstNat(["1500 + 100x", "<", "250x"]),
  [K('l3-005:q4')]: val("250x - (1500 + 100x)", 16),
  [K('l3-006:q1')]: solveEq("15x", "400 + 5x"),
  [K('l3-006:q2')]: val("15x", solveEq("15x", "400 + 5x").value),
  [K('l3-006:q3')]: cheapest(["15x", "400 + 5x"], 100),
  [K('l3-007:q1')]: coef("(x - 2)^2 - (x - 2)(3x + 1)", 2),
  [K('l3-007:q2')]: coef("(x - 2)^2 - (x - 2)(3x + 1)", 1),
  [K('l3-007:q3')]: coef("(x - 2)^2 - (x - 2)(3x + 1)", 0),
  [K('l3-007:q4')]: factor("(x - 2)^2 - (x - 2)(3x + 1)", "x - 2", "m"),
  [K('l3-007:q5')]: factor("(x - 2)^2 - (x - 2)(3x + 1)", "x - 2", "n"),
  [K('l3-007:q6')]: bound("5x - 3", "<=", "8x + 9"),
  [K('l3-007:q7')]: sym("5x - 3", "<=", "8x + 9"),
  [K('l3-008:q1')]: coef("3(x - 2) - (x + 4)", 1),
  [K('l3-008:q2')]: coef("3(x - 2) - (x + 4)", 0),
  [K('l3-008:q3')]: bound("3(x - 2) - (x + 4)", ">", "2"),
  [K('l3-008:q4')]: sym("3(x - 2) - (x + 4)", ">", "2"),
  [K('l3-008:q5')]: minInt(["3(x - 2) - (x + 4)", ">", "2"]),
  [K('l3-009:q1')]: coef("(x + 2)(x - 9) + 4(x + 2)", 2),
  [K('l3-009:q2')]: coef("(x + 2)(x - 9) + 4(x + 2)", 1),
  [K('l3-009:q3')]: coef("(x + 2)(x - 9) + 4(x + 2)", 0),
  [K('l3-009:q4')]: factor("(x + 2)(x - 9) + 4(x + 2)", "x + 2", "n"),
  [K('l3-009:q5')]: root("x + 2", "x - 5", "min"),
  [K('l3-009:q6')]: root("x + 2", "x - 5", "max"),
  [K('l3-009:q7')]: val("(x + 2)(x - 9) + 4(x + 2)", 40),
  [K('l3-010:q1')]: coef("x + x + x", 1),
  [K('l3-010:q2')]: coef("2(x + 3 + 5)", 1),
  [K('l3-010:q3')]: coef("2(x + 3 + 5)", 0),
  [K('l3-010:q4')]: bound("x + x + x", ">", "2(x + 3 + 5)"),
  [K('l3-010:q5')]: sym("x + x + x", ">", "2(x + 3 + 5)"),
  [K('l3-010:q6')]: firstNat(["x + x + x", ">", "2(x + 3 + 5)"]),
  /* ── Niveau 4 ── */
  [K('l4-001:q2')]: factor("(3x + 4)(x - 7) - (54x^2 - 96)", "3x + 4", "m"),
  [K('l4-001:q3')]: factor("(3x + 4)(x - 7) - (54x^2 - 96)", "3x + 4", "n"),
  [K('l4-001:q4')]: root("3x + 4", "-17x + 17", "min"),
  [K('l4-001:q5')]: root("3x + 4", "-17x + 17", "max"),
  [K('l4-001:q6')]: bound("54x^2 - 96", "<=", "18x(3x + 1) - 90"),
  [K('l4-001:q7')]: sym("54x^2 - 96", "<=", "18x(3x + 1) - 90"),
  [K('l4-002:q1')]: coef("(2x - 3)^2 - (x + 2)(2x - 3)", 2),
  [K('l4-002:q2')]: coef("(2x - 3)^2 - (x + 2)(2x - 3)", 1),
  [K('l4-002:q3')]: coef("(2x - 3)^2 - (x + 2)(2x - 3)", 0),
  [K('l4-002:q4')]: factor("(2x - 3)^2 - (x + 2)(2x - 3)", "2x - 3", "n"),
  [K('l4-002:q5')]: root("2x - 3", "x - 5", "min"),
  [K('l4-002:q6')]: root("2x - 3", "x - 5", "max"),
  [K('l4-002:q7')]: bound("2x^2 - 13x + 15", "<=", "2x^2 + 41"),
  [K('l4-002:q8')]: sym("2x^2 - 13x + 15", "<=", "2x^2 + 41"),
  [K('l4-003:q1')]: bound("-3x + 1", ">", "7x + 11"),
  [K('l4-003:q2')]: sym("-3x + 1", ">", "7x + 11"),
  [K('l4-003:q3')]: bound("\\dfrac{1}{2}x - 3", "<=", "x - 1"),
  [K('l4-003:q4')]: sym("\\dfrac{1}{2}x - 3", "<=", "x - 1"),
  [K('l4-003:q5')]: enc([["-3x + 1", ">", "7x + 11"], ["\\dfrac{1}{2}x - 3", "<=", "x - 1"]], [["-4", true, "-1", false], ["-4", false, "-1", true], [null, false, "-4", false], ["-1", true, null, false]]),
  [K('l4-003:q6')]: countInt(["-3x + 1", ">", "7x + 11"], ["\\dfrac{1}{2}x - 3", "<=", "x - 1"]),
  [K('l4-004:q1')]: bound("560 + 5x", "<", "75x"),
  [K('l4-004:q2')]: sym("560 + 5x", "<", "75x"),
  [K('l4-004:q3')]: firstNat(["560 + 5x", "<", "75x"]),
  [K('l4-004:q4')]: val("75x - (560 + 5x)", 12),
  [K('l4-005:q2')]: factor("2x^2 + 7x - 15 + (2x - 3)^2", "2x - 3", "m"),
  [K('l4-005:q3')]: factor("2x^2 + 7x - 15 + (2x - 3)^2", "2x - 3", "n"),
  [K('l4-005:q4')]: bound("(2x - 3)(x + 5)", ">=", "2x^2 + 5"),
  [K('l4-005:q5')]: sym("(2x - 3)(x + 5)", ">=", "2x^2 + 5"),
  [K('l4-005:q6')]: root("2x - 3", "3x + 2", "min"),
  [K('l4-005:q7')]: root("2x - 3", "3x + 2", "max"),
  [K('l4-006:q1')]: coef("2000 + 150x", 1),
  [K('l4-006:q2')]: coef("2000 + 150x", 0),
  [K('l4-006:q3')]: coef("500 + 300x", 1),
  [K('l4-006:q4')]: coef("500 + 300x", 0),
  [K('l4-006:q5')]: bound("500 + 300x", ">", "2000 + 150x"),
  [K('l4-006:q6')]: sym("500 + 300x", ">", "2000 + 150x"),
  [K('l4-006:q7')]: firstNat(["500 + 300x", ">", "2000 + 150x"]),
  [K('l4-007:q1')]: coef("(2x + 1)^2 - (2x + 1)(x + 5)", 2),
  [K('l4-007:q2')]: coef("(2x + 1)^2 - (2x + 1)(x + 5)", 1),
  [K('l4-007:q3')]: coef("(2x + 1)^2 - (2x + 1)(x + 5)", 0),
  [K('l4-007:q4')]: factor("(2x + 1)^2 - (2x + 1)(x + 5)", "2x + 1", "n"),
  [K('l4-007:q5')]: root("2x + 1", "x - 4", "min"),
  [K('l4-007:q6')]: root("2x + 1", "x - 4", "max"),
  [K('l4-007:q7')]: bound("(2x + 1)^2 - (2x + 1)(x + 5)", ">", "2x(x - 3)"),
  [K('l4-007:q8')]: sym("(2x + 1)^2 - (2x + 1)(x + 5)", ">", "2x(x - 3)"),
  [K('l4-008:q1')]: coef("(x + 2)^2 - x(x + 1)", 1),
  [K('l4-008:q2')]: coef("(x + 2)^2 - x(x + 1)", 0),
  [K('l4-008:q3')]: bound("(x + 2)^2 - x(x + 1)", "<", "19"),
  [K('l4-008:q4')]: sym("(x + 2)^2 - x(x + 1)", "<", "19"),
  [K('l4-008:q5')]: natSet(["(x + 2)^2 - x(x + 1)", "<", "19"]),
  [K('l4-009:q1')]: coef("x(x + 6)", 1),
  [K('l4-009:q2')]: coef("(x + 2)^2", 1),
  [K('l4-009:q3')]: coef("(x + 2)^2", 0),
  [K('l4-009:q4')]: bound("x(x + 6)", ">", "(x + 2)^2"),
  [K('l4-009:q5')]: sym("x(x + 6)", ">", "(x + 2)^2"),
  [K('l4-009:q6')]: solveEq("x(x + 6) - (x + 2)^2", "20"),
  [K('l4-010:q1')]: approxDown(2, 3, -7, 2),
  [K('l4-010:q2')]: bound("2x - 7", ">=", "0"),
  [K('l4-010:q3')]: sym("2x - 7", ">=", "0"),
  [K('l4-010:q4')]: coef("(2x - 7)^2 + 4x^2 - 49", 2),
  [K('l4-010:q5')]: coef("(2x - 7)^2 + 4x^2 - 49", 1),
  [K('l4-010:q6')]: coef("(2x - 7)^2 + 4x^2 - 49", 0),
  [K('l4-010:q8')]: root("4x", "2x - 7", "min"),
  [K('l4-010:q9')]: root("4x", "2x - 7", "max"),
  /* ── Niveau 5 ── */
  [K('l5-001:q1')]: val("900x", 15),
  [K('l5-001:q2')]: val("600x + 7500", 15),
  [K('l5-001:q3')]: solveEq("900x", "27000"),
  [K('l5-001:q4')]: val("600x + 7500", solveEq("900x", "27000").value),
  [K('l5-001:q5')]: coef("900x", 1),
  [K('l5-001:q6')]: coef("7500 + 600x", 1),
  [K('l5-001:q7')]: coef("7500 + 600x", 0),
  [K('l5-001:q8')]: bound("900x", ">", "600x + 7500"),
  [K('l5-001:q9')]: sym("900x", ">", "600x + 7500"),
  [K('l5-001:q10')]: cheapest(["900x", "600x + 7500"], 32),
  [K('l5-001:q11')]: val("900x - (600x + 7500)", 32),
  [K('l5-002:q1')]: val("60x", 25),
  [K('l5-002:q2')]: val("400 + 40x", 25),
  [K('l5-002:q3')]: val("1300 + 10x", 25),
  [K('l5-002:q4')]: coef("400 + 40x", 1),
  [K('l5-002:q5')]: coef("400 + 40x", 0),
  [K('l5-002:q6')]: coef("1300 + 10x", 1),
  [K('l5-002:q7')]: coef("1300 + 10x", 0),
  [K('l5-002:q8')]: bound("400 + 40x", "<", "60x"),
  [K('l5-002:q9')]: sym("400 + 40x", "<", "60x"),
  [K('l5-002:q10')]: bound("400 + 40x", "<", "1300 + 10x"),
  [K('l5-002:q11')]: sym("400 + 40x", "<", "1300 + 10x"),
  [K('l5-002:q12')]: enc([["400 + 40x", "<", "60x"], ["400 + 40x", "<", "1300 + 10x"]], [["20", false, "30", false], ["30", false, null, false], [null, false, "20", false], ["20", true, "30", true]]),
  [K('l5-003:q1')]: val("40x", 30),
  [K('l5-003:q2')]: val("25x + 600", 30),
  [K('l5-003:q3')]: solveEq("40x", "2000"),
  [K('l5-003:q4')]: val("25x + 600", solveEq("40x", "2000").value),
  [K('l5-003:q5')]: coef("40x", 1),
  [K('l5-003:q6')]: coef("600 + 25x", 1),
  [K('l5-003:q7')]: coef("600 + 25x", 0),
  [K('l5-003:q8')]: solveEq("40x", "25x + 600"),
  [K('l5-003:q10')]: cheapest(["40x", "25x + 600"], 35),
  [K('l5-003:q11')]: cheapest(["40x", "25x + 600"], 52),
  [K('l5-004:q1')]: cheapest(["6000x", "4000x + 10000", "34000"], 7),
  [K('l5-004:q2')]: coef("6000x", 1),
  [K('l5-004:q3')]: coef("10000 + 4000x", 1),
  [K('l5-004:q4')]: coef("10000 + 4000x", 0),
  [K('l5-004:q5')]: solveEq("6000x", "4000x + 10000"),
  [K('l5-004:q6')]: solveEq("4000x + 10000", "34000"),
  [K('l5-004:q7')]: firstNat(["4000x + 10000", "<", "6000x"]),
  [K('l5-005:q1')]: val("300x", 5),
  [K('l5-005:q2')]: val("180x + 1200", 5),
  [K('l5-005:q3')]: solveEq("300x", "3600"),
  [K('l5-005:q4')]: val("180x + 1200", solveEq("300x", "3600").value),
  [K('l5-005:q5')]: coef("1200 + 180x", 1),
  [K('l5-005:q6')]: coef("1200 + 180x", 0),
  [K('l5-005:q7')]: lastNat(["300x", "<=", "4200"]),
  [K('l5-005:q8')]: lastNat(["180x + 1200", "<=", "4200"]),
  [K('l5-005:q9')]: mostUnits(["300x", "180x + 1200"], 2000),
  [K('l5-006:q1')]: solveEq("250x", "4000"),
  [K('l5-006:q2')]: solveEq("150x + 1300", "4000"),
  [K('l5-006:q3')]: bound("150x + 1300", "<", "250x"),
  [K('l5-006:q4')]: sym("150x + 1300", "<", "250x"),
  [K('l5-006:q5')]: cheapest(["250x", "150x + 1300"], 9),
  [K('l5-006:q6')]: cheapest(["250x", "150x + 1300"], 16),
  [K('l5-007:q1')]: lastNat(["2 \\times (16 + 2) \\times 2(x + 150) + 2400", "<=", "60000"]),
  [K('l5-008:q1')]: val("1100x", 6),
  [K('l5-008:q2')]: val("700x + 4000", 6),
  [K('l5-008:q3')]: solveEq("1100x", "11000"),
  [K('l5-008:q4')]: val("700x + 4000", solveEq("1100x", "11000").value),
  [K('l5-008:q5')]: coef("4000 + 700x", 1),
  [K('l5-008:q6')]: coef("4000 + 700x", 0),
  [K('l5-008:q7')]: firstNat(["700x + 4000", "<", "1100x"]),
  [K('l5-008:q8')]: lastNat(["700x + 4000", "<", "15000"]),
  [K('l5-008:q9')]: cheapest(["1100x", "700x + 4000", "15000"], 20),
  [K('l5-009:q1')]: coef("25x", 1),
  [K('l5-009:q2')]: coef("25(60 - x)", 1),
  [K('l5-009:q3')]: coef("25(60 - x)", 0),
  [K('l5-009:q4')]: solveEq("25x", "420 \\times 2{,}5"),
  [K('l5-009:q6')]: bound("120 \\times 25x + 80 \\times 25(60 - x)", ">=", "150000"),
  [K('l5-009:q7')]: sym("120 \\times 25x + 80 \\times 25(60 - x)", ">=", "150000"),
  [K('l5-009:q8')]: lastNat(["120 \\times 25x + 80 \\times 25(60 - x)", ">=", "150000"], ["25(60 - x)", ">=", "600"]),
  [K('l5-010:q1')]: calc("\\dfrac{(40 + 70) \\times 30}{2}"),
  [K('l5-010:q2')]: coef("\\dfrac{(70 - x) \\times 30}{2}", 1),
  [K('l5-010:q3')]: coef("\\dfrac{(70 - x) \\times 30}{2}", 0),
  [K('l5-010:q4')]: coef("\\dfrac{(40 + 70) \\times 30}{2} - \\dfrac{(70 - x) \\times 30}{2}", 0),
  [K('l5-010:q5')]: solveEq("\\dfrac{(70 - x) \\times 30}{2}", "\\dfrac{(40 + 70) \\times 30}{2} - \\dfrac{(70 - x) \\times 30}{2}"),
  [K('l5-010:q6')]: bound("\\dfrac{(40 + 70) \\times 30}{2} - \\dfrac{(70 - x) \\times 30}{2}", ">=", "2 \\times \\dfrac{(70 - x) \\times 30}{2}"),
  [K('l5-010:q7')]: sym("\\dfrac{(40 + 70) \\times 30}{2} - \\dfrac{(70 - x) \\times 30}{2}", ">=", "2 \\times \\dfrac{(70 - x) \\times 30}{2}"),
  [K('l5-010:q8')]: firstNat(["\\dfrac{(40 + 70) \\times 30}{2} - \\dfrac{(70 - x) \\times 30}{2}", ">=", "2 \\times \\dfrac{(70 - x) \\times 30}{2}"]),
  [K('l5-010:q9')]: val("450 \\times \\dfrac{(70 - x) \\times 30}{2}", 34),
};

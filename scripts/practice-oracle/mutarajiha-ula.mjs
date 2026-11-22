// Oracle du banc « mutarajiha-ula » (unité 4 « معادلات ومتراجحات »), feuilles BEM (2026-10-07) — chaque
// réponse RECALCULÉE ici, sans lire le contenu ni le code testé. Fusionné dans
// scripts/practice-answer-oracle.test.mjs.
//
// Une petite arithmétique d'expressions est écrite ICI (analyseur récursif + rationnels exacts de
// helpers.mjs), indépendante de packages/core/arithmetic/linear.js : chaque متراجحة L REL R est ramenée
// à D(x) = L(x) − R(x), de degré 1 après simplification des x² (vérifié sur quatre points), puis
// résolue — le sens est INVERSÉ quand le coefficient de x est négatif.
//
// Convention de saisie (feuilles BEM) : l'étape « حلّ المتراجحة » est jugée par DEUX questions —
//   bound : le حدّ k (rationnel exact) ;
//   sym   : l'écriture des solutions parmi A « x < k », B « x ≤ k », C « x > k », D « x ≥ k » (ordre fixe).
// « مثّل حلولها بيانيًا » sans valeur à saisir est un selfCheck : pas d'entrée ici.
// Les entrées portent l'énoncé (L, REL, R) tel qu'imprimé ; elles ont été écrites avec la banque par le
// script de l'auteur ; ne pas éditer une entrée sans recalculer l'autre côté.
import { R, C, q } from './helpers.mjs';

/* ── analyseur : nombres (décimaux), x, + − × ÷, puissances entières (**), parenthèses ── */
function evaluate(src, xv) {
  const s = src.replace(/\s+/g, '');
  let i = 0;
  const X = xv === undefined ? null : q(xv);
  const peek = () => s[i];
  function atom() {
    if (peek() === '(') { i += 1; const v = sum(); if (s[i] !== ')') throw new Error(`) attendue dans ${src}`); i += 1; return v; }
    if (peek() === 'x') { if (!X) throw new Error(`x sans valeur dans ${src}`); i += 1; return X; }
    const m = s.slice(i).match(/^\d+(\.\d+)?/);
    if (!m) throw new Error(`terme illisible dans ${src} @${i}`);
    i += m[0].length;
    return q(m[0]);
  }
  function power() {
    let b = atom();
    if (s.startsWith('**', i)) { i += 2; const e = Number(s.slice(i).match(/^\d+/)[0]); i += String(e).length; let r = q(1); for (let k = 0; k < e; k += 1) r = r.mul(b); b = r; }
    return b;
  }
  function unary() { if (peek() === '-') { i += 1; return unary().neg(); } if (peek() === '+') { i += 1; return unary(); } return power(); }
  function product() {
    let v = unary();
    while (peek() === '*' || peek() === '/') { const op = s[i]; i += 1; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); }
    return v;
  }
  function sum() {
    let v = product();
    while (peek() === '+' || peek() === '-') { const op = s[i]; i += 1; const w = product(); v = op === '+' ? v.add(w) : v.sub(w); }
    return v;
  }
  const v = sum();
  if (i !== s.length) throw new Error(`reste illisible dans ${src}`);
  return v;
}

const sign = (v) => (v.n > 0n ? 1 : v.n < 0n ? -1 : 0);
const cmpQ = (a, b) => sign(q(a).sub(q(b)));
const truth = (a, rel, b) => { const c = cmpQ(a, b); return { '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0 }[rel]; };
const FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
const SYM = { '<': 'A', '<=': 'B', '>': 'C', '>=': 'D' };

/** Coefficients exacts (a, b, c) d'une expression de degré ≤ 2, vérifiés sur deux autres points. */
function quad(expr) {
  const c = evaluate(expr, 0); const p = evaluate(expr, 1); const m = evaluate(expr, -1);
  const a = p.add(m).div(2).sub(c); const b = p.sub(m).div(2);
  for (const t of [2, 5]) {
    const T = q(t);
    if (!a.mul(T).mul(T).add(b.mul(T)).add(c).sub(evaluate(expr, t)).isZero()) throw new Error(`degré > 2 : ${expr}`);
  }
  return { a, b, c };
}

/** L REL R → { rel, bound } (x rel bound) : D linéaire non constant exigé. */
function rayOf(L, rel, Rr) {
  const l = quad(L); const r = quad(Rr);
  if (!l.a.sub(r.a).isZero()) throw new Error(`non linéaire : ${L} ${rel} ${Rr}`);
  const A = l.b.sub(r.b);
  if (A.isZero()) throw new Error(`sans x : ${L} ${rel} ${Rr}`);
  return { rel: sign(A) > 0 ? rel : FLIP[rel], bound: r.c.sub(l.c).div(A) };
}
const satisfies = (L, rel, Rr, v) => truth(evaluate(L, v), rel, evaluate(Rr, v));
/** Contrôle croisé : la borne trouvée sépare bien les solutions (balayage au voisinage). */
function checkedRay(L, rel, Rr) {
  const r = rayOf(L, rel, Rr);
  const eps = q('1/1000');
  const below = satisfies(L, rel, Rr, r.bound.sub(eps)); const above = satisfies(L, rel, Rr, r.bound.add(eps));
  const at = satisfies(L, rel, Rr, r.bound);
  const want = { '<': [true, false, false], '<=': [true, true, false], '>': [false, false, true], '>=': [false, true, true] }[r.rel];
  if (below !== want[0] || at !== want[1] || above !== want[2]) throw new Error(`mutarajiha-ula oracle : borne incohérente pour ${L} ${rel} ${Rr}`);
  return r;
}

const bound = (L, rel, Rr) => R(checkedRay(L, rel, Rr).bound.toString());
const sym = (L, rel, Rr) => C(SYM[checkedRay(L, rel, Rr).rel]);
const test = (L, rel, Rr, v) => C(satisfies(L, rel, Rr, v) ? 'A' : 'B'); // A « نعم » · B « لا »
/** Entiers solutions, cherchés par balayage (jamais déduits de la borne). */
const integer = (kind, L, rel, Rr) => {
  const sols = [];
  for (let n = -3000; n <= 3000; n += 1) if (satisfies(L, rel, Rr, n)) sols.push(n);
  const nat = sols.filter((n) => n >= 0);
  if (kind === 'max') return R(Math.max(...sols));
  if (kind === 'min') return R(Math.min(...sols));
  if (kind === 'maxNat') return R(Math.max(...nat));
  if (kind === 'minNat') return R(Math.min(...nat));
  return R(nat.length);
};
/** Une متراجحة : un x ET un symbole d'ordre, sans « = ». */
const kind = (opts) => {
  const hits = opts.map((o, k) => (o.includes('x') && /<|>|\\leq|\\geq/.test(o) && !o.includes('=') ? 'ABC'[k] : null)).filter(Boolean);
  if (hits.length !== 1) throw new Error('mutarajiha-ula oracle kind');
  return C(hits[0]);
};
const numTruth = (a, rel, b) => C(truth(a, rel, b) ? 'A' : 'B');
/** x grel a ⇒ E(x) ? v : l'image exacte de la demi-droite par x ↦ kx + c ; opts = les deux symboles proposés. */
const deduce = (grel, a, E, v, opts) => {
  const c0 = evaluate(E, 0); const k = evaluate(E, 1).sub(c0);
  if (!evaluate(E, 2).sub(k.mul(2)).sub(c0).isZero()) throw new Error(`non affine : ${E}`);
  const img = k.mul(q(a)).add(c0);
  if (cmpQ(img, v) !== 0) throw new Error(`mutarajiha-ula oracle deduce : image ${img} ≠ ${v}`);
  const rel = sign(k) > 0 ? grel : FLIP[grel];
  const idx = opts.indexOf(rel);
  if (idx < 0) throw new Error('mutarajiha-ula oracle deduce : symbole absent');
  return C('AB'[idx]);
};
/** Lecture d'une représentation : jeu de 4 écritures dans l'ordre fixe A < · B ≤ · C > · D ≥. */
const fromGraph = (side, closed, _b) => C(SYM[side === 'left' ? (closed ? '<=' : '<') : (closed ? '>=' : '>')]);
/** Représentation : A « على يمين » / B « على يسار » ; A « [ » / B « ] ». */
const side = (L, rel, Rr) => { const r = checkedRay(L, rel, Rr); return C(r.rel === '>' || r.rel === '>=' ? 'A' : 'B'); };
const bracket = (L, rel, Rr) => {
  const r = checkedRay(L, rel, Rr);
  const right = r.rel === '>' || r.rel === '>=';
  const closed = r.rel === '<=' || r.rel === '>=';
  return C(right === closed ? 'A' : 'B');
};
const calc = (expr) => R(evaluate(expr).toString());
const val = (expr, v) => R(evaluate(expr, v).toString());
const coef = (expr, which) => R(quad(expr)[which].toString());
/** expr = (p x + r)(m x + n) : m ou n, vérifié sur plusieurs points. */
const factor = (expr, p, r, which) => {
  const P = q(p); const Rr = q(r);
  const f = (t) => P.mul(q(t)).add(Rr);
  const { a, c } = quad(expr);
  const m = a.div(P); const n = c.div(Rr);
  for (const t of [0, 1, -1, 3, 7]) if (!f(t).mul(m.mul(q(t)).add(n)).sub(evaluate(expr, t)).isZero()) throw new Error(`mutarajiha-ula oracle factor : ${expr}`);
  return R((which === 'm' ? m : n).toString());
};
/** Zéro d'un facteur du premier degré. */
const zero = (expr) => { const c0 = evaluate(expr, 0); const k = evaluate(expr, 1).sub(c0); return R(c0.neg().div(k).toString()); };
/** L'offre la moins chère (lettre A, B, C dans l'ordre de l'énoncé) pour x = v ; ex aequo → erreur. */
const cheapest = (exprs, v) => {
  const costs = exprs.map((e) => evaluate(e, v));
  const min = costs.reduce((m, c) => (cmpQ(c, m) < 0 ? c : m));
  const hits = costs.map((c, k) => (cmpQ(c, min) === 0 ? 'ABC'[k] : null)).filter(Boolean);
  if (hits.length !== 1) throw new Error('mutarajiha-ula oracle cheapest : ex aequo');
  return C(hits[0]);
};

export const ORACLE = {
  "ex-4am-mutarajiha-ula-l1-001:q1": test("2.5*x+100", "<=", "150", "18"),
  "ex-4am-mutarajiha-ula-l1-001:q2": integer("maxNat", "2.5*x+100", "<=", "150"),
  "ex-4am-mutarajiha-ula-l1-002:q1": test("4*x", ">", "-3", "-2"),
  "ex-4am-mutarajiha-ula-l1-002:q2": test("4*x", ">", "-3", "0"),
  "ex-4am-mutarajiha-ula-l1-003:q1": test("3*x-2", "<", "6", "0"),
  "ex-4am-mutarajiha-ula-l1-003:q2": test("3*x-2", "<", "6", "8/3"),
  "ex-4am-mutarajiha-ula-l1-003:q3": test("3*x-2", "<", "6", "3"),
  "ex-4am-mutarajiha-ula-l1-004:q1": kind(["3x + 1 \\geqslant 2", "3x + 1 = 2", "5 - 2 > 1"]),
  "ex-4am-mutarajiha-ula-l1-004:q2": numTruth("7", "<", "4"),
  "ex-4am-mutarajiha-ula-l1-005:q1": test("-x+5", ">=", "2", "3"),
  "ex-4am-mutarajiha-ula-l1-005:q2": test("-x+5", ">=", "2", "4"),
  "ex-4am-mutarajiha-ula-l1-005:q3": bound("-x+5", ">=", "2"),
  "ex-4am-mutarajiha-ula-l1-005:q4": sym("-x+5", ">=", "2"),
  "ex-4am-mutarajiha-ula-l1-006:q1": bound("5*x-3", ">=", "2*x+9"),
  "ex-4am-mutarajiha-ula-l1-006:q2": sym("5*x-3", ">=", "2*x+9"),
  "ex-4am-mutarajiha-ula-l1-007:q1": fromGraph("left", false, "4"),
  "ex-4am-mutarajiha-ula-l1-007:q2": fromGraph("right", true, "-1"),
  "ex-4am-mutarajiha-ula-l1-008:q1": test("300+60*x", "<=", "900", "12"),
  "ex-4am-mutarajiha-ula-l1-008:q2": integer("maxNat", "300+60*x", "<=", "900"),
  "ex-4am-mutarajiha-ula-l1-009:q1": test("((x)/(2))-1", "<=", "3", "8"),
  "ex-4am-mutarajiha-ula-l1-009:q2": test("((x)/(2))-1", "<=", "3", "10"),
  "ex-4am-mutarajiha-ula-l1-009:q3": test("((x)/(2))-1", "<=", "3", "-4"),
  "ex-4am-mutarajiha-ula-l1-010:q1": bound("5*x", "<=", "3"),
  "ex-4am-mutarajiha-ula-l1-010:q2": sym("5*x", "<=", "3"),
  "ex-4am-mutarajiha-ula-l2-001:q1": deduce(">", "3/2", "2*x", "3", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-001:q2": deduce(">", "3/2", "-4*x", "-6", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-001:q3": deduce(">", "3/2", "2*x+5", "8", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-002:q1": deduce("<", "-2", "5*x", "-10", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-002:q2": deduce("<", "-2", "-2*x", "4", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-002:q3": deduce("<", "-2", "3*x-1", "-7", ["<",">"]),
  "ex-4am-mutarajiha-ula-l2-003:q1": bound("3*x", ">=", "-2"),
  "ex-4am-mutarajiha-ula-l2-003:q2": sym("3*x", ">=", "-2"),
  "ex-4am-mutarajiha-ula-l2-003:q3": bound("-2*x", "<", "4"),
  "ex-4am-mutarajiha-ula-l2-003:q4": sym("-2*x", "<", "4"),
  "ex-4am-mutarajiha-ula-l2-003:q5": bound("((5)/(3))*x", ">", "10"),
  "ex-4am-mutarajiha-ula-l2-003:q6": sym("((5)/(3))*x", ">", "10"),
  "ex-4am-mutarajiha-ula-l2-004:q1": deduce("<=", "4", "-x", "-4", ["<=",">="]),
  "ex-4am-mutarajiha-ula-l2-004:q2": deduce("<=", "4", "x-3", "1", ["<=",">="]),
  "ex-4am-mutarajiha-ula-l2-004:q3": deduce("<=", "4", "((x)/(2))", "2", ["<=",">="]),
  "ex-4am-mutarajiha-ula-l2-005:q1": bound("3*x+7", ">=", "7*x-5"),
  "ex-4am-mutarajiha-ula-l2-005:q2": sym("3*x+7", ">=", "7*x-5"),
  "ex-4am-mutarajiha-ula-l2-006:q1": bound("-x", ">", "4"),
  "ex-4am-mutarajiha-ula-l2-006:q2": sym("-x", ">", "4"),
  "ex-4am-mutarajiha-ula-l2-006:q3": bound("((x)/(3))", ">=", "-2"),
  "ex-4am-mutarajiha-ula-l2-006:q4": sym("((x)/(3))", ">=", "-2"),
  "ex-4am-mutarajiha-ula-l2-006:q5": bound("-((x)/(2))", "<", "3"),
  "ex-4am-mutarajiha-ula-l2-006:q6": sym("-((x)/(2))", "<", "3"),
  "ex-4am-mutarajiha-ula-l2-007:q1": side("x", ">=", "-1"),
  "ex-4am-mutarajiha-ula-l2-007:q2": bracket("x", ">=", "-1"),
  "ex-4am-mutarajiha-ula-l2-007:q3": side("x", "<", "2"),
  "ex-4am-mutarajiha-ula-l2-007:q4": bracket("x", "<", "2"),
  "ex-4am-mutarajiha-ula-l2-008:q1": fromGraph("right", false, "-3"),
  "ex-4am-mutarajiha-ula-l2-008:q2": fromGraph("left", true, "1/2"),
  "ex-4am-mutarajiha-ula-l2-009:q1": val("4*x-6", "1/2"),
  "ex-4am-mutarajiha-ula-l2-009:q2": bound("4*x-6", ">=", "0"),
  "ex-4am-mutarajiha-ula-l2-009:q3": sym("4*x-6", ">=", "0"),
  "ex-4am-mutarajiha-ula-l2-010:q1": bound("-((1)/(2))*x+2", "<", "-1"),
  "ex-4am-mutarajiha-ula-l2-010:q2": sym("-((1)/(2))*x+2", "<", "-1"),
  "ex-4am-mutarajiha-ula-l3-001:q1": bound("-3*x+5", "<=", "20"),
  "ex-4am-mutarajiha-ula-l3-001:q2": sym("-3*x+5", "<=", "20"),
  "ex-4am-mutarajiha-ula-l3-001:q4": test("-3*x+5", "<=", "20", "-5"),
  "ex-4am-mutarajiha-ula-l3-002:q1": bound("3*x-2", "<", "6"),
  "ex-4am-mutarajiha-ula-l3-002:q2": sym("3*x-2", "<", "6"),
  "ex-4am-mutarajiha-ula-l3-002:q3": integer("max", "3*x-2", "<", "6"),
  "ex-4am-mutarajiha-ula-l3-003:q1": bound("4*x-1", "<=", "17-2*x"),
  "ex-4am-mutarajiha-ula-l3-003:q2": sym("4*x-1", "<=", "17-2*x"),
  "ex-4am-mutarajiha-ula-l3-003:q4": integer("max", "4*x-1", "<=", "17-2*x"),
  "ex-4am-mutarajiha-ula-l3-004:q1": bound("2*x-1", "<=", "6"),
  "ex-4am-mutarajiha-ula-l3-004:q2": sym("2*x-1", "<=", "6"),
  "ex-4am-mutarajiha-ula-l3-004:q4": integer("countNat", "2*x-1", "<=", "6"),
  "ex-4am-mutarajiha-ula-l3-005:q1": bound("7-2*x", ">", "1"),
  "ex-4am-mutarajiha-ula-l3-005:q2": sym("7-2*x", ">", "1"),
  "ex-4am-mutarajiha-ula-l3-005:q4": integer("countNat", "7-2*x", ">", "1"),
  "ex-4am-mutarajiha-ula-l3-006:q1": coef("(x+2)**2-(x+2)*(3*x-1)", "a"),
  "ex-4am-mutarajiha-ula-l3-006:q2": coef("(x+2)**2-(x+2)*(3*x-1)", "b"),
  "ex-4am-mutarajiha-ula-l3-006:q3": coef("(x+2)**2-(x+2)*(3*x-1)", "c"),
  "ex-4am-mutarajiha-ula-l3-006:q4": factor("(x+2)**2-(x+2)*(3*x-1)", "1", "2", "m"),
  "ex-4am-mutarajiha-ula-l3-006:q5": factor("(x+2)**2-(x+2)*(3*x-1)", "1", "2", "n"),
  "ex-4am-mutarajiha-ula-l3-006:q6": bound("2*x+5", ">=", "5*x-4"),
  "ex-4am-mutarajiha-ula-l3-006:q7": sym("2*x+5", ">=", "5*x-4"),
  "ex-4am-mutarajiha-ula-l3-007:q1": bound("-4*x+9", "<", "1"),
  "ex-4am-mutarajiha-ula-l3-007:q2": sym("-4*x+9", "<", "1"),
  "ex-4am-mutarajiha-ula-l3-008:q1": coef("(3*x-2)**2-(x+1)*(3*x-2)", "a"),
  "ex-4am-mutarajiha-ula-l3-008:q2": coef("(3*x-2)**2-(x+1)*(3*x-2)", "b"),
  "ex-4am-mutarajiha-ula-l3-008:q3": coef("(3*x-2)**2-(x+1)*(3*x-2)", "c"),
  "ex-4am-mutarajiha-ula-l3-008:q4": factor("(3*x-2)**2-(x+1)*(3*x-2)", "3", "-2", "m"),
  "ex-4am-mutarajiha-ula-l3-008:q5": factor("(3*x-2)**2-(x+1)*(3*x-2)", "3", "-2", "n"),
  "ex-4am-mutarajiha-ula-l3-008:q6": zero("3*x-2"),
  "ex-4am-mutarajiha-ula-l3-008:q7": zero("2*x-3"),
  "ex-4am-mutarajiha-ula-l3-008:q8": bound("6*x**2-13*x+6", "<=", "6*x**2+2*x-9"),
  "ex-4am-mutarajiha-ula-l3-008:q9": sym("6*x**2-13*x+6", "<=", "6*x**2+2*x-9"),
  "ex-4am-mutarajiha-ula-l3-009:q1": bound("800+150*x", "<=", "2000"),
  "ex-4am-mutarajiha-ula-l3-009:q2": sym("800+150*x", "<=", "2000"),
  "ex-4am-mutarajiha-ula-l3-009:q3": integer("maxNat", "800+150*x", "<=", "2000"),
  "ex-4am-mutarajiha-ula-l3-010:q2": factor("(2*x+3)*(x-5)-(12*x**2-27)", "2", "3", "m"),
  "ex-4am-mutarajiha-ula-l3-010:q3": factor("(2*x+3)*(x-5)-(12*x**2-27)", "2", "3", "n"),
  "ex-4am-mutarajiha-ula-l3-010:q4": bound("-12*x**2+7*x-1", "<", "3*(5-4*x**2)"),
  "ex-4am-mutarajiha-ula-l3-010:q5": sym("-12*x**2+7*x-1", "<", "3*(5-4*x**2)"),
  "ex-4am-mutarajiha-ula-l4-001:q1": bound("((5)/(2))*x-((1)/(3))", ">", "0"),
  "ex-4am-mutarajiha-ula-l4-001:q2": sym("((5)/(2))*x-((1)/(3))", ">", "0"),
  "ex-4am-mutarajiha-ula-l4-001:q3": bound("1.2*x-0.6", "<=", "3"),
  "ex-4am-mutarajiha-ula-l4-001:q4": sym("1.2*x-0.6", "<=", "3"),
  "ex-4am-mutarajiha-ula-l4-002:q1": bound("((x)/(2))-((3)/(4))", ">=", "1"),
  "ex-4am-mutarajiha-ula-l4-002:q2": sym("((x)/(2))-((3)/(4))", ">=", "1"),
  "ex-4am-mutarajiha-ula-l4-002:q3": bound("((x+1)/(2))", "<", "3*x-1"),
  "ex-4am-mutarajiha-ula-l4-002:q4": sym("((x+1)/(2))", "<", "3*x-1"),
  "ex-4am-mutarajiha-ula-l4-002:q5": integer("min", "((x+1)/(2))", "<", "3*x-1"),
  "ex-4am-mutarajiha-ula-l4-003:q1": bound("5*(2*x-1)", ">=", "4*x-1"),
  "ex-4am-mutarajiha-ula-l4-003:q2": sym("5*(2*x-1)", ">=", "4*x-1"),
  "ex-4am-mutarajiha-ula-l4-003:q4": integer("min", "5*(2*x-1)", ">=", "4*x-1"),
  "ex-4am-mutarajiha-ula-l4-004:q1": bound("-5*(2*x-1)", "<=", "2-4*x"),
  "ex-4am-mutarajiha-ula-l4-004:q2": sym("-5*(2*x-1)", "<=", "2-4*x"),
  "ex-4am-mutarajiha-ula-l4-004:q4": bound("((5*x-1)/(2))+3", ">", "1+2*x"),
  "ex-4am-mutarajiha-ula-l4-004:q5": sym("((5*x-1)/(2))+3", ">", "1+2*x"),
  "ex-4am-mutarajiha-ula-l4-005:q1": bound("-7*x+1", "<", "x-3"),
  "ex-4am-mutarajiha-ula-l4-005:q2": sym("-7*x+1", "<", "x-3"),
  "ex-4am-mutarajiha-ula-l4-005:q4": bound("((3*x+2)/(6))", ">=", "((2*x-3)/(5))"),
  "ex-4am-mutarajiha-ula-l4-005:q5": sym("((3*x+2)/(6))", ">=", "((2*x-3)/(5))"),
  "ex-4am-mutarajiha-ula-l4-006:q1": bound("4*x-1", "<=", "x+3"),
  "ex-4am-mutarajiha-ula-l4-006:q2": sym("4*x-1", "<=", "x+3"),
  "ex-4am-mutarajiha-ula-l4-006:q3": bound("-3*x+2", ">", "20"),
  "ex-4am-mutarajiha-ula-l4-006:q4": sym("-3*x+2", ">", "20"),
  "ex-4am-mutarajiha-ula-l4-007:q2": factor("2*x**2-x-15+(2*x+5)**2", "2", "5", "m"),
  "ex-4am-mutarajiha-ula-l4-007:q3": factor("2*x**2-x-15+(2*x+5)**2", "2", "5", "n"),
  "ex-4am-mutarajiha-ula-l4-007:q4": bound("(2*x+5)*(x-3)", "<=", "2*x**2+9"),
  "ex-4am-mutarajiha-ula-l4-007:q5": sym("(2*x+5)*(x-3)", "<=", "2*x**2+9"),
  "ex-4am-mutarajiha-ula-l4-008:q2": factor("x**2-10*x+16", "1", "-2", "n"),
  "ex-4am-mutarajiha-ula-l4-008:q3": bound("-10*x+16", ">", "0"),
  "ex-4am-mutarajiha-ula-l4-008:q4": sym("-10*x+16", ">", "0"),
  "ex-4am-mutarajiha-ula-l4-009:q1": coef("2*(x+3+x-1)", "b"),
  "ex-4am-mutarajiha-ula-l4-009:q2": coef("2*(x+3+x-1)", "c"),
  "ex-4am-mutarajiha-ula-l4-009:q3": bound("4*x+4", ">=", "26"),
  "ex-4am-mutarajiha-ula-l4-009:q4": sym("4*x+4", ">=", "26"),
  "ex-4am-mutarajiha-ula-l4-010:q1": calc("5*300"),
  "ex-4am-mutarajiha-ula-l4-010:q2": calc("3*300+400"),
  "ex-4am-mutarajiha-ula-l4-010:q3": bound("5*x", ">", "3*x+400"),
  "ex-4am-mutarajiha-ula-l4-010:q4": sym("5*x", ">", "3*x+400"),
  "ex-4am-mutarajiha-ula-l4-010:q5": integer("minNat", "5*x", ">", "3*x+400"),
  "ex-4am-mutarajiha-ula-l5-001:q1": calc("70*200"),
  "ex-4am-mutarajiha-ula-l5-001:q2": calc("56000/70"),
  "ex-4am-mutarajiha-ula-l5-001:q3": calc("40*800+18000"),
  "ex-4am-mutarajiha-ula-l5-001:q4": bound("70*x", ">", "40*x+18000"),
  "ex-4am-mutarajiha-ula-l5-001:q5": sym("70*x", ">", "40*x+18000"),
  "ex-4am-mutarajiha-ula-l5-001:q6": cheapest(["70*x","40*x+18000"], "450"),
  "ex-4am-mutarajiha-ula-l5-001:q7": cheapest(["70*x","40*x+18000"], "750"),
  "ex-4am-mutarajiha-ula-l5-002:q1": calc("450*120"),
  "ex-4am-mutarajiha-ula-l5-002:q2": calc("25000+300*120"),
  "ex-4am-mutarajiha-ula-l5-002:q3": bound("25000+300*x", "<", "450*x"),
  "ex-4am-mutarajiha-ula-l5-002:q4": sym("25000+300*x", "<", "450*x"),
  "ex-4am-mutarajiha-ula-l5-002:q5": integer("minNat", "25000+300*x", "<", "450*x"),
  "ex-4am-mutarajiha-ula-l5-003:q1": calc("2400*80-156000"),
  "ex-4am-mutarajiha-ula-l5-003:q2": bound("2400*x-156000", ">=", "64000"),
  "ex-4am-mutarajiha-ula-l5-003:q3": sym("2400*x-156000", ">=", "64000"),
  "ex-4am-mutarajiha-ula-l5-003:q4": test("2400*x-156000", ">=", "64000", "90"),
  "ex-4am-mutarajiha-ula-l5-003:q5": integer("min", "2400*x-156000", ">=", "64000"),
  "ex-4am-mutarajiha-ula-l5-004:q1": calc("30*1000+30*1200+2500"),
  "ex-4am-mutarajiha-ula-l5-004:q3": bound("30*x+38500", "<=", "77000"),
  "ex-4am-mutarajiha-ula-l5-004:q4": sym("30*x+38500", "<=", "77000"),
  "ex-4am-mutarajiha-ula-l5-004:q5": integer("max", "30*x+38500", "<=", "77000"),
  "ex-4am-mutarajiha-ula-l5-005:q1": calc("4000*30"),
  "ex-4am-mutarajiha-ula-l5-005:q2": calc("54000+2500*30"),
  "ex-4am-mutarajiha-ula-l5-005:q3": bound("4000*x", ">", "54000+2500*x"),
  "ex-4am-mutarajiha-ula-l5-005:q4": sym("4000*x", ">", "54000+2500*x"),
  "ex-4am-mutarajiha-ula-l5-005:q5": integer("minNat", "4000*x", ">", "54000+2500*x"),
  "ex-4am-mutarajiha-ula-l5-006:q1": calc("6000-75*40"),
  "ex-4am-mutarajiha-ula-l5-006:q2": bound("6000-75*x", ">=", "1000"),
  "ex-4am-mutarajiha-ula-l5-006:q3": sym("6000-75*x", ">=", "1000"),
  "ex-4am-mutarajiha-ula-l5-006:q5": integer("maxNat", "6000-75*x", ">=", "1000"),
  "ex-4am-mutarajiha-ula-l5-007:q1": calc("50-0.075*200"),
  "ex-4am-mutarajiha-ula-l5-007:q2": bound("50-0.075*x", ">=", "8"),
  "ex-4am-mutarajiha-ula-l5-007:q3": sym("50-0.075*x", ">=", "8"),
  "ex-4am-mutarajiha-ula-l5-007:q4": test("50-0.075*x", ">=", "8", "610"),
  "ex-4am-mutarajiha-ula-l5-008:q1": calc("4200+350*10"),
  "ex-4am-mutarajiha-ula-l5-008:q2": calc("7000+150*10"),
  "ex-4am-mutarajiha-ula-l5-008:q3": bound("4200+350*x", ">", "7000+150*x"),
  "ex-4am-mutarajiha-ula-l5-008:q4": sym("4200+350*x", ">", "7000+150*x"),
  "ex-4am-mutarajiha-ula-l5-008:q5": integer("minNat", "4200+350*x", ">", "7000+150*x"),
  "ex-4am-mutarajiha-ula-l5-009:q1": calc("3000*8"),
  "ex-4am-mutarajiha-ula-l5-009:q2": calc("12000+1800*8"),
  "ex-4am-mutarajiha-ula-l5-009:q3": bound("3000*x", ">", "12000+1800*x"),
  "ex-4am-mutarajiha-ula-l5-009:q4": sym("3000*x", ">", "12000+1800*x"),
  "ex-4am-mutarajiha-ula-l5-009:q5": bound("12000+1800*x", "<", "45000"),
  "ex-4am-mutarajiha-ula-l5-009:q6": sym("12000+1800*x", "<", "45000"),
  "ex-4am-mutarajiha-ula-l5-009:q7": cheapest(["3000*x","12000+1800*x","45000"], "15"),
  "ex-4am-mutarajiha-ula-l5-010:q1": calc("3*20-(40-20)"),
  "ex-4am-mutarajiha-ula-l5-010:q3": bound("4*x-40", ">=", "66"),
  "ex-4am-mutarajiha-ula-l5-010:q4": sym("4*x-40", ">=", "66"),
  "ex-4am-mutarajiha-ula-l5-010:q5": integer("min", "4*x-40", ">=", "66"),
};

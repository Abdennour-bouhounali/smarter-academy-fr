// Oracle du banc « tahlil-ibara » (unité 3 « الحساب الحرفي ») — feuilles d'examen BEM (2026-10-07).
// Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé (fusionné dans
// scripts/practice-answer-oracle.test.mjs). Une clé par question non selfCheck.
//
// E('…', d) lit une expression à UNE lettre (x) avec + − × /, ^, parenthèses, produit implicite
// (« 3x », « 2(x + 1) », « (2x + 5)^2 ») et le symbole √ (= √d, d = 2 par défaut), et la CALCULE
// en polynôme exact à coefficients dans Q(√d), avec les rationnels de helpers.mjs — sans rien lire
// du contenu ni du code testé. Une division ne se fait que par un nombre rationnel.
// Le TRAVAIL de la leçon (l'analyse en facteurs) est refait par DIVISION EXACTE :
//   qc(E, F, k)   coefficient de x^k du quotient E ÷ F (erreur si le reste n'est pas nul) — le
//                 cofacteur d'un facteur commun donné par la forme demandée « (2x − 1)(mx + n) » ;
//   r2(E, i)      i-ème racine (ordre croissant) d'un polynôme du second degré à racines
//                 rationnelles (discriminant carré parfait, racine carrée ENTIÈRE en BigInt) — les
//                 facteurs d'une forme « (x + m)(x + n) » ou « (m − 2x)(4x + n) » ;
//   sq(E)         [a, b] tels que E = (ax + b)², a > 0, vérifié par développement ;
//   isq(v)        racine carrée rationnelle exacte (erreur sinon) ;
//   sqrtForm(r, i, d) [m, n] entiers tels que (m + n√d)² = r + i√d et m + n√d > 0 ;
//   sdRoots(F1, F2, d) racines (m + n√d) de deux facteurs unitaires, rangées par ordre croissant ;
//   approxDown(a, b, d, k) valeur approchée PAR DÉFAUT à 10^-k de a + b√d (a, b entiers, b > 0),
//                 par racine carrée entière exacte (BigInt), jamais Math.sqrt.
// root('…') : racine d'une expression du premier degré (étapes « حل المعادلة / المتراجحة », hors
// leçon, counted:false) — −(terme constant)/(coefficient de x).
import { R, q } from './helpers.mjs';

class Sd {
  constructor(r, i, d) { this.r = q(r); this.i = q(i); this.d = d; }
  add(o) { return new Sd(this.r.add(o.r), this.i.add(o.i), this.d); }
  neg() { return new Sd(this.r.neg(), this.i.neg(), this.d); }
  mul(o) { return new Sd(this.r.mul(o.r).add(this.i.mul(o.i).mul(this.d)), this.r.mul(o.i).add(this.i.mul(o.r)), this.d); }
  isZero() { return this.r.isZero() && this.i.isZero(); }
}
class SP {
  constructor(c, d) { this.d = d; this.c = c.slice(); while (this.c.length && this.c.at(-1).isZero()) this.c.pop(); }
  zero() { return new Sd(0, 0, this.d); }
  add(o) { return new SP(Array.from({ length: Math.max(this.c.length, o.c.length) }, (_, k) => (this.c[k] ?? this.zero()).add(o.c[k] ?? this.zero())), this.d); }
  neg() { return new SP(this.c.map((v) => v.neg()), this.d); }
  sub(o) { return this.add(o.neg()); }
  mul(o) {
    const out = Array.from({ length: this.c.length + o.c.length }, () => this.zero());
    this.c.forEach((a, i) => o.c.forEach((b, j) => { out[i + j] = out[i + j].add(a.mul(b)); }));
    return new SP(out, this.d);
  }
  pow(n) { let r = new SP([new Sd(1, 0, this.d)], this.d); for (let k = 0; k < n; k++) r = r.mul(this); return r; }
  degree() { return this.c.length - 1; }
  rcoef(k) { return (this.c[k] ?? this.zero()).r.toString(); }
  icoef(k) { return (this.c[k] ?? this.zero()).i.toString(); }
  coef(k) {
    if (!(this.c[k] ?? this.zero()).i.isZero()) throw new Error(`oracle tahlil-ibara: coefficient de x^${k} irrationnel`);
    return this.rcoef(k);
  }
  isZero() { return this.c.length === 0; }
}

function E(src, d = 2) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/,/g, '.');
  let i = 0;
  const peek = () => s[i];
  const fail = (m) => { throw new Error(`oracle tahlil-ibara: ${m} dans « ${src} » (position ${i})`); };
  const K = (r, ir = 0) => new SP([new Sd(r, ir, d)], d);
  const X = new SP([new Sd(0, 0, d), new Sd(1, 0, d)], d);
  const startsFactor = (c) => c !== undefined && (/[0-9.(√]/.test(c) || /[a-z]/.test(c));
  function primary() {
    const c = peek();
    if (c === '(') { i += 1; const v = sum(); if (peek() !== ')') fail('« ) » attendue'); i += 1; return v; }
    if (c === '√') { i += 1; return K(0, 1); }
    if (/[a-z]/.test(c)) { i += 1; return X; }
    const m = s.slice(i).match(/^\d+(\.\d+)?/);
    if (!m) fail('terme illisible');
    i += m[0].length;
    return K(m[0]);
  }
  function power() {
    let v = primary();
    if (peek() === '^') { i += 1; const m = s.slice(i).match(/^\d+/); if (!m) fail('exposant'); i += m[0].length; v = v.pow(Number(m[0])); }
    return v;
  }
  function factor() {
    if (peek() === '-') { i += 1; return factor().neg(); }
    if (peek() === '+') { i += 1; return factor(); }
    return power();
  }
  function product() {
    let v = factor();
    for (;;) {
      const c = peek();
      if (c === '*') { i += 1; v = v.mul(factor()); }
      else if (c === '/') {
        i += 1; const den = factor();
        if (den.degree() > 0 || !den.c[0].i.isZero()) fail('division par une expression non rationnelle');
        v = v.mul(K(q(1).div(den.c[0].r)));
      } else if (startsFactor(c)) v = v.mul(power());
      else return v;
    }
  }
  function sum() {
    let v = product();
    for (;;) {
      const c = peek();
      if (c === '+') { i += 1; v = v.add(product()); }
      else if (c === '-') { i += 1; v = v.sub(product()); }
      else return v;
    }
  }
  const v = sum();
  if (i !== s.length) fail('caractère inattendu');
  return v;
}

/** Quotient EXACT de E par F (coefficient dominant de F rationnel) ; erreur si le reste n'est pas nul. */
function quo(srcE, srcF, d = 2) {
  let rem = E(srcE, d);
  const F = E(srcF, d);
  const lead = F.c.at(-1);
  if (!lead || !lead.i.isZero()) throw new Error(`oracle tahlil-ibara: diviseur « ${srcF} » inadapté`);
  const out = [];
  while (!rem.isZero() && rem.degree() >= F.degree()) {
    const k = rem.degree() - F.degree();
    const top = rem.c.at(-1);
    const t = new Sd(top.r.div(lead.r), top.i.div(lead.r), d);
    out[k] = t;
    const mono = new SP([...Array.from({ length: k }, () => new Sd(0, 0, d)), t], d);
    rem = rem.sub(mono.mul(F));
  }
  if (!rem.isZero()) throw new Error(`oracle tahlil-ibara: « ${srcF} » ne divise pas « ${srcE} »`);
  return new SP(Array.from({ length: out.length }, (_, k) => out[k] ?? new Sd(0, 0, d)), d);
}
const qc = (srcE, srcF, k, d = 2) => quo(srcE, String(srcF), d).coef(k);
const co = (src, k, d = 2) => E(src, d).coef(k);
const rc = (src, d = 2, k = 0) => E(src, d).rcoef(k);
const ic = (src, d = 2, k = 0) => E(src, d).icoef(k);
/** Valeur (rationnelle) de l'expression pour x = v. */
const valueAt = (p, v) => p.c.reduceRight((acc, a) => acc.mul(q(v)).add(a.r), q(0));
const at = (src, v) => valueAt(E(src), v).toString();
const qat = (srcE, srcF, v) => valueAt(quo(srcE, srcF), v).toString();
const neg = (v) => q(v).neg().toString();
const mul = (a, b) => q(a).mul(q(b)).toString();
const div = (a, b) => q(a).div(q(b)).toString();
const G = (a, b) => { a = Math.abs(Number(a)); b = Math.abs(Number(b)); while (b) [a, b] = [b, a % b]; return a; };

function bsqrt(n) { // racine carrée entière exacte d'un BigInt ≥ 0 (plancher)
  if (n < 0n) throw new Error('oracle tahlil-ibara: racine d\'un négatif');
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
}
/** Racine carrée rationnelle EXACTE (erreur si v n'est pas le carré d'un rationnel). */
function isq(v) {
  const Q = q(v);
  const a = bsqrt(Q.n); const b = bsqrt(Q.d);
  if (a * a !== Q.n || b * b !== Q.d) throw new Error(`oracle tahlil-ibara: ${v} n'est pas un carré`);
  return q(`${a}/${b}`).toString();
}
/** Racines rationnelles (ordre croissant) d'un polynôme du second degré. */
function r2(src, idx) {
  const p = E(src);
  if (p.degree() !== 2) throw new Error(`oracle tahlil-ibara: « ${src} » n'est pas du second degré`);
  const [c, b, a] = [0, 1, 2].map((k) => q(p.coef(k)));
  const disc = b.mul(b).sub(q(4).mul(a).mul(c));
  const s = q(isq(disc));
  const xs = [b.neg().sub(s).div(a.mul(2)), b.neg().add(s).div(a.mul(2))]
    .sort((u, v) => (u.sub(v).n < 0n ? -1 : 1));
  return xs[idx].toString();
}
/** [a, b] avec E = (ax + b)², a > 0 — vérifié par développement. */
function sq(src) {
  const p = E(src);
  const a = q(isq(p.coef(2)));
  const b0 = q(isq(p.coef(0)));
  const b = q(p.coef(1)).n < 0n ? b0.neg() : b0;
  if (!E(`(${a}x+(${b}))^2`).sub(p).isZero()) throw new Error(`oracle tahlil-ibara: « ${src} » n'est pas un carré parfait`);
  return [a.toString(), b.toString()];
}
/** Signe exact de m + n√d (m, n rationnels). */
function sdSign(m, n, d) {
  const M = q(m); const N = q(n);
  const sm = M.n > 0n ? 1 : M.n < 0n ? -1 : 0; const sn = N.n > 0n ? 1 : N.n < 0n ? -1 : 0;
  if (sm >= 0 && sn >= 0) return sm + sn > 0 ? 1 : 0;
  if (sm <= 0 && sn <= 0) return -1;
  const big = M.mul(M).sub(N.mul(N).mul(d)).n; // m² − n²d
  return big > 0n ? sm : sn;
}
/** [m, n] entiers (|m|, |n| ≤ 50) tels que (m + n√d)² = r + i√d et m + n√d > 0. */
function sqrtForm(r, i, d) {
  const found = [];
  for (let m = -50; m <= 50; m++) for (let n = -50; n <= 50; n++) {
    if (q(m * m + n * n * d).sub(q(r)).isZero() && q(2 * m * n).sub(q(i)).isZero() && sdSign(m, n, d) > 0) found.push([String(m), String(n)]);
  }
  if (found.length !== 1) throw new Error(`oracle tahlil-ibara: ${found.length} racines pour ${r} + ${i}√${d}`);
  return found[0];
}
/** Racines m + n√d de deux facteurs unitaires du premier degré, rangées par ordre croissant. */
function sdRoots(f1, f2, d) {
  const rts = [f1, f2].map((f) => { const p = E(f, d); if (p.degree() !== 1 || p.rcoef(1) !== '1' || p.icoef(1) !== '0') throw new Error('facteur non unitaire'); return [neg(p.rcoef(0)), neg(p.icoef(0))]; });
  const diff = [q(rts[0][0]).sub(q(rts[1][0])), q(rts[0][1]).sub(q(rts[1][1]))];
  return sdSign(diff[0], diff[1], d) < 0 ? rts : [rts[1], rts[0]];
}
/** Valeur approchée PAR DÉFAUT à 10^-k de a + b√d (a, b entiers, b > 0), exacte (BigInt). */
function approxDown(a, b, d, k) {
  const p = 10n ** BigInt(k);
  const t = bsqrt(BigInt(b) * BigInt(b) * BigInt(d) * p * p); // ⌊b√d · 10^k⌋
  return q(`${t + BigInt(a) * p}/${p}`).toString();
}
/** Racine (exacte) d'une expression du premier degré. */
function root(src) {
  const p = E(src);
  if (p.degree() !== 1) throw new Error(`oracle tahlil-ibara: « ${src} » n'est pas du premier degré`);
  return q(p.coef(0)).neg().div(q(p.coef(1))).toString();
}

export const ORACLE = {
  'ex-4am-tahlil-ibara-l1-001:q1': R(G(2, 6)),
  'ex-4am-tahlil-ibara-l1-001:q2': R(qc('2x+6', '2', 0)),
  'ex-4am-tahlil-ibara-l1-001:q3': R(G(7, 21)),
  'ex-4am-tahlil-ibara-l1-001:q4': R(neg(qc('7x-21', '7', 0))),
  'ex-4am-tahlil-ibara-l1-001:q5': R(qc('x^2-3x', 'x', 0)),
  'ex-4am-tahlil-ibara-l1-002:q1': R(q('2.9').mul(13 + 87)),
  'ex-4am-tahlil-ibara-l1-002:q2': R(q('2.35').mul(176 - 76)),
  'ex-4am-tahlil-ibara-l1-002:q3': R(G(9, 3)),
  'ex-4am-tahlil-ibara-l1-002:q4': R(qc('9x+3', '3', 1)),
  'ex-4am-tahlil-ibara-l1-003:q1': R(qc('x^2+5x', 'x', 0)),
  'ex-4am-tahlil-ibara-l1-003:q2': R(at('x^2+5x', '3')),
  'ex-4am-tahlil-ibara-l1-004:q1': R(G(5, 15)),
  'ex-4am-tahlil-ibara-l1-004:q2': R(qc('5x+15', '5', 0)),
  'ex-4am-tahlil-ibara-l1-004:q3': R(G(12, 8)),
  'ex-4am-tahlil-ibara-l1-004:q4': R(qc('12x-8', G(12, 8), 1)),
  'ex-4am-tahlil-ibara-l1-004:q5': R(neg(qc('12x-8', G(12, 8), 0))),
  'ex-4am-tahlil-ibara-l1-005:q1': R(sq('x^2+8x+16')[1]),
  'ex-4am-tahlil-ibara-l1-005:q2': R(isq(neg(co('x^2-49', 0)))),
  'ex-4am-tahlil-ibara-l1-005:q3': R(neg(sq('x^2-12x+36')[1])),
  'ex-4am-tahlil-ibara-l1-006:q1': R(qc('(x-5)(2x+3)+(x-5)(x-1)', 'x-5', 1)),
  'ex-4am-tahlil-ibara-l1-006:q2': R(qc('(x-5)(2x+3)+(x-5)(x-1)', 'x-5', 0)),
  'ex-4am-tahlil-ibara-l1-006:q3': R(root('3x+2')),
  'ex-4am-tahlil-ibara-l1-006:q4': R(root('x-5')),
  'ex-4am-tahlil-ibara-l1-007:q1': R(qc('x^2+7x', 'x', 0)),
  'ex-4am-tahlil-ibara-l1-007:q2': R(G(3, 6)),
  'ex-4am-tahlil-ibara-l1-007:q3': R(neg(qc('3x^2-6x', `${G(3, 6)}x`, 0))),
  'ex-4am-tahlil-ibara-l1-008:q1': R(qc('(x+4)(2x-1)+(x+4)(x+5)', 'x+4', 1)),
  'ex-4am-tahlil-ibara-l1-008:q2': R(qc('(x+4)(2x-1)+(x+4)(x+5)', 'x+4', 0)),
  'ex-4am-tahlil-ibara-l1-008:q3': R(at('(x+4)(2x-1)+(x+4)(x+5)', '0')),
  'ex-4am-tahlil-ibara-l1-009:q1': R(G(8, 12)),
  'ex-4am-tahlil-ibara-l1-009:q2': R(qc('8x+12', G(8, 12), 1)),
  'ex-4am-tahlil-ibara-l1-009:q3': R(qc('8x+12', G(8, 12), 0)),
  'ex-4am-tahlil-ibara-l1-010:q1': R(r2('81-(x+1)^2', 1)),
  'ex-4am-tahlil-ibara-l1-010:q2': R(neg(r2('81-(x+1)^2', 0))),
  'ex-4am-tahlil-ibara-l1-010:q3': R(at('81-(x+1)^2', '30')),
  'ex-4am-tahlil-ibara-l2-001:q1': R(qc('x^2-5x', 'x', 0)),
  'ex-4am-tahlil-ibara-l2-001:q2': R(qc('(x+3)(1-2x)+5(1-2x)', '1-2x', 0)),
  'ex-4am-tahlil-ibara-l2-001:q3': R(qc('(1+x)(x-5)-(1+2x)(1+x)', '1+x', 1)),
  'ex-4am-tahlil-ibara-l2-001:q4': R(qc('(1+x)(x-5)-(1+2x)(1+x)', '1+x', 0)),
  'ex-4am-tahlil-ibara-l2-002:q1': R(qc('5x(2x+1)+(2x+1)', '2x+1', 1)),
  'ex-4am-tahlil-ibara-l2-002:q2': R(qc('5x(2x+1)+(2x+1)', '2x+1', 0)),
  'ex-4am-tahlil-ibara-l2-002:q3': R(qc('(x+7)(x-3)-(x-3)', 'x-3', 0)),
  'ex-4am-tahlil-ibara-l2-002:q4': R(qc('(x+1)(x-4)-x+4', 'x', 0)),
  'ex-4am-tahlil-ibara-l2-003:q1': R(qc('(x-1)(5x+4)+(3+x)(x-1)', 'x-1', 1)),
  'ex-4am-tahlil-ibara-l2-003:q2': R(qc('(x-1)(5x+4)+(3+x)(x-1)', 'x-1', 0)),
  'ex-4am-tahlil-ibara-l2-003:q3': R(qc('(2x-5)(x+2)-(x-2)(x+2)', 'x+2', 0)),
  'ex-4am-tahlil-ibara-l2-004:q1': R(sq('x^2+6x+9')[1]),
  'ex-4am-tahlil-ibara-l2-004:q2': R(sq('4x^2+20x+25')[0]),
  'ex-4am-tahlil-ibara-l2-004:q3': R(sq('4x^2+20x+25')[1]),
  'ex-4am-tahlil-ibara-l2-004:q4': R(sq('9x^2+42x+49')[0]),
  'ex-4am-tahlil-ibara-l2-004:q5': R(sq('9x^2+42x+49')[1]),
  'ex-4am-tahlil-ibara-l2-004:q6': R(sq('1+8x+16x^2')[0]),
  'ex-4am-tahlil-ibara-l2-004:q7': R(sq('1+8x+16x^2')[1]),
  'ex-4am-tahlil-ibara-l2-005:q1': R(neg(sq('x^2-10x+25')[1])),
  'ex-4am-tahlil-ibara-l2-005:q2': R(sq('9x^2-12x+4')[0]),
  'ex-4am-tahlil-ibara-l2-005:q3': R(neg(sq('9x^2-12x+4')[1])),
  'ex-4am-tahlil-ibara-l2-005:q4': R(sq('81x^2-18x+1')[0]),
  'ex-4am-tahlil-ibara-l2-005:q5': R(neg(sq('81x^2-18x+1')[1])),
  'ex-4am-tahlil-ibara-l2-005:q6': R(neg(sq('9-6x+x^2')[1])),
  'ex-4am-tahlil-ibara-l2-006:q1': R(co('(6/2)^2', 0)),
  'ex-4am-tahlil-ibara-l2-006:q2': R(q(6).div(2)),
  'ex-4am-tahlil-ibara-l2-006:q3': R(neg(co('(6x-1)^2', 1))),
  'ex-4am-tahlil-ibara-l2-006:q4': R(isq(25)),
  'ex-4am-tahlil-ibara-l2-006:q5': R(neg(co(`(x-${isq(25)})^2`, 1))),
  'ex-4am-tahlil-ibara-l2-006:q6': R(isq(81)),
  'ex-4am-tahlil-ibara-l2-007:q2': R(qc('2x^2-7x+3+(2x-1)(3x+2)', '2x-1', 1)),
  'ex-4am-tahlil-ibara-l2-007:q3': R(qc('2x^2-7x+3+(2x-1)(3x+2)', '2x-1', 0)),
  'ex-4am-tahlil-ibara-l2-007:q4': R(root('4x-1')),
  'ex-4am-tahlil-ibara-l2-007:q5': R(root('2x-1')),
  'ex-4am-tahlil-ibara-l2-008:q1': R(E('(2x-3)(x-2)').coef(2)),
  'ex-4am-tahlil-ibara-l2-008:q2': R(E('(2x-3)(x-2)').coef(1)),
  'ex-4am-tahlil-ibara-l2-008:q3': R(E('(2x-3)(x-2)').coef(0)),
  'ex-4am-tahlil-ibara-l2-008:q4': R(qc('2x^2-7x+6-(2x-3)(2x-1)', '2x-3', 1)),
  'ex-4am-tahlil-ibara-l2-008:q5': R(qc('2x^2-7x+6-(2x-3)(2x-1)', '2x-3', 0)),
  'ex-4am-tahlil-ibara-l2-008:q6': R(root('-x-1')),
  'ex-4am-tahlil-ibara-l2-008:q7': R(root('2x-3')),
  'ex-4am-tahlil-ibara-l2-009:q1': R(E('2x-10-(x-5)^2').coef(2)),
  'ex-4am-tahlil-ibara-l2-009:q2': R(E('2x-10-(x-5)^2').coef(1)),
  'ex-4am-tahlil-ibara-l2-009:q3': R(E('2x-10-(x-5)^2').coef(0)),
  'ex-4am-tahlil-ibara-l2-009:q4': R(qc('2x-10-(x-5)^2', 'x-5', 1)),
  'ex-4am-tahlil-ibara-l2-009:q5': R(qc('2x-10-(x-5)^2', 'x-5', 0)),
  'ex-4am-tahlil-ibara-l2-009:q6': R(root('x-5')),
  'ex-4am-tahlil-ibara-l2-009:q7': R(root('7-x')),
  'ex-4am-tahlil-ibara-l2-010:q1': R(E('(x-2)(x-9)+4(x-2)').coef(2)),
  'ex-4am-tahlil-ibara-l2-010:q2': R(E('(x-2)(x-9)+4(x-2)').coef(1)),
  'ex-4am-tahlil-ibara-l2-010:q3': R(E('(x-2)(x-9)+4(x-2)').coef(0)),
  'ex-4am-tahlil-ibara-l2-010:q4': R(qc('(x-2)(x-9)+4(x-2)', 'x-2', 0)),
  'ex-4am-tahlil-ibara-l2-010:q5': R(at('(x-2)(x-9)+4(x-2)', '102')),
  'ex-4am-tahlil-ibara-l3-001:q1': R(at('(x-1)(x+2)+x(x+2)-(x+2)', '0')),
  'ex-4am-tahlil-ibara-l3-001:q2': R(at('(x+2)(2x-1)', '0')),
  'ex-4am-tahlil-ibara-l3-001:q3': R(qc('(x-1)(x+2)+x(x+2)-(x+2)', 'x+2', 1)),
  'ex-4am-tahlil-ibara-l3-001:q4': R(qc('(x-1)(x+2)+x(x+2)-(x+2)', 'x+2', 0)),
  'ex-4am-tahlil-ibara-l3-002:q1': R(qc('(x-√)(4x+3)-(x+2)(x-√)', 'x-√', 1, 2)),
  'ex-4am-tahlil-ibara-l3-002:q2': R(qc('(x-√)(4x+3)-(x+2)(x-√)', 'x-√', 0, 2)),
  'ex-4am-tahlil-ibara-l3-002:q3': R(qc('(2-5x)(x-2/3)+(2-5x)(x-4/3)', '2-5x', 1)),
  'ex-4am-tahlil-ibara-l3-002:q4': R(qc('(2-5x)(x-2/3)+(2-5x)(x-4/3)', '2-5x', 0)),
  'ex-4am-tahlil-ibara-l3-003:q1': R(sq('9x^2+24x+16')[0]),
  'ex-4am-tahlil-ibara-l3-003:q2': R(sq('9x^2+24x+16')[1]),
  'ex-4am-tahlil-ibara-l3-003:q3': R(neg(sq('121-22x+x^2')[1])),
  'ex-4am-tahlil-ibara-l3-003:q4': R(neg(mul(2, r2('9x^2+24x+16-(121-22x+x^2)', 0)))),
  'ex-4am-tahlil-ibara-l3-003:q5': R(neg(mul(4, r2('9x^2+24x+16-(121-22x+x^2)', 1)))),
  'ex-4am-tahlil-ibara-l3-004:q1': R(co('(3-2x)^2-9', 2)),
  'ex-4am-tahlil-ibara-l3-004:q2': R(qc('(3-2x)^2-9', `${co('(3-2x)^2-9', 2)}x`, 0)),
  'ex-4am-tahlil-ibara-l3-004:q3': R(neg(r2('1/4-(x+3/2)^2', 1))),
  'ex-4am-tahlil-ibara-l3-004:q4': R(neg(r2('1/4-(x+3/2)^2', 0))),
  'ex-4am-tahlil-ibara-l3-004:q5': R(mul(2, r2('(x+2)^2-(3x-1)^2', 1))),
  'ex-4am-tahlil-ibara-l3-004:q6': R(neg(mul(4, r2('(x+2)^2-(3x-1)^2', 0)))),
  'ex-4am-tahlil-ibara-l3-005:q1': R(sq('144x^2-24x+1')[0]),
  'ex-4am-tahlil-ibara-l3-005:q2': R(neg(sq('144x^2-24x+1')[1])),
  'ex-4am-tahlil-ibara-l3-005:q3': R(qc('(4x^2-1)+(12x^2-6x)', '2x-1', 1)),
  'ex-4am-tahlil-ibara-l3-005:q4': R(qc('(4x^2-1)+(12x^2-6x)', '2x-1', 0)),
  'ex-4am-tahlil-ibara-l3-006:q1': R(co('98^2-2^2', 0)),
  'ex-4am-tahlil-ibara-l3-006:q2': R(co('408^2-407^2', 0)),
  'ex-4am-tahlil-ibara-l3-006:q3': R(co('777^2-223^2', 0)),
  'ex-4am-tahlil-ibara-l3-007:q1': R(sq('x^2+6x+9')[1]),
  'ex-4am-tahlil-ibara-l3-007:q2': R(neg(sq('x^2-4x+4')[1])),
  'ex-4am-tahlil-ibara-l3-007:q3': R(isq(neg(co('x^2-16', 0)))),
  'ex-4am-tahlil-ibara-l3-007:q4': R(qc('(x^2-16)+(x+4)(2x-3)', 'x+4', 1)),
  'ex-4am-tahlil-ibara-l3-007:q5': R(qc('(x^2-16)+(x+4)(2x-3)', 'x+4', 0)),
  'ex-4am-tahlil-ibara-l3-008:q1': R(E('10^2-(x-2)^2-(x+8)').coef(2)),
  'ex-4am-tahlil-ibara-l3-008:q2': R(E('10^2-(x-2)^2-(x+8)').coef(1)),
  'ex-4am-tahlil-ibara-l3-008:q3': R(E('10^2-(x-2)^2-(x+8)').coef(0)),
  'ex-4am-tahlil-ibara-l3-008:q4': R(neg(r2('10^2-(x-2)^2', 0))),
  'ex-4am-tahlil-ibara-l3-008:q5': R(r2('10^2-(x-2)^2', 1)),
  'ex-4am-tahlil-ibara-l3-008:q6': R(qc('10^2-(x-2)^2-(x+8)', '8+x', 0)),
  'ex-4am-tahlil-ibara-l3-008:q7': R(root('8+x')),
  'ex-4am-tahlil-ibara-l3-008:q8': R(root('11-x')),
  'ex-4am-tahlil-ibara-l3-009:q1': R(E('(x+1)^2-(x+1)(2x-3)').coef(2)),
  'ex-4am-tahlil-ibara-l3-009:q2': R(E('(x+1)^2-(x+1)(2x-3)').coef(1)),
  'ex-4am-tahlil-ibara-l3-009:q3': R(E('(x+1)^2-(x+1)(2x-3)').coef(0)),
  'ex-4am-tahlil-ibara-l3-009:q4': R(qc('(x+1)^2-(x+1)(2x-3)', 'x+1', 1)),
  'ex-4am-tahlil-ibara-l3-009:q5': R(qc('(x+1)^2-(x+1)(2x-3)', 'x+1', 0)),
  'ex-4am-tahlil-ibara-l3-009:q6': R(root('(3x+4)-(6x-2)')),
  'ex-4am-tahlil-ibara-l3-010:q1': R(E('(x-3)(x-10)+3(x-3)').coef(2)),
  'ex-4am-tahlil-ibara-l3-010:q2': R(E('(x-3)(x-10)+3(x-3)').coef(1)),
  'ex-4am-tahlil-ibara-l3-010:q3': R(E('(x-3)(x-10)+3(x-3)').coef(0)),
  'ex-4am-tahlil-ibara-l3-010:q4': R(qc('(x-3)(x-10)+3(x-3)', 'x-3', 0)),
  'ex-4am-tahlil-ibara-l3-010:q5': R(root('x-3')),
  'ex-4am-tahlil-ibara-l3-010:q6': R(root('x-7')),
  'ex-4am-tahlil-ibara-l3-010:q7': R(at('(x-3)(x-10)+3(x-3)', '50')),
  'ex-4am-tahlil-ibara-l4-001:q1': R(qc('2x(2/7-x)+(2/7-x)(5x-4)/3', '(2/7-x)/3', 1)),
  'ex-4am-tahlil-ibara-l4-001:q2': R(qc('2x(2/7-x)+(2/7-x)(5x-4)/3', '(2/7-x)/3', 0)),
  'ex-4am-tahlil-ibara-l4-001:q3': R(qc('(1.2x-3.5)(3.7+x)-(0.2x-6.5)(3.7+x)+(3.7+x)', '3.7+x', 0)),
  'ex-4am-tahlil-ibara-l4-001:q4': R(at('(1.2x-3.5)(3.7+x)-(0.2x-6.5)(3.7+x)+(3.7+x)', '6.3')),
  'ex-4am-tahlil-ibara-l4-002:q1': R(sq('x^2/9+x/3+1/4')[0]),
  'ex-4am-tahlil-ibara-l4-002:q2': R(sq('x^2/9+x/3+1/4')[1]),
  'ex-4am-tahlil-ibara-l4-002:q3': R(sq('25x^2/9-5x/2+9/16')[0]),
  'ex-4am-tahlil-ibara-l4-002:q4': R(neg(sq('25x^2/9-5x/2+9/16')[1])),
  'ex-4am-tahlil-ibara-l4-002:q5': R(div(co('x^2/9+x/3+1/4-(25x^2/9-5x/2+9/16)', 2), 2)),
  'ex-4am-tahlil-ibara-l4-002:q6': R(div(co('x^2/9+x/3+1/4-(25x^2/9-5x/2+9/16)', 0), '5/4')),
  'ex-4am-tahlil-ibara-l4-003:q1': R(div(-2, r2('(2-x)^2-4x^2', 1))),
  'ex-4am-tahlil-ibara-l4-003:q2': R(neg(r2('(2-x)^2-4x^2', 0))),
  'ex-4am-tahlil-ibara-l4-003:q3': R(neg(r2('(2x+3)^2-(x+1)^2', 0))),
  'ex-4am-tahlil-ibara-l4-003:q4': R(neg(mul(3, r2('(2x+3)^2-(x+1)^2', 1)))),
  'ex-4am-tahlil-ibara-l4-003:q5': R(co('(2-x)^2-4x^2+(2x+3)^2-(x+1)^2', 1)),
  'ex-4am-tahlil-ibara-l4-003:q6': R(div(co('(2-x)^2-4x^2+(2x+3)^2-(x+1)^2', 0), co('(2-x)^2-4x^2+(2x+3)^2-(x+1)^2', 1))),
  'ex-4am-tahlil-ibara-l4-004:q1': R(rc('(2-√)^2', 3)),
  'ex-4am-tahlil-ibara-l4-004:q2': R(ic('(2-√)^2', 3)),
  'ex-4am-tahlil-ibara-l4-004:q3': R(ic(`${co('√^2', 7)}-(7-4√)`, 3)),
  'ex-4am-tahlil-ibara-l4-004:q4': R(sqrtForm(neg(rc('x^2-(7-4√)', 3)), neg(ic('x^2-(7-4√)', 3)), 3)[0]),
  'ex-4am-tahlil-ibara-l4-004:q5': R(sqrtForm(neg(rc('x^2-(7-4√)', 3)), neg(ic('x^2-(7-4√)', 3)), 3)[1]),
  'ex-4am-tahlil-ibara-l4-004:q6': R(sdRoots('x-2+√', 'x+2-√', 3)[0][0]),
  'ex-4am-tahlil-ibara-l4-004:q7': R(sdRoots('x-2+√', 'x+2-√', 3)[0][1]),
  'ex-4am-tahlil-ibara-l4-004:q8': R(sdRoots('x-2+√', 'x+2-√', 3)[1][0]),
  'ex-4am-tahlil-ibara-l4-004:q9': R(sdRoots('x-2+√', 'x+2-√', 3)[1][1]),
  'ex-4am-tahlil-ibara-l4-005:q1': R(E('(4x-1)^2-(3x+2)(4x-1)').coef(2)),
  'ex-4am-tahlil-ibara-l4-005:q2': R(E('(4x-1)^2-(3x+2)(4x-1)').coef(1)),
  'ex-4am-tahlil-ibara-l4-005:q3': R(E('(4x-1)^2-(3x+2)(4x-1)').coef(0)),
  'ex-4am-tahlil-ibara-l4-005:q4': R(qc('(4x-1)^2-(3x+2)(4x-1)', '4x-1', 1)),
  'ex-4am-tahlil-ibara-l4-005:q5': R(qc('(4x-1)^2-(3x+2)(4x-1)', '4x-1', 0)),
  'ex-4am-tahlil-ibara-l4-005:q6': R(root('4x-1')),
  'ex-4am-tahlil-ibara-l4-005:q7': R(root('x-3')),
  'ex-4am-tahlil-ibara-l4-005:q8': R(root('(4x^2-13x+3)-(4x^2+29)')),
  'ex-4am-tahlil-ibara-l4-006:q1': R(approxDown(-5, 3, 2, 2)),
  'ex-4am-tahlil-ibara-l4-006:q2': R(root('3x-5')),
  'ex-4am-tahlil-ibara-l4-006:q3': R(E('(3x-5)^2+9x^2-25').coef(2)),
  'ex-4am-tahlil-ibara-l4-006:q4': R(E('(3x-5)^2+9x^2-25').coef(1)),
  'ex-4am-tahlil-ibara-l4-006:q5': R(qc('(3x-5)^2+9x^2-25', 'x(3x-5)', 0)),
  'ex-4am-tahlil-ibara-l4-006:q6': R(root('6x')),
  'ex-4am-tahlil-ibara-l4-006:q7': R(root('3x-5')),
  'ex-4am-tahlil-ibara-l4-007:q2': R(qc('(2x+1)(3x-7)-(20x^2-5)', '2x+1', 1)),
  'ex-4am-tahlil-ibara-l4-007:q3': R(qc('(2x+1)(3x-7)-(20x^2-5)', '2x+1', 0)),
  'ex-4am-tahlil-ibara-l4-007:q4': R(root('(-14x^2-11x-2)-2(10-7x^2)')),
  'ex-4am-tahlil-ibara-l4-008:q2': R(qc('3x^2-11x-4+(3x+1)^2', '3x+1', 1)),
  'ex-4am-tahlil-ibara-l4-008:q3': R(qc('3x^2-11x-4+(3x+1)^2', '3x+1', 0)),
  'ex-4am-tahlil-ibara-l4-008:q4': R(root('(3x+1)(x-4)-(3x^2+7)')),
  'ex-4am-tahlil-ibara-l4-009:q1': R(approxDown(-3, 2, 3, 2)),
  'ex-4am-tahlil-ibara-l4-009:q2': R(root('2x-3')),
  'ex-4am-tahlil-ibara-l4-009:q3': R(E('(2x-3)^2+4x^2-9').coef(2)),
  'ex-4am-tahlil-ibara-l4-009:q4': R(E('(2x-3)^2+4x^2-9').coef(1)),
  'ex-4am-tahlil-ibara-l4-009:q5': R(qc('(2x-3)^2+4x^2-9', 'x(2x-3)', 0)),
  'ex-4am-tahlil-ibara-l4-009:q6': R(root('4x')),
  'ex-4am-tahlil-ibara-l4-009:q7': R(root('2x-3')),
  'ex-4am-tahlil-ibara-l4-010:q2': R(qc('(x-2)(5x+1)-(3x^2-12)', 'x-2', 1)),
  'ex-4am-tahlil-ibara-l4-010:q3': R(qc('(x-2)(5x+1)-(3x^2-12)', 'x-2', 0)),
  'ex-4am-tahlil-ibara-l4-010:q4': R(root('(5x^2-9x+2)-5(x^2-1)')),
  'ex-4am-tahlil-ibara-l5-001:q1': R(E('(x+7)^2-9').coef(2)),
  'ex-4am-tahlil-ibara-l5-001:q2': R(E('(x+7)^2-9').coef(1)),
  'ex-4am-tahlil-ibara-l5-001:q3': R(E('(x+7)^2-9').coef(0)),
  'ex-4am-tahlil-ibara-l5-001:q4': R(neg(r2('(x+7)^2-9', 1))),
  'ex-4am-tahlil-ibara-l5-001:q5': R(neg(r2('(x+7)^2-9', 0))),
  'ex-4am-tahlil-ibara-l5-001:q6': R(at('(x+7)^2-9', '23')),
  'ex-4am-tahlil-ibara-l5-001:q7': R(q(at('(x+7)^2-9', '23')).div('13.5').mul(100)),
  'ex-4am-tahlil-ibara-l5-002:q1': R(qc('(2x+1)^2+5(2x+1)', '2x+1', 1)),
  'ex-4am-tahlil-ibara-l5-002:q2': R(qc('(2x+1)^2+5(2x+1)', '2x+1', 0)),
  'ex-4am-tahlil-ibara-l5-002:q3': R(qc('(2x+1)^2+5(2x+1)', '2x+1', 1)),
  'ex-4am-tahlil-ibara-l5-002:q4': R(qc('(2x+1)^2+5(2x+1)', `${qc('(2x+1)^2+5(2x+1)', '2x+1', 1)}(2x+1)`, 0)),
  'ex-4am-tahlil-ibara-l5-002:q5': R(at('(2x+1)^2+5(2x+1)', '4')),
  'ex-4am-tahlil-ibara-l5-002:q6': R(q(at('(2x+1)^2+5(2x+1)', '4')).mul(1250 + 450)),
  'ex-4am-tahlil-ibara-l5-003:q1': R(qc('(x+3)(x+4)+(x+3)(x+1)', 'x+3', 1)),
  'ex-4am-tahlil-ibara-l5-003:q2': R(qc('(x+3)(x+4)+(x+3)(x+1)', 'x+3', 0)),
  'ex-4am-tahlil-ibara-l5-003:q3': R(at('(x+3)(x+4)+(x+3)(x+1)', '12')),
  'ex-4am-tahlil-ibara-l5-003:q4': R(q(at('(x+3)(x+4)+(x+3)(x+1)', '12')).mul(q(60).mul(450).sub(6000))),
  'ex-4am-tahlil-ibara-l5-004:q1': R(neg(r2('(x+5)^2-1', 1))),
  'ex-4am-tahlil-ibara-l5-004:q2': R(neg(r2('(x+5)^2-1', 0))),
  'ex-4am-tahlil-ibara-l5-004:q3': R(qc('2((x+5)^2-1)', '(x+4)(x+6)', 0)),
  'ex-4am-tahlil-ibara-l5-004:q4': R(at('2((x+5)^2-1)', '3')),
  'ex-4am-tahlil-ibara-l5-004:q5': R(q(at('2((x+5)^2-1)', '3')).div(9)),
  'ex-4am-tahlil-ibara-l5-005:q1': R(co('(x+40)^2-x^2', 1)),
  'ex-4am-tahlil-ibara-l5-005:q2': R(div(co('(x+40)^2-x^2', 0), co('(x+40)^2-x^2', 1))),
  'ex-4am-tahlil-ibara-l5-005:q3': R(at('(x+40)^2-x^2', '160')),
  'ex-4am-tahlil-ibara-l5-005:q4': R(q(at('(x+40)^2-x^2', '160')).div(10000).mul(9000)),
  'ex-4am-tahlil-ibara-l5-006:q1': R(sq('(x+6)(x+2)-4(x+2)')[1]),
  'ex-4am-tahlil-ibara-l5-006:q2': R(q(at('(x+6)(x+2)-4(x+2)', '8')).div(4).mul(2).div(5).mul(2400)),
  'ex-4am-tahlil-ibara-l5-007:q1': R(qc('4x^2-49', '2x+7', 1)),
  'ex-4am-tahlil-ibara-l5-007:q2': R(qc('4x^2-49', '2x+7', 0)),
  'ex-4am-tahlil-ibara-l5-007:q3': R(q(2).mul(q(at('2x+7', '12')).add(qat('4x^2-49', '2x+7', '12')))),
  'ex-4am-tahlil-ibara-l5-007:q4': R(q(2).mul(q(at('2x+7', '12')).add(qat('4x^2-49', '2x+7', '12'))).sub(3).mul(1800)),
  'ex-4am-tahlil-ibara-l5-008:q1': R(qc('6x+9', '2x+3', 0)),
  'ex-4am-tahlil-ibara-l5-008:q2': R(qc('4x+6', '2x+3', 0)),
  'ex-4am-tahlil-ibara-l5-008:q3': R(G(Number(at('6x+9', '60')), Number(at('4x+6', '60')))),
  'ex-4am-tahlil-ibara-l5-008:q4': R(q(at('6x+9', '60')).mul(1100).add(q(at('4x+6', '60')).mul(650))),
  'ex-4am-tahlil-ibara-l5-009:q1': R(sq('x^2+16x+64')[1]),
  'ex-4am-tahlil-ibara-l5-009:q2': R(q(sq('x^2+16x+64')[0]).mul(22).add(sq('x^2+16x+64')[1])),
  'ex-4am-tahlil-ibara-l5-009:q3': R(q(at('x^2+16x+64', '22')).div(4).mul(15)),
  'ex-4am-tahlil-ibara-l5-010:q1': R(isq(neg(co('x^2-16', 0)))),
  'ex-4am-tahlil-ibara-l5-010:q2': R(at('x^2-16', '100')),
  'ex-4am-tahlil-ibara-l5-010:q3': R(q(at('x^2-16', '100')).mul(1500).sub(q(at('x-4', '100')).mul(250))),
};

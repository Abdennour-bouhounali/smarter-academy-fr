// Oracle du banc « mutatabiqat-shahira » (unité 3 « الحساب الحرفي ») — feuilles d'examen BEM (2026-10-07).
// Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé (fusionné dans
// scripts/practice-answer-oracle.test.mjs). Une clé par question non selfCheck.
//
// E('…', d) lit une expression à UNE lettre (x, n… : toutes lues comme la même variable) avec
// + − × /, ^, parenthèses, produit implicite (« 3x », « 2(x + 1) », « (2x + 5)^2 ») et le symbole
// √ (= √d, d = 2 par défaut), et la CALCULE en polynôme exact à coefficients dans Q(√d), avec les
// rationnels de helpers.mjs — sans rien lire du contenu ni du code testé (le développement est
// REFAIT : E('(2x+5)^2-36').coef(1), jamais lu dans le JSON). Une division ne se fait que par un
// nombre rationnel.
//   .coef(k)  : coefficient rationnel de x^k (erreur s'il contient √d)
//   .rcoef(k) / .icoef(k) : partie rationnelle / coefficient de √d du coefficient de x^k
//   .at('1+√') : la valeur pour x = …, encore un polynôme (constant) : .rcoef(0), .icoef(0)
// root('…') : racine de l'expression du premier degré (étapes « حل المعادلة / المتراجحة », hors
// leçon, counted:false) — −(terme constant)/(coefficient de x), en rationnel exact.
// Le calcul mental (P4) est refait par l'identité que la question enseigne : E('(100+5)^2').coef(0).
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
    if (!(this.c[k] ?? this.zero()).i.isZero()) throw new Error(`oracle mutatabiqat-shahira: coefficient de x^${k} irrationnel`);
    return this.rcoef(k);
  }
  at(src) {
    const X = E(src, this.d);
    if (X.degree() > 0) throw new Error('oracle mutatabiqat-shahira: at() attend un nombre');
    const x = X.c[0] ?? this.zero();
    return new SP([this.c.reduceRight((acc, a) => acc.mul(x).add(a), this.zero())], this.d);
  }
}

function E(src, d = 2) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/,/g, '.');
  let i = 0;
  const peek = () => s[i];
  const fail = (m) => { throw new Error(`oracle mutatabiqat-shahira: ${m} dans « ${src} » (position ${i})`); };
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

/** Racine (exacte) d'une expression du premier degré. */
function root(src) {
  const p = E(src);
  if (p.degree() !== 1) throw new Error(`oracle mutatabiqat-shahira: « ${src} » n'est pas du premier degré`);
  return q(p.coef(0)).neg().div(q(p.coef(1))).toString();
}

export const ORACLE = {
  'ex-4am-mutatabiqat-shahira-l1-001:q1': R(E('(8+2)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-001:q2': R(E('8^2+2*8*2+2^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-001:q3': R(E('(3+0.5)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-002:q1': R(E('(9-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-002:q2': R(E('9^2-2*9*3+3^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-002:q3': R(E('(2.4-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-003:q1': R(E('(x+5)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-003:q2': R(E('(x+5)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-003:q3': R(E('(x+(3/10))^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-003:q4': R(E('(x+(3/10))^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-004:q1': R(E('(x-4)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-004:q2': R(E('(x-4)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-004:q3': R(E('(x-(3/2))^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-004:q4': R(E('(x-(3/2))^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-005:q1': R(E('(x+7)*(x-7)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-005:q2': R(E('(x+(1/5))*(x-(1/5))').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-006:q1': R(E('(x-3)*(x+3)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-006:q2': R(E('105*95').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-007:q1': R(E('31^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-007:q2': R(E('105^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-007:q3': R(E('1009^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-008:q1': R(E('(x+6)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-008:q2': R(E('(x+6)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-008:q3': R(E('(x+6)^2').at('4').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-009:q1': R(E('(x-9)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l1-009:q2': R(E('(x-9)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-009:q3': R(E('(x-9)^2').at('10').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-010:q1': R(E('41^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l1-010:q2': R(E('49*51').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-001:q1': R(E('(2x+3)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-001:q2': R(E('(2x+3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-001:q3': R(E('(2x+3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-001:q4': R(E('53^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-002:q1': R(E('(5-2x)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-002:q2': R(E('(5-2x)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-002:q3': R(E('(5-2x)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-002:q4': R(E('19^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-002:q5': R(E('37^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-003:q1': R(E('(4x+1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-003:q2': R(E('(4x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-003:q3': R(E('(4x+1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-003:q4': R(E('(2x+(1/2))^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-003:q5': R(E('(2x+(1/2))^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-003:q6': R(E('(2x+(1/2))^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-003:q7': R(E('(3x+(5/3))^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-003:q8': R(E('(3x+(5/3))^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-003:q9': R(E('(3x+(5/3))^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-004:q1': R(E('(2x-3)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-004:q2': R(E('(2x-3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-004:q3': R(E('(2x-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-004:q4': R(E('(5x-(7/5))^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-004:q5': R(E('(5x-(7/5))^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-004:q6': R(E('(5x-(7/5))^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-005:q1': R(E('(3x+5)*(3x-5)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-005:q2': R(E('(3x+5)*(3x-5)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-005:q3': R(E('((3/2)+2x)*((3/2)-2x)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-005:q4': R(E('((3/2)+2x)*((3/2)-2x)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-006:q1': R(E('(2x-5)*(2x+5)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-006:q2': R(E('(2x-5)*(2x+5)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-006:q3': R(E('97^2-3^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-007:q1': R(E('21*19').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-007:q2': R(E('101*99').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-007:q3': R(E('1008*992').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-008:q1': R(E('(3x+2)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-008:q2': R(E('(3x+2)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-008:q3': R(E('(3x+2)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-008:q4': R(E('(4-2x)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-008:q5': R(E('(4-2x)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l2-008:q6': R(E('(4-2x)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-008:q7': R(E('(5x-1)*(5x+1)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-008:q8': R(E('(5x-1)*(5x+1)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-009:q1': R(E('3*(4x-1)*(4x+1)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l2-009:q2': R(E('3*(4x-1)*(4x+1)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-009:q3': R(E('3*(4x-1)*(4x+1)').at('1/4').coef(0)),
  'ex-4am-mutatabiqat-shahira-l2-010:q1': R(E('(3-√)^2', 2).rcoef(0)),
  'ex-4am-mutatabiqat-shahira-l2-010:q2': R(E('(3-√)^2', 2).icoef(0)),
  'ex-4am-mutatabiqat-shahira-l2-010:q3': R(E('(3+√)*(3-√)', 2).coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-001:q1': R(E('(x+3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-001:q2': R(E('(x+3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-001:q3': R([1, 2, 3, 4, 5, 6, 7, 8, 9].find((p) => E(`(${p}x+1)^2`).coef(2) === '9')),
  'ex-4am-mutatabiqat-shahira-l3-001:q4': R(E('(3x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-001:q5': R([1, 2, 3, 4, 5, 6, 7, 8, 9].find((b) => E(`(x+${b})^2`).coef(0) === '25' && E(`(x+${b})^2`).coef(1) === '10')),
  'ex-4am-mutatabiqat-shahira-l3-001:q6': R(E('(x+5)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-002:q1': R(E('(3x-4)^2+(x-3)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-002:q2': R(E('(3x-4)^2+(x-3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-002:q3': R(E('(3x-4)^2+(x-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-002:q4': R(E('4*(1-2x)^2+(4x-1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-002:q5': R(E('4*(1-2x)^2+(4x-1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-002:q6': R(E('4*(1-2x)^2+(4x-1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-003:q1': R(E('(5x+1)^2+5*(x-1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-003:q2': R(E('(5x+1)^2+5*(x-1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-003:q3': R(E('(3x-4)^2-4*(1-x)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-003:q4': R(E('(3x-4)^2-4*(1-x)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-003:q5': R(E('(3x-4)^2-4*(1-x)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-004:q1': R(E('(2x+5)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-004:q2': R(E('(2x+5)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-004:q4': R(root('2x + 11')),
  'ex-4am-mutatabiqat-shahira-l3-004:q5': R(root('2x - 1')),
  'ex-4am-mutatabiqat-shahira-l3-005:q1': R(E('(2x-3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-005:q2': R(E('(2x-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-005:q4': R(root('2x + 1')),
  'ex-4am-mutatabiqat-shahira-l3-005:q5': R(root('2x - 7')),
  'ex-4am-mutatabiqat-shahira-l3-005:q6': R(E('(2x-3)^2-16', 2).at('1+√').rcoef(0)),
  'ex-4am-mutatabiqat-shahira-l3-005:q7': R(E('(2x-3)^2-16', 2).at('1+√').icoef(0)),
  'ex-4am-mutatabiqat-shahira-l3-006:q1': R(E('(3x+1)^2-(x-2)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-006:q2': R(E('(3x+1)^2-(x-2)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-006:q3': R(E('(3x+1)^2-(x-2)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-006:q5': R(root('2x + 3')),
  'ex-4am-mutatabiqat-shahira-l3-006:q6': R(root('4x - 1')),
  'ex-4am-mutatabiqat-shahira-l3-007:q1': R(E('(2x+1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-007:q2': R(E('(2x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-007:q3': R(E('(2x+1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-007:q4': R(E('(√-4x)^2', 3).coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-007:q5': R(E('(√-4x)^2', 3).icoef(1)),
  'ex-4am-mutatabiqat-shahira-l3-007:q6': R(E('(√-4x)^2', 3).coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-007:q7': R(E('(2x-√)*(2x+√)', 5).coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-007:q8': R(E('(2x-√)*(2x+√)', 5).coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-008:q1': R(E('(x+x+1)*(x+x+1)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-008:q2': R(E('(x+x+1)*(x+x+1)').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-008:q3': R(E('(x+x+1)*(x+x+1)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-008:q5': R(E('(x+x+1)*(x+x+1)').at('10').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-009:q1': R(E('(2x+3)^2-(x+1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l3-009:q2': R(E('(2x+3)^2-(x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-009:q3': R(E('(2x+3)^2-(x+1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-009:q5': R(root('x + 2')),
  'ex-4am-mutatabiqat-shahira-l3-009:q6': R(root('3x + 4')),
  'ex-4am-mutatabiqat-shahira-l3-010:q1': R(E('(3x-2)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l3-010:q2': R(E('(3x-2)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l3-010:q4': R(root('3x + 3')),
  'ex-4am-mutatabiqat-shahira-l3-010:q5': R(root('3x - 7')),
  'ex-4am-mutatabiqat-shahira-l4-001:q1': R(E('(x-2)^2+4*(3x-1)*(3x+3)').coef(2)),
  'ex-4am-mutatabiqat-shahira-l4-001:q2': R(E('(x-2)^2+4*(3x-1)*(3x+3)').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-001:q3': R(E('(x-2)^2+4*(3x-1)*(3x+3)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-001:q4': R(E('9x*(9x+1)^2-x*(x-1)^2').coef(3)),
  'ex-4am-mutatabiqat-shahira-l4-001:q5': R(E('9x*(9x+1)^2-x*(x-1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l4-001:q6': R(E('9x*(9x+1)^2-x*(x-1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-002:q1': R(E('x^2-(x-1)*(x+1)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-002:q2': R(E('978654321^2-978654320*978654322').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-002:q3': R(E('999888777^2-999888778*999888776').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-003:q1': R(E('(x+1)*(x+9)-(x+3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-003:q2': R(E('101*109-103^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-003:q3': R(E('1.5*9.5-3.5^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-004:q1': R(E('35^2-36*34').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-004:q2': R(E('2018^2-2019*2017').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-004:q3': R(E('x^2-(x+1)*(x-1)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-004:q4': R(E('(x-1)^2-(x)*(x-2)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-004:q5': R(E('(x+1)^2-(x+2)*(x)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-005:q2': R([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((k) => E(`(${k}x+4)*(${k}x-4)`).coef(2) === '49')),
  'ex-4am-mutatabiqat-shahira-l4-005:q3': R([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((k) => E(`(7x+${k})*(7x-${k})`).coef(0) === '-16')),
  'ex-4am-mutatabiqat-shahira-l4-005:q5': R(root('8x + 7')),
  'ex-4am-mutatabiqat-shahira-l4-005:q6': R(root('7x - 4')),
  'ex-4am-mutatabiqat-shahira-l4-006:q1': R(E('(x-7)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-006:q2': R(E('(x-7)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-006:q4': R(E('x^2-14x-32', 3).at('√-2').rcoef(0)),
  'ex-4am-mutatabiqat-shahira-l4-006:q5': R(E('x^2-14x-32', 3).at('√-2').icoef(0)),
  'ex-4am-mutatabiqat-shahira-l4-006:q6': R(root('-14x-32')),
  'ex-4am-mutatabiqat-shahira-l4-007:q1': R(E('(2x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-007:q2': R(E('(2x+1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-007:q4': R(root('2x + 4')),
  'ex-4am-mutatabiqat-shahira-l4-007:q5': R(root('2x - 2')),
  'ex-4am-mutatabiqat-shahira-l4-007:q6': R(E('(2x+1)^2-9', 3).at('1+√').rcoef(0)),
  'ex-4am-mutatabiqat-shahira-l4-007:q7': R(E('(2x+1)^2-9', 3).at('1+√').icoef(0)),
  'ex-4am-mutatabiqat-shahira-l4-008:q1': R(E('(x-5)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-008:q2': R(E('(x-5)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-008:q4': R(E('x^2-10x-11', 2).at('√+5').coef(0)),
  'ex-4am-mutatabiqat-shahira-l4-008:q5': R(root('-10x-11')),
  'ex-4am-mutatabiqat-shahira-l4-009:q2': R([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((k) => E(`(${k}x+3)*(${k}x-3)`).coef(2) === '25')),
  'ex-4am-mutatabiqat-shahira-l4-009:q3': R([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((k) => E(`(5x+${k})*(5x-${k})`).coef(0) === '-9')),
  'ex-4am-mutatabiqat-shahira-l4-009:q5': R(root('6x + 5')),
  'ex-4am-mutatabiqat-shahira-l4-009:q6': R(root('5x - 3')),
  'ex-4am-mutatabiqat-shahira-l4-010:q1': R(E('(x+3)^2-(x-3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l4-010:q2': R(E('53^2-47^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-001:q1': R(E('(x+6)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-001:q2': R(E('(x+6)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-001:q3': R(E('(x+6)^2-x^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-001:q4': R(E('(x+6)^2-x^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-001:q5': R(E('(x+6)^2-x^2').at('45').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-001:q6': R(q(E('(x+6)^2-x^2').at('45').coef(0)).mul(350).add(15000)),
  'ex-4am-mutatabiqat-shahira-l5-002:q1': R(E('(2x-1)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l5-002:q2': R(E('(2x-1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-002:q3': R(E('(2x-1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-002:q4': R(E('(2x-1)^2').at('3/2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-002:q5': R(q(E('(2x-1)^2').at('3/2').coef(0)).mul(6).mul(q(12500).sub(4800))),
  'ex-4am-mutatabiqat-shahira-l5-003:q1': R(E('(x-10)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-003:q2': R(E('(x-10)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-003:q3': R(E('x^2-(x-10)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-003:q4': R(E('x^2-(x-10)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-003:q5': R(E('(x-10)^2').at('210').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-003:q6': R(q(E('(x-10)^2').at('210').coef(0)).div(2).mul('1.5')),
  'ex-4am-mutatabiqat-shahira-l5-004:q1': R(E('99^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-004:q2': R(E('101*99').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-004:q3': R(q(E('101*99-99^2').coef(0)).mul(25)),
  'ex-4am-mutatabiqat-shahira-l5-005:q1': R(E('(x+3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-005:q2': R(E('(x+3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-005:q3': R(E('(x-3)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-005:q4': R(E('(x-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-005:q5': R(E('(x+3)^2+(x-3)^2').coef(2)),
  'ex-4am-mutatabiqat-shahira-l5-005:q6': R(E('(x+3)^2+(x-3)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-005:q7': R(E('(x+3)^2+(x-3)^2').at('12').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-005:q8': R(q(E('(x+3)^2+(x-3)^2').at('12').coef(0)).mul(2).div(36)),
  'ex-4am-mutatabiqat-shahira-l5-006:q1': R(E('95^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-006:q2': R(E('105^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-006:q3': R(E('105^2-95^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-006:q4': R(q(E('105^2-95^2').coef(0)).div(8).mul(1500)),
  'ex-4am-mutatabiqat-shahira-l5-007:q1': R(E('1.05^2-0.95^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-007:q2': R(E('0.95^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-007:q3': R(q(E('(1-0.05)^2').coef(0)).mul(200).mul(4000)),
  'ex-4am-mutatabiqat-shahira-l5-008:q1': R(E('(x+1)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-008:q2': R(E('(x+1)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-008:q3': R(E('(x+1)^2-x^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-008:q4': R(E('(x+1)^2-x^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-008:q5': R(E('(x+1)^2-x^2').at('24').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-008:q6': R(q(E('(n+1)^2-n^2').at('24').coef(0)).sub(q(600).sub(576))),
  'ex-4am-mutatabiqat-shahira-l5-009:q2': R(E('(x+8)*(x-8)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-009:q3': R(E('x^2-(x+8)*(x-8)').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-009:q4': R(q(E('x^2-(x+8)*(x-8)').coef(0)).mul(3500)),
  'ex-4am-mutatabiqat-shahira-l5-010:q1': R(E('(x+4)^2').coef(1)),
  'ex-4am-mutatabiqat-shahira-l5-010:q2': R(E('(x+4)^2').coef(0)),
  'ex-4am-mutatabiqat-shahira-l5-010:q4': R(q(E('(x+4)^2-x^2-4^2').at('36').coef(0))),
  'ex-4am-mutatabiqat-shahira-l5-010:q5': R(q(E('(x+4)^2-x^2-4^2').at('36').coef(0)).div(16).mul(650)),
};

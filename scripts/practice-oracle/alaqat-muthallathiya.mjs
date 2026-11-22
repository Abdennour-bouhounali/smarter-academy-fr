// Oracle du banc « alaqat-muthallathiya » au format BEM (unité 10 « حساب المثلثات في المثلث القائم », leçon 3 « العلاقات
// بين النسب المثلثية والإنشاءات الهندسية », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici
// à partir des nombres de l'ÉNONCÉ, avec les outils de ce fichier (jamais packages/core/arithmetic/trigonometry.js) :
//   q(v)                      un rationnel EXACT (helpers.mjs) ;
//   S                         un nombre EXACT à radicaux, Σ qᵢ·√rᵢ (rᵢ sans facteur carré) : S.sqrt(q) extrait les carrés,
//                             add / sub / mul / div (diviseur à un seul terme), eq (égalité exacte terme à terme) ;
//   rel(given, v)             la relation cos² + sin² = 1 : l'autre rapport = √(1 − v²) (positif, angle aigu), exact ;
//   aOver(s, b)               « اكتب على الشكل √a / b » : a = (s × b)², et l'oracle vérifie que s × b = √a exactement ;
//   roundS(s, d)              l'arrondi au plus proche d'une valeur exacte (rationnelle ou à radical), décidé par des
//                             comparaisons EXACTES de signe (jamais une égalité flottante) ;
//   rnd(x, d)                 l'écran de la calculatrice (10 chiffres significatifs) pour un ANGLE (sin⁻¹, cos⁻¹, tan⁻¹ en
//                             degrés), puis l'arrondi demandé — l'angle n'est pas une valeur exacte.
// Questions fermées : chaque option est ÉVALUÉE (valeur exacte comparée à la vraie, identité testée en exact sur 30°, 45°,
// 60° et le triangle 3-4-5, décision recalculée) et `only` exige une seule option vraie.
// FIGURES : chaque figure DESSINÉE est relue dans son fichier : les longueurs de l'énoncé à UNE échelle, chaque angle droit
// marqué, chaque angle marqué en degrés (à 0,5° près) ou par un nom (son rapport à 1e-9), les points d'un cercle, les
// alignements, et aucune longueur écrite sur la figure hors de celles que l'énoncé donne (la valeur demandée n'y est pas).
// Banc généré par le script Python de l'auteur (fractions.Fraction) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

/* ── Radicaux exacts ─────────────────────────────────────────────────── */
const ZERO = q(0);
function splitSquare(n) { // n = k² · r, r sans facteur carré (BigInt)
  let k = 1n; let r = n;
  for (let p = 2n; p * p <= r; p += 1n) { while (r % (p * p) === 0n) { r /= p * p; k *= p; } }
  return [k, r];
}
class S {
  constructor(terms = new Map()) { this.t = new Map([...terms].filter(([, c]) => !c.isZero())); }
  static rat(v) { return new S(new Map([[1n, q(v)]])); }
  static sqrt(v) {
    const x = q(v);
    if (x.n < 0n) throw new Error('racine d’un négatif');
    const [k, r] = splitSquare(x.n * x.d); // √(n/d) = √(n·d) / d
    return new S(new Map([[r, q(`${k}/${x.d}`)]]));
  }
  add(o) { o = o instanceof S ? o : S.rat(o); const m = new Map(this.t); for (const [r, c] of o.t) m.set(r, (m.get(r) ?? ZERO).add(c)); return new S(m); }
  neg() { return new S(new Map([...this.t].map(([r, c]) => [r, c.neg()]))); }
  sub(o) { return this.add((o instanceof S ? o : S.rat(o)).neg()); }
  mul(o) {
    o = o instanceof S ? o : S.rat(o);
    let out = new S();
    for (const [r1, c1] of this.t) for (const [r2, c2] of o.t) {
      const [k, r] = splitSquare(r1 * r2);
      out = out.add(new S(new Map([[r, c1.mul(c2).mul(k)]])));
    }
    return out;
  }
  div(o) {
    o = o instanceof S ? o : S.rat(o);
    if (o.t.size !== 1) throw new Error('diviseur à plusieurs termes');
    const [[r, c]] = [...o.t];
    return this.mul(new S(new Map([[r, q(1).div(c.mul(r))]]))); // 1/(c√r) = √r / (c·r)
  }
  sq() { return this.mul(this); }
  eq(o) { return this.sub(o).t.size === 0; }
  isRat() { return [...this.t.keys()].every((r) => r === 1n); }
  toQ() { if (!this.isRat()) throw new Error('valeur non rationnelle'); return this.t.get(1n) ?? ZERO; }
  /** Le signe exact de a + b√r (au plus un radical). */
  sign() {
    const a = this.t.get(1n) ?? ZERO;
    const rad = [...this.t].filter(([r]) => r !== 1n);
    if (rad.length > 1) throw new Error('signe : plus d’un radical');
    if (!rad.length) return a.n === 0n ? 0 : (a.n > 0n ? 1 : -1);
    const [[r, b]] = rad;
    const sa = a.n === 0n ? 0 : (a.n > 0n ? 1 : -1); const sb = b.n > 0n ? 1 : -1;
    if (sa === 0 || sa === sb) return sb;
    const A2 = a.mul(a); const B2 = b.mul(b).mul(r); const d = B2.sub(A2); // |b√r| vs |a|
    return d.n === 0n ? 0 : (d.n > 0n ? sb : sa);
  }
  float() { let s = 0; for (const [r, c] of this.t) s += (Number(c.n) / Number(c.d)) * Math.sqrt(Number(r)); return s; }
}
const sq = (v) => S.sqrt(v);
const rat = (v) => S.rat(v);
/** L'autre rapport par cos² + sin² = 1 (angle aigu : la racine positive). */
const rel = (v) => sq(q(1).sub((v instanceof S ? v : rat(v)).sq().toQ()));
/** « √a / b » : a = (s·b)², vérifié exactement. */
function aOver(s, b) {
  const t = s.mul(b); const a = t.sq().toQ();
  if (!sq(a).eq(t)) throw new Error(`aOver : ${t.float()} n’est pas √a`);
  return a;
}
/** L'arrondi au plus proche à d décimales d'une valeur exacte, prouvé par deux comparaisons exactes. */
function roundS(s, d) {
  const k = 10 ** d; const x = s.mul(k);
  let n = Math.round(x.float());
  for (const c of [n, n - 1, n + 1]) {
    if (x.sub(q(c).sub('1/2')).sign() >= 0 && x.sub(q(c).add('1/2')).sign() < 0) { n = c; break; }
    if (c === n + 1) throw new Error('roundS : arrondi non prouvé');
  }
  return q(`${n}/${k}`);
}
const only = (flags, what) => {
  const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`alaqat-muthallathiya ${what} : ${hits.length} options vraies`);
  return C('ABCDE'[hits[0]]);
};
const pickEq = (truth, options, what) => only(options.map((o) => o.eq(truth)), what);
const yes = (b) => C(b ? 'A' : 'B');
const RS = (s) => R(s.toQ());

/* ── Calculatrice (angles) ───────────────────────────────────────────── */
const D = Math.PI / 180;
const asin = (v) => Math.asin(v) / D;
const acos = (v) => Math.acos(v) / D;
const atan = (v) => Math.atan(v) / D;
const rnd = (x, d) => {
  const s = Number(x.toPrecision(10)); const k = 10 ** d;
  return (Math.round(s * k + 1e-9 * Math.sign(s)) / k).toFixed(d);
};

/* ── Valeurs exactes connues (pour tester une identité en exact) ─────── */
const ANGLES = [
  { c: sq('3/4'), s: rat('1/2') },   // 30°
  { c: sq('1/2'), s: sq('1/2') },    // 45°
  { c: rat('1/2'), s: sq('3/4') },   // 60°
  { c: rat('4/5'), s: rat('3/5') },  // triangle 3-4-5
];
const identity = (f) => ANGLES.every(({ c, s }) => f(c, s));

/* ── Un triangle rectangle « des deux côtés de l'angle droit » : le rapport d'un angle aigu ── */
/** legs [opp, adj] d'un angle : rend { sin, cos, tan } exacts. */
function ratios(opp, adj) {
  const o = rat(opp); const a = rat(adj); const h = sq(o.sq().add(a.sq()).toQ());
  return { sin: o.div(h), cos: a.div(h), tan: o.div(a), hyp: h };
}

// Les nombres qui reviennent (recalculés depuis les énoncés).
const L2_002_cos = rel('0.4');
const L3_002 = ratios(7, 3);              // x = NPM : opposé NM = 7, adjacent NP = 3
const L4_006 = ratios(3, 8);              // le triangle de سارة
const L4_010_sin = rel('1/4');

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-alaqat-muthallathiya-l1-001:q1': only([
    identity((c, s) => c.sq().eq(s.sq().sub(1))),
    identity((c, s) => c.sq().eq(rat(1).sub(s.sq()))),
    identity((c, s) => c.eq(rat(1).sub(s))),
  ], 'l1-001'),
  'ex-4am-alaqat-muthallathiya-l1-001:q2': RS(rat(1).sub(rat('2/3').sq())),
  'ex-4am-alaqat-muthallathiya-l1-002:q1': R(q('0.87').mul('0.87').add(q('0.50').mul('0.50'))),
  'ex-4am-alaqat-muthallathiya-l1-002:q2': RS(sq(3).div(2).sq().add(rat('1/2').sq())),
  'ex-4am-alaqat-muthallathiya-l1-003:q1': RS(rat('1/2').sq()),
  'ex-4am-alaqat-muthallathiya-l1-003:q2': RS(rat(1).sub(rat('1/2').sq())),
  'ex-4am-alaqat-muthallathiya-l1-004:q1': R(q('0.6').div('0.8')),
  'ex-4am-alaqat-muthallathiya-l1-005:q1': RS(rat('12/13').sq()),
  'ex-4am-alaqat-muthallathiya-l1-005:q2': RS(rat('5/13').sq()),
  // OA = 4 sur un côté de l'angle droit ; sin x = 4/9 = OA / AB : le rayon AB
  'ex-4am-alaqat-muthallathiya-l1-006:q1': R(q(4).div('4/9')),
  'ex-4am-alaqat-muthallathiya-l1-006:q2': (() => {
    const OA = rat(4); const AB = rat(9); const OB = sq(81 - 16);
    return pickEq(rat('4/9'), [OA.div(AB) /* sin OBA */, OB.div(AB) /* sin OAB */, rat(1) /* AOB droit */], 'l1-006');
  })(),
  'ex-4am-alaqat-muthallathiya-l1-007:q1': R(q(3).div('3/4')),
  'ex-4am-alaqat-muthallathiya-l1-007:q2': RS(ratios(3, 4).sin),
  // 0 < cos < 1 : (√7/2)² = 7/4 > 1 ; tan n'est pas borné
  'ex-4am-alaqat-muthallathiya-l1-008:q1': yes(sq(7).div(2).sq().toQ().sub(1).n < 0n),
  'ex-4am-alaqat-muthallathiya-l1-008:q2': yes(sq(7).div(2).sign() > 0),
  'ex-4am-alaqat-muthallathiya-l1-009:q1': R(q(8).div(17)),
  'ex-4am-alaqat-muthallathiya-l1-009:q2': R(q(15).div(17)),
  'ex-4am-alaqat-muthallathiya-l1-009:q3': R(q(8).div(17).div(q(15).div(17))),
  'ex-4am-alaqat-muthallathiya-l1-010:q1': RS(sq(3).div(2).sq()),
  'ex-4am-alaqat-muthallathiya-l1-010:q2': RS(rel(sq(3).div(2))),
  // ── المستوى 2 ──
  'ex-4am-alaqat-muthallathiya-l2-001:q1': RS(rel('0.6')),
  'ex-4am-alaqat-muthallathiya-l2-001:q2': RS(rel('0.6').div('0.6')),
  'ex-4am-alaqat-muthallathiya-l2-001:q3': R(roundS(rel('0.6').div('0.6'), 2)),
  'ex-4am-alaqat-muthallathiya-l2-002:q1': pickEq(L2_002_cos, [sq(21).div(5), rat('0.6'), rat('0.84'), sq(21).div(25)], 'l2-002'),
  'ex-4am-alaqat-muthallathiya-l2-002:q2': R(roundS(L2_002_cos, 2)),
  'ex-4am-alaqat-muthallathiya-l2-002:q3': R(roundS(rat('0.4').div(L2_002_cos), 2)),
  'ex-4am-alaqat-muthallathiya-l2-003:q1': R(q(16).div('8/17')),
  'ex-4am-alaqat-muthallathiya-l2-003:q2': RS(rel('8/17')),
  'ex-4am-alaqat-muthallathiya-l2-003:q3': RS(rat(16).div('8/17').mul(rel('8/17'))),
  'ex-4am-alaqat-muthallathiya-l2-004:q1': pickEq(rel(sq(2).div(2)), [rat('1/2'), sq(2).div(2), rat(1).sub(sq(2).div(2))], 'l2-004'),
  'ex-4am-alaqat-muthallathiya-l2-004:q2': RS(rel(sq(2).div(2)).div(sq(2).div(2))),
  'ex-4am-alaqat-muthallathiya-l2-005:q1': RS(rel(sq(3).div(2))),
  'ex-4am-alaqat-muthallathiya-l2-005:q2': R(roundS(sq(3).div(2).div(rel(sq(3).div(2))), 2)),
  'ex-4am-alaqat-muthallathiya-l2-006:q1': R(q('8/15').mul('15/17')),
  'ex-4am-alaqat-muthallathiya-l2-006:q2': R(q('7.5').mul('8/15')),
  'ex-4am-alaqat-muthallathiya-l2-006:q3': R(q('7.5').div('15/17')),
  'ex-4am-alaqat-muthallathiya-l2-007:q1': RS(rel('5/13')),
  'ex-4am-alaqat-muthallathiya-l2-007:q2': RS(rat('5/13').div(rel('5/13'))),
  'ex-4am-alaqat-muthallathiya-l2-008:q1': pickEq(sq(3).div(2).div(rat('1/2')), [sq(3).div(3), sq(3), sq(3).div(4), rat('1.73')], 'l2-008'),
  // OA = 2, AB = 3, OB = √5 : cos de chaque angle
  'ex-4am-alaqat-muthallathiya-l2-009:q1': pickEq(rat('2/3'), [rat(2).div(3) /* cos OAB */, sq(5).div(3) /* cos OBA */, rat(0) /* AOB */], 'l2-009'),
  'ex-4am-alaqat-muthallathiya-l2-009:q2': R(aOver(rel('2/3'), 3)),
  'ex-4am-alaqat-muthallathiya-l2-010:q2': RS(sq(2).mul(6).mul(rel('1/3'))),
  // tan x = (1/3) / (2√2/3) = √2 / a  ⇒  a = √2 / tan x, entier
  'ex-4am-alaqat-muthallathiya-l2-010:q3': (() => {
    const a = sq(2).div(rat('1/3').div(rel('1/3')));
    if (!a.isRat()) throw new Error('l2-010 q3 : a non rationnel');
    return R(a.toQ());
  })(),
  // ── المستوى 3 ──
  'ex-4am-alaqat-muthallathiya-l3-001:q2': R(aOver(rel('2/5'), 5)),
  'ex-4am-alaqat-muthallathiya-l3-001:q3': R(rnd(asin(2 / 5), 1)),
  'ex-4am-alaqat-muthallathiya-l3-002:q2': R(L3_002.hyp.sq().toQ()),
  'ex-4am-alaqat-muthallathiya-l3-002:q3': pickEq(L3_002.sin, [rat(3).div(sq(58)), rat(7).div(sq(58)), sq(58).div(7), rat('7/3')], 'l3-002'),
  'ex-4am-alaqat-muthallathiya-l3-002:q4': R(rnd(atan(7 / 3), 1)),
  'ex-4am-alaqat-muthallathiya-l3-003:q2': R(rnd(asin(3 / 5), 1)),
  'ex-4am-alaqat-muthallathiya-l3-003:q3': RS(rel('3/5')),
  'ex-4am-alaqat-muthallathiya-l3-003:q4': RS(rat('3/5').div(rel('3/5'))),
  'ex-4am-alaqat-muthallathiya-l3-004:q2': pickEq(rel('3/4'), [sq(7).div(4), rat('1/4'), rat('7/16'), sq(7).div(16)], 'l3-004'),
  'ex-4am-alaqat-muthallathiya-l3-004:q3': R(rnd(acos(3 / 4), 1)),
  // triangle équilatéral de côté 1 : BH = 1/2, cos 60 = BH / AB
  'ex-4am-alaqat-muthallathiya-l3-005:q2': pickEq(rel(rat('1/2').div(1)), [rat('1/2'), rat('3/4'), sq(3).div(2), sq(3).div(4)], 'l3-005 q2'),
  'ex-4am-alaqat-muthallathiya-l3-005:q3': pickEq(rel('1/2').div(rat('1/2')), [sq(3), sq(3).div(3), sq(3).div(4)], 'l3-005 q3'),
  'ex-4am-alaqat-muthallathiya-l3-005:q4': R(q(180).sub(90).sub(60)),
  'ex-4am-alaqat-muthallathiya-l3-005:q5': R(q('1/2').div(1)),
  // carré de côté 1 : AC = √2
  'ex-4am-alaqat-muthallathiya-l3-006:q2': pickEq(rat(1).div(sq(2)), [sq(2), sq(2).div(2), rat('1/2'), rat('0.71')], 'l3-006'),
  'ex-4am-alaqat-muthallathiya-l3-006:q3': R(aOver(rat(1).div(sq(2)), 2)),
  'ex-4am-alaqat-muthallathiya-l3-006:q4': R(q(1).div(1)),
  'ex-4am-alaqat-muthallathiya-l3-007:q2': R(rel(sq(3).div(3)).div(sq(3).div(3)).sq().toQ()),
  'ex-4am-alaqat-muthallathiya-l3-007:q3': RS(rel(sq(3).div(3)).sq().mul(3).add(rel(sq(3).div(3)).div(sq(3).div(3)).sq())),
  'ex-4am-alaqat-muthallathiya-l3-008:q1': R(aOver(rel('2/3'), 3)),
  'ex-4am-alaqat-muthallathiya-l3-008:q2': RS(rat('2/3').div(rel('2/3')).mul(5).div(sq(5))),
  'ex-4am-alaqat-muthallathiya-l3-008:q3': RS(rat('2/3').div(rel('2/3')).sq().mul(5).add(rel('2/3').sq().mul(9))),
  'ex-4am-alaqat-muthallathiya-l3-009:q1': R(aOver(sq(12).div(4), 2)), // EF = 2√3 = √12
  'ex-4am-alaqat-muthallathiya-l3-009:q2': RS(rel(sq(12).div(4))),
  'ex-4am-alaqat-muthallathiya-l3-009:q3': RS(rel(sq(12).div(4)).mul(4)),
  'ex-4am-alaqat-muthallathiya-l3-009:q4': R(rnd(asin(rel(sq(12).div(4)).float()), 0)),
  'ex-4am-alaqat-muthallathiya-l3-010:q2': RS(rel('3/5')),
  'ex-4am-alaqat-muthallathiya-l3-010:q3': R(q(10).mul('3/5')),
  'ex-4am-alaqat-muthallathiya-l3-010:q4': RS(rel('3/5').mul(10)),
  // ── المستوى 4 ──
  'ex-4am-alaqat-muthallathiya-l4-001:q1': R(aOver(rel('0.4'), 5)),
  'ex-4am-alaqat-muthallathiya-l4-001:q2': R(aOver(rel('0.4').div('0.4'), 2)),
  'ex-4am-alaqat-muthallathiya-l4-001:q3': yes(q('3/2').sub(1).n < 0n),
  'ex-4am-alaqat-muthallathiya-l4-001:q4': yes(sq(5).div(2).sq().toQ().sub(1).n < 0n),
  'ex-4am-alaqat-muthallathiya-l4-002:q1': R(q(15).div(25)),
  'ex-4am-alaqat-muthallathiya-l4-002:q2': RS(rel('15/25')),
  'ex-4am-alaqat-muthallathiya-l4-002:q3': R(q(15).mul('15/25')),
  'ex-4am-alaqat-muthallathiya-l4-002:q4': RS(rel('15/25').mul(15)),
  'ex-4am-alaqat-muthallathiya-l4-003:q1': RS(sq(5).div(5).mul(2).mul(5).div(sq(5))),
  'ex-4am-alaqat-muthallathiya-l4-003:q3': (() => {
    const c = sq(5).div(5); const s = c.mul(2);
    return RS(c.add(s).sq().sub(s.mul(c).mul(2)));
  })(),
  'ex-4am-alaqat-muthallathiya-l4-004:q1': R(q('0.18')),
  'ex-4am-alaqat-muthallathiya-l4-004:q3': R(rnd(acos(0.18), 0)),
  'ex-4am-alaqat-muthallathiya-l4-004:q4': R(roundS(rel('0.18'), 2)),
  'ex-4am-alaqat-muthallathiya-l4-005:q1': R(q('5.4')),
  'ex-4am-alaqat-muthallathiya-l4-005:q3': R(rnd(atan(5.4), 1)),
  'ex-4am-alaqat-muthallathiya-l4-005:q4': R(roundS(ratios('5.4', 1).cos, 2)),
  'ex-4am-alaqat-muthallathiya-l4-006:q1': pickEq(rat('3/8'), [L4_006.sin, L4_006.tan, L4_006.cos], 'l4-006'),
  'ex-4am-alaqat-muthallathiya-l4-006:q2': R(rnd(atan(3 / 8), 1)),
  'ex-4am-alaqat-muthallathiya-l4-006:q3': R(rnd(asin(3 / 8), 1)),
  'ex-4am-alaqat-muthallathiya-l4-006:q4': R(aOver(rel('3/8'), 8)),
  'ex-4am-alaqat-muthallathiya-l4-007:q1': RS(rel('0.96')),
  'ex-4am-alaqat-muthallathiya-l4-007:q2': RS(rel('0.96').div('0.96')),
  'ex-4am-alaqat-muthallathiya-l4-007:q3': R(rnd(acos(0.96), 0)),
  'ex-4am-alaqat-muthallathiya-l4-008:q1': R(roundS(rat('1/2').add(sq(3).div(2)), 2)),
  // يونس : « cos x + sin x = 1 pour tout x » — faux dès 60° (contre-exemple exact)
  'ex-4am-alaqat-muthallathiya-l4-008:q2': yes(identity((c, s) => c.add(s).eq(rat(1)))),
  'ex-4am-alaqat-muthallathiya-l4-008:q4': RS(rel('0.8')),
  // sin = cos ⇒ 2 cos² = 1
  'ex-4am-alaqat-muthallathiya-l4-009:q1': R(q(1)),
  'ex-4am-alaqat-muthallathiya-l4-009:q3': pickEq(sq('1/2'), [rat('1/2'), sq(2).div(2), rat('0.71'), sq(2)], 'l4-009'),
  'ex-4am-alaqat-muthallathiya-l4-009:q4': R(rnd(atan(1), 0)),
  'ex-4am-alaqat-muthallathiya-l4-010:q1': R(aOver(L4_010_sin, 4)),
  'ex-4am-alaqat-muthallathiya-l4-010:q2': pickEq(L4_010_sin.div('1/4'), [sq(15).div(16), rat(1).div(sq(15)), sq(15), sq(15).div(4)], 'l4-010'),
  'ex-4am-alaqat-muthallathiya-l4-010:q3': RS(L4_010_sin.div('1/4').sq().add(1)),
};

/* ── Niveau 5 : les situations (rapport donné → l'autre par la relation → tan → longueurs → décision) ── */
function situation(id, given, v, extra) {
  const g = rat(v); const o = rel(v);
  const s = given === 'sin' ? g : o; const c = given === 'sin' ? o : g; const t = s.div(c);
  ORACLE[`${id}:q1`] = RS(o);
  ORACLE[`${id}:q2`] = RS(t);
  Object.assign(ORACLE, Object.fromEntries(Object.entries(extra({ s, c, t })).map(([k, val]) => [`${id}:${k}`, val])));
}
const L5 = (n) => `ex-4am-alaqat-muthallathiya-l5-${String(n).padStart(3, '0')}`;
// 001 — طائرة مسيّرة : AH = 240, plafond 120 m
situation(L5(1), 'sin', '8/17', ({ c, t }) => {
  const DH = t.mul(240); const AHmax = rat(120).div(t);
  return { q3: RS(DH), q4: yes(DH.sub(120).sign() <= 0), q5: RS(AHmax), q6: RS(AHmax.div(c)) };
});
// 002 — منحدر التزلج : SB = 450 ; انخفاض بين 120 و 150 ، p ≤ 30
situation(L5(2), 'sin', '7/25', ({ s, c, t }) => {
  const SH = s.mul(450); const p = t.mul(100);
  return { q3: RS(SH), q4: RS(c.mul(450)), q5: R(roundS(p, 1)),
    q6: yes(SH.sub(120).sign() >= 0 && SH.sub(150).sign() <= 0 && p.sub(30).sign() <= 0) };
});
// 003 — برج المراقبة : TH = 36, l'angle y en T (TH adjacent) ; seuil 150 m
situation(L5(3), 'cos', '9/41', ({ c, t }) => {
  const HF = t.mul(36);
  return { q3: RS(HF), q4: RS(rat(36).div(c)), q5: C(HF.sub(150).sign() < 0 ? 'A' : 'B') };
});
// 004 — القارب : AB = 90 (adjacent) ; ponton 40 m ; 1,5 m/s
situation(L5(4), 'cos', '12/13', ({ c, t }) => {
  const BC = t.mul(90); const AC = rat(90).div(c);
  return { q3: RS(BC), q4: yes(BC.sub(40).sign() <= 0), q5: RS(AC), q6: RS(AC.div('1.5')) };
});
// 005 — الشاحنة : AB = 6,5 ; axe à 1,2 m ; plafond 5 m ; puis cos y = 12/13
situation(L5(5), 'cos', '4/5', ({ s }) => {
  const hB = s.mul('6.5').add('1.2'); const sy = rel('12/13');
  return { q3: RS(hB), q4: yes(hB.sub(5).sign() <= 0), q5: RS(sy), q6: RS(sy.mul('6.5').add('1.2')) };
});
// 006 — العارضة : AB = 3,5 ; bande 2,5–3 m ; la plus longue au même angle
situation(L5(6), 'sin', '0.8', ({ s, c }) => {
  const HB = s.mul('3.5'); const L = rat(3).div(s);
  return { q3: RS(HB), q4: RS(c.mul('3.5')), q5: yes(HB.sub('2.5').sign() >= 0 && HB.sub(3).sign() <= 0), q6: RS(L), q7: RS(L.mul(c)) };
});
// 007 — مسلك جرجرة : AB = 1640 ; carte 1/25000 ; 300 m/h ; départ 15 h 45, avant 17 h
situation(L5(7), 'sin', '9/41', ({ s, c }) => {
  const BH = s.mul(1640); const AH = c.mul(1640); const minutes = BH.div(300).mul(60);
  return { q3: RS(BH), q4: RS(AH), q5: RS(AH.mul(100).div(25000)), q6: RS(minutes), q7: yes(minutes.add(15 * 60 + 45).sub(17 * 60).sign() < 0) };
});
// 008 — الصاروخ : AR = 58 ; arbre de 20 m à 20 m
situation(L5(8), 'cos', '20/29', ({ s, c, t }) => {
  const h = t.mul(20);
  return { q3: RS(s.mul(58)), q4: RS(c.mul(58)), q5: RS(h), q6: yes(h.sub(20).sign() > 0) };
});
// 009 — الأنبوب : TH = 120 (adjacent) ; tubes de 6 m à 2750 DA
situation(L5(9), 'cos', '15/17', ({ c, t }) => {
  const ST = rat(120).div(c).toQ(); const pieces = (ST.n + 6n * ST.d - 1n) / (6n * ST.d); // ⌈ST / 6⌉
  return { q3: RS(t.mul(120)), q4: R(ST), q5: R(pieces), q6: R(q(pieces).mul(2750)) };
});
// 010 — المنطاد : AM = 65 ; ≥ 55 m ; puis cos y = 3/5 et retour à 60 m
situation(L5(10), 'cos', '5/13', ({ s }) => {
  const MH = s.mul(65); const sy = rel('3/5'); const L = rat(60).div(sy);
  return { q3: RS(MH), q4: yes(MH.sub(55).sign() >= 0), q5: RS(sy), q6: RS(sy.mul(65)), q7: RS(L), q8: RS(L.sub(65)) };
});

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur de l'énoncé] (une échelle), `angles` [from, at, to, degrés],
 * `named` [from, at, to, 'sin'|'cos'|'tan', valeur] (un angle marqué d'un nom : son rapport), `onCircle` [centre, P, rayon],
 * `aligned` [P, Q, R], `shown` : les seules étiquettes de longueur permises sur la figure (les données de l'énoncé).
 */
export const FIGURES = {
  'ex-4am-alaqat-muthallathiya-l1-009': { lengths: [['A', 'B', 15], ['A', 'C', 8], ['B', 'C', 17]], named: [['A', 'B', 'C', 'sin', 8 / 17]], shown: ['15', '8', '17'] },
  'ex-4am-alaqat-muthallathiya-l2-009': { lengths: [['O', 'A', 2], ['A', 'B', 3], ['O', 'B', Math.sqrt(5)]], shown: ['2 cm', '3 cm'] },
  'ex-4am-alaqat-muthallathiya-l3-005': { lengths: [['A', 'B', 1], ['A', 'C', 1], ['B', 'C', 1], ['B', 'H', 0.5]], angles: [['C', 'B', 'A', 60]], aligned: [['B', 'H', 'C']], shown: ['1'] },
  'ex-4am-alaqat-muthallathiya-l3-006': { lengths: [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['D', 'A', 1], ['A', 'C', Math.SQRT2]], angles: [['B', 'A', 'C', 45]], shown: ['1'] },
  'ex-4am-alaqat-muthallathiya-l3-010': { lengths: [['A', 'B', 10], ['A', 'C', 6], ['B', 'C', 8]], onCircle: [['O', 'A', 5], ['O', 'B', 5], ['O', 'C', 5]], named: [['A', 'B', 'C', 'sin', 3 / 5]], circleRadius: { O: 5 }, shown: ['10 cm'] },
  'ex-4am-alaqat-muthallathiya-l4-002': { lengths: [['A', 'B', 15], ['B', 'C', 25], ['A', 'C', 20], ['A', 'H', 12], ['B', 'H', 9]], aligned: [['B', 'H', 'C']], named: [['C', 'B', 'A', 'cos', 3 / 5]], shown: ['15', '25'] },
  'ex-4am-alaqat-muthallathiya-l5-001': { lengths: [['A', 'H', 240], ['D', 'H', 128], ['A', 'D', 272]], named: [['H', 'A', 'D', 'sin', 8 / 17]], shown: ['240 m'] },
  'ex-4am-alaqat-muthallathiya-l5-004': { lengths: [['A', 'B', 90], ['B', 'C', 37.5], ['A', 'C', 97.5]], named: [['B', 'A', 'C', 'cos', 12 / 13]], aligned: [['R', 'B', 'S'], ['R', 'C', 'S'], ['P', 'A', 'Q']], shown: ['90 m'] },
  'ex-4am-alaqat-muthallathiya-l5-005': { lengths: [['A', 'B', 6.5], ['B', 'H', 3.9], ['A', 'H', 5.2]], named: [['H', 'A', 'B', 'cos', 4 / 5]], shown: ['6,5 m'] },
  'ex-4am-alaqat-muthallathiya-l5-006': { lengths: [['A', 'B', 3.5], ['H', 'B', 2.8], ['A', 'H', 2.1]], named: [['H', 'A', 'B', 'sin', 0.8]], shown: ['3,5 m'] },
  'ex-4am-alaqat-muthallathiya-l5-008': { lengths: [['A', 'R', 58], ['R', 'H', 42], ['A', 'H', 40]], named: [['H', 'A', 'R', 'cos', 20 / 29]], shown: ['58 m'] },
  'ex-4am-alaqat-muthallathiya-l5-009': { lengths: [['T', 'H', 120], ['S', 'H', 64], ['S', 'T', 136]], named: [['H', 'T', 'S', 'cos', 15 / 17]], shown: ['120 m'] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/alaqat-muthallathiya');
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-alaqat-muthallathiya-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) { if (FIGURES[id]) problems.push(`${id}: contrôle sans figure`); continue; }
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const d = (a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
    const angle = (a, v, b) => {
      const u = [Pt[a][0] - Pt[v][0], Pt[a][1] - Pt[v][1]]; const w = [Pt[b][0] - Pt[v][0], Pt[b][1] - Pt[v][1]];
      return Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w))) / D;
    };
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(a, b) / Number(v));
    if (!scales.length) problems.push(`${id}: aucune longueur contrôlée`);
    if (scales.some((s) => Math.abs(s / scales[0] - 1) > 1e-6)) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, v, b, deg] of spec.angles ?? []) {
      if (Math.abs(angle(a, v, b) - deg) > 0.5) problems.push(`${id}: angle ${a}${v}${b} = ${angle(a, v, b)}° ≠ ${deg}°`);
    }
    for (const [a, v, b, f, val] of spec.named ?? []) {
      const m = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[f](angle(a, v, b) * D);
      if (Math.abs(m - val) > 1e-6) problems.push(`${id}: ${f} ${a}${v}${b} = ${m} ≠ ${val}`);
    }
    for (const [o, p, r] of spec.onCircle ?? []) {
      if (Math.abs(d(o, p) / scales[0] - r) > 1e-6 * r) problems.push(`${id}: ${p} hors du cercle (${o}, ${r})`);
    }
    for (const c of fig.circles ?? []) {
      if (c.radius != null && Math.abs(c.radius / scales[0] - spec.circleRadius?.[c.center]) > 1e-6) problems.push(`${id}: rayon du cercle (${c.center}) faux`);
    }
    for (const [a, b, c] of spec.aligned ?? []) {
      const cross = (Pt[b][0] - Pt[a][0]) * (Pt[c][1] - Pt[a][1]) - (Pt[b][1] - Pt[a][1]) * (Pt[c][0] - Pt[a][0]);
      if (Math.abs(cross) > 1e-6 * d(a, c) ** 2) problems.push(`${id}: ${a}, ${b}, ${c} non alignés`);
    }
    for (const [a, v, b] of fig.rightAngles ?? []) {
      if (Math.abs(angle(a, v, b) - 90) > 0.01) problems.push(`${id}: angle droit ${a}${v}${b} faux`);
    }
    for (const a of fig.angles ?? []) {
      const deg = /^(\d+)°$/.exec(a.label ?? '');
      const ok = deg
        ? (spec.angles ?? []).some(([f, v, t, g]) => v === a.at && g === Number(deg[1]) && [f, t].sort().join() === [a.from, a.to].sort().join())
        : !a.label || (spec.named ?? []).some(([f, v, t]) => v === a.at && [f, t].sort().join() === [a.from, a.to].sort().join());
      if (!ok && (deg || a.label)) problems.push(`${id}: l'angle marqué ${a.label} en ${a.at} n'est pas contrôlé`);
      if (!a.label && !(spec.named ?? []).some(([f, v, t]) => v === a.at && [f, t].sort().join() === [a.from, a.to].sort().join())) {
        problems.push(`${id}: l'angle marqué en ${a.at} n'est pas contrôlé`);
      }
    }
    for (const s of fig.segments ?? []) {
      const label = Array.isArray(s) ? null : s.label;
      if (label != null && !(spec.shown ?? []).includes(label)) problems.push(`${id}: étiquette « ${label} » non donnée par l'énoncé`);
    }
  }
}
if (problems.length) throw new Error(`oracle alaqat-muthallathiya — figures inexactes :\n${problems.join('\n')}`);

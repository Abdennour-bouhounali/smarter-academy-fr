// Oracle du banc « jidhr-tarbii » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outils exacts (aucun Math.sqrt) :
//   rt(v)              √v exacte d'un rationnel carré parfait (lève une erreur sinon) — « l'unique x ≥ 0 tel que x² = v »
//   sq(v)              v² exact
//   approx(a, n, b, k) valeur approchée PAR DÉFAUT à 10⁻ᵏ de a√n + b (a entier > 0, b entier), par racine entière BigInt
//   excess(...)        valeur approchée PAR EXCÈS (défaut + 10⁻ᵏ, la racine n'étant pas décimale)
//   S(p, c, n)         le réel p + c√n ; abs() = √((p + c√n)²) décide le signe exactement (p² comparé à c²n)
import { R, C, q } from './helpers.mjs';

const isqrt = (N) => {
  if (N < 0n) throw new Error('isqrt: négatif');
  if (N < 2n) return N;
  let x = N; let y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + N / x) / 2n; }
  return x;
};
/** √v exacte : v rationnel ≥ 0 dont numérateur et dénominateur réduits sont des carrés parfaits. */
const rt = (v) => {
  const Q = q(v);
  if (Q.n < 0n) throw new Error(`rt: ${Q} négatif — √ n'existe pas`);
  const a = isqrt(Q.n); const b = isqrt(Q.d);
  if (a * a !== Q.n || b * b !== Q.d) throw new Error(`rt: ${Q} n'est pas un carré parfait`);
  return q(`${a}/${b}`);
};
const sq = (v) => q(v).mul(q(v));
/** Valeur approchée par défaut à 10⁻ᵏ de a√n + b (a entier > 0, n entier, b entier). */
const approx = (a, n, b, k) => {
  const P = 10n ** BigInt(k);
  const f = isqrt(BigInt(a) * BigInt(a) * BigInt(n) * P * P) + BigInt(b) * P;
  return q(`${f}/${P}`);
};
/** Par excès : a√n n'étant pas décimal, l'excès est le défaut + 10⁻ᵏ. */
const excess = (a, n, b, k) => {
  const A = BigInt(a) * BigInt(a) * BigInt(n);
  const r = isqrt(A);
  if (r * r === A) throw new Error('excess: racine exacte');
  return approx(a, n, b, k).add(q(`1/${10n ** BigInt(k)}`));
};
/** Le réel p + c√n (p, c rationnels). */
class S {
  constructor(p, c, n) { this.p = q(p); this.c = q(c); this.n = n; }
  sign() {
    const sp = this.p.n === 0n ? 0 : (this.p.n > 0n ? 1 : -1);
    const sc = this.c.n === 0n ? 0 : (this.c.n > 0n ? 1 : -1);
    if (sp >= 0 && sc >= 0) return sp + sc === 0 ? 0 : 1;
    if (sp <= 0 && sc <= 0) return -1;
    const d = sq(this.p).sub(sq(this.c).mul(this.n)); // p² − c²n : le signe du plus « gros » terme gagne
    const sd = d.n === 0n ? 0 : (d.n > 0n ? 1 : -1);
    return sd === 0 ? 0 : (sd > 0 ? sp : sc);
  }
  neg() { return new S(this.p.neg(), this.c.neg(), this.n); }
  /** √((p + c√n)²) = |p + c√n| */
  abs() { return this.sign() < 0 ? this.neg() : this; }
  add(o) { return new S(this.p.add(o.p), this.c.add(o.c), this.n); }
  /** (p + c√n)² = p² + c²n + 2pc√n */
  square() { return new S(sq(this.p).add(sq(this.c).mul(this.n)), this.p.mul(this.c).mul(2), this.n); }
  /** produit par p' + c'√n */
  mul(o) { return new S(this.p.mul(o.p).add(this.c.mul(o.c).mul(this.n)), this.p.mul(o.c).add(this.c.mul(o.p)), this.n); }
}
const PI_SIGN = (k) => (k < 314159n ? -1 : 1); // signe de k/100000 − π via 3,14159 < π < 3,14160
const signChoice = (s) => C(s < 0 ? 'B' : 'A'); // A موجب ، B سالب
const yes = C('A'); const no = C('B');

export const ORACLE = {
  /* ── Niveau 1 ── */
  'ex-4am-jidhr-tarbii-l1-001:q1': R(sq(13)),
  'ex-4am-jidhr-tarbii-l1-001:q2': R(sq(25)),
  'ex-4am-jidhr-tarbii-l1-001:q3': R(rt(25)),
  'ex-4am-jidhr-tarbii-l1-002:q1': R(rt(36)),
  'ex-4am-jidhr-tarbii-l1-002:q2': R(rt(81)),
  'ex-4am-jidhr-tarbii-l1-002:q3': R(rt('0.49')),
  'ex-4am-jidhr-tarbii-l1-003:q1': R(rt(49)),
  'ex-4am-jidhr-tarbii-l1-004:q1': R(rt(16).add(rt(9))),
  'ex-4am-jidhr-tarbii-l1-004:q2': R(rt(16 + 9)),
  'ex-4am-jidhr-tarbii-l1-005:q1': rt(sq(-4)).toString() === '-4' ? yes : no,     // √16 est le POSITIF de carré 16 : ce n'est pas −4
  'ex-4am-jidhr-tarbii-l1-005:q2': R(rt(16)),
  'ex-4am-jidhr-tarbii-l1-006:q1': R(rt(64)),
  'ex-4am-jidhr-tarbii-l1-006:q2': R(rt(121)),
  'ex-4am-jidhr-tarbii-l1-007:q1': R(19),                       // (√a)² = a
  'ex-4am-jidhr-tarbii-l1-007:q2': R(rt(sq(23))),
  'ex-4am-jidhr-tarbii-l1-008:q1': (() => { try { rt(-9); return yes; } catch { return no; } })(),
  'ex-4am-jidhr-tarbii-l1-008:q2': R(rt(-(-9))),
  'ex-4am-jidhr-tarbii-l1-009:q1': R(rt(1).add(rt(0).mul(rt(100))).add(rt(100))),
  'ex-4am-jidhr-tarbii-l1-010:q1': R(rt(81)),
  'ex-4am-jidhr-tarbii-l1-010:q2': R(rt(81).mul(4)),

  /* ── Niveau 2 ── */
  'ex-4am-jidhr-tarbii-l2-001:q1': R(rt(289)),
  'ex-4am-jidhr-tarbii-l2-001:q2': R(rt('1.44')),
  'ex-4am-jidhr-tarbii-l2-001:q3': R(rt('0.0001')),
  'ex-4am-jidhr-tarbii-l2-002:q1': R(rt('25/9')),
  'ex-4am-jidhr-tarbii-l2-002:q2': R(sq(rt('25/9'))),
  'ex-4am-jidhr-tarbii-l2-003:q1': R(rt('0.36')),
  'ex-4am-jidhr-tarbii-l2-003:q2': R(rt('0.0025')),
  'ex-4am-jidhr-tarbii-l2-003:q3': R(rt('0.36').sub(rt('0.0025'))),
  'ex-4am-jidhr-tarbii-l2-004:q1': R(rt('49/64')),
  'ex-4am-jidhr-tarbii-l2-004:q2': R(rt('1/100')),
  'ex-4am-jidhr-tarbii-l2-004:q3': R(rt('49/64').mul(rt('1/100'))),
  'ex-4am-jidhr-tarbii-l2-005:q1': R(rt(40000)),
  'ex-4am-jidhr-tarbii-l2-005:q2': R(rt((10n ** 12n).toString())),
  // E = x² − 5 : x = √7 puis x = −√5
  'ex-4am-jidhr-tarbii-l2-006:q1': R(new S(0, 1, 7).square().p.sub(5)),
  'ex-4am-jidhr-tarbii-l2-006:q2': R(new S(0, -1, 5).square().p.sub(5)),
  // A = 2x − 3, x = √3 ; puis x² + 1
  'ex-4am-jidhr-tarbii-l2-007:q1': R(approx(2, 3, -3, 2)),
  'ex-4am-jidhr-tarbii-l2-007:q2': R(new S(0, 1, 3).square().p.add(1)),
  'ex-4am-jidhr-tarbii-l2-008:q1': R(new S(0, 1, 11).square().p),
  'ex-4am-jidhr-tarbii-l2-009:q1': R(rt(576)),
  'ex-4am-jidhr-tarbii-l2-009:q2': R(rt(576).mul(4)),
  'ex-4am-jidhr-tarbii-l2-010:q1': R(new S(0, 1, 20).square().p),
  'ex-4am-jidhr-tarbii-l2-010:q2': R(new S(0, 1, 45).square().p),
  'ex-4am-jidhr-tarbii-l2-010:q3': R(new S(0, 1, 65).square().p),
  'ex-4am-jidhr-tarbii-l2-010:q4': q(20).add(45).toString() === q(65).toString() ? C('A') : C('D'), // BC² = AB² + AC² ⇒ قائم في A

  /* ── Niveau 3 ── */
  'ex-4am-jidhr-tarbii-l3-001:q1': R(sq(rt('100/49'))),                        // (√(100/49))² = 100/49
  'ex-4am-jidhr-tarbii-l3-001:q2': R(new S(0, -1, 17).square().p),
  'ex-4am-jidhr-tarbii-l3-001:q3': R(rt('100/49')),
  'ex-4am-jidhr-tarbii-l3-002:q1': R(rt(sq(-1))),
  'ex-4am-jidhr-tarbii-l3-002:q2': R(rt(-(-49))),
  'ex-4am-jidhr-tarbii-l3-002:q3': R(rt(sq(-12)).add(rt(sq(12)))),
  'ex-4am-jidhr-tarbii-l3-003:q1': R(sq('1.5')),
  'ex-4am-jidhr-tarbii-l3-003:q2': R(sq('2/5')),
  'ex-4am-jidhr-tarbii-l3-003:q3': R(rt(sq('1.5').mul(sq('2/5')))),
  'ex-4am-jidhr-tarbii-l3-004:q1': R(rt(sq(6).add(sq(8)))),
  'ex-4am-jidhr-tarbii-l3-004:q2': R(rt(sq(13).sub(sq(12)))),
  'ex-4am-jidhr-tarbii-l3-005:q1': R(q(5).add(rt(sq(-3)))),
  'ex-4am-jidhr-tarbii-l3-005:q2': R(q(2).mul(7).sub(rt(sq(4)))),
  // A = 4x − 5 : défaut 10⁻² en √2 et √5 ; valeur exacte en √(25/16)
  'ex-4am-jidhr-tarbii-l3-006:q1': R(approx(4, 2, -5, 2)),
  'ex-4am-jidhr-tarbii-l3-006:q2': R(approx(4, 5, -5, 2)),
  'ex-4am-jidhr-tarbii-l3-006:q3': R(q(4).mul(rt('25/16')).sub(5)),
  // E = x² − (11 − 3√2) en x = √11 : coefficient de √2
  'ex-4am-jidhr-tarbii-l3-007:q1': R(new S(new S(0, 1, 11).square().p.sub(11), 3, 2).c),
  'ex-4am-jidhr-tarbii-l3-008:q1': R(new S(0, 1, 52).square().p),
  'ex-4am-jidhr-tarbii-l3-008:q2': R(new S(0, 1, 13).square().p),
  'ex-4am-jidhr-tarbii-l3-008:q3': R(new S(0, 1, 65).square().p),
  'ex-4am-jidhr-tarbii-l3-009:q1': R(rt(49).add(q(3).mul(rt(16))).sub(rt(sq(-5)))),
  'ex-4am-jidhr-tarbii-l3-009:q2': R(q('5/6').add(q('7/4').mul('2/3'))),
  'ex-4am-jidhr-tarbii-l3-010:q1': R(q('10/7').mul(q('5/2').add(1))),
  'ex-4am-jidhr-tarbii-l3-010:q2': R(q(6).add(rt(sq(-8))).sub(rt(9))),
  'ex-4am-jidhr-tarbii-l3-010:q3': R(rt(q('10/7').mul(q('5/2').add(1)).add(q(6).add(rt(sq(-8))).sub(rt(9))))),

  /* ── Niveau 4 ── */
  'ex-4am-jidhr-tarbii-l4-001:q1': signChoice(PI_SIGN(300000n)),                 // 3 − π
  'ex-4am-jidhr-tarbii-l4-001:q2': signChoice(-PI_SIGN(500000n)),               // π − 5 = −(5 − π)
  'ex-4am-jidhr-tarbii-l4-001:q4': R(q(-3).add(5)),                             // |3 − π| + |π − 5| = (π − 3) + (5 − π) : π s'élimine
  'ex-4am-jidhr-tarbii-l4-002:q1': R(sq(1).add(sq(2))),
  'ex-4am-jidhr-tarbii-l4-002:q2': sq('2.236067978').toString() === '5' ? no : yes, // le carré n'est pas 5 : Imane a raison
  'ex-4am-jidhr-tarbii-l4-002:q3': R(approx(1, 5, 0, 2)),
  'ex-4am-jidhr-tarbii-l4-003:q1': R(sq(-7)),
  'ex-4am-jidhr-tarbii-l4-003:q2': rt(sq(-7)).toString() === '-7' ? yes : no,
  'ex-4am-jidhr-tarbii-l4-003:q3': R(rt(sq(-7)).add(rt(sq(7)))),
  // D = √((2 − √5)²) = |2 − √5|
  'ex-4am-jidhr-tarbii-l4-004:q2': R(new S(2, -1, 5).abs().p),
  'ex-4am-jidhr-tarbii-l4-004:q3': R(new S(2, -1, 5).abs().c),
  'ex-4am-jidhr-tarbii-l4-004:q4': (() => { const s = new S(4, -1, 10).abs().add(new S(0, 1, 10)); if (!s.c.isZero()) throw new Error('√10 subsiste'); return R(s.p); })(),
  'ex-4am-jidhr-tarbii-l4-005:q2': sq('0.7').toString() === q('4.9').toString() ? yes : no,
  'ex-4am-jidhr-tarbii-l4-005:q3': R(rt('0.49').mul(rt(100)).add(rt('0.01'))),
  // A = 5x − 8
  'ex-4am-jidhr-tarbii-l4-006:q1': R(approx(5, 3, -8, 2)),
  'ex-4am-jidhr-tarbii-l4-006:q2': R(excess(5, 3, -8, 2)),
  'ex-4am-jidhr-tarbii-l4-006:q3': R(q(5).mul(rt('2.56')).sub(8)),
  'ex-4am-jidhr-tarbii-l4-006:q4': R(q(5).mul(new S(0, 1, 2).square().p).sub(8)),
  // A = (3 − √2)² ; √A = |3 − √2|
  'ex-4am-jidhr-tarbii-l4-007:q1': R(new S(3, -1, 2).square().p),
  'ex-4am-jidhr-tarbii-l4-007:q2': R(new S(3, -1, 2).square().c),
  'ex-4am-jidhr-tarbii-l4-007:q3': R(new S(3, -1, 2).abs().p),
  'ex-4am-jidhr-tarbii-l4-007:q4': R(new S(3, -1, 2).abs().c),
  'ex-4am-jidhr-tarbii-l4-007:q5': (() => { const s = new S(3, -1, 2).abs().add(new S(0, 1, 2)); if (!s.c.isZero()) throw new Error('√2 subsiste'); return R(s.p); })(),
  // m = (√7)² − 3√((−2)²) + √25 ; n = |√7 − 3|
  'ex-4am-jidhr-tarbii-l4-008:q1': R(new S(0, 1, 7).square().p.sub(q(3).mul(rt(sq(-2)))).add(rt(25))),
  'ex-4am-jidhr-tarbii-l4-008:q2': R(new S(-3, 1, 7).abs().p),
  'ex-4am-jidhr-tarbii-l4-008:q3': R(new S(-3, 1, 7).abs().c),
  'ex-4am-jidhr-tarbii-l4-008:q4': (() => { const s = new S(-3, 1, 7).abs().mul(new S(3, 1, 7)); if (!s.c.isZero()) throw new Error('√7 subsiste'); return R(s.p); })(),
  'ex-4am-jidhr-tarbii-l4-009:q1': R(sq(5).add(sq(5))),
  'ex-4am-jidhr-tarbii-l4-009:q2': R(approx(1, 50, 0, 1)),
  'ex-4am-jidhr-tarbii-l4-009:q3': R(rt(new S(0, 1, 72).square().p.div(2))),
  'ex-4am-jidhr-tarbii-l4-010:q1': R(q(3).mul(new S(0, 1, 8).square().p).sub(rt(sq(-4)))),
  'ex-4am-jidhr-tarbii-l4-010:q2': R(rt('0.09').add('0.7')),
  'ex-4am-jidhr-tarbii-l4-010:q3': R(rt(q(3).mul(8).sub(rt(sq(-4))).mul(rt('0.09').add('0.7')).add(5))),

  /* ── Niveau 5 — الوضعيات الإدماجية ── */
  // carré 1225 m² ; diagonale √(2 × 1225) par défaut à l'unité ; clôture 4a − 3 ; coût × 450
  'ex-4am-jidhr-tarbii-l5-001:q1': R(rt(1225)),
  'ex-4am-jidhr-tarbii-l5-001:q2': R(approx(1, 2 * 1225, 0, 0)),
  'ex-4am-jidhr-tarbii-l5-001:q3': R(rt(1225).mul(4).sub(3)),
  'ex-4am-jidhr-tarbii-l5-001:q4': R(rt(1225).mul(4).sub(3).mul(450)),
  // diagonale √800 : AC² ; 2AB² = AC² ; AB ; prix × 1200
  'ex-4am-jidhr-tarbii-l5-002:q1': R(new S(0, 1, 800).square().p),
  'ex-4am-jidhr-tarbii-l5-002:q2': R(q(800).div(2)),
  'ex-4am-jidhr-tarbii-l5-002:q3': R(rt(q(800).div(2))),
  'ex-4am-jidhr-tarbii-l5-002:q4': R(q(800).div(2).mul(1200)),
  // ☜ : côté √2025, périmètre / 3 poteaux (chemin fermé), 850 DA l'un, transport 2000, budget 55000
  'ex-4am-jidhr-tarbii-l5-003:q1': R(q(55000).sub(rt(2025).mul(4).div(3).mul(850).add(2000))),
  // carré 784 ; triangle ABE rectangle en B (BE = 21) ; reste ; clôture AB + BE + AE
  'ex-4am-jidhr-tarbii-l5-004:q1': R(rt(784)),
  'ex-4am-jidhr-tarbii-l5-004:q2': R(rt(784).mul(21).div(2)),
  'ex-4am-jidhr-tarbii-l5-004:q3': R(q(784).sub(rt(784).mul(21).div(2))),
  'ex-4am-jidhr-tarbii-l5-004:q4': R(rt(784).add(21).add(rt(q(784).add(sq(21))))),
  // réservoir 13,5 m³, h = 1,5 m, base carrée ; peinture latérale 350 DA/m²
  'ex-4am-jidhr-tarbii-l5-005:q1': R(q('13.5').div('1.5')),
  'ex-4am-jidhr-tarbii-l5-005:q2': R(rt(q('13.5').div('1.5'))),
  'ex-4am-jidhr-tarbii-l5-005:q3': R(rt(q('13.5').div('1.5')).mul(4).mul('1.5').mul(350)),
  // ☜ : deux carrés 196 et 441, 3 tours de fil, 60 DA/m
  'ex-4am-jidhr-tarbii-l5-006:q1': R(rt(196).add(rt(441)).mul(4).mul(3).mul(60)),
  // piscine 72 m² : côté √72 par défaut à 10⁻¹ ; diagonale √(72 + 72) ; carreaux de 0,2 m
  'ex-4am-jidhr-tarbii-l5-007:q2': R(approx(1, 72, 0, 1)),
  'ex-4am-jidhr-tarbii-l5-007:q3': R(rt(new S(0, 1, 72).square().p.mul(2))),
  'ex-4am-jidhr-tarbii-l5-007:q4': R(q(72).div(sq('0.2'))),
  // ☜ : carré 1024, un arbre tous les 4 m (chemin fermé), 750 DA + 20 %
  'ex-4am-jidhr-tarbii-l5-008:q1': R(rt(1024).mul(4).div(4).mul(q(750).mul('1.2'))),
  // jardin 900 m², BM = 16, allée AM, 1500 DA/m
  'ex-4am-jidhr-tarbii-l5-009:q1': R(rt(900)),
  'ex-4am-jidhr-tarbii-l5-009:q2': R(rt(q(900).add(sq(16)))),
  'ex-4am-jidhr-tarbii-l5-009:q3': R(rt(q(900).add(sq(16))).mul(1500)),
  // salle : carré 144 + rectangle 16 × côté ; diagonale du rectangle ; aire ; 800 DA/m²
  'ex-4am-jidhr-tarbii-l5-010:q1': R(rt(144)),
  'ex-4am-jidhr-tarbii-l5-010:q2': R(rt(sq(16).add(144))),
  'ex-4am-jidhr-tarbii-l5-010:q3': R(q(144).add(rt(144).mul(16))),
  'ex-4am-jidhr-tarbii-l5-010:q4': R(q(144).add(rt(144).mul(16)).mul(800)),
};

// Oracle du banc « amaliyat-judhur » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outil : un petit calcul EXACT sur les nombres de la forme r0 + r1·√k1 + r2·√k2 + … (ri rationnels, ki sans
// facteur carré), écrit ici et indépendant du code testé. Jamais de Math.sqrt.
//   sq(432)            → 12√3          sq('0,16')  → 2/5
//   sq(8).mul(sq(2))   → 4             (3 − √2)²   → num(3).sub(sq(2)).pow2()
//   x.rat()            → '4' (lève une erreur si x n'est pas rationnel)
//   x.coef(3)          → coefficient rationnel de √3, en chaîne
import { R, C, q } from './helpers.mjs';

/** plus grand a tel que a² divise m, et le reste sans facteur carré : m = a²·k */
function extract(m) {
  let a = 1n; let k = m;
  for (let p = 2n; p * p <= k; p += 1n) {
    while (k % (p * p) === 0n) { k /= p * p; a *= p; }
  }
  return [a, k];
}

class Surd {
  constructor(terms = new Map()) { this.t = new Map([...terms].filter(([, v]) => !v.isZero())); }
  static num(v) { return new Surd(new Map([[1n, q(v)]])); }
  /** √v pour v rationnel ≥ 0 : √(p/d) = √(p·d) / d */
  static sqrt(v) {
    const r = q(v);
    if (r.n < 0n) throw new Error('racine d’un négatif');
    const [a, k] = extract(r.n * r.d);
    return new Surd(new Map([[k, q(`${a}/${r.d}`)]]));
  }
  add(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    const t = new Map(this.t);
    for (const [k, v] of o.t) t.set(k, (t.get(k) ?? q(0)).add(v));
    return new Surd(t);
  }
  neg() { return new Surd(new Map([...this.t].map(([k, v]) => [k, v.neg()]))); }
  sub(o) { return this.add((o instanceof Surd ? o : Surd.num(o)).neg()); }
  mul(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    let out = new Surd();
    for (const [k1, v1] of this.t) for (const [k2, v2] of o.t) {
      const [a, k] = extract(k1 * k2);
      out = out.add(new Surd(new Map([[k, v1.mul(v2).mul(q(String(a)))]])));
    }
    return out;
  }
  /** division par un rationnel ou par UN seul terme c·√k */
  div(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    if (o.t.size !== 1) throw new Error('diviseur à un seul terme seulement');
    const [[k, c]] = [...o.t];
    return this.mul(new Surd(new Map([[k, q(1).div(c.mul(q(String(k))))]])));
  }
  pow2() { return this.mul(this); }
  coef(k) { return (this.t.get(BigInt(k)) ?? q(0)).toString(); }
  rat() {
    for (const k of this.t.keys()) if (k !== 1n) throw new Error(`pas rationnel : terme en √${k}`);
    return this.coef(1);
  }
}
const sq = (v) => Surd.sqrt(String(v).replace(',', '.'));
const num = (v) => Surd.num(String(v).replace(',', '.'));
/** valeur rationnelle exacte d'un nombre à racines */
const V = (s) => R(s.rat());
/** coefficient de √k */
const K = (s, k) => R(s.coef(k));
/** « oui » (A) / « non » (B) d'après un booléen recalculé */
const yesNo = (b) => C(b ? 'A' : 'B');
const eq = (a, b) => a.sub(b).t.size === 0;

/* ── Niveau 1 ─────────────────────────────────────────────────────── */
const L1_5A = sq(36).add(sq(64)); const L1_5B = sq(36 + 64);
const L1_8A = sq(25 - 16); const L1_8B = sq(25).sub(sq(16));

/* ── Niveau 2 ─────────────────────────────────────────────────────── */
const L2_2A = sq(16 + 9); const L2_2B = sq(16).add(sq(9));
const L2_6A = sq(144 + 25); const L2_6B = sq(144).add(sq(25));
const L2_7A = sq(20); const L2_7B = num(3).mul(sq(45));
const L2_9m = sq(11).sub(4); const L2_9n = sq(11).add(4);
const L2_10B = num(3).mul(sq(5)).div(sq(3));

/* ── Niveau 3 ─────────────────────────────────────────────────────── */
// BEM 2013 I-1 : A = √3(√3 − 1) + √27 + 1 ; B = 4 − 2√3
const B13_A = sq(3).mul(sq(3).sub(1)).add(sq(27)).add(1);
const B13_B = num(4).sub(num(2).mul(sq(3)));
// BEM 2018 I-1 : A = 3√8 × √2 ; B = 2√27 − 2√3 + √12
const B18_A = num(3).mul(sq(8)).mul(sq(2));
const B18_B = num(2).mul(sq(27)).sub(num(2).mul(sq(3))).add(sq(12));
// على منوال 2013 : A = √5(√5 − 1) + √45 + 2 ; B = 7 − 2√5
const M13_A = sq(5).mul(sq(5).sub(1)).add(sq(45)).add(2);
const M13_B = num(7).sub(num(2).mul(sq(5)));
// على منوال 2017 : A = √98 − √32 ; B = 1/(2√2) ; C = (A + 2)(12B − 2)
const M17_A = sq(98).sub(sq(32));
const M17_B = num(1).div(num(2).mul(sq(2)));
const M17_C = M17_A.add(2).mul(num(12).mul(M17_B).sub(2));
// على منوال 2009 : A = √48 ; B = 3√27 ; C = √3 + 2 ; C²/√3 = (a√3 + b)/3
const M09_A = sq(48); const M09_B = num(3).mul(sq(27)); const M09_C = sq(3).add(2);
const M09_Q = M09_C.pow2().div(sq(3)).mul(3); // 3 × C²/√3 = a√3 + b
// على منوال 2022 : A = √12 + 2√75 − 3√27 ; B = (3 + √3)/√3 = √3 + b
const M22_A = sq(12).add(num(2).mul(sq(75))).sub(num(3).mul(sq(27)));
const M22_B = num(3).add(sq(3)).div(sq(3));
// على منوال 2023 : A = 630/150 ; B = √28 + 2√63 − √175 ; C = 2√3/√7
const M23_B = sq(28).add(num(2).mul(sq(63))).sub(sq(175));
const M23_C = num(2).mul(sq(3)).div(sq(7));
// على منوال 2018 : A = 4√5 × √20 ; B = 3√20 − √45 + √5
const M18_A = num(4).mul(sq(5)).mul(sq(20));
const M18_B = num(3).mul(sq(20)).sub(sq(45)).add(sq(5));

/* ── Niveau 4 ─────────────────────────────────────────────────────── */
// على منوال 2015 : E = (2x + 1)² − 9 en x = 1 − √3 (et vérification sur la forme développée)
const M15_x = num(1).sub(sq(3));
const M15_E = num(2).mul(M15_x).add(1).pow2().sub(9);
if (!eq(M15_E, num(4).mul(M15_x.pow2()).add(num(4).mul(M15_x)).sub(8))) throw new Error('2015 : formes incohérentes');
// على منوال 2025 : E = x² − 6x − 7 = (x − 3)² − 16 en x = √5 − 1
const M25_x = sq(5).sub(1);
const M25_E = M25_x.pow2().sub(num(6).mul(M25_x)).sub(7);
if (!eq(M25_E, M25_x.sub(3).pow2().sub(16))) throw new Error('2025 : formes incohérentes');
// على منوال 2008 : A = (3 − √2)² ; B = (3 + √2)²
const M08_A = num(3).sub(sq(2)).pow2(); const M08_B = num(3).add(sq(2)).pow2();
// على منوال 2021 : A = √3 × √27 + √180 − √245 ; B = 9 + √5
const M21_A = sq(3).mul(sq(27)).add(sq(180)).sub(sq(245));
const M21_B = num(9).add(sq(5));
// l4-004 : a = 9, b = 16
const L4_4s = sq(9).add(sq(16));

/* ── Niveau 5 ─────────────────────────────────────────────────────── */
// l5-001 : carré de 432 m², bande 4√3 de large, graines 25 g/m², 120 DA/kg
const S1_c = sq(432); const S1_pot = S1_c.mul(num(4).mul(sq(3))); const S1_rest = num(432).sub(S1_pot);
const S1_price = q(S1_rest.rat()).mul(25).div(1000).mul(120);
// l5-002 : √540 × √60, gazon 1250 DA/m² + 15000 DA, budget 235000 DA
const S2_area = sq(540).mul(sq(60)); const S2_cost = q(S2_area.rat()).mul(1250).add(15000);
// l5-003 : t = √(h/5)
const S3_t = (h) => sq(q(h).div(5).toString());
const S3_h = q('2.4').mul(q('2.4')).mul(5); // t² = h/5
// l5-004 : panneau √8 × √0,5 ; 150 W/m² ; 6000 W ; 18500 DA ; +15 % ; 450000 DA
const S4_area = sq(8).mul(sq('0.5'));
const S4_n = q(6000).div(q(S4_area.rat()).mul(150));
if (S4_n.d !== 1n) throw new Error('l5-004 : le nombre de panneaux n’est pas entier');
const S4_left = q(450000).sub(S4_n.mul(18500).mul(q('1.15')));
// l5-005 : 8√5 × √180, parts de longueurs 5√5 et 3√5
const S5_w = sq(180); const S5_1 = num(5).mul(sq(5)).mul(S5_w); const S5_2 = num(3).mul(sq(5)).mul(S5_w);
if (!eq(S5_1.add(S5_2), num(8).mul(sq(5)).mul(S5_w))) throw new Error('l5-005 : les deux parts ne recouvrent pas la parcelle');
const S5_income = q(S5_1.rat()).div('12.5').mul(200).add(q(S5_2.rat()).div('4.5').mul(80));
// l5-006 : √24 × √6 × 1,5 ; 1,5 m³/h
const S6_base = sq(24).mul(sq(6)); const S6_vol = q(S6_base.rat()).mul('1.5');
// l5-007 : carré de 50 m², aire doublée, clôture 650 DA/m moins 1 m
const S7_c = sq(50); const S7_c2 = sq(2 * 50);
if (!eq(S7_c.mul(sq(2)), S7_c2)) throw new Error('l5-007 : c′ ≠ c√2');
const S7_fence = q(S7_c2.rat()).mul(4).sub(1).mul(650);
// l5-008 : carrés de 98 et 50 m²
const S8_1 = sq(98); const S8_2 = sq(50); const S8_area = S8_1.mul(S8_2);
// l5-009 : carré √72, rectangle √72 × √32, 800 DA/m²
const S9_1 = sq(72).mul(sq(72)); const S9_2 = sq(72).mul(sq(32));
// l5-010 : √1200 × √300, 2200 DA/m², commune 30 %, dons 1000000 DA
const S10_area = sq(1200).mul(sq(300)); const S10_price = q(S10_area.rat()).mul(2200);
const S10_left = q(1000000).sub(S10_price.mul(q('0.7')));

const id = (l, n, qn) => `ex-4am-amaliyat-judhur-l${l}-${String(n).padStart(3, '0')}:q${qn}`;

export const ORACLE = {
  // ── Niveau 1 ──
  [id(1, 1, 1)]: V(sq(4).mul(sq(36))),
  [id(1, 1, 2)]: V(sq('0.16').mul(sq(49))),
  [id(1, 2, 1)]: V(sq(36).div(sq(4))),
  [id(1, 2, 2)]: V(sq('0.25')),
  [id(1, 3, 1)]: R(q(5).mul(3)),                          // √5 × √3 = √n
  [id(1, 3, 2)]: V(sq(2).mul(sq(18))),
  [id(1, 4, 1)]: R(q(35).div(7)),                         // √35/√7 = √n
  [id(1, 4, 2)]: V(sq(45).div(sq(5))),
  [id(1, 5, 1)]: V(L1_5A),
  [id(1, 5, 2)]: V(L1_5B),
  [id(1, 5, 3)]: yesNo(eq(L1_5A, L1_5B)),
  [id(1, 6, 1)]: V(sq('0.09').mul(sq(100))),
  [id(1, 6, 2)]: V(sq(49).mul(sq('0.04'))),
  [id(1, 7, 1)]: V(sq(q(81).div(4).toString())),
  [id(1, 7, 2)]: V(sq(q(16).div(121).toString())),
  [id(1, 8, 1)]: V(L1_8A),
  [id(1, 8, 2)]: V(L1_8B),
  [id(1, 8, 3)]: yesNo(eq(L1_8A, L1_8B)),
  [id(1, 9, 1)]: V(num(5).mul(sq(12)).mul(sq(3))),        // على منوال BEM 2018
  [id(1, 10, 1)]: V(num(6).mul(sq(3)).mul(sq(3).div(9))), // على منوال BEM 2011

  // ── Niveau 2 ──
  [id(2, 1, 1)]: V(sq(9 * 81)),
  [id(2, 1, 2)]: V(sq(121 * 100)),
  [id(2, 1, 3)]: V(sq(16 * 900)),
  [id(2, 1, 4)]: V(sq(q('1.44').mul('0.25').toString())),
  [id(2, 2, 1)]: V(L2_2A),
  [id(2, 2, 2)]: V(L2_2B),
  [id(2, 2, 3)]: yesNo(eq(L2_2A, L2_2B)),
  [id(2, 3, 1)]: V(sq(8).mul(sq(32))),
  [id(2, 3, 2)]: V(sq(7).mul(sq(63))),
  [id(2, 3, 3)]: V(sq('0.5').mul(sq('4.5'))),
  [id(2, 4, 1)]: V(sq(300).div(sq(3))),
  [id(2, 4, 2)]: V(sq('1.6').div(sq('0.1'))),
  [id(2, 4, 3)]: V(sq(q('0.49').div('0.25').toString())),
  [id(2, 5, 1)]: K(sq(72), 2),
  [id(2, 5, 2)]: K(sq(75), 3),
  [id(2, 6, 1)]: V(L2_6A),
  [id(2, 6, 2)]: V(L2_6B),
  [id(2, 6, 3)]: V(L2_6B.sub(L2_6A)),
  [id(2, 7, 1)]: V(L2_7A.mul(L2_7B)),                     // على منوال BEM 2009
  [id(2, 7, 2)]: V(L2_7B.div(L2_7A)),
  [id(2, 8, 1)]: V(sq(5).add(2).mul(sq(5).sub(2))),       // على منوال BEM 2022
  [id(2, 9, 1)]: K(L2_9m.add(L2_9n), 11),                 // على منوال BEM 2012
  [id(2, 9, 2)]: V(L2_9m.mul(L2_9n)),
  [id(2, 10, 1)]: R(L2_10B.pow2().rat()),                 // على منوال BEM 2023 : B = √n ⇒ n = B²

  // ── Niveau 3 ──
  [id(3, 1, 2)]: V(B13_A.mul(B13_B)),                     // BEM 2013 — 02
  [id(3, 2, 1)]: V(B18_A),                                // BEM 2018 — 01
  [id(3, 2, 2)]: K(B18_B, 3),                             // BEM 2018 — 02
  [id(3, 3, 2)]: V(M13_A.mul(M13_B)),
  [id(3, 4, 1)]: K(M17_A, 2),
  [id(3, 4, 2)]: R(q(1).div(M17_B.coef(2))),              // B = √2 / c ⇒ c = 1 / coef(√2)
  [id(3, 4, 3)]: V(M17_C),
  [id(3, 5, 1)]: K(M09_A.add(M09_B), 3),
  [id(3, 5, 2)]: V(M09_A.mul(M09_B)),
  [id(3, 5, 3)]: K(M09_Q, 3),
  [id(3, 5, 4)]: R(M09_Q.coef(1)),
  [id(3, 6, 1)]: K(M22_A, 3),
  [id(3, 6, 2)]: R(M22_B.coef(1)),                        // B = √3 + b
  [id(3, 6, 3)]: V(M22_B.mul(sq(3).sub(1))),
  [id(3, 7, 1)]: R(q(630).div(150)),
  [id(3, 7, 2)]: K(M23_B, 7),
  [id(3, 7, 3)]: K(M23_B.mul(M23_C), 3),
  [id(3, 8, 1)]: V(M18_A),
  [id(3, 8, 2)]: K(M18_B, 5),
  [id(3, 9, 1)]: V(sq(2).mul(sq(50))),
  [id(3, 9, 2)]: V(sq(32).mul(sq(2))),
  [id(3, 9, 3)]: V(sq(3).mul(sq(48))),
  [id(3, 9, 4)]: V(sq(125).mul(sq(5))),
  [id(3, 10, 1)]: V(sq(q(49).div(16).toString())),
  [id(3, 10, 2)]: V(sq(q(36).div(81).toString())),
  [id(3, 10, 3)]: V(sq(q(12100).div(900).toString())),
  [id(3, 10, 4)]: V(sq(q(4900).div(32400).toString())),

  // ── Niveau 4 ──
  [id(4, 1, 1)]: V(sq(2).div(sq(18))),
  [id(4, 1, 2)]: V(sq(3).div(sq(48))),
  [id(4, 1, 3)]: V(sq(q(6875).div(1100).toString())),
  [id(4, 1, 4)]: V(sq(7).div(sq(448))),
  [id(4, 2, 1)]: V(sq(q('0.81').mul('0.0001').toString())),
  [id(4, 2, 2)]: V(sq(q('5.76').mul('0.0144').toString())),
  [id(4, 3, 1)]: V(sq(8).mul(sq(2))),
  [id(4, 3, 2)]: V(sq(5).add(sq(20)).mul(sq(5))),
  [id(4, 4, 1)]: V(sq(9 + 16)),
  [id(4, 4, 2)]: V(L4_4s),
  [id(4, 4, 3)]: V(L4_4s.pow2().sub(9 + 16)),
  [id(4, 5, 1)]: V(sq(q(7).div(2).toString()).mul(sq(q(8).div(7).toString()))),
  [id(4, 5, 2)]: V(sq(24).div(sq(6)).add(sq(q(49).div(4).toString()))),
  [id(4, 5, 3)]: V(sq(q(7).div(2).toString()).mul(sq(q(8).div(7).toString())).mul(sq(24).div(sq(6)).add(sq(q(49).div(4).toString())))),
  [id(4, 6, 1)]: K(sq(18).mul(sq(6)), 3),
  [id(4, 6, 2)]: V(num(3).mul(sq(2)).pow2()),
  [id(4, 7, 2)]: R(M15_E.coef(1)),                        // على منوال BEM 2015
  [id(4, 7, 3)]: K(M15_E, 3),
  [id(4, 8, 2)]: R(M25_E.coef(1)),                        // على منوال BEM 2025
  [id(4, 8, 3)]: K(M25_E, 5),
  [id(4, 9, 1)]: R(M08_A.coef(1)),                        // على منوال BEM 2008
  [id(4, 9, 2)]: K(M08_A, 2),
  [id(4, 9, 3)]: V(M08_A.mul(M08_B)),
  [id(4, 10, 1)]: R(M21_A.coef(1)),                       // على منوال BEM 2021
  [id(4, 10, 2)]: K(M21_A, 5),
  [id(4, 10, 3)]: V(M21_A.mul(M21_B)),

  // ── Niveau 5 (الوضعيات الإدماجية) ──
  [id(5, 1, 1)]: K(S1_c, 3),
  [id(5, 1, 2)]: V(S1_pot),
  [id(5, 1, 3)]: V(S1_rest),
  [id(5, 1, 4)]: R(S1_price),
  [id(5, 2, 1)]: V(S2_area),
  [id(5, 2, 2)]: V(sq(540).div(sq(60))),
  [id(5, 2, 3)]: yesNo(S2_cost.sub(235000).n <= 0n),
  [id(5, 2, 4)]: R(S2_cost.sub(235000)),
  [id(5, 3, 1)]: V(S3_t(45)),
  [id(5, 3, 2)]: V(S3_t(180).div(S3_t(45))),
  [id(5, 3, 3)]: R(S3_h),
  [id(5, 4, 1)]: R(S4_left),
  [id(5, 5, 1)]: K(S5_w, 5),
  [id(5, 5, 2)]: V(S5_1),
  [id(5, 5, 3)]: V(S5_2),
  [id(5, 5, 4)]: R(S5_income),
  [id(5, 6, 1)]: V(S6_base),
  [id(5, 6, 2)]: V(sq(24).div(sq(6))),
  [id(5, 6, 3)]: R(S6_vol),
  [id(5, 6, 4)]: R(S6_vol.div('1.5')),
  [id(5, 7, 1)]: K(S7_c, 2),
  [id(5, 7, 2)]: V(S7_c2),
  [id(5, 7, 4)]: R(S7_fence),
  [id(5, 8, 1)]: K(S8_1, 2),
  [id(5, 8, 2)]: K(S8_2, 2),
  [id(5, 8, 3)]: V(S8_1.div(S8_2)),
  [id(5, 8, 4)]: V(S8_area),
  [id(5, 8, 5)]: R(q(S8_area.rat()).mul(2).mul(350)),
  [id(5, 9, 1)]: V(S9_1),
  [id(5, 9, 2)]: V(S9_2),
  [id(5, 9, 3)]: V(sq(72).div(sq(32))),
  [id(5, 9, 4)]: R(q(S9_1.add(S9_2).rat()).mul(800)),
  [id(5, 10, 1)]: R(S10_left),
};

// Garde-fous de forme : une réponse « a√b » ou « √n » n'a de sens que si le nombre a bien cette forme.
const single = (s, k) => { if (s.t.size !== 1 || !s.t.has(BigInt(k))) throw new Error(`forme inattendue (√${k})`); };
single(sq(72), 2); single(sq(75), 3); single(L2_9m.add(L2_9n), 11); single(L2_10B, 15); single(B18_B, 3);
single(M17_A, 2); single(M17_B, 2); single(M09_A.add(M09_B), 3); single(M22_A, 3); single(M23_B, 7);
single(M23_B.mul(M23_C), 3); single(M18_B, 5); single(sq(18).mul(sq(6)), 3); single(S1_c, 3); single(S5_w, 5);
single(S7_c, 2); single(S8_1, 2); single(S8_2, 2);
if (!eq(M22_B.sub(sq(3)), num(M22_B.coef(1)))) throw new Error('2022 : B n’est pas √3 + b');
if (!eq(B13_A, num(4).add(num(2).mul(sq(3))))) throw new Error('BEM 2013 01 : A ≠ 4 + 2√3');
if (!eq(B18_A.div(B18_B), num(2).mul(sq(3)).div(3))) throw new Error('BEM 2018 03 : A/B ≠ 2√3/3');
if (!eq(M13_A, num(7).add(num(2).mul(sq(5))))) throw new Error('على منوال 2013 : A ≠ 7 + 2√5');
if (!eq(M18_A.div(M18_B), num(2).mul(sq(5)))) throw new Error('على منوال 2018 : A/B ≠ 2√5');
if (!eq(L2_10B.mul(num(2).mul(sq(15))), num(30))) throw new Error('على منوال 2023 (l2-010) : A × B ≠ 30');
if (!eq(sq(5).add(2).mul(sq(5).sub(2)), num(1))) throw new Error('l2-008 : A × B ≠ 1');
if (!eq(sq(8).add(sq(2)), sq(18)) || eq(sq(18), sq(10))) throw new Error('l4-003 : √8 + √2 = √18 ≠ √10');
if (!eq(sq(18).mul(sq(6)).pow2(), num(6).mul(num(3).mul(sq(2)).pow2()))) throw new Error('l4-006 : C² ≠ 6D');

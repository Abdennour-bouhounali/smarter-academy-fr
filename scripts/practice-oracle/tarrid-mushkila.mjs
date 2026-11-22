// Oracle du banc « tarrid-mushkila » (unité 4 « معادلات ومتراجحات »), feuilles BEM (2026-10-07) — chaque
// réponse RECALCULÉE ici à partir des NOMBRES DE L'ÉNONCÉ, sans lire le contenu ni le code testé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Un exercice de ترييض a une HISTOIRE : l'oracle la rejoue.
//   • `first(pred)`  le premier entier qui vérifie l'histoire (« بعد كم سنة »، « أصغر عدد »…), écrite avec
//                    les mots de l'énoncé, jamais avec l'équation de la clé ;
//   • `last(pred)`   le plus grand entier qui la vérifie (« أكبر عدد »، « أكبر ثمن » entier) ;
//   • `root(f)`      la racine exacte d'une fonction affine (rationnels exacts de helpers.mjs) — f est l'écart
//                    « membre de gauche − membre de droite » écrit avec les mots de l'énoncé ;
//   • `ineq(L, rel, R)` une متراجحة de l'énoncé : { k, sym } — le حدّ k (racine de L − R) et l'écriture des
//                    solutions parmi A « x < k », B « x ≤ k », C « x > k », D « x ≥ k » (ordre fixe des feuilles),
//                    déterminée en TESTANT la vérité de L rel R en k − 1, k et k + 1 (pas de règle de signe).
//   • `aff(f)`       les coefficients exacts { a, b } d'une expression affine f(x) = ax + b (lus en 0 et 1,
//                    vérifiés en un troisième point).
// Convention de saisie : un `rational` par coefficient, par nombre ; « الأصغر / الأكبر » pour deux racines ;
// les « بيّن أن » sans valeur sont des selfCheck (pas d'entrée ici). Clés « نعم / لا » : A = نعم, B = لا.
import { R, C, q } from './helpers.mjs';

const first = (pred, from = 0, to = 100000) => { for (let t = from; t <= to; t += 1) if (pred(t)) return t; throw new Error('tarrid-mushkila oracle: aucun entier'); };
const last = (pred, from = 0, to = 100000) => { let r = null; for (let t = from; t <= to; t += 1) if (pred(t)) r = t; if (r === null) throw new Error('tarrid-mushkila oracle: aucun entier'); return r; };
const sign = (v) => (v.n > 0n ? 1 : v.n < 0n ? -1 : 0);
const cmp = (a, b) => sign(q(a).sub(q(b)));
const eq = (a, b) => cmp(a, b) === 0;

/** Coefficients exacts d'une expression affine, vérifiés en x = 7. */
function aff(f) {
  const b = q(f(q(0))); const a = q(f(q(1))).sub(b);
  if (!eq(f(q(7)), a.mul(7).add(b))) throw new Error('tarrid-mushkila oracle: expression non affine');
  return { a: a.toString(), b: b.toString() };
}
/** Racine exacte de f affine (f(x) = 0). */
function root(f) {
  const { a, b } = aff(f);
  if (eq(a, 0)) throw new Error('tarrid-mushkila oracle: pas de racine unique');
  return q(b).neg().div(q(a)).toString();
}
const truth = (l, rel, r) => { const c = cmp(l, r); return { '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0 }[rel]; };
function ineq(L, rel, Rt) {
  const k = q(root((x) => q(L(x)).sub(q(Rt(x)))));
  const [lo, at, hi] = [k.sub(1), k, k.add(1)].map((x) => truth(L(x), rel, Rt(x)));
  let sym;
  if (!lo && hi) sym = at ? 'D' : 'C';
  else if (lo && !hi) sym = at ? 'B' : 'A';
  else throw new Error('tarrid-mushkila oracle: متراجحة sans sens');
  return { k: k.toString(), sym };
}
const YN = (b) => C(b ? 'A' : 'B');
const ceilDiv = (a, b) => { const x = q(a).div(q(b)); const f = x.n / x.d; return Number(x.n % x.d === 0n ? f : f + 1n); };

/* ── histoires ──────────────────────────────────────────────────────────── */
// l1-003 : rectangle 3 × x, périmètre ≥ 40.
const P_l1003 = (x) => q(x).add(3).mul(2);
const I_l1003 = ineq(P_l1003, '>=', () => 40);
// l3-001 : carré x, triangle équilatéral de côté 28 − x ; 4x ≥ périmètre du triangle.
const tri_l3001 = (x) => q(28).sub(x).mul(3);
const I_l3001 = ineq((x) => q(x).mul(4), '>=', tri_l3001);
// l3-002 : rectangle x × 6 sous un triangle équilatéral de côté x ; périmètre du rectangle > celui du triangle.
const I_l3002 = ineq((x) => q(x).add(6).mul(2), '>', (x) => q(x).mul(3));
// l3-004 : (ب) 200 + 30x < (أ) 50x.
const I_l3004 = ineq((x) => q(x).mul(30).add(200), '<', (x) => q(x).mul(50));
// l3-005 : 10x > 6x + 480 (imprimée).
const I_l3005 = ineq((x) => q(x).mul(10), '>', (x) => q(x).mul(6).add(480));
// l3-008 : (12 + x)/2 ≥ 14.
const I_l3008 = ineq((x) => q(x).add(12).div(2), '>=', () => 14);
// l3-009 : parquet 4,5 × 3,2 ; boîte 1,5 m² ; ouvrier 450 / m² ; budget 30000.
const area_l3009 = q('4.5').mul('3.2');
const boxes_l3009 = ceilDiv(area_l3009, '1.5');
// l4-001 : côtés 5, x, 7.
const I_l4001a = ineq(() => 7, '<', (x) => q(x).add(5));
const I_l4001b = ineq((x) => q(x), '<', () => q(5).add(7));
// l4-002 : carré de côté 8, EFGH d'aire x² + (8 − x)² = 34.
const r_l4002 = [];
for (let x = 1; x < 8; x += 1) if (x * x + (8 - x) ** 2 === 34) r_l4002.push(x);
// l4-004 : (أ) 120x ; (ب) 1200 + 60x ; (ج) 3000.
const I_l4004 = ineq(() => 3000, '<', (x) => q(x).mul(60).add(1200));
const cost_l4004 = { A: 120 * 25, B: 1200 + 60 * 25, C: 3000 };
// l4-005 : jardin 800 m², gazon 900 / m², dallage 1500 / m², budget 960000.
const C_l4005 = (x) => q(x).mul(900).add(q(800).sub(x).mul(1500));
// l4-006 : 40x et 30x + 450 ; la 2e moins chère : 30x + 450 < 40x.
const I_l4006 = ineq((x) => q(x).mul(30).add(450), '<', (x) => q(x).mul(40));
// l4-007 : réservoir 500 L, −25 L / min ; reste < 140.
const V_l4007 = (x) => q(500).sub(q(x).mul(25));
const I_l4007 = ineq(V_l4007, '<', () => 140);
// l4-008 : Karim 22000 + 150x ; Nabil 28000 + 100x ; Karim > Nabil.
const I_l4008 = ineq((x) => q(x).mul(150).add(22000), '>', (x) => q(x).mul(100).add(28000));
// l4-010 : programme : (x − 4) × 3 ; résultat > x.
const prog_l4010 = (x) => q(x).sub(4).mul(3);
const I_l4010 = ineq(prog_l4010, '>', (x) => q(x));
// l5-001 (BEM 2008 II) : 2400 m², largeur = 2/3 longueur ; voitures 18 m², camions 30 m² ; 8960 DA, voiture = 30 % camion.
const len_l5001 = first((t) => t * t * 2 === 2400 * 3, 1);
const wid_l5001 = q(len_l5001).mul(2).div(3);
const x_l5001 = root((x) => q(wid_l5001).mul(x).sub(80 * 18));
const trucks_l5001 = last((n) => n * 30 <= Number(q(wid_l5001).mul(q(len_l5001).sub(x_l5001)).toString()));
const truck_l5001 = root((b) => q(80).mul(q(b).mul(30).div(100)).add(q(trucks_l5001).mul(b)).sub(8960));
// l5-002 (BEM 2021 II) : murs 5 × 8 × 3, ouvertures, pots de 2,5 m², ouvrier 350 / m², budget 63000.
const walls_l5002 = q(2 * 8 * 3 + 2 * 5 * 3).sub(q('2.2').mul('1.5')).sub(q(2).mul('0.8')).sub(q(3).mul('1.7'));
const pots_l5002 = ceilDiv(walls_l5002, '2.5');
const price_l5002 = last((p) => cmp(q(pots_l5002).mul(p).add(walls_l5002.mul(350)), 63000) <= 0, 800, 2100);
// l5-003 : 1200 m², largeur = 3/4 longueur ; 25 grands stands de 24 m², petits de 15 m² ; 41000 DA, petit = 40 % grand.
const len_l5003 = first((t) => t * t * 3 === 1200 * 4, 1);
const wid_l5003 = q(len_l5003).mul(3).div(4);
const x_l5003 = root((x) => q(wid_l5003).mul(x).sub(25 * 24));
const small_l5003 = last((n) => n * 15 <= Number(q(wid_l5003).mul(q(len_l5003).sub(x_l5003)).toString()));
const big_l5003 = root((b) => q(25).mul(b).add(q(small_l5003).mul(q(b).mul(40).div(100))).sub(41000));
// l5-004 : verger 75 × 45, entrée 4 m, rouleaux de 25 m, ouvrier 150 / m, budget 80000.
const fence_l5004 = 2 * (75 + 45) - 4;
const rolls_l5004 = ceilDiv(fence_l5004, 25);
const price_l5004 = last((p) => rolls_l5004 * p + 150 * fence_l5004 <= 80000, 3000, 6000);
// l5-005 : élèves 34, 36, 35, 39 ; un exemplaire pour deux ; reliure 25 % ; transport 1800 ; budget 72000.
const copies_l5005 = (34 + 36 + 35 + 39) / 2;
const price_l5005 = last((p) => cmp(q(copies_l5005).mul(q(p).mul('1.25')).add(1800), 72000) <= 0, 500, 1500);
// l5-006 : 120x ; 70x + 1600 ; 44 trajets.
const I_l5006 = ineq((x) => q(x).mul(120), '>', (x) => q(x).mul(70).add(1600));
const t1_l5006 = 120 * 44; const t2_l5006 = 70 * 44 + 1600;
// l5-007 : 30 matchs, 6 défaites, 52 points (3 / 1 / 0) ; 8 matchs sans défaite pour atteindre 71.
const wins_l5007 = first((w) => 3 * w + (30 - 6 - w) === 52);
const need_l5007 = first((y) => 52 + 3 * y + (8 - y) >= 71);
// l5-008 : 2000 plants, 36 et 26 DA, 60000 DA ; profit ≥ 20 % du prix d'achat.
const tom_l5008 = first((t) => 36 * t + 26 * (2000 - t) === 60000);
const pmin_l5008 = first((p) => 2000 * p - 60000 >= 60000 * 20 / 100);
// l5-009 : carré x + rectangle x × 12, périmètre 104 ; carrelage 900 / m² ; budget 552000.
const x_l5009 = first((x) => 2 * (x + 12) + 2 * x === 104, 1);
const pmax_l5009 = last((p) => 900 * x_l5009 * x_l5009 + 12 * x_l5009 * p <= 552000);
// l5-010 : 1440 m², BC = 2/5 AB ; triangle BCM, DM = x ; ABMD = 3 × BCM.
const AB_l5010 = first((t) => t * t * 2 === 1440 * 5, 1);
const BC_l5010 = q(AB_l5010).mul(2).div(5);
const tri_l5010 = (x) => q(BC_l5010).mul(q(AB_l5010).sub(x)).div(2);
const trap_l5010 = (x) => q(1440).sub(tri_l5010(x));

export const ORACLE = {
  /* ── niveau 1 ── */
  'ex-4am-tarrid-mushkila-l1-001:q1': R(first((t) => 6 * t + 7 === 31)),
  'ex-4am-tarrid-mushkila-l1-002:q1': R(first((t) => 3 * t - 21 === 2 * t, 1)),
  'ex-4am-tarrid-mushkila-l1-003:q1': R(aff(P_l1003).a),
  'ex-4am-tarrid-mushkila-l1-003:q2': R(aff(P_l1003).b),
  'ex-4am-tarrid-mushkila-l1-003:q3': R(I_l1003.k),
  'ex-4am-tarrid-mushkila-l1-003:q4': C(I_l1003.sym),
  'ex-4am-tarrid-mushkila-l1-004:q1': R(first((t) => 40 + t === 2 * (12 + t))),
  'ex-4am-tarrid-mushkila-l1-004:q2': R(12 + first((t) => 40 + t === 2 * (12 + t))),
  'ex-4am-tarrid-mushkila-l1-005:q1': R(root((e) => q(11).add(q(e).mul(2)).div(3).sub(13))),
  'ex-4am-tarrid-mushkila-l1-006:q1': R(first((n) => 25 * n === 175)),
  'ex-4am-tarrid-mushkila-l1-006:q2': R(first((n) => 35 * n === 175)),
  'ex-4am-tarrid-mushkila-l1-007:q1': R(first((x) => 2 * (x + 4) === 30)),
  'ex-4am-tarrid-mushkila-l1-007:q2': R(first((x) => 2 * (x + 4) === 30) * 4),
  'ex-4am-tarrid-mushkila-l1-008:q1': R(root((x) => q(x).add(q(x).add(5)).sub(36))),
  'ex-4am-tarrid-mushkila-l1-008:q2': YN(q(root((x) => q(x).add(q(x).add(5)).sub(36))).d === 1n),
  'ex-4am-tarrid-mushkila-l1-009:q1': R(first((t) => 34 + t === 3 * (4 + t))),
  'ex-4am-tarrid-mushkila-l1-009:q2': YN(Array.from({ length: 200 }, (_, t) => (34 + t) - (4 + t)).includes(20)),
  'ex-4am-tarrid-mushkila-l1-010:q1': R(first((n) => 200 * n + 500 * (12 - n) === 3600)),
  'ex-4am-tarrid-mushkila-l1-010:q2': R(12 - first((n) => 200 * n + 500 * (12 - n) === 3600)),

  /* ── niveau 2 ── */
  'ex-4am-tarrid-mushkila-l2-001:q1': R(first((t) => 36 + t === (4 + t) + (6 + t) + (8 + t))),
  'ex-4am-tarrid-mushkila-l2-001:q2': R(((t) => (4 + t) + (6 + t) + (8 + t))(first((t) => 36 + t === (4 + t) + (6 + t) + (8 + t)))),
  'ex-4am-tarrid-mushkila-l2-002:q1': R(first((x) => 3 * x + 5 === 32)),
  'ex-4am-tarrid-mushkila-l2-002:q2': R(first((x) => 3 * x + 5 === 2 * x, -100)),
  'ex-4am-tarrid-mushkila-l2-003:q1': R(first((t) => 43 + t === 2 * ((4 + t) + (7 + t)))),
  'ex-4am-tarrid-mushkila-l2-003:q2': R(43 + first((t) => 43 + t === 2 * ((4 + t) + (7 + t)))),
  'ex-4am-tarrid-mushkila-l2-004:q1': R(first((n) => 250 * n === 6500)),
  'ex-4am-tarrid-mushkila-l2-004:q2': R(first((n) => 150 * n + 2000 === 6500)),
  'ex-4am-tarrid-mushkila-l2-004:q3': R(first((n) => 250 * n === 150 * n + 2000, 1)),
  'ex-4am-tarrid-mushkila-l2-005:q1': R(q(60).div(100).toString()),
  'ex-4am-tarrid-mushkila-l2-005:q2': R(root((w) => q(w).mul(40).add(q(w).mul(60).div(100).mul(25)).sub(22000))),
  'ex-4am-tarrid-mushkila-l2-005:q3': R(q(root((w) => q(w).mul(40).add(q(w).mul(60).div(100).mul(25)).sub(22000))).mul(60).div(100).toString()),
  'ex-4am-tarrid-mushkila-l2-006:q1': R(first((x) => 2 * (x + (2 * x - 6)) === 108, 1)),
  'ex-4am-tarrid-mushkila-l2-006:q2': R(2 * first((x) => 2 * (x + (2 * x - 6)) === 108, 1) - 6),
  'ex-4am-tarrid-mushkila-l2-006:q3': R(((x) => x * (2 * x - 6))(first((x) => 2 * (x + (2 * x - 6)) === 108, 1))),
  'ex-4am-tarrid-mushkila-l2-007:q1': R(first((x) => x + (x + 1) + (x + 2) === 72)),
  'ex-4am-tarrid-mushkila-l2-007:q2': YN(Array.from({ length: 100 }, (_, x) => x + (x + 1) + (x + 2)).includes(100)),
  'ex-4am-tarrid-mushkila-l2-008:q1': R(last((n) => 850 + (45 + 7) * n <= 2000)),
  'ex-4am-tarrid-mushkila-l2-009:q1': R(first((t) => 45 + t === 4 * (15 + t), -15)),
  'ex-4am-tarrid-mushkila-l2-009:q2': YN(Array.from({ length: 200 }, (_, t) => t).some((t) => 45 + t === 4 * (15 + t))),
  'ex-4am-tarrid-mushkila-l2-009:q3': R(first((y) => 45 - y === 4 * (15 - y))),
  'ex-4am-tarrid-mushkila-l2-010:q1': R(first((x) => x + (x + 3) === 25)),
  'ex-4am-tarrid-mushkila-l2-010:q2': R(first((y) => (11 + y) + (14 + y) === 41)),

  /* ── niveau 3 ── */
  'ex-4am-tarrid-mushkila-l3-001:q1': R(aff(tri_l3001).b),
  'ex-4am-tarrid-mushkila-l3-001:q2': R(aff(tri_l3001).a),
  'ex-4am-tarrid-mushkila-l3-001:q3': R(I_l3001.k),
  'ex-4am-tarrid-mushkila-l3-001:q4': C(I_l3001.sym),
  'ex-4am-tarrid-mushkila-l3-001:q5': R(first((x) => 4 * x >= 3 * (28 - x), 1)),
  'ex-4am-tarrid-mushkila-l3-002:q1': R(I_l3002.k),
  'ex-4am-tarrid-mushkila-l3-002:q2': C(I_l3002.sym),
  'ex-4am-tarrid-mushkila-l3-002:q3': R(last((x) => 2 * (x + 6) > 3 * x, 1, 1000)),
  'ex-4am-tarrid-mushkila-l3-002:q4': C(2 * (12 + 6) === 3 * 12 ? 'A' : (2 * (12 + 6) > 3 * 12 ? 'B' : 'C')),
  'ex-4am-tarrid-mushkila-l3-003:q1': R(root((D) => q(D).mul(75).div(100).add(4).add(11).sub(D))),
  'ex-4am-tarrid-mushkila-l3-003:q2': R(q(root((D) => q(D).mul(75).div(100).add(4).add(11).sub(D))).mul(75).div(100).toString()),
  'ex-4am-tarrid-mushkila-l3-004:q1': R(first((x) => 50 * x === 200 + 30 * x, 1)),
  'ex-4am-tarrid-mushkila-l3-004:q2': R(I_l3004.k),
  'ex-4am-tarrid-mushkila-l3-004:q3': C(I_l3004.sym),
  'ex-4am-tarrid-mushkila-l3-004:q4': C(50 * 8 < 200 + 30 * 8 ? 'A' : 'B'),
  'ex-4am-tarrid-mushkila-l3-005:q1': R(10 * 100),
  'ex-4am-tarrid-mushkila-l3-005:q2': R(first((n) => 10 * n === 2000)),
  'ex-4am-tarrid-mushkila-l3-005:q3': R(6 * first((n) => 10 * n === 2000) + 480),
  'ex-4am-tarrid-mushkila-l3-005:q4': R(I_l3005.k),
  'ex-4am-tarrid-mushkila-l3-005:q5': C(I_l3005.sym),
  'ex-4am-tarrid-mushkila-l3-005:q6': C(10 * 150 < 6 * 150 + 480 ? 'A' : 'B'),
  'ex-4am-tarrid-mushkila-l3-006:q1': R(first((x) => x % 3 === 0 && x - x / 3 - 5 === 15, 1)),
  'ex-4am-tarrid-mushkila-l3-006:q2': R(first((x) => x % 3 === 0 && x - x / 3 - 5 === 15, 1) / 3),
  'ex-4am-tarrid-mushkila-l3-007:q1': R(root((x) => q(x).sub(q(x).mul(20).div(100)).sub(1200))),
  'ex-4am-tarrid-mushkila-l3-007:q2': R(q(1200).add(q(1200).mul(20).div(100)).toString()),
  'ex-4am-tarrid-mushkila-l3-007:q3': YN(eq(q(1200).mul(120).div(100), root((x) => q(x).mul(80).div(100).sub(1200)))),
  'ex-4am-tarrid-mushkila-l3-008:q1': R(I_l3008.k),
  'ex-4am-tarrid-mushkila-l3-008:q2': C(I_l3008.sym),
  'ex-4am-tarrid-mushkila-l3-008:q3': R(Array.from({ length: 21 }, (_, t) => t).filter((t) => (12 + t) / 2 >= 14).length),
  'ex-4am-tarrid-mushkila-l3-009:q1': R(area_l3009.toString()),
  'ex-4am-tarrid-mushkila-l3-009:q2': R(boxes_l3009),
  'ex-4am-tarrid-mushkila-l3-009:q3': R(root((p) => q(boxes_l3009).mul(p).add(area_l3009.mul(450)).sub(30000))),
  'ex-4am-tarrid-mushkila-l3-010:q1': R(first((r) => 4 * r + 2 * (20 - r) === 56)),
  'ex-4am-tarrid-mushkila-l3-010:q2': R(20 - first((r) => 4 * r + 2 * (20 - r) === 56)),
  'ex-4am-tarrid-mushkila-l3-010:q3': YN(Array.from({ length: 60 }, (_, r) => r).some((r) => Array.from({ length: 60 }, (_, c) => c).some((c) => 4 * r + 2 * c === 75))),

  /* ── niveau 4 ── */
  'ex-4am-tarrid-mushkila-l4-001:q1': R(I_l4001a.k),
  'ex-4am-tarrid-mushkila-l4-001:q2': C(I_l4001a.sym),
  'ex-4am-tarrid-mushkila-l4-001:q3': R(I_l4001b.k),
  'ex-4am-tarrid-mushkila-l4-001:q4': C(I_l4001b.sym),
  'ex-4am-tarrid-mushkila-l4-001:q5': R(Array.from({ length: 100 }, (_, x) => x).filter((x) => x > 0 && 7 < 5 + x && x < 5 + 7 && 5 < x + 7).length),
  'ex-4am-tarrid-mushkila-l4-002:q3': R(r_l4002[0]),
  'ex-4am-tarrid-mushkila-l4-002:q4': R(r_l4002[1]),
  'ex-4am-tarrid-mushkila-l4-003:q3': R(first((x) => x > 8 && (x + 3) * (x - 8) === 60, 9)),
  'ex-4am-tarrid-mushkila-l4-004:q1': R(first((n) => 120 * n === 1200 + 60 * n, 1)),
  'ex-4am-tarrid-mushkila-l4-004:q2': R(I_l4004.k),
  'ex-4am-tarrid-mushkila-l4-004:q3': C(I_l4004.sym),
  'ex-4am-tarrid-mushkila-l4-004:q4': C(Object.entries(cost_l4004).sort((u, v) => u[1] - v[1])[0][0]),
  'ex-4am-tarrid-mushkila-l4-005:q1': R(aff(C_l4005).a),
  'ex-4am-tarrid-mushkila-l4-005:q2': R(aff(C_l4005).b),
  'ex-4am-tarrid-mushkila-l4-005:q3': R(root((x) => C_l4005(x).sub(960000))),
  'ex-4am-tarrid-mushkila-l4-005:q4': YN(cmp(C_l4005(300), 960000) <= 0),
  'ex-4am-tarrid-mushkila-l4-006:q1': R(40 * 30),
  'ex-4am-tarrid-mushkila-l4-006:q2': R(30 * 30 + 450),
  'ex-4am-tarrid-mushkila-l4-006:q3': R(first((n) => 40 * n === 30 * n + 450, 1)),
  'ex-4am-tarrid-mushkila-l4-006:q4': R(I_l4006.k),
  'ex-4am-tarrid-mushkila-l4-006:q5': C(I_l4006.sym),
  'ex-4am-tarrid-mushkila-l4-007:q1': R(aff(V_l4007).a),
  'ex-4am-tarrid-mushkila-l4-007:q2': R(I_l4007.k),
  'ex-4am-tarrid-mushkila-l4-007:q3': C(I_l4007.sym),
  'ex-4am-tarrid-mushkila-l4-007:q4': R(first((t) => 500 - 25 * t < 140)),
  'ex-4am-tarrid-mushkila-l4-007:q5': R(first((t) => 500 - 25 * t === 0)),
  'ex-4am-tarrid-mushkila-l4-008:q1': R(22000 + 150 * 100),
  'ex-4am-tarrid-mushkila-l4-008:q2': R(28000 + 100 * 100),
  'ex-4am-tarrid-mushkila-l4-008:q3': R(first((n) => 22000 + 150 * n === 28000 + 100 * n)),
  'ex-4am-tarrid-mushkila-l4-008:q4': R(I_l4008.k),
  'ex-4am-tarrid-mushkila-l4-008:q5': C(I_l4008.sym),
  'ex-4am-tarrid-mushkila-l4-009:q1': R(first((s) => (s + 26) + 4 === 3 * (s + 4))),
  'ex-4am-tarrid-mushkila-l4-009:q2': R(first((s) => (s + 26) + 4 === 3 * (s + 4)) + 26),
  'ex-4am-tarrid-mushkila-l4-009:q3': R(first((y) => (35 + y) === 2 * (9 + y))),
  'ex-4am-tarrid-mushkila-l4-010:q1': R(aff(prog_l4010).a),
  'ex-4am-tarrid-mushkila-l4-010:q2': R(aff(prog_l4010).b),
  'ex-4am-tarrid-mushkila-l4-010:q3': R(I_l4010.k),
  'ex-4am-tarrid-mushkila-l4-010:q4': C(I_l4010.sym),
  'ex-4am-tarrid-mushkila-l4-010:q5': R(first((x) => (x - 4) * 3 === 21, -100)),

  /* ── niveau 5 ── */
  'ex-4am-tarrid-mushkila-l5-001:q1': R(wid_l5001.toString()),
  'ex-4am-tarrid-mushkila-l5-001:q2': R(len_l5001),
  'ex-4am-tarrid-mushkila-l5-001:q3': R(aff((x) => q(wid_l5001).mul(x)).a),
  'ex-4am-tarrid-mushkila-l5-001:q4': R(aff((x) => q(wid_l5001).mul(q(len_l5001).sub(x))).a),
  'ex-4am-tarrid-mushkila-l5-001:q5': R(aff((x) => q(wid_l5001).mul(q(len_l5001).sub(x))).b),
  'ex-4am-tarrid-mushkila-l5-001:q6': R(x_l5001),
  'ex-4am-tarrid-mushkila-l5-001:q7': R(trucks_l5001),
  'ex-4am-tarrid-mushkila-l5-001:q8': R(q(truck_l5001).mul(30).div(100).toString()),
  'ex-4am-tarrid-mushkila-l5-001:q9': R(truck_l5001),
  'ex-4am-tarrid-mushkila-l5-002:q1': R(price_l5002),
  'ex-4am-tarrid-mushkila-l5-003:q1': R(wid_l5003.toString()),
  'ex-4am-tarrid-mushkila-l5-003:q2': R(len_l5003),
  'ex-4am-tarrid-mushkila-l5-003:q3': R(aff((x) => q(wid_l5003).mul(x)).a),
  'ex-4am-tarrid-mushkila-l5-003:q4': R(aff((x) => q(wid_l5003).mul(q(len_l5003).sub(x))).a),
  'ex-4am-tarrid-mushkila-l5-003:q5': R(aff((x) => q(wid_l5003).mul(q(len_l5003).sub(x))).b),
  'ex-4am-tarrid-mushkila-l5-003:q6': R(x_l5003),
  'ex-4am-tarrid-mushkila-l5-003:q7': R(small_l5003),
  'ex-4am-tarrid-mushkila-l5-003:q8': R(big_l5003),
  'ex-4am-tarrid-mushkila-l5-003:q9': R(q(big_l5003).mul(40).div(100).toString()),
  'ex-4am-tarrid-mushkila-l5-004:q1': R(price_l5004),
  'ex-4am-tarrid-mushkila-l5-005:q1': R(copies_l5005),
  'ex-4am-tarrid-mushkila-l5-005:q2': R(price_l5005),
  'ex-4am-tarrid-mushkila-l5-006:q1': R(120 * 20),
  'ex-4am-tarrid-mushkila-l5-006:q2': R(first((n) => 120 * n === 4800)),
  'ex-4am-tarrid-mushkila-l5-006:q3': R(70 * first((n) => 120 * n === 4800) + 1600),
  'ex-4am-tarrid-mushkila-l5-006:q4': R(I_l5006.k),
  'ex-4am-tarrid-mushkila-l5-006:q5': C(I_l5006.sym),
  'ex-4am-tarrid-mushkila-l5-006:q6': C(t1_l5006 < t2_l5006 ? 'A' : 'B'),
  'ex-4am-tarrid-mushkila-l5-006:q7': R(Math.abs(t1_l5006 - t2_l5006)),
  'ex-4am-tarrid-mushkila-l5-007:q1': R(wins_l5007),
  'ex-4am-tarrid-mushkila-l5-007:q2': R(30 - 6 - wins_l5007),
  'ex-4am-tarrid-mushkila-l5-007:q3': R(need_l5007),
  'ex-4am-tarrid-mushkila-l5-008:q1': R(tom_l5008),
  'ex-4am-tarrid-mushkila-l5-008:q2': R(2000 - tom_l5008),
  'ex-4am-tarrid-mushkila-l5-008:q3': R(pmin_l5008),
  'ex-4am-tarrid-mushkila-l5-009:q1': R(x_l5009),
  'ex-4am-tarrid-mushkila-l5-009:q2': R(x_l5009 * x_l5009),
  'ex-4am-tarrid-mushkila-l5-009:q3': R(12 * x_l5009),
  'ex-4am-tarrid-mushkila-l5-009:q4': R(pmax_l5009),
  'ex-4am-tarrid-mushkila-l5-010:q1': R(AB_l5010),
  'ex-4am-tarrid-mushkila-l5-010:q2': R(BC_l5010.toString()),
  'ex-4am-tarrid-mushkila-l5-010:q3': R(aff(tri_l5010).b),
  'ex-4am-tarrid-mushkila-l5-010:q4': R(aff(tri_l5010).a),
  'ex-4am-tarrid-mushkila-l5-010:q5': R(aff(trap_l5010).a),
  'ex-4am-tarrid-mushkila-l5-010:q6': R(root((x) => trap_l5010(x).sub(tri_l5010(x).mul(3)))),
};

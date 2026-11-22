// Oracle du banc « tarrid-muthallathiya » au format BEM (unité 10 « حساب المثلثات في المثلث القائم », leçon 4 « حل مشكلات
// وترييض وضعيات بتوظيف النسب المثلثية », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici à
// partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/trigonometry.js) :
//   sin / cos / tan(d)        Math.* d'un angle en DEGRÉS ; asin / acos / atan rendent des degrés ;
//   rnd(x, d)                 l'arrondi demandé (au plus proche, demi vers le haut), écrit avec un point ;
//   q(…), fr(a, b)            rationnels EXACTS (helpers.mjs) pour les rapports et les longueurs exactes (cos = 12/13…) ;
//   sqrtQ(v)                  racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — erreur sinon.
// Modélisation (leçon 4) : chaque situation à plusieurs triangles rectangles est recalculée triangle par triangle, à partir
// des valeurs NON arrondies (la règle « on n'arrondit qu'à la fin » que la banque enseigne) ; la valeur « arrondie trop tôt »
// des feuilles 26–27 est recalculée à part (early) pour prouver qu'elle diffère.
// Questions fermées, décidées par un calcul (une seule option vraie, vérifiée par le test commun) :
//   eqPick(options)        chaque option « fn(angle) = a / b » évaluée sur le triangle MODÈLE (coordonnées construites ici) ;
//   rolePick(…)            le rôle d'un côté (op / adj / hyp) par rapport à un angle, sur des étiquettes de sommets ;
//   bestPick(…)            la seule fonction qui relie les deux côtés connus ;  numPick(v, [..])  l'option numériquement égale ;
//   yes(b)                 A = « نعم », B = « لا ».
// FIGURES : chaque figure DESSINÉE est relue dans son fichier : les longueurs de l'énoncé à UNE échelle (1e-3 près, les
// coordonnées sont arrondies à 1e-4), chaque angle droit, chaque angle marqué en degrés à 0,5° près, un cos / tan imposé,
// points alignés, droites parallèles, milieux. Une figure fausse fait échouer l'import (donc le test).
// Généré avec le banc par le script de l'auteur (Python : math, Decimal) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const DEG = Math.PI / 180;
const sin = (d) => Math.sin(d * DEG);
const cos = (d) => Math.cos(d * DEG);
const tan = (d) => Math.tan(d * DEG);
const asin = (v) => Math.asin(v) / DEG;
const acos = (v) => Math.acos(v) / DEG;
const atan = (v) => Math.atan(v) / DEG;
const hyp = (a, b) => Math.hypot(a, b);
/** L'arrondi demandé (au plus proche, demi vers le haut), écrit avec un point. */
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);
const fr = (a, b) => q(a).div(q(b));
const yes = (b) => C(b ? 'A' : 'B');
function sqrtQ(v) {
  const x = q(v);
  const r = (n) => {
    let s = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (s * s > n) s -= 1n;
    while ((s + 1n) * (s + 1n) <= n) s += 1n;
    if (s * s !== n) throw new Error(`sqrtQ: ${n} n'est pas un carré`);
    return s;
  };
  return q(`${r(x.n)}/${r(x.d)}`);
}
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options vraies`);
  return C('ABCDE'[hits[0]]);
};
const FN = { sin, cos, tan };
/** Options « [fn, angle, a, b] » : vraie si fn(angle) = a / b (a, b nombres). */
function eqPick(options, what) {
  return only(options.map(([f, d, a, b], i) => (Math.abs(FN[f](d) - a / b) < 1e-9 ? i : -1)).filter((i) => i >= 0), what);
}
/** Le rôle d'un côté [XY] pour l'angle de sommet V dans un triangle rectangle en `right`. */
const role = (right, V, side) => (!side.includes(right) ? 'hyp' : !side.includes(V) ? 'op' : 'adj');
const rolePick = (right, V, side, order) => only(order.map((r, i) => (r === role(right, V, side) ? i : -1)).filter((i) => i >= 0), 'rolePick');
function bestPick(right, V, known, fns) {
  const need = { cos: ['adj', 'hyp'], sin: ['op', 'hyp'], tan: ['adj', 'op'] };
  const have = known.map((s) => role(right, V, s)).sort().join();
  return only(fns.map((f, i) => (need[f].slice().sort().join() === have ? i : -1)).filter((i) => i >= 0), 'bestPick');
}
function numPick(target, values) {
  return only(values.map((v, i) => (Math.abs(v - target) < 1e-9 * Math.max(1, Math.abs(target)) ? i : -1)).filter((i) => i >= 0), 'numPick');
}
/** Angle (degrés) au sommet v entre les points a et b. */
const angAt = (a, v, b) => {
  const u = [a[0] - v[0], a[1] - v[1]]; const w = [b[0] - v[0], b[1] - v[1]];
  return acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w)));
};

// ── Les données des énoncés, recalculées ─────────────────────────────────────
// Le cercle de l'exercice 24 (ص 125) : A(−2,5 ; 0), B(2,5 ; 0), C sur le cercle avec AC = 3 ⇒ x_C = −2,5 + 9/5.
const ex24 = (() => {
  const A = [-2.5, 0]; const B = [2.5, 0]; const xc = -2.5 + (3 * 3) / 5; const C = [xc, Math.sqrt(2.5 ** 2 - xc ** 2)];
  const right = [['A', angAt(B, A, C)], ['B', angAt(A, B, C)], ['C', angAt(A, C, B)]].filter(([, a]) => Math.abs(a - 90) < 1e-9).map(([n]) => n);
  if (right.length !== 1) throw new Error('ex24 : angle droit introuvable');
  return { right: right[0], BC: Math.hypot(B[0] - C[0], B[1] - C[1]) };
})();
// L'arrondi trop tôt de l'exercice 26 et de la feuille l2-006 : la cause unique est la valeur arrondie réutilisée.
const earlyCause = (exact, early, d) => (rnd(exact, d) !== rnd(early, d) ? 'A' : null);
// BEM 2010 II : y = x + 2 et x + y = 28 (système résolu en exact), puis cos α = L / y.
const x2010 = q(28).sub(2).div(2);
const y2010 = x2010.add(2);
const L2010 = y2010.mul('0.8');
const l2010 = sqrtQ(y2010.mul(y2010).sub(L2010.mul(L2010)));
const area2010 = x2010.mul(x2010).div(2).add(L2010.mul(l2010)).add(q('3.14').mul(L2010.div(2)).mul(L2010.div(2)).div(2));
// Le tunnel (l5-004), la rivière (l5-003), l'avion (l5-005), le drone (l5-006), la route (l5-007), les panneaux (l5-009).
const SH4 = 600 * tan(35); const HB4 = SH4 / tan(50);
const AT3 = 45 * tan(48);
const DH6 = 150 / tan(25); const GH6 = 150 / tan(60);
const rise7 = 1200 * sin(6) + 800 * sin(10); const run7 = 1200 * cos(6) + 800 * cos(10);
const band9 = 1.8 * cos(30) + (1.8 * sin(30)) / tan(35); const rows9 = Math.floor(16 / band9);

const K = (lv, n, qid) => `ex-4am-tarrid-muthallathiya-l${lv}-${String(n).padStart(3, '0')}:${qid}`;
export const ORACLE = {
  // ── المستوى 1 ──
  [K(1, 1, 'q1')]: eqPick([['cos', 59, 1.6, 1.6 / sin(59)], ['sin', 59, 1.6, 1.6 / sin(59)], ['tan', 59, 1.6, 1.6 / sin(59)], ['sin', 59, 1.6 / sin(59), 1.6]], 'l1-001'),
  [K(1, 1, 'q2')]: R(rnd(1.6 / sin(59), 1)),
  [K(1, 2, 'q1')]: eqPick([['cos', 50, 30 * sin(50), 30], ['tan', 50, 30 * sin(50), 30], ['sin', 50, 30 * sin(50), 30], ['sin', 50, 30, 30 * sin(50)]], 'l1-002'),
  [K(1, 2, 'q2')]: R(rnd(30 * sin(50), 1)),
  [K(1, 3, 'q1')]: rolePick('P', 'E', 'PE', ['op', 'adj', 'hyp']), // P pied du poteau (droit), E bout de l'ombre (angle 35°)
  [K(1, 3, 'q2')]: R(rnd(8 * tan(35), 1)),
  [K(1, 4, 'q1')]: numPick(6 * sin(5), [6 / sin(5), 6 * sin(5), 6 * cos(5), 6 * tan(5)]),
  [K(1, 4, 'q2')]: R(rnd(6 * sin(5), 2)),
  [K(1, 5, 'q1')]: bestPick('A', 'B', ['AB', 'AC'], ['sin', 'cos', 'tan']),
  [K(1, 5, 'q2')]: R(rnd(5 * tan(40), 2)),
  [K(1, 6, 'q1')]: R(180 - 90 - 38),
  [K(1, 6, 'q2')]: R(rnd(10 * sin(38), 2)),
  [K(1, 7, 'q1')]: R(sqrtQ(144 + 81)),
  [K(1, 7, 'q2')]: R(rnd(atan(9 / 12), 0)),
  [K(1, 8, 'q1')]: eqPick([['sin', 36, 10 * tan(36), 10], ['tan', 36, 10 * tan(36), 10], ['tan', 36, 10, 10 * tan(36)]], 'l1-008'),
  [K(1, 8, 'q2')]: R(rnd(10 * tan(36), 1)),
  [K(1, 9, 'q1')]: rolePick('H', 'A', 'HT', ['op', 'adj', 'hyp']), // A départ (angle), H sous le sommet T (droit)
  [K(1, 9, 'q2')]: R(rnd(600 * sin(18), 0)),
  [K(1, 10, 'q1')]: yes(4.1 >= 5),
  [K(1, 10, 'q2')]: R(rnd(5 / cos(35), 1)),
  // ── المستوى 2 ──
  [K(2, 1, 'q1')]: R(rnd(1.6 / tan(59), 2)),
  [K(2, 1, 'q2')]: R(rnd((1.6 / sin(59)) * sin(50), 2)),
  [K(2, 2, 'q1')]: R(fr('2.4', '5.6')),
  [K(2, 2, 'q2')]: R(rnd(atan(2.4 / 5.6), 0)),
  [K(2, 3, 'q1')]: R(fr('3.6', 9)),
  [K(2, 3, 'q2')]: R(rnd(acos(3.6 / 9), 0)),
  [K(2, 3, 'q3')]: R(rnd(9 * sin(acos(3.6 / 9)), 2)),
  [K(2, 4, 'q1')]: R(rnd(asin(1.2 / 3), 0)),
  [K(2, 4, 'q2')]: R(rnd(3 * cos(asin(1.2 / 3)), 2)),
  [K(2, 5, 'q1')]: R(rnd(8 * cos(40), 2)),
  [K(2, 5, 'q2')]: R(rnd(8 * sin(40), 2)),
  [K(2, 6, 'q1')]: R(rnd(4 / sin(52), 1)),
  [K(2, 6, 'q2')]: R(rnd(4 / tan(52), 2)),
  [K(2, 6, 'q3')]: C(earlyCause(4 / tan(52), Math.sqrt(Number(rnd(4 / sin(52), 1)) ** 2 - 16), 2)),
  [K(2, 7, 'q1')]: C('ABC'[['A', 'C', 'B'].indexOf(ex24.right)]),
  [K(2, 7, 'q2')]: R(rnd(asin(3 / 5), 0)),
  [K(2, 8, 'q1')]: R(sqrtQ(25 - 9)),
  [K(2, 8, 'q2')]: R(rnd(acos(3 / 5), 0)),
  [K(2, 9, 'q1')]: R(rnd(atan(18 / 25), 0)),
  [K(2, 9, 'q2')]: R(rnd(hyp(18, 25), 1)),
  [K(2, 10, 'q1')]: R(rnd(5 / sin(28), 2)),
  [K(2, 10, 'q2')]: R(rnd(5 / tan(28), 2)),
  // ── المستوى 3 ──
  [K(3, 1, 'q1')]: R(rnd(6 * sin(18), 1)),
  [K(3, 1, 'q2')]: R(rnd(6 * cos(18), 1)),
  [K(3, 1, 'q3')]: R(rnd(6 * sin(90 - 18), 1)),
  [K(3, 2, 'q1')]: R(rnd(9 / tan(32), 2)),
  [K(3, 2, 'q2')]: R(rnd(9 / sin(32), 1)),
  [K(3, 2, 'q3')]: R(rnd(9 / cos(90 - 32), 1)),
  [K(3, 2, 'q4')]: R(rnd(hyp(14.4, 9), 1)),
  // BEM 2014 I-3 : AB = 22 tan 25° arrondi à l'unité ; les aires avec AB = 10 (comme le livret).
  [K(3, 3, 'q1')]: R(rnd(22 * tan(25), 0)),
  [K(3, 3, 'q2')]: R(q(12).add(22).mul(rnd(22 * tan(25), 0)).div(2)),
  [K(3, 3, 'q3')]: R(q(rnd(22 * tan(25), 0)).mul(22).div(2)),
  [K(3, 3, 'q4')]: R(q(12).add(22).mul(10).div(2).sub(q(10).mul(22).div(2))),
  [K(3, 4, 'q1')]: R(sqrtQ((2 - 6) ** 2 + (1 - 4) ** 2)),
  [K(3, 4, 'q2')]: R(sqrtQ((-4 - 2) ** 2 + (9 - 1) ** 2)),
  [K(3, 4, 'q4')]: R(rnd(atan(Math.hypot(-6, 8) / Math.hypot(-4, -3)), 0)),
  [K(3, 5, 'q1')]: R(rnd(290 * tan(31), 0)),
  [K(3, 5, 'q2')]: R(rnd(290 / cos(31), 0)),
  [K(3, 5, 'q3')]: R(rnd(290 - (290 * tan(31)) / tan(45), 0)),
  [K(3, 6, 'q1')]: R(q(6).mul(fr(5, 12))),
  [K(3, 6, 'q2')]: R(sqrtQ(q(36).add(q('2.5').mul('2.5')))),
  [K(3, 6, 'q3')]: R(q(6).div(sqrtQ(q(36).add(q('2.5').mul('2.5'))))),
  [K(3, 6, 'q4')]: R(q('2.5').div(sqrtQ(q(36).add(q('2.5').mul('2.5'))))),
  [K(3, 6, 'q5')]: R(rnd(atan(5 / 12), 0)),
  [K(3, 7, 'q1')]: R(90 - (180 - 30) / 2),
  [K(3, 7, 'q2')]: R(rnd(10 * cos(90 - (180 - 30) / 2), 2)),
  [K(3, 7, 'q3')]: R(rnd(10 * sin(90 - (180 - 30) / 2), 2)),
  [K(3, 8, 'q1')]: R(fr('10.35', '4.5')),
  [K(3, 8, 'q2')]: R(rnd(asin(2.3 / 2.7), 0)),
  [K(3, 8, 'q3')]: R(rnd(180 - asin(2.3 / 2.7), 0)),
  [K(3, 9, 'q1')]: R(q(250).mul('0.28')),
  [K(3, 9, 'q2')]: R(sqrtQ(q(250).mul(250).sub(q(70).mul(70)))),
  [K(3, 9, 'q3')]: R(rnd(asin(0.28), 1)),
  [K(3, 10, 'q3')]: R(rnd(acos((2.4 + 1) / (1.25 + 3)), 0)),
  // ── المستوى 4 ──
  [K(4, 1, 'q1')]: R(rnd(6 * sin(18), 1)),
  [K(4, 1, 'q2')]: R(rnd(6 * cos(18), 1)),
  [K(4, 1, 'q3')]: R(rnd(Number(rnd(6 * sin(18), 1)) / tan(18), 1)),
  [K(4, 1, 'q4')]: R(rnd((6 * sin(18)) / tan(18), 1)),
  [K(4, 1, 'q5')]: C(earlyCause((6 * sin(18)) / tan(18), Number(rnd(6 * sin(18), 1)) / tan(18), 1)),
  [K(4, 2, 'q1')]: C('ABC'[['C', 'A', 'iso'].indexOf(ex24.right)]),
  [K(4, 2, 'q2')]: R(rnd(ex24.BC, 6)),
  [K(4, 2, 'q3')]: R(rnd(acos(3 / 5), 0)),
  [K(4, 2, 'q4')]: R(rnd(90 - acos(3 / 5), 0)),
  [K(4, 3, 'q1')]: R(90 - 35),
  [K(4, 3, 'q2')]: R(rnd(12 * cos(35), 2)),
  [K(4, 3, 'q3')]: R(rnd(12 * sin(35), 2)),
  [K(4, 3, 'q4')]: R(rnd(Number(rnd(12 * cos(35), 2)) ** 2 + Number(rnd(12 * sin(35), 2)) ** 2, 0)),
  [K(4, 4, 'q1')]: C(7 * 7 + 24 * 24 === 25 * 25 ? 'A' : 'C'),
  [K(4, 4, 'q2')]: R(rnd(atan(7 / 24), 0)),
  [K(4, 4, 'q3')]: R(rnd(90 - atan(7 / 24), 0)),
  [K(4, 4, 'q4')]: R(q(24).mul(fr(7, 25))),
  [K(4, 5, 'q1')]: R(sqrtQ(100 - 36)),
  [K(4, 5, 'q2')]: R(rnd(acos(6 / 10), 0)),
  [K(4, 5, 'q3')]: R(rnd(2 * asin(6 / 10), 0)),
  [K(4, 6, 'q1')]: R(rnd(hyp(3.5, 2), 2)),
  [K(4, 6, 'q2')]: R(rnd(atan(2 / 3.5), 1)),
  [K(4, 6, 'q3')]: R(rnd(2 * atan(2 / 3.5), 0)),
  [K(4, 7, 'q1')]: R(rnd(50 * sin(50), 2)),
  [K(4, 7, 'q2')]: R(rnd(50 * cos(50), 2)),
  [K(4, 7, 'q3')]: R(rnd(80 * 50 * sin(50), 0)),
  [K(4, 8, 'q1')]: R(q(80).mul('0.75')),
  [K(4, 8, 'q2')]: R(sqrtQ(q(80).mul(80).add(q(80).mul('0.75').mul(q(80).mul('0.75'))))),
  [K(4, 8, 'q3')]: R(q(48).mul(q(80).mul('0.75')).div(80)),
  [K(4, 8, 'q4')]: R(q(48).mul('0.75')),
  [K(4, 8, 'q5')]: R(q(48).add(q(48).mul('0.75')).add(sqrtQ(q(48).mul(48).add(q(36).mul(36))))),
  [K(4, 8, 'q6')]: R(q(2).mul(q(80).add(60).add(100)).sub(q(3).mul(q(48).add(36).add(60)))),
  [K(4, 9, 'q2')]: R(q(120).mul(50).div(2)),
  [K(4, 9, 'q3')]: R(rnd((120 * 50) / 130, 2)),
  [K(4, 9, 'q4')]: R(fr(50, 130)),
  [K(4, 9, 'q5')]: R(rnd(120 * (50 / 130), 2)),
  [K(4, 9, 'q6')]: R(rnd(120 * (120 / 130), 2)),
  [K(4, 10, 'q1')]: R(fr(6, 10)),
  [K(4, 10, 'q2')]: R(rnd(acos(0.6), 0)),
  [K(4, 10, 'q3')]: R(q(6).mul(fr(6, 10))),
  [K(4, 10, 'q4')]: R(sqrtQ(100 - 36)),
  [K(4, 10, 'q5')]: R(q(6).mul(fr(8, 10))),
  // ── المستوى 5 ──
  [K(5, 1, 'q1')]: R(x2010),
  [K(5, 1, 'q2')]: R(L2010),
  [K(5, 1, 'q3')]: R(l2010),
  [K(5, 1, 'q4')]: R(area2010),
  [K(5, 1, 'q5')]: R(area2010.mul(800)),
  [K(5, 2, 'q1')]: R(rnd(60 * tan(32), 2)),
  [K(5, 2, 'q2')]: R(rnd(1.6 + 60 * tan(32), 1)),
  [K(5, 2, 'q3')]: R(rnd(60 - (60 * tan(32)) / tan(50), 1)),
  [K(5, 3, 'q1')]: R(rnd(AT3, 1)),
  [K(5, 3, 'q2')]: R(rnd(45 / cos(48), 1)),
  [K(5, 3, 'q3')]: R(rnd(AT3 / tan(30) - 45, 1)),
  [K(5, 3, 'q4')]: R(rnd(AT3 / sin(30), 0)),
  [K(5, 4, 'q1')]: R(rnd(SH4, 0)),
  [K(5, 4, 'q2')]: R(rnd(HB4, 0)),
  [K(5, 4, 'q3')]: R(rnd(600 + HB4, 0)),
  [K(5, 4, 'q4')]: R(Math.ceil((600 + HB4) / (8 + 8))),
  [K(5, 5, 'q1')]: R(rnd(2000 * tan(12), 0)),
  [K(5, 5, 'q2')]: R(rnd(2000 * tan(12) - 60, 0)),
  [K(5, 5, 'q3')]: R(rnd(2000 / cos(12), 0)),
  [K(5, 5, 'q4')]: R(rnd(3000 / tan(12) / 1000, 1)),
  [K(5, 6, 'q1')]: R(rnd(DH6, 0)),
  [K(5, 6, 'q2')]: R(rnd(GH6, 0)),
  [K(5, 6, 'q3')]: R(rnd(DH6 - GH6, 0)),
  [K(5, 6, 'q4')]: R(rnd(150 / sin(60), 1)),
  [K(5, 6, 'q5')]: R(rnd((DH6 - GH6) / 8, 0)),
  [K(5, 7, 'q1')]: R(rnd(1200 * sin(6), 1)),
  [K(5, 7, 'q2')]: R(rnd(1150 + rise7, 0)),
  [K(5, 7, 'q3')]: R(rnd(run7, 0)),
  [K(5, 7, 'q4')]: R(rnd(atan(rise7 / run7), 1)),
  [K(5, 8, 'q1')]: R(rnd(2.4 * cos(40), 2)),
  [K(5, 8, 'q2')]: R(rnd(0.5 + 2.4 * (1 - cos(40)), 2)),
  [K(5, 8, 'q3')]: R(rnd(2.4 * (sin(40) + sin(25)), 2)),
  [K(5, 8, 'q4')]: R(rnd(2.4 * (cos(25) - cos(40)), 2)),
  [K(5, 9, 'q1')]: R(q('1.8').mul(fr(1, 2))),
  [K(5, 9, 'q2')]: R(rnd(1.8 * cos(30), 2)),
  [K(5, 9, 'q3')]: R(rnd((1.8 * sin(30)) / tan(35), 2)),
  [K(5, 9, 'q4')]: R(rows9),
  [K(5, 9, 'q5')]: R(rows9 * 10 * 24500),
  [K(5, 10, 'q1')]: R(rnd(atan((8 - 1.2) / 12), 1)),
  [K(5, 10, 'q2')]: R(rnd(atan((2 - 1.2) / 12), 1)),
  [K(5, 10, 'q3')]: R(rnd(atan((8 - 1.2) / 12) - atan((2 - 1.2) / 12), 1)),
  [K(5, 10, 'q4')]: R(rnd((8 - 1.2) / tan(30), 1)),
};

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur de l'énoncé] (une seule échelle par figure), `angles` [from, at, to,
 * degrés], `cos` / `tan` [from, at, to, valeur], `collinear` [P, Q, R], `parallel` [A, B, C, D] ((AB) ∥ (CD)),
 * `mid` [M, A, B].
 */
export const FIGURES = {
  'ex-4am-tarrid-muthallathiya-l1-001': { lengths: [['W', 'T', 1.6], ['F', 'T', 1.6 / sin(59)]], angles: [['T', 'F', 'W', 59]] },
  'ex-4am-tarrid-muthallathiya-l1-005': { lengths: [['A', 'B', 5]], angles: [['C', 'B', 'A', 40]] },
  'ex-4am-tarrid-muthallathiya-l1-008': { lengths: [['P', 'O', 10]], angles: [['T', 'O', 'P', 36]] },
  'ex-4am-tarrid-muthallathiya-l2-001': { lengths: [['W', 'T', 1.6]], angles: [['T', 'F', 'W', 59]] },
  'ex-4am-tarrid-muthallathiya-l2-002': { lengths: [['P', 'H', 5.6], ['H', 'Q', 2.4]] },
  'ex-4am-tarrid-muthallathiya-l2-003': { lengths: [['P', 'A', 3.6], ['A', 'S', 9]] },
  'ex-4am-tarrid-muthallathiya-l2-005': { lengths: [['B', 'C', 8]], angles: [['C', 'B', 'A', 40]] },
  'ex-4am-tarrid-muthallathiya-l2-010': { lengths: [['D', 'F', 5]], angles: [['F', 'E', 'D', 28]] },
  'ex-4am-tarrid-muthallathiya-l3-001': { lengths: [['B', 'C', 6]], angles: [['C', 'B', 'A', 18]] },
  'ex-4am-tarrid-muthallathiya-l3-002': { lengths: [['M', 'F', 9]], angles: [['F', 'S', 'M', 32]] },
  'ex-4am-tarrid-muthallathiya-l3-003': { lengths: [['A', 'D', 12], ['B', 'C', 22]], angles: [['A', 'C', 'B', 25]], parallel: [['A', 'D', 'B', 'C']] },
  'ex-4am-tarrid-muthallathiya-l3-006': { lengths: [['A', 'H', 6]], tan: [['H', 'A', 'B', 5 / 12]] },
  'ex-4am-tarrid-muthallathiya-l3-007': { lengths: [['A', 'C', 10], ['B', 'D', 10]], angles: [['D', 'O', 'A', 30]], mid: [['O', 'A', 'C'], ['O', 'B', 'D']], parallel: [['A', 'B', 'D', 'C'], ['A', 'D', 'B', 'C']] },
  'ex-4am-tarrid-muthallathiya-l3-008': { lengths: [['B', 'C', 2.7], ['D', 'C', 4.5], ['A', 'D', 2.7], ['A', 'H', 2.3], ['A', 'B', 4.5]], parallel: [['A', 'B', 'D', 'C']], collinear: [['D', 'H', 'C']] },
  'ex-4am-tarrid-muthallathiya-l3-010': { lengths: [['C', 'B', 1.25], ['B', 'A', 3], ['A', 'E', 2.4], ['E', 'D', 1], ['C', 'D', 2.55]], collinear: [['A', 'B', 'C'], ['A', 'E', 'D']] },
  'ex-4am-tarrid-muthallathiya-l4-001': { lengths: [['B', 'C', 6]], angles: [['C', 'B', 'A', 18]] },
  'ex-4am-tarrid-muthallathiya-l4-008': { lengths: [['A', 'D', 48], ['A', 'B', 80]], tan: [['A', 'B', 'C', 0.75]], parallel: [['D', 'E', 'B', 'C']], collinear: [['A', 'D', 'B'], ['A', 'E', 'C']] },
  'ex-4am-tarrid-muthallathiya-l4-010': { lengths: [['A', 'B', 6], ['B', 'C', 10]], collinear: [['B', 'H', 'C']] },
  'ex-4am-tarrid-muthallathiya-l5-001': {
    lengths: [['A', 'B', 12], ['B', 'C', 9], ['A', 'C', 15], ['E', 'G', 13], ['E', 'F', 13 / Math.SQRT2], ['F', 'G', 13 / Math.SQRT2], ['K', 'G', 13 / Math.SQRT2]],
    cos: [['B', 'A', 'C', 0.8]], collinear: [['D', 'E', 'C'], ['D', 'F', 'C']],
  },
  'ex-4am-tarrid-muthallathiya-l5-002': { lengths: [['E', 'K', 60]], angles: [['K', 'E', 'S', 32], ['K', 'F', 'S', 50]], collinear: [['E', 'F', 'K']] },
  'ex-4am-tarrid-muthallathiya-l5-003': { lengths: [['A', 'B', 45]], angles: [['A', 'B', 'T', 48], ['A', 'C', 'T', 30]], collinear: [['A', 'B', 'C']] },
  'ex-4am-tarrid-muthallathiya-l5-004': { lengths: [['A', 'H', 600]], angles: [['H', 'A', 'S', 35], ['H', 'B', 'S', 50]], collinear: [['A', 'H', 'B']] },
  'ex-4am-tarrid-muthallathiya-l5-006': { lengths: [['H', 'F', 150]], angles: [['H', 'D', 'F', 25], ['H', 'G', 'F', 60]], collinear: [['D', 'G', 'H']] },
  'ex-4am-tarrid-muthallathiya-l5-008': { lengths: [['O', 'P', 2.4], ['O', 'Q', 2.4], ['O', 'M', 2.4]], angles: [['M', 'O', 'P', 40], ['Q', 'O', 'M', 25]], collinear: [['O', 'H', 'M'], ['O', 'K', 'M']] },
  'ex-4am-tarrid-muthallathiya-l5-010': { lengths: [['E', 'K', 12], ['K', 'B', 0.8], ['K', 'T', 6.8]], collinear: [['K', 'B', 'T']] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/tarrid-muthallathiya');
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-tarrid-muthallathiya-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) {
      if (/المقابل|الموالي/.test(ex.statement?.content ?? '')) problems.push(`${id}: « الشكل المقابل » sans figure`);
      if (FIGURES[id]) problems.push(`${id}: contrôle de figure sans figure`);
      continue;
    }
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const d = (a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
    const angle = (a, v, b) => angAt(Pt[a], Pt[v], Pt[b]);
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(a, b) / Number(v));
    if (scales.some((s) => Math.abs(s / scales[0] - 1) > 1e-3)) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, v, b, deg] of spec.angles ?? []) {
      if (Math.abs(angle(a, v, b) - deg) > 0.5) problems.push(`${id}: angle ${a}${v}${b} = ${angle(a, v, b)}° ≠ ${deg}°`);
    }
    for (const [a, v, b, c] of spec.cos ?? []) if (Math.abs(cos(angle(a, v, b)) - c) > 1e-3) problems.push(`${id}: cos ${a}${v}${b} ≠ ${c}`);
    for (const [a, v, b, t] of spec.tan ?? []) if (Math.abs(tan(angle(a, v, b)) - t) > 1e-3) problems.push(`${id}: tan ${a}${v}${b} ≠ ${t}`);
    for (const [a, b, c] of spec.collinear ?? []) {
      const cr = (Pt[b][0] - Pt[a][0]) * (Pt[c][1] - Pt[a][1]) - (Pt[b][1] - Pt[a][1]) * (Pt[c][0] - Pt[a][0]);
      if (Math.abs(cr) > 1e-3 * d(a, c) * d(a, c)) problems.push(`${id}: ${a}, ${b}, ${c} non alignés`);
    }
    for (const [a, b, c, e] of spec.parallel ?? []) {
      const u = [Pt[b][0] - Pt[a][0], Pt[b][1] - Pt[a][1]]; const w = [Pt[e][0] - Pt[c][0], Pt[e][1] - Pt[c][1]];
      if (Math.abs(u[0] * w[1] - u[1] * w[0]) > 1e-3 * Math.hypot(...u) * Math.hypot(...w)) problems.push(`${id}: (${a}${b}) non parallèle à (${c}${e})`);
    }
    for (const [m, a, b] of spec.mid ?? []) {
      if (Math.hypot(Pt[m][0] - (Pt[a][0] + Pt[b][0]) / 2, Pt[m][1] - (Pt[a][1] + Pt[b][1]) / 2) > 1e-3) problems.push(`${id}: ${m} n'est pas le milieu de [${a}${b}]`);
    }
    for (const [a, v, b] of fig.rightAngles ?? []) {
      if (Math.abs(angle(a, v, b) - 90) > 0.01) problems.push(`${id}: angle droit ${a}${v}${b} faux`);
    }
    for (const a of fig.angles ?? []) {
      const m = /^(\d+)°$/.exec(a.label ?? '');
      if (!m) continue;
      if (!(spec.angles ?? []).some(([f, v, t, deg]) => v === a.at && deg === Number(m[1]) && [f, t].sort().join() === [a.from, a.to].sort().join())) {
        problems.push(`${id}: l'angle marqué ${a.label} en ${a.at} n'est pas contrôlé`);
      }
    }
  }
}
if (problems.length) throw new Error(`oracle tarrid-muthallathiya — figures inexactes :\n${problems.join('\n')}`);

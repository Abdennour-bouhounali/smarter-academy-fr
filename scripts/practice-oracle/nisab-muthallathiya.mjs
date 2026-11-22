// Oracle du banc « nisab-muthallathiya » au format BEM (unité 10 « حساب المثلثات في المثلث القائم », leçon 1 « النسب
// المثلثية لزاوية حادة في مثلث قائم », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici à
// partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/trigonometry.js) :
//   fr(a, b)            un rapport EXACT a / b (rationnels de helpers.mjs) : cos = 3/5, tan = 4/3… ;
//   sin / cos / tan(d)  Math.sin / cos / tan d'un angle en DEGRÉS ; rnd(x, d) l'arrondi demandé (au plus proche) ;
//   sqrtQ(v)            racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — erreur sinon ;
//   un angle (étape de la leçon 2, counted:false) : Math.asin / acos / atan en degrés, arrondi à l'unité.
// Questions fermées, décidées par un calcul (une seule option vraie, vérifiée par le test commun) :
//   ratioPick(droit, V, fn, ['AC/BC', …])  sur un triangle rectangle canonique (droit en l'origine, V à 3, le troisième
//                                         sommet à 7) : l'option dont le rapport de côtés vaut fn(V) ;
//   wordPick(fn, ['op/hyp', …])           la définition en mots (op, adj, hyp) qui vaut fn ;
//   sidePick(droit, V, 'hyp'|'op'|'adj', ['AB', …])  le côté demandé ; bestPick(…) le rapport qui relie les côtés connus ;
//   numPick(valeur, [options])            l'option numériquement égale (valeurs exactes en √, expressions de longueur) ;
//   yes(b)                                A = « نعم », B = « لا ».
// FIGURES : chaque figure DESSINÉE est relue dans son fichier : les longueurs de l'énoncé à UNE échelle (à 1e-3 près, les
// coordonnées sont arrondies à 1e-4), chaque angle droit, chaque angle marqué en degrés à 0,5° près de sa mesure, un
// cosinus imposé (cos α = 0,6), les points d'un cercle. Une figure fausse fait échouer l'import (donc le test).
// Généré avec le banc par le script de l'auteur (Python : math, fractions, Decimal) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const D = Math.PI / 180;
const sin = (d) => Math.sin(d * D);
const cos = (d) => Math.cos(d * D);
const tan = (d) => Math.tan(d * D);
/** L'arrondi demandé (au plus proche, demi vers le haut), écrit avec un point. */
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);
const fr = (a, b) => q(a).div(q(b));
const yes = (b) => C(b ? 'A' : 'B');
const inOpen01 = (x) => x > 0 && x < 1;
function sqrtQ(v) {
  const x = q(v);
  const r = (n) => {
    if (n < 0n) throw new Error('sqrtQ: négatif');
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
/** Le triangle rectangle canonique : sommet droit en (0 ; 0), V en (3 ; 0), le troisième en (0 ; 7). */
function canon(right, V, letters) {
  const third = [...new Set(letters)].filter((l) => l !== right && l !== V);
  if (third.length !== 1) throw new Error(`triangle ${right}${V}? : ${letters}`);
  return { [right]: [0, 0], [V]: [3, 0], [third[0]]: [0, 7] };
}
const FNV = { cos: 3 / Math.sqrt(58), sin: 7 / Math.sqrt(58), tan: 7 / 3 };
function ratioPick(right, V, fn, options) {
  const P = canon(right, V, options.join('').replace(/[^A-Z]/g, '').split(''));
  const len = (s) => Math.hypot(P[s[0]][0] - P[s[1]][0], P[s[0]][1] - P[s[1]][1]);
  const vals = options.map((o) => { const [a, b] = o.split('/'); return len(a) / len(b); });
  return only(vals.map((v, i) => (Math.abs(v - FNV[fn]) < 1e-12 ? i : -1)).filter((i) => i >= 0), `ratioPick ${fn}`);
}
function wordPick(fn, descs) {
  const L = { op: 7, adj: 3, hyp: Math.sqrt(58) };
  const vals = descs.map((d) => { const [a, b] = d.split('/'); return L[a] / L[b]; });
  return only(vals.map((v, i) => (Math.abs(v - FNV[fn]) < 1e-12 ? i : -1)).filter((i) => i >= 0), `wordPick ${fn}`);
}
const role = (right, V, side) => (!side.includes(right) ? 'hyp' : !side.includes(V) ? 'op' : 'adj');
function sidePick(right, V, kind, order) {
  return only(order.map((s, i) => (role(right, V, s) === kind ? i : -1)).filter((i) => i >= 0), `sidePick ${kind}`);
}
function bestPick(right, V, known, fns) {
  const need = { cos: ['adj', 'hyp'], sin: ['op', 'hyp'], tan: ['op', 'adj'] };
  const have = known.map((s) => role(right, V, s)).sort().join();
  return only(fns.map((f, i) => (need[f].slice().sort().join() === have ? i : -1)).filter((i) => i >= 0), 'bestPick');
}
function numPick(target, values) {
  return only(values.map((v, i) => (Math.abs(v - target) < 1e-12 * Math.max(1, Math.abs(target)) ? i : -1)).filter((i) => i >= 0), 'numPick');
}

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-nisab-muthallathiya-l1-001:q1': sidePick('A', 'C', 'hyp', ["AB", "BC", "AC"]),
  'ex-4am-nisab-muthallathiya-l1-001:q2': sidePick('A', 'C', 'op', ["AC", "BC", "AB"]),
  'ex-4am-nisab-muthallathiya-l1-002:q1': sidePick('A', 'C', 'adj', ["AB", "AC", "BC"]),
  'ex-4am-nisab-muthallathiya-l1-002:q2': ratioPick('A', 'C', 'cos', ["AB/BC", "BC/AC", "AC/BC", "AC/AB"]),
  'ex-4am-nisab-muthallathiya-l1-003:q1': ratioPick('S', 'K', 'cos', ["JS/JK", "SK/JK", "JK/SK", "SK/JS"]),
  'ex-4am-nisab-muthallathiya-l1-003:q2': R(rnd(10 * cos(55), 2)),
  'ex-4am-nisab-muthallathiya-l1-004:q1': wordPick('cos', ['op/hyp', 'hyp/adj', 'adj/hyp']),
  'ex-4am-nisab-muthallathiya-l1-004:q2': wordPick('sin', ['op/hyp', 'adj/hyp', 'op/adj']),
  'ex-4am-nisab-muthallathiya-l1-005:q1': wordPick('tan', ['op/hyp', 'op/adj', 'adj/op']),
  'ex-4am-nisab-muthallathiya-l1-005:q2': ratioPick('A', 'B', 'tan', ["AB/AC", "AC/BC", "AB/BC", "AC/AB"]),
  'ex-4am-nisab-muthallathiya-l1-006:q1': ratioPick('O', 'M', 'cos', ["OM/MB", "OB/MB", "MB/OM", "OM/OB"]),
  'ex-4am-nisab-muthallathiya-l1-006:q2': ratioPick('O', 'M', 'tan', ["OM/OB", "OB/MB", "OB/OM", "OM/MB"]),
  'ex-4am-nisab-muthallathiya-l1-007:q1': ratioPick('M', 'L', 'sin', ["LM/LN", "LN/MN", "MN/LM", "MN/LN"]),
  'ex-4am-nisab-muthallathiya-l1-007:q2': ratioPick('M', 'L', 'cos', ["MN/LN", "LM/LN", "LN/LM", "LM/MN"]),
  'ex-4am-nisab-muthallathiya-l1-008:q1': yes(inOpen01(1.5)),
  'ex-4am-nisab-muthallathiya-l1-009:q1': yes(inOpen01(1.35)),
  'ex-4am-nisab-muthallathiya-l1-009:q2': yes(inOpen01(-0.35)),
  'ex-4am-nisab-muthallathiya-l1-009:q3': yes(2.5 > 0),
  'ex-4am-nisab-muthallathiya-l1-010:q1': R(fr("4.5", "7.5")),
  // ── المستوى 2 ──
  'ex-4am-nisab-muthallathiya-l2-001:q2': R(fr(3, 5)),
  'ex-4am-nisab-muthallathiya-l2-001:q3': R(fr(4, 5)),
  'ex-4am-nisab-muthallathiya-l2-001:q4': R(fr(4, 3)),
  'ex-4am-nisab-muthallathiya-l2-002:q2': R(q(8).mul(15).div(2)),
  'ex-4am-nisab-muthallathiya-l2-002:q3': R(fr(8, 17)),
  'ex-4am-nisab-muthallathiya-l2-002:q4': R(fr(15, 17)),
  'ex-4am-nisab-muthallathiya-l2-003:q2': R(fr("3.5", "3.7")),
  'ex-4am-nisab-muthallathiya-l2-003:q3': R(fr("1.2", "3.7")),
  'ex-4am-nisab-muthallathiya-l2-003:q4': R(fr("1.2", "3.5")),
  'ex-4am-nisab-muthallathiya-l2-004:q2': R(fr("10.4", "7.8")),
  'ex-4am-nisab-muthallathiya-l2-004:q3': R(fr("7.8", "10.4")),
  'ex-4am-nisab-muthallathiya-l2-005:q1': R(q(20).mul(fr(21, 20))),
  'ex-4am-nisab-muthallathiya-l2-005:q2': R(sqrtQ(q(20).mul(20).add(q(21).mul(21)))),
  'ex-4am-nisab-muthallathiya-l2-005:q3': R(fr(21, 29)),
  'ex-4am-nisab-muthallathiya-l2-005:q4': R(fr(20, 29)),
  'ex-4am-nisab-muthallathiya-l2-006:q1': R(q(24).div("0.96")),
  'ex-4am-nisab-muthallathiya-l2-006:q2': R(sqrtQ(q(25).mul(25).sub(q(24).mul(24)))),
  'ex-4am-nisab-muthallathiya-l2-006:q3': R(fr(7, 24)),
  'ex-4am-nisab-muthallathiya-l2-007:q1': R(fr(3, 5)),
  'ex-4am-nisab-muthallathiya-l2-007:q2': R(q("7.5").mul(fr(3, 5))),
  'ex-4am-nisab-muthallathiya-l2-008:q1': R(q(180).sub(90).div(2)),
  'ex-4am-nisab-muthallathiya-l2-008:q2': R(rnd(6 * sin(45), 1)),
  'ex-4am-nisab-muthallathiya-l2-009:q1': numPick(3 / Math.sqrt(13), [2 / Math.sqrt(13), 3 / Math.sqrt(13), 0.83, Math.sqrt(13) / 3]),
  'ex-4am-nisab-muthallathiya-l2-009:q2': R(fr(3, 2)),
  'ex-4am-nisab-muthallathiya-l2-010:q1': numPick(3 / (3 * Math.sqrt(3)), [Math.sqrt(3), 0.58, Math.sqrt(3) / 3, Math.sqrt(3) / 2]),
  'ex-4am-nisab-muthallathiya-l2-010:q2': numPick(3 * Math.sqrt(3) / 6, [1 / 2, Math.sqrt(3) / 2, 2 * Math.sqrt(3) / 3, 0.87]),
  // ── المستوى 3 ──
  'ex-4am-nisab-muthallathiya-l3-001:q1': ratioPick('A', 'B', 'sin', ["AB/BC", "AC/BC", "BC/AC", "AC/AB"]),
  'ex-4am-nisab-muthallathiya-l3-001:q2': R(rnd(2.5 / sin(25), 2)),
  'ex-4am-nisab-muthallathiya-l3-001:q3': R(rnd(2.5 / tan(25), 2)),
  'ex-4am-nisab-muthallathiya-l3-002:q1': ratioPick('S', 'R', 'cos', ["ST/RT", "RT/RS", "RS/ST", "RS/RT"]),
  'ex-4am-nisab-muthallathiya-l3-002:q2': R(rnd(3.5 * cos(37), 1)),
  'ex-4am-nisab-muthallathiya-l3-002:q3': R(rnd(3.5 * sin(37), 1)),
  'ex-4am-nisab-muthallathiya-l3-003:q1': ratioPick('F', 'E', 'tan', ["FG/EF", "EF/FG", "FG/EG", "EF/EG"]),
  'ex-4am-nisab-muthallathiya-l3-003:q2': R(rnd(4.5 * tan(53), 2)),
  'ex-4am-nisab-muthallathiya-l3-003:q3': R(rnd(4.5 / cos(53), 2)),
  'ex-4am-nisab-muthallathiya-l3-004:q1': ratioPick('A', 'B', 'cos', ["AC/BC", "BC/AB", "AB/BC", "AB/AC"]),
  'ex-4am-nisab-muthallathiya-l3-004:q2': ratioPick('H', 'B', 'cos', ["AH/AB", "BH/AB", "AB/BH", "BH/AH"]),
  'ex-4am-nisab-muthallathiya-l3-005:q1': R(q(8).div("0.8")),
  'ex-4am-nisab-muthallathiya-l3-005:q2': R(sqrtQ(q(8).div("0.8").mul(q(8).div("0.8")).sub(64))),
  'ex-4am-nisab-muthallathiya-l3-005:q3': R(rnd(8 * 4 / Math.sqrt((8 / 0.8) ** 2 - 8 ** 2), 0)),
  'ex-4am-nisab-muthallathiya-l3-006:q1': R(q("4.8").div(fr(4, 3))),
  'ex-4am-nisab-muthallathiya-l3-006:q2': R(sqrtQ(q("4.8").mul("4.8").add(q("4.8").div(fr(4, 3)).mul(q("4.8").div(fr(4, 3)))))),
  'ex-4am-nisab-muthallathiya-l3-006:q3': R(sqrtQ(q("4.8").mul("4.8").add(q("4.8").div(fr(4, 3)).mul(q("4.8").div(fr(4, 3))))).div(2)),
  'ex-4am-nisab-muthallathiya-l3-006:q4': R(q("4.8").div("1.6")),
  'ex-4am-nisab-muthallathiya-l3-007:q1': ratioPick('A', 'B', 'sin', ["AB/BC", "BC/AC", "AC/BC", "AC/AB"]),
  'ex-4am-nisab-muthallathiya-l3-007:q2': R(rnd(5.2 * sin(23), 1)),
  'ex-4am-nisab-muthallathiya-l3-007:q3': R(rnd(5.2 * cos(23), 1)),
  'ex-4am-nisab-muthallathiya-l3-008:q1': R(fr(17, 14)),
  'ex-4am-nisab-muthallathiya-l3-008:q2': numPick(14 / Math.hypot(14, 17), [14 / Math.sqrt(485), 17 / Math.sqrt(485), Math.sqrt(485) / 14, 14 / 31]),
  'ex-4am-nisab-muthallathiya-l3-008:q3': R(rnd(14 / Math.hypot(14, 17), 2)),
  'ex-4am-nisab-muthallathiya-l3-008:q4': R(rnd(17 / Math.hypot(14, 17), 2)),
  'ex-4am-nisab-muthallathiya-l3-009:q1': bestPick('B', 'A', ['BC', 'AC'], ['cos', 'sin', 'tan']),
  'ex-4am-nisab-muthallathiya-l3-009:q2': R(fr("8.4", "10.5")),
  'ex-4am-nisab-muthallathiya-l3-009:q3': R(rnd(Math.asin(0.8) / D, 0)),
  'ex-4am-nisab-muthallathiya-l3-010:q1': R(fr(6, q(8).div(2))),
  'ex-4am-nisab-muthallathiya-l3-010:q2': R(rnd(Math.atan(1.5) / D, 0)),
  // ── المستوى 4 ──
  'ex-4am-nisab-muthallathiya-l4-001:q1': ratioPick('B', 'C', 'sin', ["AB/AC", "BC/AC", "AC/AB", "AB/BC"]),
  'ex-4am-nisab-muthallathiya-l4-001:q2': R(rnd(7 / sin(35), 2)),
  'ex-4am-nisab-muthallathiya-l4-001:q3': R(rnd(7 / tan(35), 1)),
  'ex-4am-nisab-muthallathiya-l4-002:q1': R(q(180).sub(90).sub(72)),
  'ex-4am-nisab-muthallathiya-l4-002:q2': ratioPick('Q', 'P', 'tan', ["PQ/QR", "QR/PQ", "QR/PR", "PQ/PR"]),
  'ex-4am-nisab-muthallathiya-l4-002:q3': R(rnd(2.8 / tan(72), 1)),
  'ex-4am-nisab-muthallathiya-l4-002:q4': R(rnd(2.8 / sin(72), 1)),
  'ex-4am-nisab-muthallathiya-l4-003:q1': numPick(6 / cos(50), [6 * cos(50), 6 / cos(50), 6 * sin(50), cos(50) / 6]),
  'ex-4am-nisab-muthallathiya-l4-003:q2': R(rnd(6 / cos(50), 1)),
  'ex-4am-nisab-muthallathiya-l4-003:q3': R(rnd(6 * tan(50), 1)),
  'ex-4am-nisab-muthallathiya-l4-004:q2': R(q(12).mul(5).div(2)),
  'ex-4am-nisab-muthallathiya-l4-004:q3': R(rnd(12 * 5 / 13, 1)),
  'ex-4am-nisab-muthallathiya-l4-005:q1': ratioPick('A', 'B', 'cos', ["AC/BC", "AB/BC", "BC/AB", "AB/AC"]),
  'ex-4am-nisab-muthallathiya-l4-005:q2': ratioPick('H', 'B', 'cos', ["AH/AB", "AB/BH", "BH/AH", "BH/AB"]),
  'ex-4am-nisab-muthallathiya-l4-005:q3': R(fr(6, 10)),
  'ex-4am-nisab-muthallathiya-l4-005:q4': R(q(6).mul(fr(6, 10))),
  'ex-4am-nisab-muthallathiya-l4-006:q2': R(fr(8, 10)),
  'ex-4am-nisab-muthallathiya-l4-006:q3': R(q(8).mul(fr(8, 10))),
  'ex-4am-nisab-muthallathiya-l4-006:q4': R(q(8).mul(sqrtQ(q(100).sub(64)).div(10))),
  'ex-4am-nisab-muthallathiya-l4-007:q1': R(rnd(4 / sin(30), 6)),
  'ex-4am-nisab-muthallathiya-l4-007:q2': R(rnd(4 / tan(30), 2)),
  'ex-4am-nisab-muthallathiya-l4-007:q3': R(rnd((2.5 + 4 / tan(30)) * 4 / 2, 2)),
  'ex-4am-nisab-muthallathiya-l4-008:q1': R(fr(3, 5)),
  'ex-4am-nisab-muthallathiya-l4-008:q2': R(sqrtQ(q(125).sub(45).div(5))),
  'ex-4am-nisab-muthallathiya-l4-008:q3': R(fr(4, 5)),
  'ex-4am-nisab-muthallathiya-l4-008:q4': R(rnd(Math.acos(0.8) / D, 0)),
  'ex-4am-nisab-muthallathiya-l4-009:q3': R(fr("1.6", 3)),
  'ex-4am-nisab-muthallathiya-l4-009:q4': R(q(3).add(3).mul(fr("1.6", 3))),
  'ex-4am-nisab-muthallathiya-l4-010:q1': R(sqrtQ(q(25).add(144))),
  'ex-4am-nisab-muthallathiya-l4-010:q2': R(fr(5, 13)),
  'ex-4am-nisab-muthallathiya-l4-010:q3': R(fr(12, 13)),
  'ex-4am-nisab-muthallathiya-l4-010:q4': R(fr(12, 5)),
  'ex-4am-nisab-muthallathiya-l4-010:q5': yes(fr(12, 5).sub(1).n < 0n),
  // ── المستوى 5 ──
  'ex-4am-nisab-muthallathiya-l5-001:q1': R(q(20).mul("0.6")),
  'ex-4am-nisab-muthallathiya-l5-001:q2': R(sqrtQ(q(400).sub(q(20).mul("0.6").mul(q(20).mul("0.6"))))),
  'ex-4am-nisab-muthallathiya-l5-001:q3': R(fr(16, 12)),
  'ex-4am-nisab-muthallathiya-l5-001:q4': R(q(3).add(16)),
  'ex-4am-nisab-muthallathiya-l5-001:q5': yes(18 < 3 + 16 && 3 + 16 < 20),
  'ex-4am-nisab-muthallathiya-l5-002:q1': R(rnd(120 * sin(9), 1)),
  'ex-4am-nisab-muthallathiya-l5-002:q2': R(rnd(120 * cos(9), 1)),
  'ex-4am-nisab-muthallathiya-l5-002:q3': R(rnd(120 * sin(9) / sin(12), 1)),
  'ex-4am-nisab-muthallathiya-l5-002:q4': R(q(rnd(120 * sin(9) / sin(12), 1)).mul(1500)),
  'ex-4am-nisab-muthallathiya-l5-003:q1': R(fr("0.48", "6.4")),
  'ex-4am-nisab-muthallathiya-l5-003:q2': yes(fr("0.48", "6.4").sub("0.08").n <= 0n),
  'ex-4am-nisab-muthallathiya-l5-003:q3': R(rnd(Math.hypot(6.4, 0.48), 2)),
  'ex-4am-nisab-muthallathiya-l5-003:q4': R(q(rnd(Math.hypot(6.4, 0.48), 2)).mul("1.5").mul(2400)),
  'ex-4am-nisab-muthallathiya-l5-004:q1': R(rnd(40 * tan(35), 2)),
  'ex-4am-nisab-muthallathiya-l5-004:q2': R(rnd(1.6 + 40 * tan(35), 1)),
  'ex-4am-nisab-muthallathiya-l5-004:q3': R(rnd(40 / cos(35), 1)),
  'ex-4am-nisab-muthallathiya-l5-004:q4': R(rnd(Math.atan(40 * tan(35) / 25) / D, 0)),
  'ex-4am-nisab-muthallathiya-l5-005:q1': R(rnd(50 * sin(40), 1)),
  'ex-4am-nisab-muthallathiya-l5-005:q2': R(rnd(50 * sin(40) + 1.2, 1)),
  'ex-4am-nisab-muthallathiya-l5-005:q3': R(rnd((45 - 1.2) / sin(40), 2)),
  'ex-4am-nisab-muthallathiya-l5-005:q4': R(Math.ceil((45 - 1.2) / sin(40) / 20) * 350),
  'ex-4am-nisab-muthallathiya-l5-006:q1': R(rnd(24 / sin(60), 2)),
  'ex-4am-nisab-muthallathiya-l5-006:q2': R(rnd(24 / tan(60), 2)),
  'ex-4am-nisab-muthallathiya-l5-006:q3': R(q(rnd(24 / sin(60), 2)).add("1.5").mul(3).mul(650)),
  'ex-4am-nisab-muthallathiya-l5-007:q1': R(rnd(18 * sin(30), 6)),
  'ex-4am-nisab-muthallathiya-l5-007:q2': R(rnd(18 * cos(30), 2)),
  'ex-4am-nisab-muthallathiya-l5-007:q3': R(rnd(12 / sin(30), 6)),
  'ex-4am-nisab-muthallathiya-l5-007:q4': R(q(rnd(12 / sin(30), 6)).div("0.5")),
  'ex-4am-nisab-muthallathiya-l5-008:q1': R(rnd(7.5 / sin(25), 2)),
  'ex-4am-nisab-muthallathiya-l5-008:q2': R(rnd(7.5 / tan(25), 2)),
  'ex-4am-nisab-muthallathiya-l5-008:q3': R(q(rnd(7.5 / sin(25), 2)).mul(2).add("1.5").mul(3200)),
  'ex-4am-nisab-muthallathiya-l5-009:q1': R(rnd(25 * tan(38), 2)),
  'ex-4am-nisab-muthallathiya-l5-009:q2': R(rnd(25 / cos(38), 2)),
  'ex-4am-nisab-muthallathiya-l5-009:q3': R(rnd(25 * tan(38) / tan(50), 2)),
  'ex-4am-nisab-muthallathiya-l5-009:q4': R(q(25).sub(rnd(25 * tan(38) / tan(50), 2))),
  'ex-4am-nisab-muthallathiya-l5-010:q1': R(fr(12, 100)),
  'ex-4am-nisab-muthallathiya-l5-010:q2': R(q(2500).mul(fr(12, 100))),
  'ex-4am-nisab-muthallathiya-l5-010:q3': R(rnd(Math.hypot(2500, 300), 0)),
  'ex-4am-nisab-muthallathiya-l5-010:q4': R(rnd(300 / Math.hypot(2500, 300), 3)),
};

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur de l'énoncé] (une seule échelle par figure), `angles` [from, at, to, degrés],
 * `cos` [from, at, to, valeur], `onCircle` [centre, P, rayon].
 */
export const FIGURES = {
  'ex-4am-nisab-muthallathiya-l1-001': {},
  'ex-4am-nisab-muthallathiya-l1-002': {"angles": [["A", "C", "B", 25]]},
  'ex-4am-nisab-muthallathiya-l1-003': {"lengths": [["J", "K", 10]], "angles": [["S", "K", "J", 55]]},
  'ex-4am-nisab-muthallathiya-l1-005': {},
  'ex-4am-nisab-muthallathiya-l1-006': {},
  'ex-4am-nisab-muthallathiya-l1-007': {},
  'ex-4am-nisab-muthallathiya-l2-009': {"lengths": [["F", "G", 3], ["G", "E", 2], ["E", "F", 3.605551275463989]]},
  'ex-4am-nisab-muthallathiya-l2-010': {"lengths": [["F", "G", 3], ["E", "G", 6], ["F", "E", 5.196152422706632]], "angles": [["F", "E", "G", 30]]},
  'ex-4am-nisab-muthallathiya-l3-001': {"lengths": [["A", "C", 2.5]], "angles": [["A", "B", "C", 25]]},
  'ex-4am-nisab-muthallathiya-l3-002': {"lengths": [["R", "T", 3.5]], "angles": [["T", "R", "S", 37]]},
  'ex-4am-nisab-muthallathiya-l3-003': {"lengths": [["E", "F", 4.5]], "angles": [["G", "E", "F", 53]]},
  'ex-4am-nisab-muthallathiya-l3-008': {"lengths": [["K", "B", 14], ["B", "C", 17]]},
  'ex-4am-nisab-muthallathiya-l3-009': {"lengths": [["B", "C", 8.4], ["A", "C", 10.5]]},
  'ex-4am-nisab-muthallathiya-l4-001': {"lengths": [["A", "B", 7]], "angles": [["B", "C", "A", 35]]},
  'ex-4am-nisab-muthallathiya-l4-003': {"lengths": [["L", "I", 6]], "angles": [["I", "L", "E", 50]]},
  'ex-4am-nisab-muthallathiya-l4-006': {"lengths": [["A", "C", 8], ["A", "B", 10]], "onCircle": [["O", "A", 5], ["O", "B", 5], ["O", "C", 5]]},
  'ex-4am-nisab-muthallathiya-l4-007': {"lengths": [["D", "A", 4], ["A", "B", 2.5]], "angles": [["D", "C", "A", 30]]},
  'ex-4am-nisab-muthallathiya-l4-009': {"lengths": [["O", "A", 3], ["A", "F", 3], ["A", "B", 1.6]]},
  'ex-4am-nisab-muthallathiya-l5-001': {"lengths": [["A", "C", 20], ["G", "A", 3]], "cos": [["B", "A", "C", 0.6]]},
  'ex-4am-nisab-muthallathiya-l5-004': {"lengths": [["E", "B", 40]], "angles": [["B", "E", "C", 35]]},
  'ex-4am-nisab-muthallathiya-l5-005': {"lengths": [["R", "T", 50]], "angles": [["P", "R", "T", 40]]},
  'ex-4am-nisab-muthallathiya-l5-006': {"lengths": [["S", "H", 24]], "angles": [["H", "A", "S", 60]]},
  'ex-4am-nisab-muthallathiya-l5-007': {"lengths": [["A", "B", 18]], "angles": [["H", "A", "B", 30]]},
  'ex-4am-nisab-muthallathiya-l5-008': {"lengths": [["H", "B", 7.5]], "angles": [["H", "A", "B", 25]]},
  'ex-4am-nisab-muthallathiya-l5-009': {"lengths": [["H", "O", 25]], "angles": [["H", "O", "S", 38]]},
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/nisab-muthallathiya');
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-nisab-muthallathiya-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) continue;
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const d = (a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
    const angle = (a, v, b) => {
      const u = [Pt[a][0] - Pt[v][0], Pt[a][1] - Pt[v][1]]; const w = [Pt[b][0] - Pt[v][0], Pt[b][1] - Pt[v][1]];
      return Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w))) / D;
    };
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(a, b) / Number(v));
    if (scales.some((s) => Math.abs(s / scales[0] - 1) > 1e-3)) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, v, b, deg] of spec.angles ?? []) {
      if (Math.abs(angle(a, v, b) - deg) > 0.5) problems.push(`${id}: angle ${a}${v}${b} = ${angle(a, v, b)}° ≠ ${deg}°`);
    }
    for (const [a, v, b, c] of spec.cos ?? []) {
      if (Math.abs(Math.cos(angle(a, v, b) * D) - c) > 1e-3) problems.push(`${id}: cos ${a}${v}${b} ≠ ${c}`);
    }
    for (const [o, p, r] of spec.onCircle ?? []) {
      if (Math.abs(d(o, p) / (scales[0] ?? 1) - r) > 1e-3 * r) problems.push(`${id}: ${p} hors du cercle (${o}, ${r})`);
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
if (problems.length) throw new Error(`oracle nisab-muthallathiya — figures inexactes :\n${problems.join('\n')}`);

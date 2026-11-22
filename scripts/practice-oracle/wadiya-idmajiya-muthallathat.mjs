// Oracle du banc « wadiya-idmajiya-muthallathat » au format BEM (unité 10 « حساب المثلثات في المثلث القائم », أدمج تعلّماتي,
// banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici à partir des nombres de l'ÉNONCÉ, avec les
// formules de ce fichier (jamais packages/core/arithmetic/trigonometry.js) :
//   sin / cos / tan(d)      Math.* d'un angle en DEGRÉS ; asin / acos / atan rendent des degrés ;
//   rnd(x, d)               l'arrondi demandé (au plus proche, demi vers le haut), écrit avec un point ;
//   q(…), fr(a, b)          rationnels EXACTS (helpers.mjs) : rapports (cos = 12/13), relations cos² + sin² = 1 (sqrtQ),
//                           longueurs exactes (Pythagore entier, Thalès de BEM 2025 II) ;
//   sqrtQ(v)                racine EXACTE d'un carré rationnel — erreur sinon ;
//   surd(k, r)              k√r comme nombre, pour désigner l'option juste d'un QCM à valeur exacte (numPick).
// Questions fermées : numPick (l'option numériquement égale, une seule), yes(b) (A = « نعم », B = « لا »).
// FIGURES : chaque figure DESSINÉE est relue dans son fichier — longueurs de l'énoncé à UNE échelle (1e-3), angles droits,
// angles en degrés à 0,5°, un cos / tan imposé, points alignés, droites parallèles ; pour une figure de l'espace
// (`kind: 'space'`), les longueurs et les angles droits en 3D. Une figure « غير مرسوم بالأبعاد الحقيقية » (caption) n'a pas
// de contrôle d'échelle mais garde ses angles et ses alignements. Une figure fausse fait échouer l'import (donc le test).
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
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);
const fr = (a, b) => q(a).div(q(b));
const yes = (b) => C(b ? 'A' : 'B');
const num = (x) => Number(x.n) / Number(x.d);
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
const surd = (k, r) => k * Math.sqrt(r);
function numPick(target, values) {
  const hits = values.map((v, i) => (Math.abs(v - target) < 1e-9 * Math.max(1, Math.abs(target)) ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`numPick : ${hits.length} options vraies`);
  return C('ABCDE'[hits[0]]);
}
/** sin depuis cos (ou l'inverse) par cos² + sin² = 1, en EXACT. */
const other = (c) => sqrtQ(q(1).sub(q(c).mul(q(c))));
const angAt = (a, v, b) => {
  const u = a.map((x, i) => x - v[i]); const w = b.map((x, i) => x - v[i]);
  const dot = u.reduce((t, x, i) => t + x * w[i], 0);
  return acos(dot / (Math.hypot(...u) * Math.hypot(...w)));
};

// ── Données recalculées ──────────────────────────────────────────────────────
// BEM 2025 II : rectangle ABCD (AB = 1500, BC = 1125), F ∈ [CD] avec DF = 300, tan CEF = 0,75, (FG) ∥ (AC).
const CF25 = q(1500).sub(300);
const CE25 = CF25.div('0.75');
const EF25 = sqrtQ(CE25.mul(CE25).add(CF25.mul(CF25)));
const DG25 = q(300).div(1500).mul(1125); // Thalès dans ADC : DG / DA = DF / DC
const d1 = q(1500).add(1125); const d2 = d1.add(CE25); const d3 = d2.add(EF25).add(300).add(DG25);
// Khéops : 231 m, arêtes 220 m.
const OA32 = (231 * Math.SQRT2) / 2; const SO32 = Math.sqrt(220 ** 2 - OA32 ** 2); const SH32 = Math.sqrt(220 ** 2 - 115.5 ** 2);
// Fenêtre (l4-008) : AB = 1,3, BM = 1,2.
const AM8 = sqrtQ(q('1.3').mul('1.3').sub(q('1.2').mul('1.2')));
// Picture (l5-009) : 70 cm, AB = 50 cm.
const NH9 = Math.sqrt(35 ** 2 - 25 ** 2);

const K = (lv, n, qid) => `ex-4am-wadiya-idmajiya-muthallathat-l${lv}-${String(n).padStart(3, '0')}:${qid}`;
export const ORACLE = {
  // ── المستوى 1 ──
  [K(1, 1, 'q1')]: R(fr(4, 5)),
  [K(1, 1, 'q2')]: R(rnd(acos(4 / 5), 0)),
  [K(1, 2, 'q1')]: R(fr(7, 10)),
  [K(1, 2, 'q2')]: R(rnd(asin(7 / 10), 0)),
  [K(1, 3, 'q1')]: R(rnd(7 / sin(35), 1)),
  [K(1, 3, 'q2')]: R(rnd(7 / tan(35), 1)),
  [K(1, 4, 'q1')]: R(rnd(2 / cos(70), 1)),
  [K(1, 4, 'q2')]: R(rnd(2 * tan(70), 1)),
  [K(1, 5, 'q1')]: R(rnd(6 * tan(50), 1)),
  [K(1, 5, 'q2')]: R(rnd(6 / cos(50), 1)),
  [K(1, 6, 'q1')]: R(other('0.6')),
  [K(1, 6, 'q2')]: R(q('0.6').div(other('0.6'))),
  [K(1, 7, 'q1')]: R(fr('2.5', '6.5')),
  [K(1, 7, 'q2')]: R(rnd(acos(2.5 / 6.5), 0)),
  [K(1, 8, 'q1')]: R(fr('3.5', '2.8')),
  [K(1, 8, 'q2')]: R(rnd(atan(3.5 / 2.8), 0)),
  [K(1, 9, 'q1')]: R(rnd(31.6330693, 0)),
  [K(1, 9, 'q2')]: R(rnd(90 - 31.6330693, 0)),
  [K(1, 10, 'q1')]: R(q('3.2').add('46.8')),
  [K(1, 10, 'q2')]: R(rnd(atan(30 / (3.2 + 46.8)), 0)),
  // ── المستوى 2 ──
  [K(2, 1, 'q1')]: R(q('95.65').add('2.45')),
  [K(2, 1, 'q2')]: R(rnd((2.30 * (95.65 + 2.45)) / 2.45, 2)), // Thalès (counted:false)
  [K(2, 1, 'q3')]: R(rnd(atan(2.30 / 2.45), 0)),
  [K(2, 2, 'q1')]: R(rnd(atan(3 / 3), 6)),
  [K(2, 2, 'q2')]: R(q(89).add(3).mul(fr(3, 3))),
  [K(2, 3, 'q1')]: R(fr(45, 300)),
  [K(2, 3, 'q2')]: R(rnd(atan(45 / 300), 0)),
  [K(2, 4, 'q1')]: R(rnd(atan(2.5 / 4), 0)),
  [K(2, 4, 'q2')]: R(rnd(hyp(4, 2.5), 1)),
  [K(2, 5, 'q1')]: R(rnd(30 * tan(52), 1)),
  [K(2, 5, 'q2')]: R(rnd(30 / cos(52), 1)),
  [K(2, 6, 'q1')]: R(rnd(hyp(105, 68), 0)),
  [K(2, 6, 'q2')]: R(rnd(atan(68 / 105), 0)),
  [K(2, 7, 'q1')]: R(q('1.8').mul(fr(4, 3))),
  [K(2, 7, 'q2')]: R(sqrtQ(q('1.8').mul('1.8').add(q('2.4').mul('2.4')))),
  [K(2, 8, 'q1')]: R(sqrtQ(64 + 36)),
  [K(2, 8, 'q2')]: R(sqrtQ(64 + 36 + 576)),
  [K(2, 8, 'q3')]: R(rnd(atan(24 / 10), 0)),
  [K(2, 9, 'q1')]: R(fr(15, 17)),
  [K(2, 9, 'q2')]: R(other(fr(15, 17))),
  [K(2, 9, 'q3')]: R(other(fr(15, 17)).div(fr(15, 17))),
  [K(2, 10, 'q1')]: R(rnd(acos(1.5 / 4), 0)),
  [K(2, 10, 'q2')]: R(rnd(Math.sqrt(16 - 2.25), 2)),
  // ── المستوى 3 ──
  [K(3, 1, 'q1')]: numPick(hyp(3.15, 2.35), [Math.sqrt(15.445), 5.5, Math.sqrt(17.8475)]),
  [K(3, 1, 'q2')]: R(rnd(hyp(3.15, 2.35), 0)),
  [K(3, 1, 'q3')]: numPick(Math.sqrt(3.15 ** 2 + 2.35 ** 2 + 1.55 ** 2), [Math.sqrt(17.8475), 7.05, Math.sqrt(15.445)]),
  [K(3, 1, 'q4')]: R(rnd(Math.sqrt(3.15 ** 2 + 2.35 ** 2 + 1.55 ** 2), 0)),
  [K(3, 2, 'q1')]: numPick(1.55 / Math.sqrt(3.15 ** 2 + 2.35 ** 2 + 1.55 ** 2),
    [1.55 / Math.sqrt(15.445), Math.sqrt(15.445) / Math.sqrt(17.8475), Math.sqrt(17.8475) / 1.55, 1.55 / Math.sqrt(17.8475)]),
  [K(3, 2, 'q2')]: R(rnd(asin(1.55 / Math.sqrt(3.15 ** 2 + 2.35 ** 2 + 1.55 ** 2)), 0)),
  [K(3, 3, 'q1')]: R(rnd(atan(1.2 / 2), 0)),
  [K(3, 3, 'q2')]: R(q(100).mul(fr('1.2', 2))),
  [K(3, 3, 'q3')]: R(rnd(hyp(100, 60), 0)),
  [K(3, 4, 'q2')]: R(q(10).mul(24).div(2)), // aire (counted:false) ; 10² + 24² = 26² vérifié plus bas
  [K(3, 4, 'q3')]: R(fr(10, 26)),
  [K(3, 4, 'q4')]: R(q(24).mul(fr(10, 26))),
  [K(3, 4, 'q5')]: R(rnd(asin(10 / 26), 0)),
  [K(3, 5, 'q1')]: R(rnd(64 / tan(8), 0)),
  [K(3, 5, 'q2')]: R(rnd(64 / tan(12), 0)),
  [K(3, 5, 'q3')]: R(rnd(64 / tan(8) - 64 / tan(12), 0)),
  [K(3, 6, 'q1')]: numPick(OA32, [surd(231, 2) / 2, 231 / 2, surd(231, 2)]),
  [K(3, 6, 'q2')]: R(rnd(SO32, 0)),
  [K(3, 6, 'q3')]: R(rnd(acos(OA32 / 220), 0)),
  [K(3, 7, 'q1')]: R(rnd(750 * sin(12), 1)),
  [K(3, 7, 'q2')]: R(rnd(750 * cos(12), 1)),
  [K(3, 7, 'q3')]: R(rnd(atan(120 / 400), 0)),
  [K(3, 8, 'q1')]: R(other(fr(5, 13))),
  [K(3, 8, 'q2')]: R(fr(5, 13).div(other(fr(5, 13)))),
  [K(3, 8, 'q3')]: R(rnd(asin(5 / 13), 0)),
  [K(3, 9, 'q1')]: R(q('4.8').div('0.8')),
  [K(3, 9, 'q2')]: R(sqrtQ(q(6).mul(6).sub(q('4.8').mul('4.8')))),
  [K(3, 9, 'q3')]: R(q('4.8').mul(q('1.2').div('3.6'))), // Thalès (counted:false)
  [K(3, 9, 'q4')]: R(rnd(asin(0.8), 0)),
  [K(3, 10, 'q1')]: R(fr('0.6', 1)),
  [K(3, 10, 'q3')]: R(q('0.6').mul('0.6').div(1)),
  [K(3, 10, 'q4')]: R(sqrtQ(q('0.36').sub(q('0.36').mul('0.36')))),
  // ── المستوى 4 ──
  [K(4, 1, 'q1')]: R(rnd(SH32, 0)),
  [K(4, 1, 'q2')]: R(rnd(acos(115.5 / SH32), 0)),
  [K(4, 1, 'q3')]: R(rnd(SH32 * sin(acos(115.5 / SH32)), 0)),
  [K(4, 2, 'q1')]: R(q(4).sub('1.5')),
  [K(4, 2, 'q2')]: R(rnd(atan(2.5 / 2), 0)),
  [K(4, 2, 'q3')]: R(q(2).add('70.4').mul(fr('2.5', 2)).add('1.5')),
  [K(4, 3, 'q1')]: R(sqrtQ(64 + 36)),
  [K(4, 3, 'q2')]: R(rnd(Math.sqrt(64 + 36 + 9), 1)),
  [K(4, 3, 'q3')]: R(rnd(atan(3 / 10), 0)),
  [K(4, 4, 'q1')]: R(fr(2, '1.6')),
  [K(4, 4, 'q2')]: R(rnd(atan(2 / 1.6), 0)),
  [K(4, 4, 'q3')]: R(q('1.6').add('46.4').mul(fr(2, '1.6'))),
  [K(4, 4, 'q4')]: R(rnd(hyp(48, 60), 1)),
  [K(4, 5, 'q1')]: R(q('3.2').sub('1.2')),
  [K(4, 5, 'q2')]: R(rnd(2 * tan(64), 1)),
  [K(4, 5, 'q3')]: R(rnd(2 / cos(64), 1)),
  [K(4, 5, 'q4')]: R(rnd(((1.2 + 3.2) / 2) * 2 * tan(64), 1)),
  [K(4, 6, 'q1')]: numPick(Math.sqrt(3 * 25), [surd(5, 3), surd(5, 2), 15, 75]),
  [K(4, 6, 'q2')]: numPick(5 / Math.sqrt(75), [Math.sqrt(3) / 3, Math.sqrt(6) / 3, Math.SQRT2 / 2, Math.sqrt(3)]),
  [K(4, 6, 'q3')]: R(rnd(asin(5 / Math.sqrt(75)), 0)),
  [K(4, 7, 'q1')]: R(rnd(8 * tan(35), 1)),
  [K(4, 7, 'q2')]: R(rnd(8 / cos(35), 1)),
  [K(4, 7, 'q3')]: R(90 - 35),
  [K(4, 8, 'q2')]: R(AM8),
  [K(4, 8, 'q3')]: R(rnd(asin(num(AM8) / 1.3), 0)),
  [K(4, 8, 'q4')]: R(rnd(1.2 * (num(AM8) / 1.3), 2)),
  [K(4, 9, 'q1')]: yes(Math.abs(atan(2.30 / 2.45) - 0.94) < 0.5),
  [K(4, 9, 'q2')]: R(rnd(atan(2.30 / 2.45), 0)),
  [K(4, 9, 'q3')]: R(rnd(hyp(2.30, 2.45), 2)),
  [K(4, 10, 'q1')]: R(rnd(hyp(15, 7), 1)),
  [K(4, 10, 'q2')]: R(rnd(atan(7 / 15), 0)),
  [K(4, 10, 'q3')]: R(rnd(hyp(15, 7) / 2.54, 1)), // conversion (counted:false)
  // ── المستوى 5 ──
  // BEM 2025 II (officiel) : d1, CE, d2, EF, DG (Thalès, counted:false), d3 (counted:false), durée (counted:false).
  [K(5, 1, 'q1')]: R(d1),
  [K(5, 1, 'q2')]: R(CE25),
  [K(5, 1, 'q3')]: R(d2),
  [K(5, 1, 'q4')]: R(EF25),
  [K(5, 1, 'q5')]: R(DG25),
  [K(5, 1, 'q6')]: R(d3),
  [K(5, 1, 'q7')]: R(q(6).mul(3).div(30)),
  [K(5, 2, 'q1')]: R(other(fr(12, 13))),
  [K(5, 2, 'q2')]: R(other(fr(12, 13)).div(fr(12, 13))),
  [K(5, 2, 'q3')]: R(q(60).div(other(fr(12, 13)))),
  [K(5, 2, 'q4')]: R(q(60).div(other(fr(12, 13)).div(fr(12, 13)))),
  [K(5, 2, 'q5')]: R(rnd(acos(12 / 13), 0)),
  [K(5, 2, 'q6')]: yes(num(q(60).div(other(fr(12, 13)))) <= 150),
  [K(5, 3, 'q1')]: R(fr(1, 10)),
  [K(5, 3, 'q2')]: R(rnd(atan(0.1), 0)),
  [K(5, 3, 'q3')]: R(q(900).div(fr(1, 10))),
  [K(5, 3, 'q4')]: R(rnd(hyp(900 / 0.1, 900), 0)),
  [K(5, 3, 'q5')]: yes(900 / 0.1 >= 8400),
  [K(5, 4, 'q1')]: R(other('0.6')),
  [K(5, 4, 'q2')]: R(other('0.6').div('0.6')),
  [K(5, 4, 'q3')]: R(q(6).mul(other('0.6').div('0.6'))),
  [K(5, 4, 'q4')]: R(rnd(acos(0.6), 0)),
  [K(5, 4, 'q5')]: yes(7 <= num(q(6).mul(other('0.6').div('0.6')))),
  [K(5, 4, 'q6')]: R(Math.ceil(100 / (2 * num(q(6).mul(other('0.6').div('0.6')))))),
  [K(5, 5, 'q1')]: R(fr(12, 15)),
  [K(5, 5, 'q2')]: R(rnd(atan(12 / 15), 0)),
  [K(5, 5, 'q3')]: yes(atan(12 / 15) <= 35),
  [K(5, 5, 'q4')]: R(rnd(12 / tan(35), 1)),
  [K(5, 5, 'q5')]: R(rnd(12 / sin(35), 1)),
  [K(5, 6, 'q1')]: R(fr(40, 80)),
  [K(5, 6, 'q2')]: R(rnd(atan(40 / 80), 0)),
  [K(5, 6, 'q3')]: R(q(40).mul('0.4')),
  [K(5, 6, 'q4')]: R(rnd(hyp(40 * 0.8, 40 * 0.4), 1)),
  [K(5, 6, 'q5')]: R(Math.ceil(2 * hyp(32, 16))),
  [K(5, 6, 'q6')]: R(Math.ceil(2 * hyp(32, 16)) * 2500), // argent (counted:false)
  [K(5, 7, 'q1')]: R(sqrtQ(30 * 30 + 16 * 16)),
  [K(5, 7, 'q2')]: R(q(30).div(sqrtQ(30 * 30 + 16 * 16))),
  [K(5, 7, 'q3')]: R(q(16).div(sqrtQ(30 * 30 + 16 * 16))),
  [K(5, 7, 'q4')]: R(rnd(atan(16 / 30), 0)),
  [K(5, 7, 'q5')]: R(sqrtQ(1156).mul(2)),
  [K(5, 7, 'q6')]: R(sqrtQ(1156).mul(2).mul(fr(9, 10)).mul(46)), // argent (counted:false)
  [K(5, 8, 'q1')]: R(sqrtQ(144 + 25)),
  [K(5, 8, 'q2')]: R(q(12).div(sqrtQ(144 + 25))),
  [K(5, 8, 'q3')]: R(rnd(atan((5 + 7) / 12), 6)),
  [K(5, 8, 'q4')]: R(rnd(atan(12 / 12) - atan(5 / 12), 0)),
  [K(5, 8, 'q5')]: R(rnd(atan(12 / 9) - atan(5 / 9), 0)),
  [K(5, 8, 'q6')]: C(atan(12 / 9) - atan(5 / 9) > atan(12 / 12) - atan(5 / 12) ? 'A' : 'B'),
  [K(5, 9, 'q1')]: R(fr(50 / 2, 35)),
  [K(5, 9, 'q2')]: numPick(Math.sqrt(1 - (25 / 35) ** 2), [surd(2, 6) / 7, 2 / 7, 24 / 49, Math.sqrt(24) / 49]),
  [K(5, 9, 'q3')]: R(rnd(acos(25 / 35), 0)),
  [K(5, 9, 'q4')]: R(rnd(NH9, 1)),
  [K(5, 9, 'q5')]: R(rnd(2 * hyp(25, 20), 0)),
  [K(5, 10, 'q1')]: R(fr('1.5', 1)),
  [K(5, 10, 'q2')]: R(rnd(atan(1.5), 0)),
  [K(5, 10, 'q3')]: R(q(2).mul(fr('1.5', 1))),
  [K(5, 10, 'q4')]: R(rnd(hyp(2, 3), 2)),
  [K(5, 10, 'q5')]: yes(3.5 >= 2 * 1.5),
};
if (10 * 10 + 24 * 24 !== 26 * 26) throw new Error('l3-004 : TIC n\'est pas rectangle');

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur de l'énoncé] (une échelle), `angles` [from, at, to, degrés],
 * `cos` / `tan` [from, at, to, valeur], `collinear` [P, Q, R], `parallel` [A, B, C, D] ((AB) ∥ (CD)).
 * `scaleFree: true` = figure « غير مرسوم بالأبعاد الحقيقية » (pas de contrôle de longueurs).
 */
const box = (L, W, H) => ({ lengths: [['A', 'B', L], ['B', 'C', W], ['C', 'D', H], ['A', 'H', W], ['A', 'F', H], ['F', 'G', W]] });
export const FIGURES = {
  'ex-4am-wadiya-idmajiya-muthallathat-l1-001': { lengths: [['M', 'O', 4], ['M', 'B', 5]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l1-002': { lengths: [['M', 'N', 7], ['L', 'N', 10]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l1-003': { lengths: [['A', 'B', 7]], angles: [['B', 'C', 'A', 35]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l1-005': { lengths: [['L', 'I', 6]], angles: [['I', 'L', 'E', 50]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l2-001': { scaleFree: true, tan: [['P', 'A', 'Q', 2.30 / 2.45]], collinear: [['A', 'Q', 'S'], ['M', 'P', 'A']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l2-007': { lengths: [['B', 'C', 1.8]], tan: [['B', 'C', 'A', 4 / 3]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l2-008': box(8, 6, 24),
  'ex-4am-wadiya-idmajiya-muthallathat-l2-009': { lengths: [['A', 'P', 15], ['A', 'Q', 17]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l3-001': box(3.15, 2.35, 1.55),
  'ex-4am-wadiya-idmajiya-muthallathat-l3-002': box(3.15, 2.35, 1.55),
  'ex-4am-wadiya-idmajiya-muthallathat-l3-006': { lengths: [['A', 'B', 231], ['S', 'A', 220], ['S', 'B', 220], ['S', 'C', 220], ['S', 'D', 220], ['B', 'C', 231]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l3-009': { lengths: [['R', 'S', 4.8], ['T', 'M', 1.2]], cos: [['R', 'T', 'S', 0.6]], parallel: [['M', 'N', 'R', 'S']], collinear: [['T', 'M', 'R'], ['T', 'N', 'S']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l3-010': { lengths: [['A', 'B', 0.6], ['B', 'C', 1]], collinear: [['B', 'H', 'C']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l4-001': { lengths: [['A', 'B', 231], ['S', 'A', 220], ['S', 'B', 220], ['S', 'C', 220], ['S', 'D', 220], ['A', 'H', 115.5]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l4-003': box(8, 6, 3),
  'ex-4am-wadiya-idmajiya-muthallathat-l4-005': { lengths: [['A', 'D', 1.2], ['B', 'C', 3.2]], angles: [['H', 'C', 'D', 64]], parallel: [['A', 'D', 'B', 'C']], collinear: [['B', 'H', 'C']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l4-006': box(5, 5, 5),
  'ex-4am-wadiya-idmajiya-muthallathat-l4-007': { lengths: [['L', 'I', 8]], angles: [['I', 'L', 'E', 35]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l4-008': { lengths: [['A', 'B', 1.3], ['M', 'B', 1.2], ['O', 'M', 0.65], ['O', 'A', 0.65]], collinear: [['A', 'O', 'B']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-001': {
    lengths: [['A', 'B', 1500], ['B', 'C', 1125], ['F', 'D', 300], ['C', 'D', 1500], ['C', 'E', num(CE25)], ['D', 'G', num(DG25)]],
    tan: [['C', 'E', 'F', 0.75]], parallel: [['F', 'G', 'A', 'C']], collinear: [['B', 'C', 'E'], ['C', 'F', 'D'], ['A', 'G', 'D']],
  },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-002': { lengths: [['H', 'P', 60]], cos: [['H', 'A', 'P', 12 / 13]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-004': { lengths: [['O', 'L', 6], ['O', 'B', 7]], cos: [['O', 'L', 'E', 0.6]], collinear: [['O', 'B', 'E']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-005': { lengths: [['H', 'A', 12], ['H', 'B', 15]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-007': { lengths: [['M', 'K', 30], ['K', 'H', 16]] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-008': { lengths: [['H', 'A', 5], ['A', 'B', 7], ['P', 'H', 12]], collinear: [['H', 'A', 'B']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-009': { lengths: [['A', 'B', 50], ['N', 'A', 35], ['N', 'B', 35]], collinear: [['A', 'H', 'B']] },
  'ex-4am-wadiya-idmajiya-muthallathat-l5-010': { lengths: [['E', 'K', 1.5], ['K', 'A', 1], ['A', 'B', 2]], collinear: [['E', 'A', 'D'], ['K', 'A', 'B']] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/wadiya-idmajiya-muthallathat');
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-wadiya-idmajiya-muthallathat-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    const text = `${ex.statement?.content ?? ''} ${(ex.questions ?? []).map((x) => `${x.lead ?? ''} ${x.statement}`).join(' ')}`;
    if (!fig) {
      if (/الشكل (المقابل|أدناه|الموالي)|\(الشكل\)/.test(text)) problems.push(`${id}: renvoi à une figure absente`);
      if (FIGURES[id]) problems.push(`${id}: contrôle de figure sans figure`);
      continue;
    }
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const d = (a, b) => Math.hypot(...Pt[a].map((x, k) => x - Pt[b][k]));
    const angle = (a, v, b) => angAt(Pt[a], Pt[v], Pt[b]);
    if (spec.scaleFree && fig.caption !== 'الشكل غير مرسوم بالأبعاد الحقيقية') problems.push(`${id}: figure hors échelle sans légende`);
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(a, b) / Number(v));
    if (scales.some((s) => Math.abs(s / scales[0] - 1) > 1e-3)) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    if (!spec.scaleFree && !(spec.lengths ?? []).length) problems.push(`${id}: aucune longueur contrôlée`);
    for (const [a, v, b, deg] of spec.angles ?? []) {
      if (Math.abs(angle(a, v, b) - deg) > 0.5) problems.push(`${id}: angle ${a}${v}${b} = ${angle(a, v, b)}° ≠ ${deg}°`);
    }
    for (const [a, v, b, c] of spec.cos ?? []) if (Math.abs(cos(angle(a, v, b)) - c) > 1e-3) problems.push(`${id}: cos ${a}${v}${b} ≠ ${c}`);
    for (const [a, v, b, t] of spec.tan ?? []) if (Math.abs(tan(angle(a, v, b)) - t) > 1e-3) problems.push(`${id}: tan ${a}${v}${b} ≠ ${t}`);
    for (const [a, b, c] of spec.collinear ?? []) {
      const t = angle(b, a, c);
      if (Math.min(t, 180 - t) > 0.05) problems.push(`${id}: ${a}, ${b}, ${c} non alignés`);
    }
    for (const [a, b, c, e] of spec.parallel ?? []) {
      const u = Pt[b].map((x, k) => x - Pt[a][k]); const w = Pt[e].map((x, k) => x - Pt[c][k]);
      const cosUW = Math.abs(u.reduce((t, x, k) => t + x * w[k], 0)) / (Math.hypot(...u) * Math.hypot(...w));
      if (Math.abs(cosUW - 1) > 1e-6) problems.push(`${id}: (${a}${b}) non parallèle à (${c}${e})`);
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
if (problems.length) throw new Error(`oracle wadiya-idmajiya-muthallathat — figures inexactes :\n${problems.join('\n')}`);

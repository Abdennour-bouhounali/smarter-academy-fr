// Oracle du banc « hasiba-muthallathiya » au format BEM (unité 10 « حساب المثلثات في المثلث القائم », leçon 2 « استعمال
// الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية », banque réécrite le 2026-10-08) — chaque réponse non selfCheck
// RECALCULÉE ici à partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais
// packages/core/arithmetic/trigonometry.js, ni la logique du lab) :
//   sin / cos / tan(d)        Math.sin / cos / tan d'un angle en DEGRÉS ; asin / acos / atan(v) : l'angle en DEGRÉS ;
//   rnd(x, d)                 l'écran de la calculatrice (10 chiffres significatifs) puis l'arrondi demandé (au plus
//                             proche, demi vers le haut) — jamais une troncature ; une longueur est calculée par la route
//                             EXACTE (angle non arrondi), jamais à partir d'un angle déjà arrondi ;
//   fr(a, b)                  un rapport EXACT (rationnels de helpers.mjs) ;
//   rndDec(s, d)              l'arrondi d'un écran DONNÉ par l'énoncé (chaîne décimale), en rationnels exacts.
// Questions fermées, décidées par un calcul (une seule option vraie, vérifiée par le test commun) :
//   progPick(cible, [programmes])  exécute chaque programme de calculatrice (« ON 2nd cos⁻¹ ( 4 ÷ 4,4 ) = », en mode
//                                  DEGRÉ) et rend l'option dont le résultat vaut la cible (calculée sur la figure) ;
//   yes(b)                         A = « نعم », B = « لا » ; pick(i) : l'option i, choisie par le test calculé à côté.
// FIGURES : chaque figure DESSINÉE est relue dans son fichier : les longueurs de l'énoncé à UNE échelle (à 1e-3 près),
// les longueurs MESURÉES (تمرين 3 : 6,1 et 5,1 cm, au millimètre) à leur tolérance, chaque angle droit marqué, chaque
// angle marqué en degrés à 0,5° près, les points d'un cercle, les alignements. Une figure fausse fait échouer l'import.
// Banc généré par le script Python de l'auteur (math, Decimal) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const D = Math.PI / 180;
const sin = (d) => Math.sin(d * D);
const cos = (d) => Math.cos(d * D);
const tan = (d) => Math.tan(d * D);
const asin = (v) => Math.asin(v) / D;
const acos = (v) => Math.acos(v) / D;
const atan = (v) => Math.atan(v) / D;
/** L'écran (10 chiffres significatifs) puis l'arrondi au plus proche à d décimales, en chaîne. */
const rnd = (x, d) => {
  const s = Number(x.toPrecision(10));
  const k = 10 ** d;
  const n = Math.round(s * k + 1e-9 * Math.sign(s));
  return (n / k).toFixed(d);
};
/** L'arrondi d'un écran donné (chaîne décimale), exact : rationnels. */
function rndDec(s, d) {
  const [i, f = ''] = s.split('.');
  const digits = (f + '0'.repeat(d + 1)).slice(0, d + 1);
  let kept = BigInt(i + digits.slice(0, d));
  if (Number(digits[d]) >= 5) kept += 1n;
  return q(`${kept}/${10n ** BigInt(d)}`);
}
/** La valeur approchée par défaut (troncature) d'un décimal positif donné, exacte. */
function truncDec(s, d) {
  const x = q(s).mul(10 ** d);
  return q(`${x.n / x.d}/${10n ** BigInt(d)}`);
}
const fr = (a, b) => q(a).div(q(b));
const yes = (b) => C(b ? 'A' : 'B');
const pick = (i) => C('ABCDE'[i]);
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options vraies`);
  return C('ABCDE'[hits[0]]);
};

/** Un programme de calculatrice en mode DEGRÉ : « ON [2nd] f[⁻¹] arg = » ; arg = nombre « 4,4 » ou « ( a ÷ b ) ». */
function run(prog) {
  let t = prog.replace(/[⁦⁩]/g, '').replace(/^ON\s+/, '').replace(/\s*=$/, '').trim();
  const second = t.startsWith('2nd');
  t = t.replace(/^2nd\s+/, '');
  const m = /^(sin|cos|tan)(⁻¹)?\s+(.+)$/.exec(t);
  if (!m) throw new Error(`programme illisible : ${prog}`);
  const num = (s) => Number(s.replace(',', '.'));
  const a = m[3].trim();
  const arg = a.startsWith('(') ? (([x, y]) => num(x) / num(y))(a.replace(/[()]/g, '').split('÷').map((s) => s.trim())) : num(a);
  if (m[2]) {
    if (!second) throw new Error(`touche inverse sans 2nd : ${prog}`);
    return { sin: asin, cos: acos, tan: atan }[m[1]](arg); // NaN = « خطأ رياضي »
  }
  if (second) throw new Error(`2nd sans touche inverse : ${prog}`);
  return { sin, cos, tan }[m[1]](arg);
}
function progPick(target, progs) {
  return only(progs.map((p, i) => (Math.abs(run(p) - target) < 1e-9 ? i : -1)).filter((i) => i >= 0), 'progPick');
}

// Les nombres qui reviennent (recalculés, jamais lus dans le contenu).
const A23 = acos(5 / 9);               // تمرين 23 : KML
const EMB = 90 - acos(5 / 13);         // BEM 2008 على منوال : la zone EMB = complément de ABC
const CRANE = acos(24 / 30);           // la grue, deuxième position

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-hasiba-muthallathiya-l1-001:q1': R(rndDec('1.267103', 0)),
  'ex-4am-hasiba-muthallathiya-l1-001:q2': R(rndDec('1.267103', 2)),
  'ex-4am-hasiba-muthallathiya-l1-002:q1': R(rndDec('1.267103', 1)),
  'ex-4am-hasiba-muthallathiya-l1-002:q2': R(truncDec('1.267103', 1)), // القيمة المقربة بالنقصان
  'ex-4am-hasiba-muthallathiya-l1-003:q1': R(rndDec('0.8090169944', 2)),
  'ex-4am-hasiba-muthallathiya-l1-003:q2': R(rndDec('0.8090169944', 3)),
  'ex-4am-hasiba-muthallathiya-l1-004:q1': progPick(cos(54), ['ON 2nd cos⁻¹ 54 =', 'ON cos 54 =', 'ON sin 54 =']),
  'ex-4am-hasiba-muthallathiya-l1-004:q2': R(rnd(cos(54), 2)),
  // la calculatrice en R donne cos 40 rad ≠ cos 40° : il faut la programmer en degrés (option C)
  'ex-4am-hasiba-muthallathiya-l1-005:q1': pick(Math.abs(Math.cos(40) - cos(40)) > 1e-3 ? 2 : 1),
  'ex-4am-hasiba-muthallathiya-l1-005:q2': R(rnd(cos(40), 2)),
  'ex-4am-hasiba-muthallathiya-l1-006:q1': R(rnd(sin(30), 9)),
  'ex-4am-hasiba-muthallathiya-l1-006:q2': R(rnd(tan(30), 2)),
  'ex-4am-hasiba-muthallathiya-l1-007:q1': R(rnd(tan(45), 9)),
  'ex-4am-hasiba-muthallathiya-l1-007:q2': R(rnd(cos(62), 2)),
  'ex-4am-hasiba-muthallathiya-l1-008:q1': progPick(asin(0.7), ['ON sin 0,7 =', 'ON 2nd cos⁻¹ 0,7 =', 'ON 2nd sin⁻¹ 0,7 =']),
  'ex-4am-hasiba-muthallathiya-l1-008:q2': R(rnd(asin(0.7), 0)),
  'ex-4am-hasiba-muthallathiya-l1-009:q1': R(rnd(asin(0.5), 6)),
  'ex-4am-hasiba-muthallathiya-l1-009:q2': R(rnd(acos(0.9), 1)),
  'ex-4am-hasiba-muthallathiya-l1-010:q1': R(rndDec('23.57817848', 0)),
  'ex-4am-hasiba-muthallathiya-l1-010:q2': R(rndDec('23.57817848', 1)),
  // ── المستوى 2 ──
  'ex-4am-hasiba-muthallathiya-l2-001:q1': R(rnd(cos(10), 2)),
  'ex-4am-hasiba-muthallathiya-l2-001:q2': R(rnd(sin(10), 2)),
  'ex-4am-hasiba-muthallathiya-l2-001:q3': R(rnd(tan(10), 2)),
  'ex-4am-hasiba-muthallathiya-l2-002:q1': R(rnd(cos(75), 2)),
  'ex-4am-hasiba-muthallathiya-l2-002:q2': R(rnd(sin(75), 2)),
  'ex-4am-hasiba-muthallathiya-l2-002:q3': R(rnd(tan(75), 2)),
  'ex-4am-hasiba-muthallathiya-l2-003:q1': R(rnd(cos(20), 2)),
  'ex-4am-hasiba-muthallathiya-l2-003:q2': R(rnd(sin(20), 2)),
  'ex-4am-hasiba-muthallathiya-l2-003:q3': R(rnd(tan(20), 2)),
  'ex-4am-hasiba-muthallathiya-l2-004:q1': R(rnd(tan(54), 2)),
  'ex-4am-hasiba-muthallathiya-l2-004:q2': R(rnd(atan(1.38), 0)),
  'ex-4am-hasiba-muthallathiya-l2-005:q1': R(Math.sqrt(15 ** 2 + 8 ** 2)),
  'ex-4am-hasiba-muthallathiya-l2-005:q2': R(rnd(atan(8 / 15), 0)),
  'ex-4am-hasiba-muthallathiya-l2-006:q1': R(rnd(asin(0.52), 2)),
  'ex-4am-hasiba-muthallathiya-l2-006:q2': R(rnd(asin(0.52), 0)),
  'ex-4am-hasiba-muthallathiya-l2-007:q1': R(rnd(acos(0.25), 1)),
  'ex-4am-hasiba-muthallathiya-l2-007:q2': R(rnd(acos(0.25), 0)),
  'ex-4am-hasiba-muthallathiya-l2-008:q1': R(rnd(atan(1.33), 2)),
  'ex-4am-hasiba-muthallathiya-l2-008:q2': R(rnd(atan(1.33), 1)),
  'ex-4am-hasiba-muthallathiya-l2-009:q1': R(rnd(atan(0.3), 0)),
  'ex-4am-hasiba-muthallathiya-l2-009:q2': R(rnd(atan(0.3), 2)),
  'ex-4am-hasiba-muthallathiya-l2-010:q1': R(rndDec('0.5877852523', 1)),
  'ex-4am-hasiba-muthallathiya-l2-010:q2': R(rndDec('44.99736', 2)),
  // ── المستوى 3 ──
  'ex-4am-hasiba-muthallathiya-l3-001:q1': R(rnd(cos(40), 2)),
  'ex-4am-hasiba-muthallathiya-l3-001:q2': R(rnd(sin(40), 2)),
  'ex-4am-hasiba-muthallathiya-l3-001:q3': R(rnd(tan(40), 2)),
  'ex-4am-hasiba-muthallathiya-l3-001:q4': R(rnd(6.1 / 8, 2)),
  'ex-4am-hasiba-muthallathiya-l3-002:q1': progPick(acos(4 / 4.4), ['ON cos ( 4 ÷ 4,4 ) =', 'ON 2nd sin⁻¹ ( 4 ÷ 4,4 ) =', 'ON 2nd cos⁻¹ ( 4 ÷ 4,4 ) =', 'ON 2nd cos⁻¹ ( 4,4 ÷ 4 ) =']),
  'ex-4am-hasiba-muthallathiya-l3-002:q2': R(rnd(acos(4 / 4.4), 0)),
  'ex-4am-hasiba-muthallathiya-l3-003:q1': R(Math.sqrt(49 - 17.64).toFixed(6).replace(/0+$/, '')),
  'ex-4am-hasiba-muthallathiya-l3-003:q2': R(fr('4.2', 7)),
  'ex-4am-hasiba-muthallathiya-l3-003:q3': R(rnd(asin(4.2 / 7), 0)),
  'ex-4am-hasiba-muthallathiya-l3-004:q1': R(fr(2, 5)),
  'ex-4am-hasiba-muthallathiya-l3-004:q2': R(rnd(atan(2 / 5), 1)),
  'ex-4am-hasiba-muthallathiya-l3-004:q3': R(rnd(atan(5 / 2), 1)),
  // ليلى : 5/9 est bien MK/ML = cos (adjacent / hypoténuse), et 0,6 = arrondi de 5/9 ≠ l'angle (option A)
  'ex-4am-hasiba-muthallathiya-l3-005:q1': pick(rnd(5 / 9, 1) === '0.6' && Math.abs(A23 - 0.6) > 1 ? 0 : 1),
  // رضا : tan KML = KL/MK = √56/5 ≠ 5/9 = cos KML (option A)
  'ex-4am-hasiba-muthallathiya-l3-005:q2': pick(Math.abs(Math.sqrt(81 - 25) / 5 - 5 / 9) > 1e-6 && Math.abs(cos(A23) - 5 / 9) < 1e-12 ? 0 : 1),
  'ex-4am-hasiba-muthallathiya-l3-005:q3': R(rnd(A23, 0)),
  'ex-4am-hasiba-muthallathiya-l3-006:q2': R(rnd(atan(24 / 30), 0)),
  'ex-4am-hasiba-muthallathiya-l3-007:q2': R(Math.sqrt(13 ** 2 - 5 ** 2)),
  'ex-4am-hasiba-muthallathiya-l3-007:q3': R(rnd(acos(5 / 13), 0)),
  'ex-4am-hasiba-muthallathiya-l3-008:q2': R(q(45).mul(60 - 25).div(25)),
  'ex-4am-hasiba-muthallathiya-l3-008:q3': R(rnd(atan(25 / 45), 0)),
  // sin 37 rad < 0 alors que le sinus d'un angle aigu est dans ]0 ; 1[ : mode radian (option B)
  'ex-4am-hasiba-muthallathiya-l3-009:q1': pick(Math.sin(37) < 0 && sin(37) > 0 ? 1 : 0),
  'ex-4am-hasiba-muthallathiya-l3-009:q2': R(rnd(sin(37), 2)),
  'ex-4am-hasiba-muthallathiya-l3-009:q3': R(rnd(cos(37), 2)),
  // رياض : AC/AB = 7/10 = cos A est juste, mais A = acos(0,7) ≠ 0,7 (option B)
  'ex-4am-hasiba-muthallathiya-l3-010:q1': pick(Math.abs(acos(0.7) - 0.7) > 1 ? 1 : 2),
  'ex-4am-hasiba-muthallathiya-l3-010:q2': R(rnd(acos(7 / 10), 0)),
  'ex-4am-hasiba-muthallathiya-l3-010:q3': R(rnd(acos(7 / 10), 1)),
  // ── المستوى 4 ──
  'ex-4am-hasiba-muthallathiya-l4-001:q1': R(Math.sqrt(13 ** 2 - 5 ** 2)),
  'ex-4am-hasiba-muthallathiya-l4-001:q2': R(q(13).mul(2).div(5)),
  'ex-4am-hasiba-muthallathiya-l4-001:q3': R(fr(5, 13)),
  'ex-4am-hasiba-muthallathiya-l4-001:q4': R(rnd(EMB, 0)),
  'ex-4am-hasiba-muthallathiya-l4-002:q1': R(rnd(atan(40 / 150), 1)),
  'ex-4am-hasiba-muthallathiya-l4-002:q2': R(rnd(Math.hypot(40, 150), 1)),
  'ex-4am-hasiba-muthallathiya-l4-003:q1': R(rnd(7 / tan(34), 0)),
  'ex-4am-hasiba-muthallathiya-l4-003:q2': R(q(rnd(7 / tan(34), 0)).mul(7)),
  'ex-4am-hasiba-muthallathiya-l4-003:q3': R(q(rnd(7 / tan(34), 0)).mul(7).div(2)),
  'ex-4am-hasiba-muthallathiya-l4-003:q4': R(rnd(7 / sin(34), 1)),
  'ex-4am-hasiba-muthallathiya-l4-004:q1': R(rnd(acos(3.5 / 12), 0)),
  'ex-4am-hasiba-muthallathiya-l4-004:q2': R(rnd(Math.sqrt(12 ** 2 - 3.5 ** 2), 1)),
  'ex-4am-hasiba-muthallathiya-l4-004:q3': yes(acos(3.5 / 12) > 65 && acos(3.5 / 12) < 75),
  'ex-4am-hasiba-muthallathiya-l4-005:q1': R(rnd(asin(15 / 50), 0)),
  'ex-4am-hasiba-muthallathiya-l4-005:q2': R(rnd(Math.sqrt(50 ** 2 - 15 ** 2), 1)),
  'ex-4am-hasiba-muthallathiya-l4-006:q1': R(rnd(atan(265 / 400), 1)),
  'ex-4am-hasiba-muthallathiya-l4-006:q2': R(rnd(Math.hypot(265, 400), 1)),
  'ex-4am-hasiba-muthallathiya-l4-007:q1': R(rnd(sin(50), 2)),
  'ex-4am-hasiba-muthallathiya-l4-007:q2': R(rnd(30 * sin(50), 1)),
  'ex-4am-hasiba-muthallathiya-l4-007:q3': R(rnd(30 * sin(50) + 1.2, 1)),
  // ON tan 2,4 = calcule tan 2,4° (l'écran 0,0419…) : il fallait la touche inverse (option B)
  'ex-4am-hasiba-muthallathiya-l4-008:q1': pick(Math.abs(run('ON tan 2,4 =') - 0.0419124) < 1e-6 ? 1 : 0),
  'ex-4am-hasiba-muthallathiya-l4-008:q2': R(rnd(atan(2.4), 0)),
  // sin⁻¹ 2,4 n'existe pas (2,4 > 1) : « خطأ رياضي » (option C)
  'ex-4am-hasiba-muthallathiya-l4-008:q3': pick(Number.isNaN(run('ON 2nd sin⁻¹ 2,4 =')) ? 2 : 1),
  'ex-4am-hasiba-muthallathiya-l4-009:q1': R(rnd(acos(5 / 9), 1)),
  // يونس garde 5/9 ; سارة arrondit d'abord : 55,9 ≠ 56,3 (option A)
  'ex-4am-hasiba-muthallathiya-l4-009:q2': pick(rnd(acos(0.56), 1) !== rnd(acos(5 / 9), 1) ? 0 : 2),
  'ex-4am-hasiba-muthallathiya-l4-010:q1': R(rnd(tan(25), 2)),
  'ex-4am-hasiba-muthallathiya-l4-010:q2': R(rnd(60 * tan(25), 1)),
  'ex-4am-hasiba-muthallathiya-l4-010:q3': R(rnd(60 * tan(25) + 1.7, 1)),
  // ── المستوى 5 ──
  'ex-4am-hasiba-muthallathiya-l5-001:q1': R(rnd(atan(2.8 / 4.8), 0)),
  'ex-4am-hasiba-muthallathiya-l5-001:q2': yes(atan(2.8 / 4.8) >= 35),
  'ex-4am-hasiba-muthallathiya-l5-001:q3': R(rnd(4.8 * tan(35), 2)),
  'ex-4am-hasiba-muthallathiya-l5-001:q4': R(rnd(4.8 / cos(35), 2)),
  'ex-4am-hasiba-muthallathiya-l5-001:q5': R(q(rnd(4.8 / cos(35), 2)).mul(2).mul(12).mul(1450)),
  'ex-4am-hasiba-muthallathiya-l5-002:q1': R(rnd(asin(21 / 30), 0)),
  'ex-4am-hasiba-muthallathiya-l5-002:q2': R(rnd(Math.sqrt(30 ** 2 - 21 ** 2), 1)),
  'ex-4am-hasiba-muthallathiya-l5-002:q3': R(rnd(CRANE, 0)),
  'ex-4am-hasiba-muthallathiya-l5-002:q4': R(rnd(24 + 30 * sin(CRANE), 1)),
  'ex-4am-hasiba-muthallathiya-l5-002:q5': yes(24 + 30 * sin(CRANE) >= 45),
  'ex-4am-hasiba-muthallathiya-l5-003:q1': R(rnd(atan(450 / 8200), 1)),
  'ex-4am-hasiba-muthallathiya-l5-003:q2': yes(atan(450 / 8200) >= 2.5 && atan(450 / 8200) <= 3.5),
  'ex-4am-hasiba-muthallathiya-l5-003:q3': R(rnd(5000 * tan(3), 0)),
  'ex-4am-hasiba-muthallathiya-l5-003:q4': R(rnd(atan(320 / 5000), 1)),
  'ex-4am-hasiba-muthallathiya-l5-003:q5': yes(!(atan(320 / 5000) >= 2.5 && atan(320 / 5000) <= 3.5)),
  'ex-4am-hasiba-muthallathiya-l5-004:q1': R(rnd(asin(4.2 / 9), 0)),
  'ex-4am-hasiba-muthallathiya-l5-004:q2': R(rnd(Math.sqrt(9 ** 2 - 4.2 ** 2), 1)),
  'ex-4am-hasiba-muthallathiya-l5-004:q3': yes(asin(4.2 / 9) <= 30),
  'ex-4am-hasiba-muthallathiya-l5-004:q4': R(rnd(5.4 / sin(30), 1)),
  'ex-4am-hasiba-muthallathiya-l5-004:q5': R(Math.ceil(Number(rnd(5.4 / sin(30), 6)) / 1.5) * 18500),
  'ex-4am-hasiba-muthallathiya-l5-005:q1': R(rnd(54 / tan(7), 0)),
  'ex-4am-hasiba-muthallathiya-l5-005:q2': yes(54 / tan(7) < 400),
  'ex-4am-hasiba-muthallathiya-l5-005:q3': R(rnd(54 / tan(9), 0)),
  'ex-4am-hasiba-muthallathiya-l5-005:q4': R(rnd(atan(54 / 400), 1)),
  'ex-4am-hasiba-muthallathiya-l5-006:q1': R(rnd(atan(17 / 29), 0)),
  'ex-4am-hasiba-muthallathiya-l5-006:q2': yes(atan(17 / 29) > 25 && atan(17 / 29) < 35),
  'ex-4am-hasiba-muthallathiya-l5-006:q3': R(rnd(Math.hypot(3.06, 5.22), 2)),
  'ex-4am-hasiba-muthallathiya-l5-006:q4': R(q(rnd(Math.hypot(3.06, 5.22), 2)).mul(2).mul(2400)),
  'ex-4am-hasiba-muthallathiya-l5-007:q1': R(rnd(atan(1 / 0.36), 0)),
  'ex-4am-hasiba-muthallathiya-l5-007:q2': R(rnd(1.8 * 0.36, 2)),
  'ex-4am-hasiba-muthallathiya-l5-007:q3': R(rnd(0.65 * tan(32), 2)),
  'ex-4am-hasiba-muthallathiya-l5-007:q4': yes(0.65 * tan(32) < 1.8),
  'ex-4am-hasiba-muthallathiya-l5-008:q1': R(rnd(asin(1.1 / 3.5), 0)),
  'ex-4am-hasiba-muthallathiya-l5-008:q2': yes(asin(1.1 / 3.5) <= 15),
  'ex-4am-hasiba-muthallathiya-l5-008:q3': R(rnd(1.1 / sin(15), 2)),
  'ex-4am-hasiba-muthallathiya-l5-008:q4': R([4, 4.5, 5].find((L) => L >= 1.1 / sin(15))),
  'ex-4am-hasiba-muthallathiya-l5-008:q5': R({ 4: 9500, 4.5: 11000, 5: 12500 }[[4, 4.5, 5].find((L) => L >= 1.1 / sin(15))]),
  'ex-4am-hasiba-muthallathiya-l5-009:q1': R(rnd(asin(11 / 20), 0)),
  'ex-4am-hasiba-muthallathiya-l5-009:q2': yes(asin(11 / 20) <= 30),
  'ex-4am-hasiba-muthallathiya-l5-009:q3': R(rnd(11 / sin(30), 6)),
  'ex-4am-hasiba-muthallathiya-l5-009:q4': R(rnd((11 / sin(30)) * cos(30), 1)),
  'ex-4am-hasiba-muthallathiya-l5-010:q1': R(rnd(atan(18 / 15), 0)),
  'ex-4am-hasiba-muthallathiya-l5-010:q2': yes(atan(18 / 15) > 42),
  'ex-4am-hasiba-muthallathiya-l5-010:q3': R(rnd(15 * tan(42), 1)),
  'ex-4am-hasiba-muthallathiya-l5-010:q4': R(rnd(18 - 15 * tan(42), 1)),
};

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur de l'énoncé] (une seule échelle par figure), `measured` [P, Q, mesure,
 * tolérance] (longueurs mesurées au millimètre), `angles` [from, at, to, degrés], `onCircle` [centre, P, rayon],
 * `aligned` [P, Q, R].
 */
export const FIGURES = {
  'ex-4am-hasiba-muthallathiya-l2-005': { lengths: [['K', 'L', 15], ['L', 'M', 8], ['M', 'N', 15], ['N', 'K', 8], ['K', 'M', 17]] },
  'ex-4am-hasiba-muthallathiya-l3-001': { lengths: [['A', 'B', 8]], measured: [['A', 'C', 6.1, 0.05], ['C', 'B', 5.1, 0.05]], angles: [['C', 'A', 'B', 40]] },
  'ex-4am-hasiba-muthallathiya-l3-002': { lengths: [['C', 'A', 4.4], ['C', 'B', 4]] },
  'ex-4am-hasiba-muthallathiya-l3-003': { lengths: [['E', 'F', 7], ['D', 'F', 4.2], ['E', 'D', 5.6]] },
  'ex-4am-hasiba-muthallathiya-l3-004': { lengths: [['I', 'R', 5], ['I', 'T', 2]] },
  'ex-4am-hasiba-muthallathiya-l3-005': { lengths: [['M', 'L', 9], ['M', 'K', 5]] },
  'ex-4am-hasiba-muthallathiya-l3-006': { lengths: [['K', 'R', 20], ['K', 'S', 16], ['K', 'P', 30], ['K', 'Q', 24]], aligned: [['R', 'K', 'P'], ['S', 'K', 'Q']] },
  'ex-4am-hasiba-muthallathiya-l3-007': { lengths: [['E', 'F', 13], ['F', 'K', 5], ['E', 'K', 12]], onCircle: [['O', 'E', 6.5], ['O', 'F', 6.5], ['O', 'K', 6.5]], angles: [['E', 'K', 'F', 90]] },
  'ex-4am-hasiba-muthallathiya-l3-008': { lengths: [['A', 'B', 60], ['A', 'D', 45], ['D', 'M', 25], ['C', 'N', 63], ['B', 'C', 45]], aligned: [['A', 'M', 'N'], ['D', 'M', 'C'], ['B', 'C', 'N']] },
  'ex-4am-hasiba-muthallathiya-l3-010': { lengths: [['C', 'A', 7], ['A', 'B', 10]] },
  'ex-4am-hasiba-muthallathiya-l4-001': { lengths: [['A', 'B', 5], ['B', 'C', 13], ['B', 'E', 2], ['A', 'C', 12], ['B', 'M', 5.2]], aligned: [['A', 'E', 'B'], ['B', 'M', 'C']] },
  'ex-4am-hasiba-muthallathiya-l4-003': { lengths: [['C', 'B', 7], ['A', 'D', 7]], angles: [['C', 'D', 'B', 34], ['D', 'A', 'B', 90]] },
  'ex-4am-hasiba-muthallathiya-l5-001': { lengths: [['A', 'H', 4.8], ['H', 'S', 2.8]] },
  'ex-4am-hasiba-muthallathiya-l5-002': { lengths: [['O', 'P', 30], ['H', 'P', 21]] },
  'ex-4am-hasiba-muthallathiya-l5-004': { lengths: [['H', 'T', 4.2], ['T', 'B', 9]] },
  'ex-4am-hasiba-muthallathiya-l5-006': { lengths: [['B', 'H', 5.22], ['H', 'A', 3.06]] },
  'ex-4am-hasiba-muthallathiya-l5-009': { lengths: [['A', 'H', 11], ['A', 'B', 20]] },
  'ex-4am-hasiba-muthallathiya-l5-010': { lengths: [['D', 'H', 15], ['H', 'T', 18]], angles: [['H', 'D', 'S', 42]] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/hasiba-muthallathiya');
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-hasiba-muthallathiya-l${level}-${String(i).padStart(3, '0')}`;
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
    if (!scales.length) problems.push(`${id}: aucune longueur contrôlée`);
    if (scales.some((s) => Math.abs(s / scales[0] - 1) > 1e-3)) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, b, v, tol] of spec.measured ?? []) {
      if (Math.abs(d(a, b) / scales[0] - v) > tol) problems.push(`${id}: ${a}${b} mesuré ${v} ± ${tol} : ${d(a, b) / scales[0]}`);
    }
    for (const [a, v, b, deg] of spec.angles ?? []) {
      if (Math.abs(angle(a, v, b) - deg) > 0.5) problems.push(`${id}: angle ${a}${v}${b} = ${angle(a, v, b)}° ≠ ${deg}°`);
    }
    for (const [o, p, r] of spec.onCircle ?? []) {
      if (Math.abs(d(o, p) / scales[0] - r) > 1e-3 * r) problems.push(`${id}: ${p} hors du cercle (${o}, ${r})`);
    }
    for (const [a, b, c] of spec.aligned ?? []) {
      const cross = (Pt[b][0] - Pt[a][0]) * (Pt[c][1] - Pt[a][1]) - (Pt[b][1] - Pt[a][1]) * (Pt[c][0] - Pt[a][0]);
      if (Math.abs(cross) > 1e-3 * d(a, c) ** 2) problems.push(`${id}: ${a}, ${b}, ${c} non alignés`);
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
if (problems.length) throw new Error(`oracle hasiba-muthallathiya — figures inexactes :\n${problems.join('\n')}`);

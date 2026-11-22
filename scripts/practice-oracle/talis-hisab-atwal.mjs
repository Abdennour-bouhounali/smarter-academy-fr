// Oracle du banc « talis-hisab-atwal » au format BEM (unité 9 « خاصية طالس », leçon 1 « خاصية طالس وحساب الأطوال »,
// banque réécrite le 2026-10-08) — chaque réponse construite RECALCULÉE ici en rationnels exacts (helpers.mjs) à
// partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/thales.js) :
//   num(a, b, d)  le x de  a/b = x/d   (x = a × d ÷ b) — un côté de l'image depuis un rapport connu ;
//   den(a, b, c)  le x de  a/b = c/x   (x = b × c ÷ a) — le quatrième proportionnel au dénominateur ;
//   sqrtQ(v)      racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — lève une erreur sinon ;
//   degRound(r)   un angle en radians arrondi au degré (étapes de trigonométrie counted:false des sujets).
// Questions fermées : C('A' | 'B') décidé par un calcul (comparaison d'un k à 1, de deux rapports).
// FIGURES : chaque figure DESSINÉE est relue dans son fichier et doit respecter les rapports de Thalès de l'énoncé
// (|PQ| / |RS| = r à 1e-9 près), ses angles droits et ses parallèles ; une figure à l'échelle garde aussi ses longueurs
// proportionnelles. Le contrôle s'exécute au chargement : une figure fausse fait échouer l'import (donc le test).
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const num = (a, b, d) => q(a).mul(q(d)).div(q(b));
const den = (a, b, c) => q(b).mul(q(c)).div(q(a));
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
const degRound = (rad) => String(Math.round((rad * 180) / Math.PI));

export const ORACLE = {
  'ex-4am-talis-hisab-atwal-l1-001:q1': R(den('3', '4', '1.5')),
  'ex-4am-talis-hisab-atwal-l1-002:q2': R(den('2.5', '3', '4')),
  'ex-4am-talis-hisab-atwal-l1-003:q1': R(num('3', q('3').add('1'), '6')),
  'ex-4am-talis-hisab-atwal-l1-004:q1': C('A'),
  'ex-4am-talis-hisab-atwal-l1-004:q2': R(den('2', '6', '1.5')),
  'ex-4am-talis-hisab-atwal-l1-005:q1': R(q('3').div('6')),
  'ex-4am-talis-hisab-atwal-l1-005:q2': R(q('3').div('6').mul('7')),
  'ex-4am-talis-hisab-atwal-l1-006:q1': R(num('3', q('3').add('2'), '4')),
  'ex-4am-talis-hisab-atwal-l1-007:q1': C(q('4').div('3').sub('1').n > 0n ? 'A' : 'B'),
  'ex-4am-talis-hisab-atwal-l1-007:q2': R(q('4').div('3').mul('6')),
  'ex-4am-talis-hisab-atwal-l1-008:q1': R(q('2').div('3')),
  'ex-4am-talis-hisab-atwal-l1-008:q2': R(den('2', '3', '2.4')),
  'ex-4am-talis-hisab-atwal-l1-009:q1': R(q('2').mul('2')),
  'ex-4am-talis-hisab-atwal-l1-009:q2': R(q('2').mul('3')),
  'ex-4am-talis-hisab-atwal-l1-009:q3': R(q('2').mul('4')),
  'ex-4am-talis-hisab-atwal-l1-010:q1': R(q('2').div('5')),
  'ex-4am-talis-hisab-atwal-l1-010:q2': R(num('2', '5', '10')),
  'ex-4am-talis-hisab-atwal-l2-001:q1': R(num('3', q('3').add('2'), '10')),
  'ex-4am-talis-hisab-atwal-l2-001:q2': R(den('2', q('3').add('2'), '3').sub('3')),
  'ex-4am-talis-hisab-atwal-l2-002:q1': R(den('2', '4', '2')),
  'ex-4am-talis-hisab-atwal-l2-002:q2': R(den('2', '4', '3')),
  'ex-4am-talis-hisab-atwal-l2-003:q1': R(num('4.5', '9', '10')),
  'ex-4am-talis-hisab-atwal-l2-003:q2': R(q('4.5').div('9')),
  'ex-4am-talis-hisab-atwal-l2-004:q1': R(den('9', '15', '6')),
  'ex-4am-talis-hisab-atwal-l2-004:q2': R(den('9', '15', '6').sub('6')),
  'ex-4am-talis-hisab-atwal-l2-005:q1': R(q('1').div('3').mul('12')),
  'ex-4am-talis-hisab-atwal-l2-005:q2': C(q('1').div('3').sub('1').n < 0n ? 'B' : 'A'),
  'ex-4am-talis-hisab-atwal-l2-006:q1': R(sqrtQ(q('6').mul('6').add(q('8').mul('8')))),
  'ex-4am-talis-hisab-atwal-l2-006:q2': R(num('2', '8', '6')),
  'ex-4am-talis-hisab-atwal-l2-007:q1': R(num('3', '6', '8')),
  'ex-4am-talis-hisab-atwal-l2-007:q2': R(den('3', '6', '2.5')),
  'ex-4am-talis-hisab-atwal-l2-008:q1': R(num('30', '45', '60')),
  'ex-4am-talis-hisab-atwal-l2-008:q2': R(den('30', '45', '28')),
  'ex-4am-talis-hisab-atwal-l2-009:q1': R(num('2', q('2').add('3'), '7')),
  'ex-4am-talis-hisab-atwal-l2-009:q2': R(den('2', q('2').add('3'), '4').sub('4')),
  'ex-4am-talis-hisab-atwal-l2-010:q1': R(q('2').div('5')),
  'ex-4am-talis-hisab-atwal-l2-010:q2': R(q('3').div('7')),
  'ex-4am-talis-hisab-atwal-l2-010:q3': C(q('2').div('5').sub(q('3').div('7')).isZero() ? 'A' : 'B'),
  'ex-4am-talis-hisab-atwal-l3-001:q1': R(num('3.2', '6', '7')),
  'ex-4am-talis-hisab-atwal-l3-001:q2': R(num('3.2', '6', '6.1')),
  'ex-4am-talis-hisab-atwal-l3-001:q3': R(q('3.2').div('6')),
  'ex-4am-talis-hisab-atwal-l3-002:q1': R(num('1.6', '3.2', '4.5')),
  'ex-4am-talis-hisab-atwal-l3-002:q2': R(num('1.6', '3.2', '3')),
  'ex-4am-talis-hisab-atwal-l3-002:q3': R(q('1.6').div('3.2')),
  'ex-4am-talis-hisab-atwal-l3-003:q1': R(den('3.75', '5.25', '2.25')),
  'ex-4am-talis-hisab-atwal-l3-003:q2': R(q('5.25').div('3.75')),
  'ex-4am-talis-hisab-atwal-l3-003:q3': R(q('5.25').div('3.75').mul('2.5')),
  'ex-4am-talis-hisab-atwal-l3-004:q1': R(num('1.3', '3.9', '4')),
  'ex-4am-talis-hisab-atwal-l3-004:q2': R(den('1.3', '3.9', '2')),
  'ex-4am-talis-hisab-atwal-l3-004:q3': R(q('3.9').div('1.3')),
  'ex-4am-talis-hisab-atwal-l3-005:q1': R(den('3', '5', '2')),
  'ex-4am-talis-hisab-atwal-l3-005:q2': R(den('3', '5', '4')),
  'ex-4am-talis-hisab-atwal-l3-006:q1': R(num(q('8').sub(q('8').div('4')), '8', '4')),
  'ex-4am-talis-hisab-atwal-l3-006:q2': R(q('4').div(q('8').div('4'))),
  'ex-4am-talis-hisab-atwal-l3-006:q3': R(degRound(Math.atan(2))),
  'ex-4am-talis-hisab-atwal-l3-007:q1': R(sqrtQ(q('100').sub('36'))),
  'ex-4am-talis-hisab-atwal-l3-007:q2': R(num(q('6').sub('2'), '6', '10')),
  'ex-4am-talis-hisab-atwal-l3-007:q3': R(num(q('6').sub('2'), '6', sqrtQ(q('100').sub('36')))),
  'ex-4am-talis-hisab-atwal-l3-008:q2': R(q('4').div('1')),
  'ex-4am-talis-hisab-atwal-l3-008:q3': R(num('4', q('4').add('3'), '5')),
  'ex-4am-talis-hisab-atwal-l3-009:q1': R(q('5').div('2').mul('4')),
  'ex-4am-talis-hisab-atwal-l3-009:q2': R(q('5').div('2').mul(q('2').add('3').add('4'))),
  'ex-4am-talis-hisab-atwal-l3-009:q3': R(q('5').div('2').mul(q('2').add('3').add('4')).div(q('2').add('3').add('4'))),
  'ex-4am-talis-hisab-atwal-l3-010:q1': R(sqrtQ(q('6').mul('6').add(q('4.5').mul('4.5')))),
  'ex-4am-talis-hisab-atwal-l3-010:q2': R(num('2.5', sqrtQ(q('6').mul('6').add(q('4.5').mul('4.5'))), '6')),
  'ex-4am-talis-hisab-atwal-l3-010:q3': R(num('2.5', sqrtQ(q('6').mul('6').add(q('4.5').mul('4.5'))), '4.5')),
  'ex-4am-talis-hisab-atwal-l4-001:q1': R(num(q('12').sub('4'), '12', '9')),
  'ex-4am-talis-hisab-atwal-l4-001:q2': R(num(q('12').sub('4'), '12', '6')),
  'ex-4am-talis-hisab-atwal-l4-001:q3': R(q('12').sub('4').div('12')),
  'ex-4am-talis-hisab-atwal-l4-001:q4': R(q('12').sub('4').div('12').mul(q('12').add('9').add('6'))),
  'ex-4am-talis-hisab-atwal-l4-002:q1': R(q('3').sub('2')),
  'ex-4am-talis-hisab-atwal-l4-002:q2': R(num(q('3').sub('2'), '2', '5')),
  'ex-4am-talis-hisab-atwal-l4-002:q3': R(q('5').add(num(q('3').sub('2'), '2', '5'))),
  'ex-4am-talis-hisab-atwal-l4-003:q1': R(q('3.3').add('2')),
  'ex-4am-talis-hisab-atwal-l4-003:q4': R(num('3.3', '2', '4.5')),
  'ex-4am-talis-hisab-atwal-l4-004:q1': R(den('6', q('6').add('3'), '8')),
  'ex-4am-talis-hisab-atwal-l4-004:q2': R(den('6', q('6').add('3'), '8').sub('8')),
  'ex-4am-talis-hisab-atwal-l4-004:q3': R(num('6', q('6').add('3'), '7')),
  'ex-4am-talis-hisab-atwal-l4-005:q1': R(den('3', '7.5', '2')),
  'ex-4am-talis-hisab-atwal-l4-005:q2': R(den('3', '7.5', '4')),
  'ex-4am-talis-hisab-atwal-l4-005:q3': R(q('7.5').div('3')),
  'ex-4am-talis-hisab-atwal-l4-006:q1': R(sqrtQ(q('25').sub('9'))),
  'ex-4am-talis-hisab-atwal-l4-006:q2': R(num(q('3').sub('1'), '3', '5')),
  'ex-4am-talis-hisab-atwal-l4-006:q3': R(q('3').div('5')),
  'ex-4am-talis-hisab-atwal-l4-006:q4': R(degRound(Math.PI / 2 - Math.acos(3 / 5))),
  'ex-4am-talis-hisab-atwal-l4-007:q2': R(den('3', '7.5', '2')),
  'ex-4am-talis-hisab-atwal-l4-007:q3': R(den('3', '7.5', '3.6').sub('3.6')),
  'ex-4am-talis-hisab-atwal-l4-008:q1': R(sqrtQ(q('169').sub('25'))),
  'ex-4am-talis-hisab-atwal-l4-008:q2': R(num('3.9', '13', '5')),
  'ex-4am-talis-hisab-atwal-l4-008:q3': R(num('3.9', '13', sqrtQ(q('169').sub('25')))),
  'ex-4am-talis-hisab-atwal-l4-009:q1': C('A'),
  'ex-4am-talis-hisab-atwal-l4-009:q2': R(sqrtQ(q('100').sub('36'))),
  'ex-4am-talis-hisab-atwal-l4-009:q3': R(degRound(Math.acos(6 / 10))),
  'ex-4am-talis-hisab-atwal-l4-009:q4': R(num('4.2', '6', '10')),
  'ex-4am-talis-hisab-atwal-l4-010:q3': R(q('4').add('6')),
  'ex-4am-talis-hisab-atwal-l4-010:q4': R(den(q('4').add('6'), '4', '7')),
  'ex-4am-talis-hisab-atwal-l5-001:q2': R(den('6', '30', '8')),
  'ex-4am-talis-hisab-atwal-l5-001:q3': R(den('6', '30', '8').add('4').mul('15000')),
  'ex-4am-talis-hisab-atwal-l5-002:q2': R(num('2.4', '7.2', '0.6')),
  'ex-4am-talis-hisab-atwal-l5-002:q3': R(num('4.8', '7.2', '0.6')),
  'ex-4am-talis-hisab-atwal-l5-002:q4': R(num('2.4', '7.2', '0.6').add(num('4.8', '7.2', '0.6')).add('0.6').mul('850')),
  'ex-4am-talis-hisab-atwal-l5-003:q1': R(q('3.4').sub('1.6')),
  'ex-4am-talis-hisab-atwal-l5-003:q2': R(q('30').div('6')),
  'ex-4am-talis-hisab-atwal-l5-003:q3': R(q('30').div('6').mul(q('3.4').sub('1.6'))),
  'ex-4am-talis-hisab-atwal-l5-003:q4': R(q('30').div('6').mul(q('3.4').sub('1.6')).add('1.6')),
  'ex-4am-talis-hisab-atwal-l5-004:q1': R(sqrtQ(q('600').mul('600').add(q('250').mul('250')))),
  'ex-4am-talis-hisab-atwal-l5-004:q2': R(num('150', '600', '250')),
  'ex-4am-talis-hisab-atwal-l5-004:q3': R(num('480', '600', '250')),
  'ex-4am-talis-hisab-atwal-l5-004:q4': R(num('150', '600', sqrtQ(q('600').mul('600').add(q('250').mul('250'))))),
  'ex-4am-talis-hisab-atwal-l5-004:q5': R(num('150', '600', sqrtQ(q('600').mul('600').add(q('250').mul('250')))).div('5')),
  'ex-4am-talis-hisab-atwal-l5-005:q1': R(num('36', '60', '45')),
  'ex-4am-talis-hisab-atwal-l5-005:q2': R(num('36', '60', '50')),
  'ex-4am-talis-hisab-atwal-l5-005:q3': R(q('36').div('60')),
  'ex-4am-talis-hisab-atwal-l5-005:q4': R(q('60').sub('36').add('50').add(q('45').sub(num('36', '60', '45'))).add(num('36', '60', '50'))),
  'ex-4am-talis-hisab-atwal-l5-005:q5': R(q('60').sub('36').add('50').add(q('45').sub(num('36', '60', '45'))).add(num('36', '60', '50')).mul('1200')),
  'ex-4am-talis-hisab-atwal-l5-006:q1': R(den('45', '75', '48')),
  'ex-4am-talis-hisab-atwal-l5-006:q2': R(num('45', '75', '70')),
  'ex-4am-talis-hisab-atwal-l5-006:q3': R(q('75').div('45')),
  'ex-4am-talis-hisab-atwal-l5-006:q4': R(q('45').add('75').add(num('45', '75', '70')).add('70').mul('25').div('100')),
  'ex-4am-talis-hisab-atwal-l5-007:q1': R(sqrtQ(q('2.1').mul('2.1').add(q('7.2').mul('7.2')))),
  'ex-4am-talis-hisab-atwal-l5-007:q2': R(num('5', sqrtQ(q('2.1').mul('2.1').add(q('7.2').mul('7.2'))), '7.2')),
  'ex-4am-talis-hisab-atwal-l5-007:q3': R(num('5', sqrtQ(q('2.1').mul('2.1').add(q('7.2').mul('7.2'))), '2.1')),
  'ex-4am-talis-hisab-atwal-l5-007:q4': R(num('6', '7.2', sqrtQ(q('2.1').mul('2.1').add(q('7.2').mul('7.2'))))),
  'ex-4am-talis-hisab-atwal-l5-008:q1': R(num('1.8', '2.5', '1.5')),
  'ex-4am-talis-hisab-atwal-l5-008:q2': R(q('1.8').div('2.5')),
  'ex-4am-talis-hisab-atwal-l5-008:q3': R(num('0.9', '1.5', '2.5')),
  'ex-4am-talis-hisab-atwal-l5-008:q4': R(num('1.8', '2.5', '1.5').add('0.32').mul('150')),
  'ex-4am-talis-hisab-atwal-l5-009:q1': R(q('2.4').sub('0.8')),
  'ex-4am-talis-hisab-atwal-l5-009:q2': R(den(q('2.4').sub('0.8'), '2.4', '0.6')),
  'ex-4am-talis-hisab-atwal-l5-009:q3': R(q('2.4').div(q('2.4').sub('0.8'))),
  'ex-4am-talis-hisab-atwal-l5-009:q4': R(den(q('2.4').sub('0.8'), '2.4', '0.6').mul('2')),
  'ex-4am-talis-hisab-atwal-l5-010:q1': R(num('2', '6', '4.5')),
  'ex-4am-talis-hisab-atwal-l5-010:q2': R(q('25').mul('4.5')),
  'ex-4am-talis-hisab-atwal-l5-010:q3': R(q('25').mul(num('2', '6', '4.5')).div('100')),
  'ex-4am-talis-hisab-atwal-l5-010:q4': R(q('25').mul(num('2', '6', '4.5')).div('100').mul('12').mul('400')),
};

/** Les figures DESSINÉES : rapports de Thalès de l'énoncé (|PQ| / |RS| = r), angles droits, parallèles, et longueurs réelles quand la figure est à l'échelle. */
export const FIGURES = {
  'ex-4am-talis-hisab-atwal-l1-002': { ratios: [["O", "E", "O", "A", "6/5"], ["O", "F", "O", "B", "6/5"], ["E", "F", "A", "B", "6/5"]] },
  'ex-4am-talis-hisab-atwal-l1-003': { ratios: [["A", "M", "A", "B", "3/4"], ["A", "N", "A", "C", "3/4"], ["M", "N", "B", "C", "3/4"]] },
  'ex-4am-talis-hisab-atwal-l1-006': { ratios: [["I", "K", "I", "M", "3/5"], ["I", "N", "I", "J", "3/5"], ["K", "N", "M", "J", "3/5"]] },
  'ex-4am-talis-hisab-atwal-l1-008': { ratios: [["O", "P", "O", "K", "3/2"], ["O", "Q", "O", "L", "3/2"], ["P", "Q", "K", "L", "3/2"]] },
  'ex-4am-talis-hisab-atwal-l1-010': { ratios: [["A", "M", "A", "B", "2/5"], ["A", "N", "A", "C", "2/5"], ["M", "N", "B", "C", "2/5"]] },
  'ex-4am-talis-hisab-atwal-l2-001': { ratios: [["A", "I", "A", "B", "3/5"], ["A", "J", "A", "C", "3/5"], ["I", "J", "B", "C", "3/5"]] },
  'ex-4am-talis-hisab-atwal-l2-002': { ratios: [["A", "L", "A", "B", "1/2"], ["A", "M", "A", "C", "1/2"], ["L", "M", "B", "C", "1/2"]] },
  'ex-4am-talis-hisab-atwal-l2-003': { ratios: [["A", "B", "A", "E", "1/2"], ["A", "C", "A", "F", "1/2"], ["B", "C", "E", "F", "1/2"]] },
  'ex-4am-talis-hisab-atwal-l2-004': { ratios: [["A", "M", "A", "N", "3/5"], ["A", "L", "A", "P", "3/5"], ["M", "L", "N", "P", "3/5"]] },
  'ex-4am-talis-hisab-atwal-l2-005': { ratios: [["A", "M", "A", "B", "1/3"], ["A", "N", "A", "C", "1/3"], ["M", "N", "B", "C", "1/3"]] },
  'ex-4am-talis-hisab-atwal-l2-007': { ratios: [["O", "C", "O", "A", "2"], ["O", "D", "O", "B", "2"], ["C", "D", "A", "B", "2"]] },
  'ex-4am-talis-hisab-atwal-l2-008': { ratios: [["O", "B", "O", "A", "2/3"], ["O", "D", "O", "C", "2/3"], ["B", "D", "A", "C", "2/3"]] },
  'ex-4am-talis-hisab-atwal-l2-009': { ratios: [["A", "E", "A", "B", "2/5"], ["A", "F", "A", "C", "2/5"], ["E", "F", "B", "C", "2/5"]] },
  'ex-4am-talis-hisab-atwal-l3-001': { ratios: [["A", "B'", "A", "B", "8/15"], ["A", "C'", "A", "C", "8/15"], ["B'", "C'", "B", "C", "8/15"]] },
  'ex-4am-talis-hisab-atwal-l3-002': { ratios: [["A", "B'", "A", "B", "1/2"], ["A", "C'", "A", "C", "1/2"], ["B'", "C'", "B", "C", "1/2"]] },
  'ex-4am-talis-hisab-atwal-l3-003': { ratios: [["E", "T", "E", "U", "7/5"], ["E", "W", "E", "V", "7/5"], ["W", "T", "U", "V", "7/5"]] },
  'ex-4am-talis-hisab-atwal-l3-004': { ratios: [["O", "H", "O", "E", "3"], ["O", "G", "O", "F", "3"], ["G", "H", "E", "F", "3"]] },
  'ex-4am-talis-hisab-atwal-l3-005': { ratios: [["O", "C", "O", "A", "5/3"], ["O", "D", "O", "B", "5/3"], ["C", "D", "A", "B", "5/3"]] },
  'ex-4am-talis-hisab-atwal-l3-008': { ratios: [["I", "K", "I", "M", "4/7"], ["I", "N", "I", "J", "4/7"], ["N", "K", "J", "M", "4/7"]], perp: [["K", "J", "K", "M"]] },
  'ex-4am-talis-hisab-atwal-l4-001': { ratios: [["B", "K", "B", "E", "2/3"], ["B", "L", "B", "M", "2/3"], ["K", "L", "E", "M", "2/3"]], lengths: [["B", "E", "12"], ["B", "M", "9"], ["E", "M", "6"]] },
  'ex-4am-talis-hisab-atwal-l4-002': { ratios: [["M", "D", "M", "A", "1/2"], ["M", "N", "M", "B", "1/2"], ["D", "N", "A", "B", "1/2"], ["A", "M", "A", "D", "2/3"]], parallel: [["D", "N", "A", "B"], ["A", "D", "B", "C"]] },
  'ex-4am-talis-hisab-atwal-l4-003': { ratios: [["E", "A", "E", "D", "33/20"], ["E", "F", "E", "B", "33/20"], ["A", "F", "D", "B", "33/20"]], perp: [["A", "F", "A", "B"], ["B", "D", "B", "A"]] },
  'ex-4am-talis-hisab-atwal-l4-004': { ratios: [["C", "D", "C", "A", "2/3"], ["C", "E", "C", "B", "2/3"], ["D", "E", "A", "B", "2/3"]] },
  'ex-4am-talis-hisab-atwal-l4-005': { ratios: [["O", "C", "O", "A", "5/2"], ["O", "D", "O", "B", "5/2"], ["C", "D", "A", "B", "5/2"]] },
  'ex-4am-talis-hisab-atwal-l4-007': { ratios: [["I", "H", "I", "F", "2/5"], ["I", "J", "I", "G", "2/5"], ["H", "J", "F", "G", "2/5"]] },
  'ex-4am-talis-hisab-atwal-l4-008': { ratios: [["A", "F", "A", "B", "3/10"], ["A", "D", "A", "C", "3/10"], ["F", "D", "B", "C", "3/10"]], perp: [["C", "A", "C", "B"]], lengths: [["A", "B", "13"], ["B", "C", "5"]] },
  'ex-4am-talis-hisab-atwal-l4-009': { ratios: [["B", "E", "B", "M", "7/10"], ["B", "F", "B", "A", "7/10"]], perp: [["M", "B", "M", "A"], ["E", "B", "E", "F"]], lengths: [["A", "B", "10"], ["B", "M", "6"]] },
  'ex-4am-talis-hisab-atwal-l4-010': { ratios: [["S", "R", "S", "E", "2/5"], ["S", "P", "S", "T", "2/5"], ["R", "P", "E", "T", "2/5"]], lengths: [["R", "S", "4"], ["R", "T", "6"], ["S", "T", "7"]] },
  'ex-4am-talis-hisab-atwal-l5-001': { ratios: [["O", "C", "O", "B", "1/5"], ["O", "D", "O", "T", "1/5"], ["C", "D", "B", "T", "1/5"]], perp: [["B", "T", "B", "O"], ["C", "D", "C", "O"]] },
  'ex-4am-talis-hisab-atwal-l5-002': { ratios: [["A", "M", "A", "B", "1/3"], ["A", "N", "A", "C", "1/3"], ["M", "N", "B", "C", "1/3"], ["A", "P", "A", "B", "2/3"], ["A", "Q", "A", "C", "2/3"], ["P", "Q", "B", "C", "2/3"]] },
  'ex-4am-talis-hisab-atwal-l5-003': { ratios: [["O", "H", "O", "R", "5"], ["O", "T", "O", "Q", "5"], ["H", "T", "R", "Q", "5"]] },
  'ex-4am-talis-hisab-atwal-l5-004': { ratios: [["A", "M", "A", "B", "1/4"], ["A", "N", "A", "C", "1/4"], ["M", "N", "B", "C", "1/4"], ["A", "P", "A", "B", "4/5"], ["A", "Q", "A", "C", "4/5"], ["P", "Q", "B", "C", "4/5"]], lengths: [["A", "B", "600"], ["B", "C", "250"]] },
  'ex-4am-talis-hisab-atwal-l5-005': { ratios: [["A", "M", "A", "B", "3/5"], ["A", "N", "A", "C", "3/5"], ["M", "N", "B", "C", "3/5"]], lengths: [["A", "B", "60"], ["A", "C", "45"], ["B", "C", "50"]] },
  'ex-4am-talis-hisab-atwal-l5-006': { ratios: [["O", "D", "O", "A", "5/3"], ["O", "C", "O", "B", "5/3"], ["D", "C", "A", "B", "5/3"]] },
  'ex-4am-talis-hisab-atwal-l5-007': { ratios: [["A", "M", "A", "B", "2/3"], ["A", "N", "A", "C", "2/3"], ["M", "N", "B", "C", "2/3"]] },
  'ex-4am-talis-hisab-atwal-l5-008': { ratios: [["S", "M", "S", "A", "18/25"], ["S", "N", "S", "B", "18/25"], ["M", "N", "A", "B", "18/25"]], lengths: [["S", "A", "2.5"], ["S", "B", "2.5"], ["A", "B", "1.5"]] },
  'ex-4am-talis-hisab-atwal-l5-009': { ratios: [["S", "I", "S", "H", "2/3"], ["S", "M", "S", "M'", "2/3"], ["I", "M", "H", "M'", "2/3"]] },
  'ex-4am-talis-hisab-atwal-l5-010': { ratios: [["A", "M", "A", "B", "1/3"], ["A", "N", "A", "C", "1/3"], ["M", "N", "B", "C", "1/3"]], lengths: [["A", "B", "6"], ["B", "C", "4.5"]] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/talis-hisab-atwal');
const d = (P, a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
const vec = (P, a, b) => [P[b][0] - P[a][0], P[b][1] - P[a][1]];
const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-talis-hisab-atwal-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) continue;
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const P = fig.points;
    for (const [a, b, c, e, r] of spec.ratios ?? []) {
      const want = q(r); const got = d(P, a, b) / d(P, c, e);
      if (!close(got, Number(want.n) / Number(want.d))) problems.push(`${id}: |${a}${b}|/|${c}${e}| = ${got} ≠ ${r}`);
    }
    for (const [a, b, c, e] of spec.perp ?? []) {
      const u = vec(P, a, b); const v = vec(P, c, e);
      if (Math.abs(u[0] * v[0] + u[1] * v[1]) > 1e-9 * d(P, a, b) * d(P, c, e)) problems.push(`${id}: (${a}${b}) non perpendiculaire à (${c}${e})`);
    }
    for (const [a, b, c, e] of spec.parallel ?? []) {
      const u = vec(P, a, b); const v = vec(P, c, e);
      if (Math.abs(u[0] * v[1] - u[1] * v[0]) > 1e-9 * d(P, a, b) * d(P, c, e)) problems.push(`${id}: (${a}${b}) non parallèle à (${c}${e})`);
    }
    // Les segments marqués d'une même flèche (arrows) sont parallèles ; les angles droits marqués sont droits.
    const arrowed = (fig.segments ?? []).filter((s) => !Array.isArray(s) && s.arrows);
    for (let x = 0; x < arrowed.length; x += 1) for (let y = x + 1; y < arrowed.length; y += 1) {
      if (arrowed[x].arrows !== arrowed[y].arrows) continue;
      const u = vec(P, arrowed[x].from, arrowed[x].to); const v = vec(P, arrowed[y].from, arrowed[y].to);
      if (Math.abs(u[0] * v[1] - u[1] * v[0]) > 1e-9 * Math.hypot(...u) * Math.hypot(...v)) problems.push(`${id}: segments fléchés non parallèles`);
    }
    for (const [a, v0, b] of fig.rightAngles ?? []) {
      const u = vec(P, v0, a); const w = vec(P, v0, b);
      if (Math.abs(u[0] * w[0] + u[1] * w[1]) > 1e-9 * Math.hypot(...u) * Math.hypot(...w)) problems.push(`${id}: angle droit ${a}${v0}${b} faux`);
    }
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(P, a, b) / Number(v));
    if (scales.some((s) => !close(s, scales[0]))) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
  }
}
if (problems.length) throw new Error(`oracle talis-hisab-atwal — figures inexactes :\n${problems.join('\n')}`);

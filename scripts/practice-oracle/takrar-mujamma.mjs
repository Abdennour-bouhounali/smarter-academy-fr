// Oracle du banc « takrar-mujamma » au format BEM (unité 8 « الإحصاء », leçon 1 « التكرار المجمع والتواتر المجمع »,
// banque réécrite le 2026-10-08) — chaque réponse RECALCULÉE ici en rationnels exacts (helpers.mjs) à partir des
// nombres de l'ÉNONCÉ (les séries S ci-dessous sont recopiées des tableaux des feuilles), sans lire le contenu ni
// packages/core/arithmetic/statistics.js. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils :
//   up(s, i) / down(s, i)   التكرار المجمع الصاعد / النازل de la colonne i (somme des effectifs jusqu'à / depuis i)
//   lt(s, i) / gt(s, i)     « أقل من » / « تفوق » la colonne i (bornes exclues)
//   N(s)                    التكرار الكلي ;  tw(c, n) = c ÷ n (التواتر) ;  pct(c, n) = c ÷ n × 100
//   fromUp(ups)             les effectifs relus d'une ligne de cumuls croissants (exercice 21 du manuel)
//   meanCentres(bornes, f)  moyenne par les centres des classes (étapes hors leçon, counted:false)
//   ceilDiv(a, b)           le plus petit entier ≥ a ÷ b (nombre de bus, de groupes)
//   gtQ / cmpLetter / downIndexOf / sameArr   décisions des questions fermées (A, B, C), recalculées
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { R, C, q } from './helpers.mjs';

const sum = (arr) => arr.reduce((a, x) => a.add(q(x)), q(0));
const up = (s, i) => sum(s.slice(0, i + 1)).toString();
const down = (s, i) => sum(s.slice(i)).toString();
const gt = (s, i) => sum(s.slice(i + 1)).toString();
const lt = (s, i) => sum(s.slice(0, i)).toString();
const N = (s) => sum(s).toString();
const tw = (c, n) => q(c).div(q(n)).toString();
const pct = (c, n) => q(c).div(q(n)).mul(100).toString();
const sumArr = (a) => sum(a);
const count = (list, v) => String(list.filter((x) => x === v).length);
const ceilDiv = (a, b) => {
  const x = q(a).div(q(b));
  return String(x.n / x.d + (x.n % x.d === 0n ? 0n : 1n));
};
const downs = (s) => s.map((_, i) => down(s, i));
const sameArr = (a, b) => a.length === b.length && a.every((x, i) => q(x).sub(q(b[i])).isZero());
const gtQ = (a, b) => q(a).sub(q(b)).n > 0n;
const cmpLetter = (a, b) => {
  const d = q(a).sub(q(b));
  if (d.isZero()) return 'C';
  return d.n > 0n ? 'A' : 'B';
};
const downIndexOf = (s, target) => s.findIndex((_, i) => q(down(s, i)).sub(q(target)).isZero());
const fromUp = (ups) => ups.map((u, i) => (i === 0 ? q(u) : q(u).sub(q(ups[i - 1]))).toString());
function meanCentres(bounds, f) {
  let t = q(0);
  f.forEach((x, i) => { t = t.add(q(bounds[i]).add(q(bounds[i + 1])).div(2).mul(q(x))); });
  return t.div(sum(f)).toString();
}

/** Les séries des énoncés (effectifs dans l'ordre des colonnes du tableau). */
const S = {
  l1_001: ['6', '10', '3', '1'],
  l1_002: ['50', '60', '70', '80'],
  l1_003: ['3', '4', '5', '5', '3'],
  l1_004: ['40', '50', '80', '30'],
  l1_005: ['5', '8', '4', '3'],
  l1_006: ['2', '6', '7', '5'],
  l1_007: ['4', '9', '6', '1'],
  l1_008: ['3', '7', '6', '4'],
  l1_009: ['40', '10', '30'],
  l1_010: ['3', '4', '3', '1', '1'],
  l1_010_raw: [2, 0, 1, 3, 1, 0, 2, 1, 4, 1, 0, 2],
  l2_001: ['3', '4', '7', '5', '1'],
  l2_002: ['5', '3', '1', '3', '2', '1', '1', '1'],
  l2_003: ['8', '9', '4', '6', '2', '1'],
  l2_004: ['8', '9', '4', '6', '2', '1'],
  l2_005: ['2', '3', '9', '6', '6', '2', '2'],
  l2_006: ['3', '8', '7', '5', '2'],
  l2_007: ['2', '5', '6', '4', '3'],
  l2_008: ['4', '6', '10', '12', '8'],
  l2_009: ['3', '8', '6', '3'],
  l2_010: ['6', '4', '7', '3'],
  l2_010_b: [20, 14, 10, 3],
  l3_001: ['3', '7', '8', '5', '4', '2', '1'],
  l3_002: ['3', '4', '7', '5', '1'],
  l3_003: ['97.97', '0.95', '1.08'],
  l3_004: { known: ['20', '40', '25'] },
  l3_005: ['2', '5', '9', '10', '4'],
  l3_006: ['3', '7', '12', '9', '6', '3'],
  l3_007: ['4', '9', '6', '4', '2'],
  l3_008: ['10', '20', '15', '5'],
  l3_009: { f: ['3', null, '6', '2'], up6: '17' },
  l3_010: ['2', '3', '3', '2'],
  l4_001: ['20', '30', '40', '20', '60', '20', '10'],
  l4_002: ['180', '150', '50', '20'],
  l4_003: ['10', '50', '60', '50', '20', '10'],
  l4_004: ['2', '8', '10', '5'],
  l4_005: ['6', '12', '14', '6', '2'],
  l4_006: ['12', '16', '8', '4'],
  l4_007: ['3', '9', '8', '5'],
  l4_008: ['5', '15', '20', '10'],
  l4_009: ['24', '18', '9', '4', '1'],
  l4_010: fromUp(['3', '13', '22', '29', '30']),
  l5_001: ['2', '4', '6', '7', '5', '4', '3'],
  l5_002: ['4', '10', '14', '8', '4'],
  l5_003: ['2', '3', '5', '8', '7', '4', '3'],
  l5_004: ['6', '9', '14', '11', '7', '3'],
  l5_005: ['12', '30', '42', '24', '12'],
  l5_006: ['5', '9', '14', '20', '16', '10', '6'],
  l5_007a: ['3', '6', '9', '8', '4'],
  l5_007b: ['2', '4', '7', '7', '5'],
  l5_008: ['9', '33', '48', '30'],
  l5_009: ['4', '11', '17', '12', '6'],
  l5_010: ['3', '9', '16', '8', '4'],
};

const K = (s) => `ex-4am-takrar-mujamma-${s}`;

export const ORACLE = {
  [K('l1-001:q1')]: R(up(S.l1_001, 2)),
  [K('l1-001:q2')]: R(down(S.l1_001, 1)),
  [K('l1-002:q1')]: R(down(S.l1_002, 3)),
  [K('l1-002:q2')]: R(up(S.l1_002, 2)),
  [K('l1-003:q1')]: R(down(S.l1_003, 2)),
  [K('l1-003:q2')]: R(up(S.l1_003, 3)),
  [K('l1-004:q1')]: R(up(S.l1_004, 1)),
  [K('l1-004:q2')]: R(down(S.l1_004, 2)),
  [K('l1-005:q1')]: R(up(S.l1_005, 1)),
  [K('l1-005:q2')]: R(down(S.l1_005, 2)),
  [K('l1-006:q1')]: R(down(S.l1_006, 1)),
  [K('l1-006:q2')]: R(up(S.l1_006, 2)),
  [K('l1-007:q1')]: R(up(S.l1_007, 1)),
  [K('l1-007:q2')]: R(down(S.l1_007, 2)),
  [K('l1-008:q1')]: R(down(S.l1_008, 2)),
  [K('l1-008:q2')]: R(down(S.l1_008, 1)),
  [K('l1-009:q1')]: R(tw(S.l1_009[1], N(S.l1_009))),
  [K('l1-009:q2')]: R(tw(up(S.l1_009, 1), N(S.l1_009))),
  [K('l1-010:q1')]: R(count(S.l1_010_raw, 1)),
  [K('l1-010:q2')]: R(up(S.l1_010, 1)),
  [K('l2-001:q1')]: R(up(S.l2_001, 2)),
  [K('l2-001:q2')]: R(up(S.l2_001, 3)),
  [K('l2-001:q3')]: R(down(S.l2_001, 2)),
  [K('l2-001:q4')]: R(down(S.l2_001, 3)),
  [K('l2-002:q1')]: R(up(S.l2_002, 3)),
  [K('l2-002:q2')]: R(down(S.l2_002, 4)),
  [K('l2-003:q1')]: R(gt(S.l2_003, 3)),
  [K('l2-003:q2')]: R(lt(S.l2_003, 3)),
  [K('l2-004:q1')]: R(down(S.l2_004, 1)),
  [K('l2-004:q2')]: R(up(S.l2_004, 1)),
  [K('l2-005:q1')]: R(up(S.l2_005, 2)),
  [K('l2-005:q2')]: R(up(S.l2_005, 3)),
  [K('l2-005:q3')]: R(up(S.l2_005, 5)),
  [K('l2-005:q4')]: R(down(S.l2_005, 4)),
  [K('l2-006:q1')]: R(up(S.l2_006, 2)),
  [K('l2-006:q2')]: R(tw(up(S.l2_006, 2), N(S.l2_006))),
  [K('l2-007:q1')]: R(up(S.l2_007, 2)),
  [K('l2-007:q2')]: R(pct(up(S.l2_007, 2), N(S.l2_007))),
  [K('l2-008:q1')]: R(down(S.l2_008, 3)),
  [K('l2-008:q2')]: R(tw(down(S.l2_008, 3), N(S.l2_008))),
  [K('l2-009:q1')]: R(down(S.l2_009, 1)),
  [K('l2-009:q2')]: R(lt(S.l2_009, 1)),
  [K('l2-010:q1')]: C(sameArr(S.l2_010_b, downs(S.l2_010)) ? 'B' : 'A'),
  [K('l2-010:q2')]: R(up(S.l2_010, 2)),
  [K('l3-001:q1')]: R(up(S.l3_001, 3)),
  [K('l3-001:q2')]: R(tw(up(S.l3_001, 3), N(S.l3_001))),
  [K('l3-001:q3')]: R(tw(down(S.l3_001, 2), N(S.l3_001))),
  [K('l3-001:q4')]: R(pct(lt(S.l3_001, 4), N(S.l3_001))),
  [K('l3-002:q1')]: R(tw(S.l3_002[2], N(S.l3_002))),
  [K('l3-002:q2')]: R(tw(up(S.l3_002, 1), N(S.l3_002))),
  [K('l3-002:q3')]: R(tw(down(S.l3_002, 2), N(S.l3_002))),
  [K('l3-003:q1')]: R(up(S.l3_003, 1)),
  [K('l3-003:q2')]: R(up(S.l3_003, 2)),
  [K('l3-003:q3')]: R(down(S.l3_003, 0)),
  [K('l3-003:q4')]: R(down(S.l3_003, 1)),
  [K('l3-004:q1')]: R(q(100).sub(sumArr(S.l3_004.known))),
  [K('l3-004:q2')]: R(q(100).sub(sumArr(S.l3_004.known)).add(q(S.l3_004.known[0])).add(q(S.l3_004.known[1]))),
  [K('l3-004:q3')]: R(q(S.l3_004.known[1]).add(q(S.l3_004.known[2]))),
  [K('l3-004:q4')]: R(q(100).sub(sumArr(S.l3_004.known)).add(q(S.l3_004.known[0]))),
  [K('l3-005:q2')]: R(tw(down(S.l3_005, 2), N(S.l3_005))),
  [K('l3-005:q3')]: R(lt(S.l3_005, 2)),
  [K('l3-006:q1')]: R(up(S.l3_006, 2)),
  [K('l3-006:q2')]: R(up(S.l3_006, 3)),
  [K('l3-006:q3')]: R(tw(up(S.l3_006, 3), N(S.l3_006))),
  [K('l3-006:q4')]: R(pct(down(S.l3_006, 4), N(S.l3_006))),
  [K('l3-007:q1')]: R(up(S.l3_007, 2)),
  [K('l3-007:q2')]: R(tw(down(S.l3_007, 3), N(S.l3_007))),
  [K('l3-008:q1')]: R(up(S.l3_008, 1)),
  [K('l3-008:q2')]: R(tw(up(S.l3_008, 1), N(S.l3_008))),
  [K('l3-008:q3')]: R(pct(down(S.l3_008, 2), N(S.l3_008))),
  [K('l3-009:q1')]: R(q(S.l3_009.up6).sub(q(S.l3_009.f[0])).sub(q(S.l3_009.f[2]))),
  [K('l3-009:q2')]: R(q(S.l3_009.up6).add(q(S.l3_009.f[3]))),
  [K('l3-009:q3')]: R(tw(q(S.l3_009.up6).sub(q(S.l3_009.f[0])).add(q(S.l3_009.f[3])), q(S.l3_009.up6).add(q(S.l3_009.f[3])))),
  [K('l3-010:q1')]: R(up(S.l3_010, 1)),
  [K('l3-010:q2')]: R(pct(up(S.l3_010, 1), N(S.l3_010))),
  [K('l3-010:q3')]: R(pct(gt(S.l3_010, 0), N(S.l3_010))),
  [K('l4-001:q1')]: R(N(S.l4_001)),
  [K('l4-001:q2')]: R(tw(up(S.l4_001, 2), N(S.l4_001))),
  [K('l4-001:q3')]: R(tw(down(S.l4_001, 5), N(S.l4_001))),
  [K('l4-001:q4')]: R(lt(S.l4_001, 4)),
  [K('l4-002:q1')]: R(up(S.l4_002, 1)),
  [K('l4-002:q2')]: R(down(S.l4_002, 2)),
  [K('l4-002:q3')]: R(pct(lt(S.l4_002, 2), N(S.l4_002))),
  [K('l4-002:q4')]: R(ceilDiv(down(S.l4_002, 2), 30)),
  [K('l4-003:q1')]: R(tw(up(S.l4_003, 3), N(S.l4_003))),
  [K('l4-003:q2')]: R(tw(down(S.l4_003, 2), N(S.l4_003))),
  [K('l4-003:q3')]: R(lt(S.l4_003, 4)),
  [K('l4-004:q1')]: R(up(S.l4_004, 1)),
  [K('l4-004:q2')]: R(up(S.l4_004, 2)),
  [K('l4-004:q3')]: R(tw(up(S.l4_004, 2), N(S.l4_004))),
  [K('l4-004:q4')]: R(tw(down(S.l4_004, 2), N(S.l4_004))),
  [K('l4-004:q5')]: R(meanCentres(['0', '5', '10', '15', '20'], S.l4_004)),
  [K('l4-005:q2')]: R(tw(down(S.l4_005, 3), N(S.l4_005))),
  [K('l4-006:q1')]: R(up(S.l4_006, 2)),
  [K('l4-006:q2')]: R(tw(down(S.l4_006, 1), N(S.l4_006))),
  [K('l4-006:q3')]: R(down(S.l4_006, 2)),
  [K('l4-007:q1')]: R(up(S.l4_007, 1)),
  [K('l4-007:q2')]: R(tw(down(S.l4_007, 2), N(S.l4_007))),
  [K('l4-007:q3')]: R(pct(lt(S.l4_007, 2), N(S.l4_007))),
  [K('l4-008:q1')]: R(up(S.l4_008, 2)),
  [K('l4-008:q2')]: R(tw(down(S.l4_008, 1), N(S.l4_008))),
  [K('l4-008:q3')]: R(meanCentres(['4', '5', '6', '7', '8'], S.l4_008)),
  [K('l4-009:q1')]: R(q(S.l4_009[1]).sub(q(S.l4_009[3]))),
  [K('l4-010:q1')]: R(S.l4_010[1]),
  [K('l4-010:q2')]: R(S.l4_010[2]),
  [K('l4-010:q3')]: R(tw(up(S.l4_010, 2), N(S.l4_010))),
  [K('l4-010:q4')]: R(tw(down(S.l4_010, 3), N(S.l4_010))),
  [K('l4-010:q5')]: R(tw(down(S.l4_010, 1), N(S.l4_010))),
  [K('l5-001:q1')]: R(up(S.l5_001, 2)),
  [K('l5-001:q2')]: R(up(S.l5_001, 4)),
  [K('l5-001:q3')]: R(down(S.l5_001, 5)),
  [K('l5-001:q4')]: R(down(S.l5_001, 3)),
  [K('l5-001:q5')]: R(down(S.l5_001, 4)),
  [K('l5-001:q6')]: C(gtQ(gt(S.l5_001, 3), q(N(S.l5_001)).div(3)) ? 'A' : 'B'),
  [K('l5-002:q1')]: R(up(S.l5_002, 1)),
  [K('l5-002:q2')]: R(up(S.l5_002, 2)),
  [K('l5-002:q3')]: R(up(S.l5_002, 3)),
  [K('l5-002:q4')]: R(tw(up(S.l5_002, 2), N(S.l5_002))),
  [K('l5-002:q5')]: R(tw(down(S.l5_002, 3), N(S.l5_002))),
  [K('l5-002:q6')]: R(down(S.l5_002, 3)),
  [K('l5-003:q1')]: R(up(S.l5_003, 2)),
  [K('l5-003:q2')]: R(down(S.l5_003, 4)),
  [K('l5-003:q3')]: R(tw(up(S.l5_003, 2), N(S.l5_003))),
  [K('l5-003:q4')]: R(pct(down(S.l5_003, 3), N(S.l5_003))),
  [K('l5-003:q5')]: C(gtQ(pct(lt(S.l5_003, 3), N(S.l5_003)), q(25)) ? 'A' : 'B'),
  [K('l5-004:q1')]: R(up(S.l5_004, 2)),
  [K('l5-004:q2')]: R(down(S.l5_004, 4)),
  [K('l5-004:q3')]: R(pct(up(S.l5_004, 2), N(S.l5_004))),
  [K('l5-004:q4')]: R(down(S.l5_004, 3)),
  [K('l5-004:q5')]: R(q(down(S.l5_004, 3)).mul(150)),
  [K('l5-005:q1')]: R(up(S.l5_005, 2)),
  [K('l5-005:q2')]: R(down(S.l5_005, 3)),
  [K('l5-005:q3')]: R(tw(down(S.l5_005, 3), N(S.l5_005))),
  [K('l5-005:q4')]: R(q(down(S.l5_005, 3)).mul(4500)),
  [K('l5-005:q5')]: R(q(down(S.l5_005, 3)).mul(4500).mul(20).div(100)),
  [K('l5-006:q1')]: R(up(S.l5_006, 2)),
  [K('l5-006:q2')]: R(down(S.l5_006, 3)),
  [K('l5-006:q3')]: R(down(S.l5_006, 4)),
  [K('l5-006:q4')]: R(q(down(S.l5_006, 4)).mul(2).add(q(up(S.l5_006, 3)))),
  [K('l5-006:q5')]: R(q(down(S.l5_006, 4)).mul(2).add(q(up(S.l5_006, 3))).mul(4500).mul(120).div(100)),
  [K('l5-007:q1')]: R(down(S.l5_007a, 3)),
  [K('l5-007:q2')]: R(down(S.l5_007b, 3)),
  [K('l5-007:q3')]: R(tw(down(S.l5_007a, 3), N(S.l5_007a))),
  [K('l5-007:q4')]: R(tw(down(S.l5_007b, 3), N(S.l5_007b))),
  [K('l5-007:q5')]: C(cmpLetter(tw(down(S.l5_007a, 3), N(S.l5_007a)), tw(down(S.l5_007b, 3), N(S.l5_007b)))),
  [K('l5-008:q1')]: R(lt(S.l5_008, 2)),
  [K('l5-008:q2')]: R(q(ceilDiv(lt(S.l5_008, 2), 15)).mul(8).mul(1200)),
  [K('l5-009:q1')]: R(up(S.l5_009, 1)),
  [K('l5-009:q2')]: R(tw(up(S.l5_009, 2), N(S.l5_009))),
  [K('l5-009:q3')]: R(pct(lt(S.l5_009, 2), N(S.l5_009))),
  [K('l5-009:q4')]: R(q(3).div(q(12).div(60))),
  [K('l5-010:q1')]: R(up(S.l5_010, 2)),
  [K('l5-010:q2')]: R(down(S.l5_010, 3)),
  [K('l5-010:q3')]: R(tw(down(S.l5_010, 3), N(S.l5_010))),
  [K('l5-010:q4')]: R(q(N(S.l5_010)).mul(30).div(100)),
  [K('l5-010:q5')]: C('ABC'[downIndexOf(S.l5_010, q(N(S.l5_010)).mul(30).div(100)) - 2]),
};

// Oracle du banc « ikhtizal-kasr » (اختزال كسر), réécrit au format BEM le 2026-10-07 — chaque réponse
// RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs : remplace les entrées en ligne de la leçon
// (bloc « // ikhtizal-kasr » et les blocs « سلسلة التفوق » تمرين 8 → 13 qui citent ses ids). ATTENTION :
// plusieurs ids gardent leur numéro mais pas leur contenu (l1-001, l2-001, l2-003, l3-004, l4-001…l4-005,
// l5-001…l5-004) — les anciennes entrées en ligne de ces ids sont FAUSSES pour la nouvelle banque.
//
// Outils (indépendants du contenu) : reste par SOUSTRACTIONS successives, PGCD = plus grand diviseur commun
// par balayage complet, recoupé par Euclide (assertion) ; forme irréductible = division par ce PGCD, puis
// vérification que numérateur et dénominateur sont premiers entre eux ; calculs fractionnaires exacts via q(...).
// Les questions « بيّن أن … » en selfCheck (l3-009 q3, l3-010 q3, l4-006 q4, l4-009 q3) n'ont pas de clé.
// Choix : نعم = A, لا = B (yn) ; sinon l'id du choix juste, déduit d'une comparaison exacte.
import { R, C, q } from './helpers.mjs';

const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const divides = (d, n) => rem(n, d) === 0;
const euclid = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
/** PGCD par balayage des diviseurs communs, recoupé par Euclide */
const pgcd = (a, b) => {
  let g = 1;
  for (let d = 1; d <= Math.min(a, b); d++) if (divides(d, a) && divides(d, b)) g = d;
  if (g !== euclid(Math.max(a, b), Math.min(a, b))) throw new Error(`pgcd(${a}, ${b}) incohérent`);
  return g;
};
/** n/d sous forme irréductible, en divisant par le PGCD — chaîne 'p/q' (ou 'p' si q = 1) */
const irr = (n, d) => {
  const neg = n < 0; const g = pgcd(Math.abs(n), d);
  const p = ediv(Math.abs(n), g)[0], qd = ediv(d, g)[0];
  if (pgcd(p, qd) !== 1) throw new Error(`${p}/${qd} pas irréductible`);
  return `${neg ? '-' : ''}${p}${qd === 1 ? '' : `/${qd}`}`;
};
const F = (n, d) => R(irr(n, d));
/** valeur exacte d'un calcul q(...) → clé */
const V = (x) => R(x.toString());
const yn = (b) => C(b ? 'A' : 'B');
/** plus petit entier ≥ x (x rationnel positif) */
const ceil = (x) => { let k = 0; while (q(k).sub(x).toString().startsWith('-')) k++; return k; };
const lt = (a, b) => a.sub(b).toString().startsWith('-');

/* — contrôles de cohérence des énoncés — */
// l1-001 : 84 ÷ 4 et 48 ÷ 4 exacts ; l2-005 : 10 divise 360 et 840
if (!divides(4, 84) || !divides(4, 48) || !divides(10, 360) || !divides(10, 840)) throw new Error('diviseurs annoncés');
// l4-006 : A = (n + 7)/(n + 1) = 1 + 6/(n + 1) pour tout n (balayage)
for (let n = 0; n <= 200; n++) if (q(`${n + 7}/${n + 1}`).toString() !== q(1).add(q(`6/${n + 1}`)).toString()) throw new Error('l4-006');
// l5-004 : 2175 + (5/6)·1044 = 2·1044 + 957
if (2175 + 870 !== 2 * 1044 + 957 || ediv(1044 * 5, 6)[0] !== 870) throw new Error('l5-004 litres');
// l5-009 : 405 + 324 + 351 = 1080
if (405 + 324 + 351 !== 1080) throw new Error('l5-009 effectifs');

// Calculs partagés
const L1_004 = q('3/4').add(q('5/4').mul('2/15'));
const L1_007 = q('5/6').sub(q('1/6').mul('3/2'));
const L1_008 = q('14/9').mul(q('5/2').add(2));
const L1_009 = q('5/3').add(q('7/6').mul('4/7'));
const L2_006A = q('7/5').sub(q('2/5').mul('3/4'));
const L2_006B = q('2/3').add('1/6').div('5/4');
const L2_007B = q('1035/1150').add('1/15');
const L2_010A = q('15/8').mul(q('2/3').add(2));
const L3_001B = q('595/560').sub('9/16');
const L3_004 = q('17/86').sub('210/301');
const L3_006P = q('1716/1092').sub(q('2/7').mul('3/2'));
const L3_009A = q('5/2').sub(q('3/2').mul('7/9'));
const L3_010B = q('3/4').sub(q('1/4').mul('2/5'));
const L4_001C = q('1005/315').sub('4/7');
const L4_002 = {
  A: q('2/7').sub(q('3/7').mul('8/21')),
  B: q('7/6').sub('3/4').mul('4/5'),
  C: q(10).div(q('7/3').sub('3/7')),
  D: q('2/3').sub(q('14/3').div('5/24')),
};
// l4-003 : n tel que 441/770 = 315/(315 + n), par balayage
const L4_003n = (() => { for (let n = 0; n <= 5000; n++) if (441 * (315 + n) === 770 * 315) return n; throw new Error('l4-003 n'); })();
// l4-004 : 240x = 320y et x + y = 98, par balayage
const L4_004 = (() => { for (let x = 1; x < 98; x++) { const y = 98 - x; if (240 * x === 320 * y) return [x, y]; } throw new Error('l4-004'); })();
const L4_005A = q('1631/932').sub(q('1/2').mul('3/2'));
const L4_006set = { value: Array.from({ length: 1001 }, (_, n) => n).filter((n) => divides(n + 1, n + 7)).join(', ') };
const L4_007P = q('2925/2275').add(q('5/7').mul('7/10'));
const L4_008A = q('1725/2070');
const L4_008B = q('1/2').add(q('2/3').mul('1/4'));
const L4_009B = q('5/4').add(q('3/4').mul('2/9'));
// l4-010 : n tel que 4199/3553 = n/44, par balayage
const L4_010n = (() => { for (let n = 1; n <= 1000; n++) if (4199 * 44 === 3553 * n) return n; throw new Error('l4-010 n'); })();
/** partie entière par soustractions : plus grand k avec k ≤ x */
const floorQ = (x) => { let k = 0; while (!lt(x, q(k + 1))) k++; return k; };
// l5-001 : 20 L de vert, jaune:bleu = 1386:924
const L5_001 = (() => {
  const r = q('1386/924');                                   // jaune / bleu
  const yellow = q(20).mul(r).div(r.add(1)), blue = q(20).sub(yellow);
  const cansY = ceil(yellow.div('2.5')), cansB = ceil(blue.div(2));
  return { yellow, blue, cost: cansY * 1850 + cansB * 1600 };
})();
const L5_002 = { turns4: q(4).mul('44/16'), dist: q(100).mul('44/16').mul('2.1'), firstBigger: lt(q('48/18'), q('44/16')) };
const L5_003 = (() => {
  const restant = q('3/2').sub('1/4');
  const cost = restant.mul('7/5');
  const days = restant.div('5/16');
  const frac = q('1/4').add(q(2).mul('5/16')).div('3/2');
  return { restant, cost, days, frac };
})();
const L5_004E = q('2175/1044').add('5/6');
const L5_004 = { a: floorQ(L5_004E), bc: L5_004E.sub(floorQ(L5_004E)), trips: ceil(L5_004E), last: L5_004E.sub(floorQ(L5_004E)).mul(1044) };
const L5_005 = { firstBigger: lt(q('238/340'), q('261/348')), need: q(350).mul('4/5') };
const L5_006need = (() => { for (let w = 0; w <= 15; w++) if (!lt(q(18 + w).div(45), q('2/3'))) return w; throw new Error('l5-006'); })();
const L5_007secondBigger = lt(q('1350/1620'), q('925/1000'));
const L5_008 = (() => {
  const perRoll = q('21/2').div('7/4');
  const curtains = 8 * 2;
  const rolls = ceil(q(curtains).div(perRoll));
  const left = q(rolls).mul('21/2').sub(q(curtains).mul('7/4'));
  return { perRoll, rolls, left };
})();
const L5_009hand = q(1).sub('405/1080').sub('324/1080');
const L5_010 = (() => {
  const w1 = q('3/8'); const rest1 = q(1).sub(w1); const w2 = q('2/5').mul(rest1); const both = w1.add(w2);
  const leftGB = q(12).mul(q(1).sub(both));
  return { rest1, w2, both, enough: !lt(leftGB, q(5)) };
})();

export const ORACLE = {
  /* ── Niveau 1 ── */
  'ex-4am-ikhtizal-kasr-l1-001:q1': R(`${ediv(84, 4)[0]}/${ediv(48, 4)[0]}`),   // 84 ÷ 4 et 48 ÷ 4
  'ex-4am-ikhtizal-kasr-l1-001:q2': F(84, 48),
  'ex-4am-ikhtizal-kasr-l1-002:q1': R(pgcd(266, 342)),
  'ex-4am-ikhtizal-kasr-l1-002:q2': F(266, 342),
  'ex-4am-ikhtizal-kasr-l1-003:q1': F(528, 360),
  'ex-4am-ikhtizal-kasr-l1-004:q1': V(L1_004),
  'ex-4am-ikhtizal-kasr-l1-005:q1': R(pgcd(1102, 646)),
  'ex-4am-ikhtizal-kasr-l1-005:q2': F(1102, 646),
  'ex-4am-ikhtizal-kasr-l1-006:q1': F(1350, 1890),
  'ex-4am-ikhtizal-kasr-l1-007:q1': V(L1_007),
  'ex-4am-ikhtizal-kasr-l1-008:q1': V(L1_008),
  'ex-4am-ikhtizal-kasr-l1-009:q1': V(L1_009),
  'ex-4am-ikhtizal-kasr-l1-010:q1': R(pgcd(325, 156)),
  'ex-4am-ikhtizal-kasr-l1-010:q2': F(156, 325),

  /* ── Niveau 2 ── */
  'ex-4am-ikhtizal-kasr-l2-001:q1': yn(pgcd(15, 22) > 1),
  'ex-4am-ikhtizal-kasr-l2-001:q2': yn(pgcd(28, 42) > 1),
  'ex-4am-ikhtizal-kasr-l2-001:q3': F(28, 42),
  'ex-4am-ikhtizal-kasr-l2-002:q1': R(pgcd(84, 48)),
  'ex-4am-ikhtizal-kasr-l2-002:q2': F(84, 48),
  'ex-4am-ikhtizal-kasr-l2-003:q1': R(pgcd(133, 27)),
  'ex-4am-ikhtizal-kasr-l2-003:q2': yn(pgcd(133, 27) > 1),
  'ex-4am-ikhtizal-kasr-l2-004:q1': R(pgcd(1428, 1092)),
  'ex-4am-ikhtizal-kasr-l2-004:q2': F(1428, 1092),
  'ex-4am-ikhtizal-kasr-l2-005:q1': R(`${ediv(360, 10)[0]}/${ediv(840, 10)[0]}`), // 360 ÷ 10 et 840 ÷ 10
  'ex-4am-ikhtizal-kasr-l2-005:q2': F(360, 840),
  'ex-4am-ikhtizal-kasr-l2-006:q1': V(L2_006A),
  'ex-4am-ikhtizal-kasr-l2-006:q2': V(L2_006B),
  'ex-4am-ikhtizal-kasr-l2-007:q1': F(1035, 1150),
  'ex-4am-ikhtizal-kasr-l2-007:q2': V(L2_007B),
  'ex-4am-ikhtizal-kasr-l2-008:q1': R(pgcd(312, 245)),
  'ex-4am-ikhtizal-kasr-l2-008:q2': R(pgcd(312, 234)),
  'ex-4am-ikhtizal-kasr-l2-008:q3': C(pgcd(245, 312) === 1 ? 'A' : 'B'),
  'ex-4am-ikhtizal-kasr-l2-008:q4': F(234, 312),
  'ex-4am-ikhtizal-kasr-l2-009:q1': R(pgcd(1462, 1032)),
  'ex-4am-ikhtizal-kasr-l2-009:q2': F(1462, 1032),
  'ex-4am-ikhtizal-kasr-l2-010:q1': V(L2_010A),
  'ex-4am-ikhtizal-kasr-l2-010:q2': F(260, 364),

  /* ── Niveau 3 ── */
  'ex-4am-ikhtizal-kasr-l3-001:q1': R(pgcd(595, 560)),
  'ex-4am-ikhtizal-kasr-l3-001:q2': F(595, 560),
  'ex-4am-ikhtizal-kasr-l3-001:q3': V(L3_001B),
  'ex-4am-ikhtizal-kasr-l3-002:q1': F(529, 69),
  'ex-4am-ikhtizal-kasr-l3-002:q2': F(91, 28),
  'ex-4am-ikhtizal-kasr-l3-002:q3': F(707, 909),
  'ex-4am-ikhtizal-kasr-l3-002:q4': F(1111, 1919),
  'ex-4am-ikhtizal-kasr-l3-003:q1': F(136, 104),
  'ex-4am-ikhtizal-kasr-l3-003:q2': F(240, 520),
  'ex-4am-ikhtizal-kasr-l3-003:q3': F(651, 310),
  'ex-4am-ikhtizal-kasr-l3-003:q4': F(333, 666),
  'ex-4am-ikhtizal-kasr-l3-003:q5': F(1978, 732),
  'ex-4am-ikhtizal-kasr-l3-004:q1': F(210, 301),
  'ex-4am-ikhtizal-kasr-l3-004:q2': V(L3_004),
  'ex-4am-ikhtizal-kasr-l3-005:q1': R(pgcd(19251, 22816)),
  'ex-4am-ikhtizal-kasr-l3-005:q2': F(22816, 19251),
  'ex-4am-ikhtizal-kasr-l3-006:q1': R(pgcd(1716, 1092)),
  'ex-4am-ikhtizal-kasr-l3-006:q2': F(1716, 1092),
  'ex-4am-ikhtizal-kasr-l3-006:q3': V(L3_006P),
  'ex-4am-ikhtizal-kasr-l3-007:q1': R(pgcd(1665, 2405)),
  'ex-4am-ikhtizal-kasr-l3-007:q2': F(1665, 2405),
  'ex-4am-ikhtizal-kasr-l3-008:q1': R(pgcd(2210, 1326)),
  'ex-4am-ikhtizal-kasr-l3-008:q2': F(2210, 1326),
  'ex-4am-ikhtizal-kasr-l3-008:q3': F(1326, 2210),
  'ex-4am-ikhtizal-kasr-l3-009:q1': V(L3_009A),
  'ex-4am-ikhtizal-kasr-l3-009:q2': F(1924, 1443),
  'ex-4am-ikhtizal-kasr-l3-010:q1': F(1144, 1430),
  'ex-4am-ikhtizal-kasr-l3-010:q2': V(L3_010B),

  /* ── Niveau 4 ── */
  'ex-4am-ikhtizal-kasr-l4-001:q1': yn(pgcd(1005, 315) === 1),
  'ex-4am-ikhtizal-kasr-l4-001:q2': R(pgcd(1005, 315)),
  'ex-4am-ikhtizal-kasr-l4-001:q3': F(1005, 315),
  'ex-4am-ikhtizal-kasr-l4-001:q4': V(L4_001C),
  'ex-4am-ikhtizal-kasr-l4-002:q1': V(L4_002.A),
  'ex-4am-ikhtizal-kasr-l4-002:q2': V(L4_002.B),
  'ex-4am-ikhtizal-kasr-l4-002:q3': V(L4_002.C),
  'ex-4am-ikhtizal-kasr-l4-002:q4': V(L4_002.D),
  'ex-4am-ikhtizal-kasr-l4-003:q1': R(pgcd(63, 110)),
  'ex-4am-ikhtizal-kasr-l4-003:q2': yn(pgcd(63, 110) > 1),
  'ex-4am-ikhtizal-kasr-l4-003:q3': F(441, 770),
  'ex-4am-ikhtizal-kasr-l4-003:q4': R(L4_003n),
  'ex-4am-ikhtizal-kasr-l4-004:q1': R(pgcd(320, 240)),
  'ex-4am-ikhtizal-kasr-l4-004:q2': F(320, 240),
  'ex-4am-ikhtizal-kasr-l4-004:q3': R(L4_004[0]),
  'ex-4am-ikhtizal-kasr-l4-004:q4': R(L4_004[1]),
  'ex-4am-ikhtizal-kasr-l4-005:q1': R(pgcd(1631, 932)),
  'ex-4am-ikhtizal-kasr-l4-005:q2': F(1631, 932),
  'ex-4am-ikhtizal-kasr-l4-005:q3': V(L4_005A),
  'ex-4am-ikhtizal-kasr-l4-006:q1': F(13 + 7, 13 + 1),
  'ex-4am-ikhtizal-kasr-l4-006:q2': F(11 + 7, 11 + 1),
  'ex-4am-ikhtizal-kasr-l4-006:q3': F(9 + 7, 9 + 1),
  'ex-4am-ikhtizal-kasr-l4-006:q5': L4_006set,
  'ex-4am-ikhtizal-kasr-l4-007:q1': R(pgcd(2925, 2275)),
  'ex-4am-ikhtizal-kasr-l4-007:q2': F(2925, 2275),
  'ex-4am-ikhtizal-kasr-l4-007:q3': V(L4_007P),
  'ex-4am-ikhtizal-kasr-l4-007:q4': R(floorQ(L4_007P)),
  'ex-4am-ikhtizal-kasr-l4-007:q5': V(L4_007P.sub(floorQ(L4_007P))),
  'ex-4am-ikhtizal-kasr-l4-008:q1': V(L4_008A),
  'ex-4am-ikhtizal-kasr-l4-008:q2': V(L4_008B),
  'ex-4am-ikhtizal-kasr-l4-008:q3': V(L4_008A.div(L4_008B)),
  'ex-4am-ikhtizal-kasr-l4-009:q1': F(2754, 1458),
  'ex-4am-ikhtizal-kasr-l4-009:q2': V(L4_009B),
  'ex-4am-ikhtizal-kasr-l4-010:q1': R(pgcd(4199, 3553)),
  'ex-4am-ikhtizal-kasr-l4-010:q2': F(4199, 3553),
  'ex-4am-ikhtizal-kasr-l4-010:q3': R(L4_010n),

  /* ── Niveau 5 — وضعيات إدماجية ── */
  'ex-4am-ikhtizal-kasr-l5-001:q1': R(pgcd(1386, 924)),
  'ex-4am-ikhtizal-kasr-l5-001:q2': F(1386, 924),
  'ex-4am-ikhtizal-kasr-l5-001:q3': V(L5_001.yellow),
  'ex-4am-ikhtizal-kasr-l5-001:q4': V(L5_001.blue),
  'ex-4am-ikhtizal-kasr-l5-001:q5': R(L5_001.cost),
  'ex-4am-ikhtizal-kasr-l5-002:q1': F(44, 16),
  'ex-4am-ikhtizal-kasr-l5-002:q2': V(L5_002.turns4),
  'ex-4am-ikhtizal-kasr-l5-002:q3': V(L5_002.dist),
  'ex-4am-ikhtizal-kasr-l5-002:q4': F(48, 18),
  'ex-4am-ikhtizal-kasr-l5-002:q5': C(L5_002.firstBigger ? 'A' : 'B'),
  'ex-4am-ikhtizal-kasr-l5-003:q1': V(L5_003.restant),
  'ex-4am-ikhtizal-kasr-l5-003:q2': V(L5_003.cost),
  'ex-4am-ikhtizal-kasr-l5-003:q3': V(L5_003.days),
  'ex-4am-ikhtizal-kasr-l5-003:q4': V(L5_003.frac),
  'ex-4am-ikhtizal-kasr-l5-004:q1': R(pgcd(2175, 1044)),
  'ex-4am-ikhtizal-kasr-l5-004:q2': yn(pgcd(2175, 1044) === 1),
  'ex-4am-ikhtizal-kasr-l5-004:q3': F(2175, 1044),
  'ex-4am-ikhtizal-kasr-l5-004:q4': V(L5_004E),
  'ex-4am-ikhtizal-kasr-l5-004:q5': R(L5_004.a),
  'ex-4am-ikhtizal-kasr-l5-004:q6': V(L5_004.bc),
  'ex-4am-ikhtizal-kasr-l5-004:q7': R(L5_004.trips),
  'ex-4am-ikhtizal-kasr-l5-004:q8': V(L5_004.last),
  'ex-4am-ikhtizal-kasr-l5-005:q1': F(261, 348),
  'ex-4am-ikhtizal-kasr-l5-005:q2': F(238, 340),
  'ex-4am-ikhtizal-kasr-l5-005:q3': C(L5_005.firstBigger ? 'A' : 'B'),
  'ex-4am-ikhtizal-kasr-l5-005:q4': V(L5_005.need),
  'ex-4am-ikhtizal-kasr-l5-006:q1': F(18, 30),
  'ex-4am-ikhtizal-kasr-l5-006:q2': F(8, 30),
  'ex-4am-ikhtizal-kasr-l5-006:q3': R(L5_006need),
  'ex-4am-ikhtizal-kasr-l5-007:q1': R(pgcd(1350, 1350 + 270)),
  'ex-4am-ikhtizal-kasr-l5-007:q2': F(1350, 1350 + 270),
  'ex-4am-ikhtizal-kasr-l5-007:q3': F(925, 1000),
  'ex-4am-ikhtizal-kasr-l5-007:q4': C(L5_007secondBigger ? 'B' : 'A'),
  'ex-4am-ikhtizal-kasr-l5-008:q1': V(L5_008.perRoll),
  'ex-4am-ikhtizal-kasr-l5-008:q2': R(L5_008.rolls),
  'ex-4am-ikhtizal-kasr-l5-008:q3': V(L5_008.left),
  'ex-4am-ikhtizal-kasr-l5-009:q1': R(pgcd(405, 1080)),
  'ex-4am-ikhtizal-kasr-l5-009:q2': F(405, 1080),
  'ex-4am-ikhtizal-kasr-l5-009:q3': F(324, 1080),
  'ex-4am-ikhtizal-kasr-l5-009:q4': V(L5_009hand),
  'ex-4am-ikhtizal-kasr-l5-010:q1': V(L5_010.rest1),
  'ex-4am-ikhtizal-kasr-l5-010:q2': V(L5_010.w2),
  'ex-4am-ikhtizal-kasr-l5-010:q3': V(L5_010.both),
  'ex-4am-ikhtizal-kasr-l5-010:q4': yn(L5_010.enough),
};

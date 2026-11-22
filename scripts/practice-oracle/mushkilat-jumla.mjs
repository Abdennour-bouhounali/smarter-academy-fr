// Oracle du banc « mushkilat-jumla » au format BEM (unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
// banque réécrite le 2026-10-07) — chaque réponse RECALCULÉE ici, sans lire le contenu ni le code testé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Un exercice de ce banc est une HISTOIRE : l'oracle la REJOUE avec les nombres relus dans l'énoncé.
//   findPair(histoire, max)   le couple d'entiers naturels de [0, max]² qui vérifie l'histoire — UNIQUE
//                             (zéro ou deux couples → l'oracle lève une erreur) : balayage, indépendant
//                             de toute méthode de résolution ;
//   solve2(…)                 Cramer en rationnels exacts (helpers.mjs) pour une jumla donnée telle quelle
//                             (« حُل الجملة », coefficients décimaux, solutions négatives ou fractionnaires) ;
//   natural(…)                « هل يمكن ذلك ؟ » : la jumla a-t-elle une solution en entiers naturels ?
//   gcd / q(…)                étapes hors leçon (`counted:false` : PGCD, pourcentages, coûts) recalculées
//                             depuis les nombres de l'énoncé et la solution de l'histoire.
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est
// indépendant : ne pas éditer une entrée sans recalculer l'autre côté.
import { R, C, P, q, solve2 } from './helpers.mjs';

/**
 * Tous les couples d'entiers naturels qui vérifient l'histoire : balayage de [0, max]², ou, pour les grands
 * montants, balayage de x ∈ [0, max] avec y lu dans la PREMIÈRE phrase de l'histoire (`yOf`).
 */
const findPairs = (story, max, yOf) => {
  const out = [];
  for (let x = 0; x <= max; x += 1) {
    if (yOf) { const y = yOf(x); if (Number.isInteger(y) && y >= 0 && story(x, y)) out.push([x, y]); continue; }
    for (let y = 0; y <= max; y += 1) if (story(x, y)) out.push([x, y]);
  }
  return out;
};

/** Le couple UNIQUE de l'histoire. */
function findPair(story, max = 200, yOf = null) {
  const all = findPairs(story, max, yOf);
  if (all.length !== 1) throw new Error(`mushkilat-jumla oracle: ${all.length} couples vérifient l'histoire`);
  return all[0];
}

/** La jumla a1·x + b1·y = c1 ; a2·x + b2·y = c2 a-t-elle une solution en entiers naturels ? */
const natural = (...a) => solve2(...a).every((s) => /^\d+$/.test(s));
/** PGCD par Euclide. */
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const yes = (b) => C(b ? 'A' : 'B');

// Histoires (nombres relus dans les énoncés)
const coins = findPair((x, y) => x + y === 37 && 20 * x + 10 * y === 610);                 // تحدّ ص 55
const museum = findPair((x, y) => x + y === 140 && 300 * x + 150 * y === 30300);           // نشاط 3
const derby = findPair((x, y) => x + y === 20 && 300 * x + 150 * y === 4800);
const kiosk = findPair((x, y) => 2 * x + y === 160 && x + y === 110);
const bundles = findPair((x, y) => x + y === 7 && 200 * x + 100 * y === 1100);
const ages = findPair((x, y) => x + y === 20 && x - y === 4);
const league = findPair((x, y) => x + y === 10 && 3 * x + y === 24);
const farm = findPair((x, y) => x + y === 36 && 4 * x + 2 * y === 90);
const cinema = findPair((x, y) => x + y === 50 && 250 * x + 400 * y === 15500);
const big2019 = findPair((x, y) => x + y === 2019 && x - y === 25, 2019);
const euclid = findPair((x, y) => x + y === 206 && x === 4 * y + 1 && 1 < y, 206);
const karting = findPair((x, y) => x + y === 12 && 400 * x + 250 * y === 3750);
const pencils = findPair((x, y) => 2 * x + 3 * y === 255 && 3 * x + 2 * y === 320);
const shoes = findPair((x, y) => x + y === 18 && 4500 * x + 6000 * y === 93000);
const theatre1 = [[25, 35], [35, 25]].filter(([x, y]) => x + y === 60 && 200 * x + 300 * y === 14500);
const theatre2 = findPair((x, y) => x + y === 70 && 200 * x + 300 * y === 17000);
const diff24 = findPair((x, y) => x - y === 24 && x + 8 === 3 * (y + 8));
const father = findPair((x, y) => x + y === 48 && x === 3 * y);
const prizes = findPair((x, y) => x + y === 54 && 10 * x === 8 * y);                       // en milliers de DA : x = 0,8·y
const ratio133 = findPair((a, b) => a + b === 133 && 7 * (a + 5) === 4 * (b + 5));
const amine = findPair((x, y) => x + y === 34 && x + 4 === 2 * (y + 4));
const grades = findPair((x, y) => x <= 20 && y <= 20 && 2 * x + y === 3 * 11 && x + 2 * y === 3 * 13, 20);
const timgad = findPair((x, y) => x + y === 52 && 800 * x + 1200 * y === 44000);
const olives = findPair((x, y) => x + y === 20 && 300 * x + 900 * y === 10800);
const tram = findPair((x, y) => x + y === 38 && 40 * x + 25 * y === 1220);
const notebooks = findPair((x, y) => 4 * x + 5 * y === 105 && 3 * x + 2 * y === 56);      // BEM 2007
const balls = findPair((x, y) => x + y === 105 && 100 * x === 40 * y);
const rect60 = findPair((x, y) => 2 * (x + y) === 60 && (x + 5) * (y - 2) === x * y);
const field = findPair((x, y) => 2 * (x + y) === 220 && (x - 2) * (y + 2) === x * y + 16);
const angles = findPair((x, y) => x + 2 * y === 180 && 2 * x === y, 180);                  // x = ACD = y/2
const trapeze = findPair((x, y) => 4 + x + 5 + y === 25 && 6 * x === (6 + 4) * y);         // Thalès : EA/EB = AD/BC
const fruits = findPair((x, y) => 5 * x + 3 * y === 1000 + 50 && 3 * y === 2 * x, 1050);
const ratioAB = solve2(1, -3, -2, 1, -4, 2);                                               // (a + 2) = 3b ; (a − 2) = 4b
const canteen = findPair((x, y) => 3 * x + 5 * y === 7400 && 2 * x + 7 * y === 6400, 2500, (x) => (7400 - 3 * x) / 5);
const abuKamil = findPair((x, y) => x + y === 30 && 6 * x === 4 * y, 30);
const tea = findPair((x, y) => x + y === 14 && 125 * x + 500 * y === 4000);                // BEM 2009
const quiz1 = [[13, 7], [15, 5]].filter(([x, y]) => x + y === 20 && 5 * x - 2 * y === 65);
const quiz2 = findPair((x, y) => x + y === 30 && 5 * x - 2 * y === 87);
const training = findPair((x, y) => y === 700 * x && y === 4000 + 450 * x, 1000, (x) => 700 * x);
const kindergarten = findPair((x, y) => 3 * x + y === 3500 && x + 2 * y === 3000, 3500, (x) => 3500 - 3 * x); // BEM 2023
const library = findPair((x, y) => 4 * x + 10 * y === 62000 && 6 * x + 5 * y === 61000, 15500, (x) => (62000 - 4 * x) / 10);
const bikes = findPair((x, y) => y === 150 * x && y === 600 + 90 * x, 1000, (x) => 150 * x);
const bakery = findPair((x, y) => 5 * x + 2 * y === 21000 && 3 * x + 4 * y === 25200, 4200, (x) => (21000 - 5 * x) / 2);
const coffee = findPair((x, y) => x + y === 30 && 250 * x + 500 * y === 9 * 1000);
const melons = findPair((x, y) => x + y === 400 && 20 * x + 30 * y === 9600, 400);
const water = solve2(1, 1, 3600, 1, '-1.4', 0);
const gym = findPair((x, y) => 2 * x + y === 9000 && x + 3 * y === 12500, 4500, (x) => 9000 - 2 * x);
const copies = findPair((x, y) => y === 5 * x && y === 600 + 3 * x, 3000, (x) => 5 * x);
const feed = findPair((x, y) => 8 * x + 5 * y === 26300 && 6 * x + 10 * y === 34600, 3300, (x) => (26300 - 8 * x) / 5);

if (theatre1.length !== 1 || quiz1.length !== 1) throw new Error('mushkilat-jumla oracle: une seule ثنائية proposée doit convenir');

const ID = (k) => `ex-4am-mushkilat-jumla-${k}`;
const E = {
  // ── niveau 1
  'l1-001:q1': R(610 / 10),
  'l1-001:q2': R(coins[0]), 'l1-001:q3': R(coins[1]),
  'l1-002:q2': R(30300 / 150),
  'l1-003:q2': P(...derby),
  'l1-004:q2': R(kiosk[0]), 'l1-004:q3': R(kiosk[1]),
  'l1-005:q1': R(1100 / 100),
  'l1-005:q2': R(bundles[0]), 'l1-005:q3': R(bundles[1]),
  'l1-006:q2': R(ages[0]), 'l1-006:q3': R(ages[1]),
  'l1-007:q2': R(league[0]), 'l1-007:q3': R(league[1]),
  'l1-008:q1': R(90 / 2),
  'l1-008:q2': R(farm[0]), 'l1-008:q3': R(farm[1]),
  'l1-009:q1': yes(24 + 6 === 30 && 150 * 24 + 250 * 6 === 5100),
  'l1-009:q2': yes(6 + 24 === 30 && 150 * 6 + 250 * 24 === 5100),
  'l1-010:q2': R(cinema[0]), 'l1-010:q3': R(cinema[1]),
  // ── niveau 2
  'l2-001:q2': R(museum[0]), 'l2-001:q3': R(museum[1]),
  'l2-002:q2': R(big2019[0]), 'l2-002:q3': R(big2019[1]),
  'l2-003:q2': R(euclid[0]), 'l2-003:q3': R(euclid[1]),
  'l2-004:q1': R(3750 / 50),
  'l2-004:q2': R(karting[0]), 'l2-004:q3': R(karting[1]),
  'l2-005:q1': P(...solve2(2, 3, 255, 6, 4, 640)),
  'l2-005:q2': R(pencils[0]), 'l2-005:q3': R(pencils[1]),
  'l2-006:q1': R(93000 / 1500),
  'l2-006:q2': R(shoes[0]), 'l2-006:q3': R(shoes[1]),
  'l2-007:q1': P(...theatre1[0]),
  'l2-007:q2': R(theatre2[0]), 'l2-007:q3': R(theatre2[1]),
  'l2-008:q2': R(diff24[0]), 'l2-008:q3': R(diff24[1]),
  'l2-009:q2': R(father[0]), 'l2-009:q3': R(father[1]),
  'l2-010:q1': P(...solve2(1, 1, 54000, 1, '-0.8', 0)),
  'l2-010:q2': R(prizes[1] * 1000), 'l2-010:q3': R(prizes[0] * 1000),                     // 1er = y, 2e = x
  // ── niveau 3
  'l3-001:q2': P(...coins),
  'l3-002:q2': R(ratio133[0]), 'l3-002:q3': R(ratio133[1]),
  'l3-003:q1': R(2 * 4 - 4),                                                               // x + 4 = 2(y + 4) ⇒ x − 2y = 4
  'l3-003:q2': R(amine[0]), 'l3-003:q3': R(amine[1]),
  'l3-004:q2': R(grades[0]), 'l3-004:q3': R(grades[1]),
  'l3-005:q2': R(timgad[0]), 'l3-005:q3': R(timgad[1]),
  'l3-005:q4': yes(40 + 12 === 52 && 800 * 40 + 1200 * 12 === 44000),
  'l3-006:q1': P(...solve2(1, 1, 20, 1, 3, 36)),
  'l3-006:q2': R(gcd(900, 300)),
  'l3-006:q3': R(olives[0]), 'l3-006:q4': R(olives[1]),
  'l3-007:q2': R(tram[0]), 'l3-007:q3': R(tram[1]),
  'l3-007:q4': yes(natural(1, 1, 30, 40, 25, 1000)),
  'l3-008:q1': P(...solve2(4, 5, 105, 6, 4, 112)),
  'l3-008:q2': R(notebooks[0]), 'l3-008:q3': R(notebooks[1]),
  'l3-009:q1': P(...solve2(1, 1, 105, 1, '-0.4', 0)),
  'l3-009:q2': R(balls[0]), 'l3-009:q3': R(balls[1]),
  'l3-009:q4': R(balls[1] * 2500 + balls[0] * 1800),
  'l3-010:q2': R(rect60[0]), 'l3-010:q3': R(rect60[1]),
  // ── niveau 4
  'l4-001:q2': R(field[0]), 'l4-001:q3': R(field[1]),
  'l4-001:q4': R((field[0] - 2) * (field[1] + 2)),
  'l4-002:q2': R(angles[0]), 'l4-002:q3': R(angles[1]),
  'l4-003:q2': R(trapeze[0]), 'l4-003:q3': R(trapeze[1]),
  'l4-004:q1': R(1000 + 50),
  'l4-004:q2': R(fruits[0]), 'l4-004:q3': R(fruits[1]),
  'l4-005:q2': R(ratioAB[0]), 'l4-005:q3': R(ratioAB[1]),
  'l4-005:q4': R(q(ratioAB[0]).div(ratioAB[1])),
  'l4-006:q1': P(...solve2(3, 5, 7400, 4, 14, 12800)),
  'l4-006:q2': R(canteen[0]), 'l4-006:q3': R(canteen[1]),
  'l4-006:q4': R(q(3 * canteen[0]).add(q(5).mul(q(canteen[1]).mul('1.15')))),
  'l4-007:q2': R(abuKamil[0]), 'l4-007:q3': R(abuKamil[1]),
  'l4-008:q1': P(...solve2(1, 1, 14, 1, 4, 32)),
  'l4-008:q2': R(gcd(500, 125)),
  'l4-008:q3': R(tea[0]), 'l4-008:q4': R(tea[1]),
  'l4-009:q1': P(...quiz1[0]),
  'l4-009:q2': R(quiz2[0]), 'l4-009:q3': R(quiz2[1]),
  'l4-009:q4': yes(natural(1, 1, 30, 5, -2, 100)),
  'l4-010:q1': R(10 * 700), 'l4-010:q2': R(4000 + 10 * 450),
  'l4-010:q4': R(training[0]), 'l4-010:q5': R(training[1]),
  // ── niveau 5
  'l5-001:q1': R(kindergarten[0]), 'l5-001:q2': R(kindergarten[1]),
  'l5-001:q3': C(1500000 - (840 * kindergarten[0] + (6 * 8 / 2) * kindergarten[1] + 0.2 * 1500000) > 0 ? 'A' : 'B'),
  'l5-001:q4': R(1500000 - (840 * kindergarten[0] + (6 * 8 / 2) * kindergarten[1] + 1500000 * 20 / 100)),
  'l5-002:q2': R(library[0]), 'l5-002:q3': R(library[1]),
  'l5-002:q4': R(400000 - (24 * library[0] + 50 * library[1] + 400000 * 10 / 100)),
  'l5-003:q1': R(6 * 150), 'l5-003:q2': R(600 + 6 * 90),
  'l5-003:q4': R(bikes[0]), 'l5-003:q5': R(bikes[1]),
  'l5-003:q6': C(15 * 150 <= 600 + 15 * 90 ? 'A' : 'B'),
  'l5-004:q2': R(bakery[0]), 'l5-004:q3': R(bakery[1]),
  'l5-004:q4': R(30 * bakery[0] + 8 * bakery[1]),
  'l5-004:q5': R(q(30 * bakery[0] + 8 * bakery[1]).mul('0.9')),
  'l5-005:q2': R(coffee[0]), 'l5-005:q3': R(coffee[1]),
  'l5-005:q4': R(coffee[0] * 450 + coffee[1] * 850),
  'l5-005:q5': R(coffee[0] * 450 + coffee[1] * 850 - 9 * 1300),
  'l5-006:q2': R(melons[0]), 'l5-006:q3': R(melons[1]),
  'l5-006:q4': R(gcd(melons[0], melons[1])),
  'l5-006:q5': R(melons[0] / gcd(melons[0], melons[1])), 'l5-006:q6': R(melons[1] / gcd(melons[0], melons[1])),
  'l5-007:q2': R(water[0]), 'l5-007:q3': R(water[1]),
  'l5-007:q4': R(q(water[0]).div('0.35')),
  'l5-007:q5': R(q(3600).mul('6.3').mul(30)),
  'l5-008:q2': R(gym[0]), 'l5-008:q3': R(gym[1]),
  'l5-008:q4': R(12 * 8 * gym[0]), 'l5-008:q5': R(8 * 2 * gym[1]),
  'l5-008:q6': R(400000 - (12 * 8 * gym[0] + 8 * 2 * gym[1] + 400000 * 15 / 100)),
  'l5-009:q2': R(copies[0]), 'l5-009:q3': R(copies[1]),
  'l5-009:q4': R(600 + 450 * 3),
  'l5-009:q5': R(Math.max(Math.floor(2000 / 5), Math.floor((2000 - 600) / 3))),
  'l5-010:q2': R(feed[0]), 'l5-010:q3': R(feed[1]),
  'l5-010:q4': R(q(8 * feed[0]).mul('1.05').add(q(5 * feed[1]).mul('0.9'))),
};

export const ORACLE = Object.fromEntries(Object.entries(E).map(([k, v]) => [`${ID(k.split(':')[0])}:${k.split(':')[1]}`, v]));

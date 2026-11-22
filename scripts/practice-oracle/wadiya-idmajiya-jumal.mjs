// Oracle du banc « wadiya-idmajiya-jumal » au format BEM (unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
// synthèse « أدمج تعلّماتي », banque réécrite le 2026-10-07) — chaque réponse RECALCULÉE ici, sans lire le contenu
// ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Méthode : chaque histoire est RE-TRADUITE ici à partir des nombres de l'énoncé (quantités, prix, kg → g,
// pourcentages payés…), puis
//   solve2(…)   résout la jumla par Cramer en rationnels exacts (helpers.mjs) ;
//   story(…)    vérifie en plus que la solution rejoue l'histoire écrite en clair (contrôle croisé) ;
//   yes(b)      « هل … ؟ برّر » : A = نعم, B = لا ;
//   firstNat / lastNat   « ابتداءً من » / « أكبر عدد » : recherche pas à pas sur les entiers naturels ;
//   gcd         PGCD par Euclide (étapes hors leçon `counted:false`).
// Les montants dérivés (coûts, bénéfices, budgets) sont recalculés sur la ثنائية obtenue.
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { R, C, P, q, solve2 } from './helpers.mjs';

const K = (s) => `ex-4am-wadiya-idmajiya-jumal-${s}`;
const v = (x) => q(x).toString();
const sign = (x) => { const n = q(x).n; return n > 0n ? 1 : n < 0n ? -1 : 0; };
const yes = (b) => C(b ? 'A' : 'B');
/** a·x + b·y = c est-elle vérifiée par (x ; y) ? */
const holds = ([a, b, c], x, y) => q(a).mul(x).add(q(b).mul(y)).sub(c).isZero();
/** Résout la jumla et vérifie qu'elle rejoue l'histoire (prédicat en clair sur les rationnels). */
function story(sys, check) {
  const [x, y] = solve2(...sys.flat());
  if (check && !check(q(x), q(y))) throw new Error(`oracle: l'histoire n'est pas rejouée par (${x} ; ${y})`);
  return { x, y, P: P(x, y) };
}
const firstNat = (pred) => { for (let n = 0; n <= 100000; n += 1) if (pred(n)) return n; throw new Error('oracle: aucun naturel'); };
const lastNat = (pred) => firstNat((n) => !pred(n + 1) && pred(n));
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const eq = (a, b) => q(a).sub(b).isZero();

/* ── Niveau 1 ── */
const n1_7 = story([[1, 1, 180], [1, -1, 15]], (x, y) => eq(x.add(y), 180) && eq(x.sub(y), 15));
// رحلة القسم : 10x + 10y = 800 ; 2x + 3y = 210
const rihla = story([[10, 10, 800], [2, 3, 210]]);
const baqat = story([[3, 1, 700], [1, 2, 900]]);
const n1_4 = story([[2, -1, 3], [1, -2, -5]]);
const n1_5 = story([[3, -1, -1], [3, 1, 5]]);

/* ── Niveau 2 ── */
const asal = story([[1, 1, 18], [500, 250, 7 * 1000]]);              // 7kg = 7000 g
const atm = story([[1, 1, 356], [1000, 2000, 454000]]);
const m22 = story([[1, 1, 20], [4, 5, 88]]);
const derby = story([[1, 1, 12], [300, 500, 4400]]);
const water = story([[2, 5, 330], [6, 4, 440]]);
const waterStory = story([[2, 5, 330], [3, 2, 220]]);             // l'histoire de l'étape 02
const coins = story([[1, 1, 25], [10, 20, 380]]);
const karate = story([[5, 3, 7600], [2, 4, 6400]]);
const kiosk = story([[2, 1, 170], [3, 1, 225]]);
const ages = story([[1, 1, 30], [1, -1, 4]]);
const pitch = story([[2, 2, 46], [1, -1, 7]]);

/* ── Niveau 3 ── */
// 0,8(5x + 5y) = 1080 : on paie 80 %
const milk = story([[6, 1, 720], [q(1).sub('0.2').mul(5), q(1).sub('0.2').mul(5), 1080]]);
const figs = story([[1, 1, 15], [1, 4, 30]]);
const figsStory = story([[1, 1, 15], [200, 800, 6000]]);
const hafl = story([[150, 150, 11250], [24, 30, 2100]]);
const fruit = story([[3, 2, 1000 + 100], [1, 4, 1000 + 200]]);
const acc = story([[1, 1, 2500], [q(1).sub('0.2'), q(1).sub('0.1'), 2100]]);
const ice = story([[3, 2, 340], [2, 5, 520]]);
const park = story([[1, 1, 90], [400, 250, 27600]]);
const thales = story([[1, 1, 96], [1, '-1.4', 0]]);
const tPR = q(96).mul(35).div(35 + 25);                               // PR/PS = PT/PU, PR + PS = RS
const school = story([[3, 1, 4100], [5, 1, 6300]]);
const sweets = story([[5, 3, 380], [8, 6, 650]]);
const sweetsStory = story([[5, 3, 380], [4, 3, 325]]);

/* ── Niveau 4 ── */
const n41b = story([[1, 1, 50], [3, 4, 165]]);
const plot = story([[2, 2, 96], [1, '-0.6', 0]]);
const shirts = story([[2, 3, 5100], [1, 5, 3250]]);
const shirtsOne = q(shirts.x).add(q(2).mul(shirts.y));
const stadium = story([[1, 1, 1000], [600, 200, 383000]]);
const isNat = (s) => /^\d+$/.test(s);
const phone = story([[4, 1, 1400], [7, 1, 1850]]);
const bus = story([[30, 1, 13500], [45, 1, 18000]]);
const share = (n) => q(bus.x).mul(n).add(bus.y).div(n);
const juice = story([[1, 1, 20], [120, 200, 2960]]);
const age2 = story([[1, 1, 52], [1, -3, 3 * 6 - 6]], (x, y) => eq(x.add(6), y.add(6).mul(3)));
const tri = story([[2, 1, 32], [1, -1, 4]], (x, y) => q(x).add(x).sub(y).n > 0n);   // inégalité triangulaire
const gars = story([[1, 1, 24], [150, 600, 6750]]);

/* ── Niveau 5 ── */
const eqPay = ([p1, q1], [p2, q2]) => story([[p1, -1, -q1], [p2, -1, -q2]]);   // y = p·x + q ⇔ p·x − y = −q
const pay = ([p, c], n) => q(p).mul(n).add(c);
const cars = [[3000, 40000], [4500, 25000]];
const tank = [[1500, 0], [1200, 4500]];
const theatre = [[600, 0], [350, 3000]];
const transl = [[800, 0], [500, 2400]];
const boat = [[2500, 0], [1500, 6000]];
const mosque = story([[2, 3, 5400], [3, 1, 5300]]);
const mosqueCost = q(30 * 20).mul(mosque.x).add(q(9 * 12).div(2).mul(mosque.y)).add(q(1500000).mul('0.25'));
const gear = story([[4, 3, 19200], [2, 5, 26400]]);
const gearFull = q(25).mul(q(gear.x).add(gear.y));
const gearPaid = gearFull.mul(q(1).sub('0.12'));
const island = story([[2, 5, 12000], [3, 2, 14700]]);
const hyp = firstNat((h) => h * h === 24 * 24 + 32 * 32);
const shrubs = (24 + 32 + hyp) / 8;
const islandTotal = q(shrubs).mul(island.x).add(q(240).mul(island.y)).mul('1.15');
const clinic = story([[3, 2, 4200], [1, 4, 3400]]);
const facade = q(20 * 7).sub(q(3).mul('1.5').mul('1.2')).sub(q(2).mul('2.5'));
const clinicCost = q(20 * 12).mul(clinic.x).add(facade.mul(clinic.y)).add(q(400000).mul('0.2'));
const canteen = story([[2, 8, 30400], [3, 10, 42000]]);
const canteenEquip = q(30).mul(canteen.x).add(q(180).mul(canteen.y));
const canteenTotal = canteenEquip.mul('1.05');

export const ORACLE = {
  /* ── Niveau 1 ── */
  [K('l1-001:q1')]: R(8 * 2 - 1),
  [K('l1-001:q2')]: yes(8 * 0 - 1 === -1),
  [K('l1-002:q2')]: yes(holds(['1/3', -1, 3], 0, 0)),
  [K('l1-003:q1')]: R(v(q(2).mul('1/2').sub(q('1/2').mul('-1/2')))),
  [K('l1-003:q2')]: yes(holds([1, 1, 0], '1/2', '-1/2') && holds([2, '-1/2', 0], '1/2', '-1/2')),
  [K('l1-004:q1')]: n1_4.P,
  [K('l1-005:q1')]: R(v(q(-1 + 5).div(3 + 3))),
  [K('l1-005:q2')]: n1_5.P,
  // 3x − y = 1 ⇔ y = 3x − 1
  [K('l1-006:q1')]: R(3),
  [K('l1-006:q2')]: R(-1),
  [K('l1-006:q3')]: yes([0, 1, 2].every((x) => 3 * x - (3 * x + 1) === 1)),
  [K('l1-007:q2')]: n1_7.P,
  [K('l1-008:q2')]: rihla.P,
  [K('l1-009:q2')]: baqat.P,
  [K('l1-010:q1')]: R(1600 / 20),
  [K('l1-010:q2')]: yes(isNat('12.5') && isNat('17.5')),

  /* ── Niveau 2 ── */
  [K('l2-001:q2')]: asal.P,
  [K('l2-002:q2')]: atm.P,
  // l'unique des deux paires qui vérifie x + y = 20 et x + 5/4·y = 22
  [K('l2-003:q1')]: (() => { const ok = [[12, 8], [8, 12]].filter(([x, y]) => holds([1, 1, 20], x, y) && holds([1, '5/4', 22], x, y)); if (ok.length !== 1) throw new Error('l2-003'); return P(...ok[0]); })(),
  [K('l2-003:q2')]: m22.P,
  [K('l2-004:q1')]: derby.P,
  [K('l2-004:q2')]: R(v(q(derby.y).mul(500))),
  [K('l2-005:q1')]: water.P,
  [K('l2-005:q2')]: R(waterStory.x),
  [K('l2-005:q3')]: R(waterStory.y),
  [K('l2-006:q2')]: coins.P,
  [K('l2-007:q1')]: karate.P,
  [K('l2-007:q2')]: R(v(q(4).mul(karate.x).add(q(4).mul(karate.y)))),
  [K('l2-008:q1')]: kiosk.P,
  [K('l2-008:q2')]: R(v(q(kiosk.x).add(kiosk.y))),
  [K('l2-009:q2')]: ages.P,
  [K('l2-010:q2')]: pitch.P,

  /* ── Niveau 3 ── */
  [K('l3-001:q2')]: milk.P,
  [K('l3-001:q3')]: R(v(q(5).mul(milk.x).add(q(5).mul(milk.y)))),
  [K('l3-002:q1')]: figs.P,
  [K('l3-002:q2')]: R(gcd(800, 200)),
  [K('l3-002:q3')]: R(figsStory.x),
  [K('l3-002:q4')]: R(figsStory.y),
  [K('l3-003:q2')]: hafl.P,
  [K('l3-003:q3')]: R(v(q(150 - 24).mul(hafl.x).add(q(150 - 30).mul(hafl.y)))),
  [K('l3-004:q2')]: fruit.P,
  [K('l3-004:q3')]: R(v(q(5).mul(fruit.x).add(q(6).mul(fruit.y)).div(1000))),
  [K('l3-005:q2')]: acc.P,
  [K('l3-005:q3')]: R(v(q(acc.x).mul('0.8'))),
  [K('l3-006:q1')]: ice.P,
  [K('l3-006:q2')]: R(v(q(2).mul(ice.x).add(q(3).mul(ice.y)))),
  [K('l3-007:q2')]: park.P,
  [K('l3-007:q3')]: R(v(q(park.y).mul(250))),
  [K('l3-008:q1')]: thales.P,
  [K('l3-008:q2')]: R(96),
  [K('l3-008:q3')]: R(v(q(35).div(25))),
  [K('l3-008:q4')]: R(v(tPR)),
  [K('l3-008:q5')]: R(v(q(96).sub(tPR))),
  [K('l3-009:q2')]: school.P,
  [K('l3-009:q3')]: R(v(q(9).mul(school.x).add(school.y))),
  [K('l3-010:q1')]: sweets.P,
  [K('l3-010:q2')]: R(sweetsStory.x),
  [K('l3-010:q3')]: R(sweetsStory.y),

  /* ── Niveau 4 ── */
  [K('l4-001:q1')]: (() => { const ok = [[35, 15], [15, 35]].filter(([x, y]) => holds([1, 1, 50], x, y) && holds([1, '4/3', 55], x, y)); if (ok.length !== 1) throw new Error('l4-001'); return P(...ok[0]); })(),
  [K('l4-001:q2')]: n41b.P,
  // x + y = 50 et 3x + 3y = 165 : déterminant nul et 3·50 ≠ 165 → aucune solution
  [K('l4-001:q3')]: yes(3 * 3 - 3 * 3 !== 0 || 3 * 50 === 165),
  [K('l4-002:q1')]: story([[1, 1, 48], [1, '-0.6', 0]]).P,
  [K('l4-002:q2')]: R(plot.x),
  [K('l4-002:q3')]: R(plot.y),
  [K('l4-002:q4')]: R(v(q(plot.x).mul(plot.y))),
  [K('l4-003:q2')]: shirts.P,
  [K('l4-003:q3')]: yes(sign(q(2500).sub(shirtsOne)) < 0),
  [K('l4-003:q4')]: R(v(shirtsOne.sub(2500))),
  [K('l4-004:q2')]: stadium.P,
  [K('l4-004:q3')]: yes(isNat(stadium.x) && isNat(stadium.y)),
  [K('l4-005:q2')]: phone.P,
  [K('l4-005:q3')]: R(v(q(10).mul(phone.x).add(phone.y))),
  [K('l4-005:q4')]: R(lastNat((n) => sign(q(n).mul(phone.x).add(phone.y).sub(3000)) <= 0)),
  [K('l4-006:q1')]: bus.P,
  [K('l4-006:q2')]: R(v(share(50))),
  [K('l4-006:q3')]: R(firstNat((n) => n > 0 && sign(share(n).sub(400)) < 0)),
  [K('l4-007:q2')]: juice.P,
  [K('l4-007:q3')]: R(v(q(juice.y).mul(200))),
  [K('l4-007:q4')]: R(v(q(20).div('0.25').mul(80).sub(2960))),
  [K('l4-008:q2')]: age2.P,
  [K('l4-008:q3')]: R(firstNat((n) => eq(q(age2.x).add(n), q(age2.y).add(n).mul(2)))),
  [K('l4-009:q2')]: tri.P,
  // AH² = AB² − (BC/2)² = a²·2 → a
  [K('l4-009:q3')]: R(firstNat((a) => eq(q(a * a * 2), q(tri.x).mul(tri.x).sub(q(tri.y).div(2).mul(q(tri.y).div(2)))))),
  [K('l4-010:q1')]: story([[1, 1, 24], [1, 4, 45]]).P,
  [K('l4-010:q2')]: R(gcd(600, 150)),
  [K('l4-010:q3')]: R(gars.x),
  [K('l4-010:q4')]: R(gars.y),

  /* ── Niveau 5 ── */
  [K('l5-001:q1')]: mosque.P,
  [K('l5-001:q2')]: R(v(q(30 * 20).mul(mosque.x))),
  [K('l5-001:q3')]: R(v(q(9 * 12).div(2))),
  [K('l5-001:q4')]: C(sign(q(1500000).sub(mosqueCost)) > 0 ? 'A' : 'B'),
  [K('l5-001:q5')]: R(v(q(1500000).sub(mosqueCost))),
  [K('l5-002:q1')]: R(v(pay(cars[0], 8))),
  [K('l5-002:q2')]: R(v(pay(cars[1], 8))),
  [K('l5-002:q4')]: eqPay(...cars).P,
  [K('l5-002:q5')]: R(firstNat((n) => sign(pay(cars[1], n).sub(pay(cars[0], n))) > 0)),
  [K('l5-003:q1')]: R(v(pay(tank[0], 10))),
  [K('l5-003:q2')]: R(v(pay(tank[1], 10))),
  [K('l5-003:q4')]: eqPay(...tank).P,
  [K('l5-003:q5')]: C(sign(pay(tank[1], 20).sub(pay(tank[0], 20))) < 0 ? 'B' : 'A'),
  [K('l5-004:q2')]: gear.P,
  [K('l5-004:q3')]: R(v(gearFull)),
  [K('l5-004:q4')]: R(v(gearPaid)),
  [K('l5-004:q5')]: R(lastNat((n) => sign(q(950).mul(n).sub(q(140000).sub(gearPaid))) <= 0)),
  [K('l5-005:q1')]: R(v(pay(theatre[0], 10))),
  [K('l5-005:q2')]: R(v(pay(theatre[1], 10))),
  [K('l5-005:q4')]: eqPay(...theatre).P,
  [K('l5-005:q5')]: R(firstNat((n) => eq(pay(theatre[1], n), 8600))),
  [K('l5-005:q6')]: R(v(pay(theatre[0], firstNat((n) => eq(pay(theatre[1], n), 8600))))),
  [K('l5-006:q1')]: island.P,
  [K('l5-006:q2')]: R(v(q(240).mul(island.y))),
  [K('l5-006:q3')]: R(hyp),
  [K('l5-006:q4')]: R(shrubs),
  [K('l5-006:q5')]: yes(sign(q(250000).sub(islandTotal)) >= 0),
  [K('l5-006:q6')]: R(v(q(250000).sub(islandTotal))),
  [K('l5-007:q1')]: R(v(pay(transl[0], 5))),
  [K('l5-007:q2')]: R(v(pay(transl[1], 5))),
  [K('l5-007:q4')]: eqPay(...transl).P,
  [K('l5-007:q5')]: C(sign(pay(transl[1], 12).sub(pay(transl[0], 12))) < 0 ? 'B' : 'A'),
  [K('l5-008:q2')]: clinic.P,
  [K('l5-008:q3')]: R(v(q(20 * 12).mul(clinic.x))),
  [K('l5-008:q4')]: R(v(facade)),
  [K('l5-008:q5')]: C(sign(q(400000).sub(clinicCost)) > 0 ? 'A' : 'B'),
  [K('l5-008:q6')]: R(v(q(400000).sub(clinicCost))),
  [K('l5-009:q1')]: R(v(pay(boat[0], 4))),
  [K('l5-009:q2')]: R(v(pay(boat[1], 4))),
  [K('l5-009:q4')]: eqPay(...boat).P,
  [K('l5-009:q5')]: R(lastNat((n) => sign(pay(boat[0], n).sub(21000)) <= 0)),
  [K('l5-009:q6')]: R(lastNat((n) => sign(pay(boat[1], n).sub(21000)) <= 0)),
  [K('l5-010:q2')]: canteen.P,
  [K('l5-010:q3')]: R(v(canteenEquip)),
  [K('l5-010:q4')]: yes(sign(q(600000).sub(canteenTotal)) >= 0),
  [K('l5-010:q5')]: R(v(q(600000).sub(canteenTotal))),
};

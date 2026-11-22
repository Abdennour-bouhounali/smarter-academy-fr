// Oracle du banc « tatbiqat-tanasub » au format BEM (unité 6 « الدالة الخطية والتناسبية », leçon 4
// « تطبيقات التناسبية — النسب المئوية والمقادير المركبة », banque réécrite le 2026-10-07) — chaque réponse
// RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu ni le code testé
// (packages/core/arithmetic/proportional.js). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils (rationnels exacts de helpers.mjs, jamais de flottants) :
//   up(x, t) / down(x, t)  augmenter / diminuer x de t % : x × (1 + t/100), x × (1 − t/100)
//   pct(x, t)              t % de x : x × t/100
//   rate(a, b)             le taux d'évolution SIGNÉ de a vers b, en % : (b − a)/a × 100
//   net(n, t)              le montant TOTAL dont il reste n après un prélèvement de t % : n ÷ (1 − t/100)
//   share(part, whole)     la part en % : part/whole × 100
//   roundTo(v, step)       arrondi exact au pas `step` (au plus proche, la moitié vers le haut) — la règle
//                          « مدوّرا إلى 0,1 / 0,01 » écrite dans answerFormat
//   floorQ(v)              partie entière (le plus grand nombre de شجيرات qu'un budget permet)
//   sci(v)                 [a, n] de la كتابة علمية a × 10^n (1 ≤ a < 10)
//   yes(b)                 « هل … ؟ برّر » : A = نعم, B = لا
//   pickMax(vals)          la lettre (A, B, C…) de la plus grande valeur, unique
// Unités : 1 h = 3600 s = 60 min, 1 km = 1000 m, 1 m³ = 1000 L = 1 000 000 cm³, 1 dm³ = 1000 cm³,
// 1 kg = 1000 g, 1 t = 1000 kg ; 1 mm de pluie = 1 L par m².
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { R, C, q } from './helpers.mjs';

const LETTERS = 'ABCDEF';
const up = (x, t) => q(x).mul(q(1).add(q(t).div(100)));
const down = (x, t) => q(x).mul(q(1).sub(q(t).div(100)));
const pct = (x, t) => q(x).mul(q(t)).div(100);
const rate = (a, b) => q(b).sub(q(a)).div(q(a)).mul(100);
const net = (n, t) => q(n).div(q(1).sub(q(t).div(100)));
const share = (part, whole) => q(part).div(q(whole)).mul(100);
function floorQ(v) {
  const x = q(v);
  const f = x.n >= 0n ? x.n / x.d : -((-x.n + x.d - 1n) / x.d);
  return q(String(f));
}
const roundTo = (v, step) => floorQ(q(v).div(q(step)).add(q('1/2'))).mul(q(step));
const yes = (b) => C(b ? 'A' : 'B');
/** La kitāba ʿilmiyya a × 10^n d'un nombre positif : [a, n] avec 1 ≤ a < 10. */
function sci(v) {
  let a = q(v); let n = 0;
  while (a.sub(10).n >= 0n) { a = a.div(10); n += 1; }
  while (a.sub(1).n < 0n) { a = a.mul(10); n -= 1; }
  return [a, n];
}
function pickMax(vals) {
  const qs = vals.map((v) => q(v));
  let best = 0;
  qs.forEach((v, i) => { if (v.sub(qs[best]).n > 0n) best = i; });
  if (qs.filter((v) => v.sub(qs[best]).isZero()).length !== 1) throw new Error('oracle tatbiqat-tanasub : maximum non unique');
  return C(LETTERS[best]);
}
const K = (lvl, n, qid) => `ex-4am-tatbiqat-tanasub-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

// ── Niveau 1 ──
const L1 = {
  [K(1, 1, 'q1')]: R(up(1, 5)),                                   // f(x) = 1,05x
  [K(1, 1, 'q2')]: R(up(25000, 5)),
  [K(1, 2, 'q1')]: R(down(1, 15)),
  [K(1, 2, 'q2')]: R(down(40, 15)),
  [K(1, 3, 'q1')]: R(pct(30, 20)),
  [K(1, 3, 'q2')]: R(pct(10, 30)),
  [K(1, 3, 'q3')]: R(q(30).add(10).sub(pct(30, 20)).sub(pct(10, 30))),
  [K(1, 4, 'q1')]: R(pct(640, 25)),
  [K(1, 4, 'q2')]: R(q(640).sub(pct(640, 25))),
  [K(1, 5, 'q1')]: R(down(1, 30)),
  [K(1, 5, 'q2')]: R(down(4500, 30)),
  [K(1, 6, 'q1')]: R(q(150).div(2)),
  [K(1, 6, 'q2')]: R(q(150).div(2).mul(4)),
  [K(1, 7, 'q1')]: R(q(540).div(200)),
  [K(1, 7, 'q2')]: R(q(540).div(200).mul(50)),
  [K(1, 8, 'q1')]: R(q('1.5').mul(2)),
  [K(1, 8, 'q2')]: R(q('1.5').mul(2).mul('4.2')),
  [K(1, 9, 'q1')]: R(up(1, 20)),
  [K(1, 9, 'q2')]: R(up(500, 20)),
  [K(1, 10, 'q1')]: R(q(90)),                                     // d = 90t
  [K(1, 10, 'q2')]: R(q(90).mul(q(2).add(q(30).div(60)))),        // 2 h 30 min
};

// ── Niveau 2 ──
const L2 = {
  [K(2, 1, 'q1')]: R(down(1, 6)),
  [K(2, 1, 'q2')]: R(down(560, 6)),
  [K(2, 2, 'q1')]: R(down(1, 5)),
  [K(2, 2, 'q2')]: R(down(1200, 5)),
  [K(2, 3, 'q1')]: R(q(3240).div(3000)),
  [K(2, 3, 'q2')]: R(rate(3000, 3240)),
  [K(2, 4, 'q1')]: R(up(1, 8)),
  [K(2, 4, 'q2')]: yes(up(7, 8).div(7).sub(up(3, 8).div(3)).isZero() && up(0, 8).isZero()), // x ⟼ kx, f(0) = 0
  [K(2, 4, 'q3')]: R(up(250, 8)),
  [K(2, 5, 'q1')]: R(q(25).mul(3600).div(1000)),
  [K(2, 5, 'q2')]: yes(q(25).mul(3600).div(1000).sub(80).n > 0n),
  [K(2, 6, 'q1')]: R(q(7200000).div(1000)),
  [K(2, 6, 'q2')]: R(q(7200000).div(1000).div(3600)),
  [K(2, 7, 'q1')]: R(q(45).div(q(1).add(q(30).div(60)))),
  [K(2, 7, 'q2')]: R(q(75).div(q(45).div('1.5'))),
  [K(2, 8, 'q1')]: R(q(42).div('1.5')),
  [K(2, 8, 'q2')]: R(q('2.4').div('0.01')),
  [K(2, 9, 'q1')]: R(q('0.92').mul(5)),
  [K(2, 9, 'q2')]: R(q(23).div('0.92')),
  [K(2, 10, 'q1')]: R(net(324000, 10)),
  [K(2, 10, 'q2')]: R(net(324000, 10).div(60)),
};

// ── Niveau 3 ──
const fill = [[100, 50], [95, 40], [90, 60], [90, 70]];
const girls = fill.reduce((s, [n, t]) => s.add(pct(n, t)), q(0));
const pupils = fill.reduce((s, [n]) => s.add(n), q(0));
const pop17 = q('41.2').mul(1000000);
const L3 = {
  [K(3, 1, 'q1')]: R(q(4140).div(4500)),
  [K(3, 1, 'q2')]: R(rate(4500, 4140).mul(-1)),
  [K(3, 2, 'q1')]: R(girls),
  [K(3, 2, 'q2')]: R(roundTo(share(girls, pupils), '0.1')),
  [K(3, 3, 'q1')]: R(q('6.7').sub('6.1')),
  [K(3, 3, 'q2')]: R(roundTo(rate('6.7', '6.1').mul(-1), '0.01')),
  [K(3, 4, 'q1')]: R(down(2600, 5)),
  [K(3, 4, 'q2')]: R(net(1900, 5)),
  [K(3, 5, 'q1')]: R(q(150).mul(1500)),
  [K(3, 5, 'q2')]: R(pct(360000, 25)),
  [K(3, 5, 'q3')]: R(q(360000).sub(q(150).mul(1500)).sub(pct(360000, 25))),
  [K(3, 6, 'q1')]: R(q('57.9').mul(1000).div(q(3).mul(1000))),
  [K(3, 6, 'q2')]: R(q(63).div(6)),
  [K(3, 6, 'q3')]: R(q('71.2').div(8)),
  [K(3, 6, 'q4')]: pickMax([q('57.9').mul(1000).div(3000), q(63).div(6), q('71.2').div(8)]),
  [K(3, 7, 'q1')]: R(roundTo(pop17.div(2381740), '0.1')),
  [K(3, 7, 'q2')]: R(roundTo(up(pop17, 10).div(2381740), '0.1')),
  [K(3, 8, 'q1')]: R(q(300).div(250)),
  [K(3, 8, 'q2')]: R(rate(250, 300)),
  [K(3, 8, 'q3')]: R(q(300).mul(q(300).div(250))),
  [K(3, 9, 'q1')]: R(q(13600).mul(1000).div(1000000)),
  [K(3, 9, 'q2')]: R(roundTo(q(1000).div(q(13600).mul(1000).div(1000000)), '0.1')),
  [K(3, 10, 'q1')]: R(pct(360, 125)),
  [K(3, 10, 'q2')]: R(q(360).add(pct(360, 125))),
  [K(3, 10, 'q3')]: R(floorQ(q(81000).sub(1800).div(q(360).add(pct(360, 125))))),
};

// ── Niveau 4 ──
const tank = up(down(30, 30), 15);
const car = up(1, 3).mul(down(1, 2)).mul(down(1, 1));
// 2023-like : x + y = 5500 ; 2x + 3y = 14000 (Cramer)
const [tile, grass] = (() => {
  const D = q(1).mul(3).sub(q(2).mul(1));
  return [q(5500).mul(3).sub(q(14000).mul(1)).div(D), q(1).mul(14000).sub(q(2).mul(5500)).div(D)];
})();
const L4 = {
  [K(4, 1, 'q1')]: R(down(30, 30)),
  [K(4, 1, 'q2')]: R(tank),
  [K(4, 1, 'q3')]: R(rate(30, tank)),
  [K(4, 2, 'q1')]: R(car),
  [K(4, 2, 'q2')]: R(q(1800000).mul(car)),
  [K(4, 3, 'q1')]: R(down(down(48000, 3), 4)),
  [K(4, 3, 'q2')]: R(rate(48000, down(down(48000, 3), 4)).mul(-1)),
  [K(4, 4, 'q1')]: R(down(1000, 20)),
  [K(4, 4, 'q2')]: R(up(down(1000, 20), 20)),
  [K(4, 4, 'q3')]: yes(up(down(1000, 20), 20).sub(1000).isZero()),
  [K(4, 4, 'q4')]: R(rate(1000, up(down(1000, 20), 20))),
  [K(4, 5, 'q1')]: R(net(q('3.24').mul(1000000), 10)),
  [K(4, 5, 'q2')]: R(net(q('3.24').mul(1000000), 10).div(240)),
  [K(4, 5, 'q3')]: R(sci(net(q('3.24').mul(1000000), 10).div(240))[0]),
  [K(4, 5, 'q4')]: R(sci(net(q('3.24').mul(1000000), 10).div(240))[1]),
  [K(4, 6, 'q1')]: R(q(2200).mul(1000)),
  [K(4, 6, 'q2')]: R(q(2200).mul(1000).mul(60)),
  [K(4, 7, 'q1')]: R(q(3).mul(1000)),
  [K(4, 7, 'q2')]: R(q(3).mul(1000).mul(3600)),
  [K(4, 7, 'q3')]: R(q(54000).div(3).div(3600)),
  [K(4, 8, 'q1')]: R(tile),
  [K(4, 8, 'q2')]: R(grass),
  [K(4, 8, 'q3')]: R(q(120).mul(tile).add(q(60).mul(grass))),
  [K(4, 8, 'q4')]: R(pct(900000, 30)),
  [K(4, 8, 'q5')]: R(q(900000).sub(q(120).mul(tile).add(q(60).mul(grass))).sub(pct(900000, 30))),
  [K(4, 9, 'q1')]: R(pct(63, 75)),
  [K(4, 9, 'q2')]: R(pct(63, 75).mul(1000)),                       // kg → g, ρ = 1 g/cm³
  [K(4, 9, 'q3')]: R(roundTo(q(47).div(q(75).div(100)), '0.1')),    // 47 L d'eau = 47 kg
  [K(4, 10, 'q1')]: R(q(5).mul(3600).div(1000)),
  [K(4, 10, 'q2')]: R(q(5).mul(3600).div(1000).mul(2)),
  [K(4, 10, 'q3')]: R(q(45).div(q(5).mul(3600).div(1000))),
};

// ── Niveau 5 — الوضعيات الإدماجية ──
const land = net(q('7.65').mul(1000000), 15);
const bus = q(120).div(q(9).add(q(15).div(60)).sub(q(7).add(q(45).div(60))));
const figCost = (p) => q(p).add(pct(p, 125));
const acA = q('2.5').mul(8).mul(31).mul(5);
const potato = net(q('1.728').mul(1000000), 4);
const flight = q(1980).div(720);
const soapCost = q(60).add(pct(60, 125));
const tractor = up(3200000, 19);
const roofPerMm = pct(120, 80);
const L5 = {
  [K(5, 1, 'q1')]: R(q(80).mul(45)),
  [K(5, 1, 'q2')]: R(land),
  [K(5, 1, 'q3')]: R(land.div(q(80).mul(45))),
  [K(5, 1, 'q4')]: R(down(q('7.65').mul(1000000), 5)),
  [K(5, 2, 'q1')]: R(q(180).mul(450)),
  [K(5, 2, 'q2')]: R(q(96).mul(2800)),
  [K(5, 2, 'q3')]: R(pct(600000, 25)),
  [K(5, 2, 'q4')]: R(q(600000).sub(q(180).mul(450)).sub(q(96).mul(2800)).sub(pct(600000, 25))),
  [K(5, 2, 'q5')]: R(share(q(600000).sub(q(180).mul(450)).sub(q(96).mul(2800)).sub(pct(600000, 25)), 600000)),
  [K(5, 3, 'q1')]: R(q(9).add(q(15).div(60)).sub(q(7).add(q(45).div(60)))),
  [K(5, 3, 'q2')]: R(bus),
  [K(5, 3, 'q3')]: R(roundTo(bus.mul(1000).div(3600), '0.1')),
  [K(5, 3, 'q4')]: R(q(120).div(up(bus, 20)).mul(60)),
  [K(5, 4, 'q1')]: R(pct(300, 125)),
  [K(5, 4, 'q2')]: R(figCost(300).mul(48).add(2400)),
  [K(5, 4, 'q3')]: R(figCost(1).mul(48)),                          // T = k·p + 2400
  [K(5, 4, 'q4')]: R(q(56400).sub(2400).div(figCost(1).mul(48))),
  [K(5, 5, 'q1')]: R(q('2.5').mul(8)),
  [K(5, 5, 'q2')]: R(acA),
  [K(5, 5, 'q3')]: R(down(acA, 30)),
  [K(5, 5, 'q4')]: R(q(5580).div(acA.sub(down(acA, 30)))),
  [K(5, 6, 'q1')]: R(potato),
  [K(5, 6, 'q2')]: R(potato.div(q(45).mul(1000))),
  [K(5, 6, 'q3')]: R(up(potato.div(45000), 35)),
  [K(5, 6, 'q4')]: R(up(potato.div(45000), 35).sub(potato.div(45000)).mul(45000)),
  [K(5, 7, 'q1')]: R(flight),
  [K(5, 7, 'q2')]: R(flight.mul(60)),
  [K(5, 7, 'q3')]: R(q(720).mul(1000).div(3600)),
  [K(5, 7, 'q4')]: R(q('2.4').mul(flight)),
  [K(5, 7, 'q5')]: R(share(q(8).sub(q('2.4').mul(flight)), 8)),
  [K(5, 8, 'q1')]: R(pct(60, 125)),
  [K(5, 8, 'q2')]: R(soapCost),
  [K(5, 8, 'q3')]: R(up(soapCost, 20)),
  [K(5, 8, 'q4')]: R(q(54000).div(up(soapCost, 20).sub(soapCost))),
  [K(5, 9, 'q1')]: R(tractor),
  [K(5, 9, 'q2')]: R(pct(tractor, 40)),
  [K(5, 9, 'q3')]: R(tractor.sub(pct(tractor, 40)).div(12)),
  [K(5, 9, 'q4')]: R(share(tractor.sub(pct(tractor, 40)), 3200000)),
  [K(5, 10, 'q1')]: R(q(120).mul(18)),
  [K(5, 10, 'q2')]: R(pct(q(120).mul(18), 80)),
  [K(5, 10, 'q3')]: R(pct(q(120).mul(18), 80).div(54)),
  [K(5, 10, 'q4')]: R(q(3).mul(1000).div(roofPerMm)),
};

export const ORACLE = { ...L1, ...L2, ...L3, ...L4, ...L5 };

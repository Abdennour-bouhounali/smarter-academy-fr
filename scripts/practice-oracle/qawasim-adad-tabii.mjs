// Oracle du banc « qawasim-adad-tabii » (قواسم عدد طبيعي), réécrit au format BEM le 2026-10-06 —
// chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon,
// bloc « // qawasim-adad-tabii » et « سلسلة التفوق — تمرين 1 »).
//
// Outils : diviseurs par BALAYAGE complet 1…n (indépendant de la règle d'arrêt √n enseignée),
// couples (d, n/d) avec d ≤ n/d, borne de test = plus grand k tel que k² ≤ n (balayage),
// filtres sur les diviseurs, fractions et inéquations exactes via q(...).
// Choix نعم / لا : A = نعم, B = لا. Niveau 5, l5-005 : O1/O3/O4 = العرض 1/3/4 ; l5-006 : A = ربح, B = خسارة.
import { R, C, q } from './helpers.mjs';

const S = (arr) => ({ value: [...arr].sort((a, b) => a - b).join(', ') });
const divides = (d, n) => n % d === 0;
const divisors = (n) => { const out = []; for (let d = 1; d <= n; d++) if (divides(d, n)) out.push(d); return out; };
/** couples (d, n/d) avec d ≤ n/d */
const pairs = (n) => divisors(n).filter((d) => d * d <= n).map((d) => [d, n / d]);
/** plus grand k ≥ 1 tel que k² ≤ n, par balayage */
const testBound = (n) => { let k = 1; while ((k + 1) * (k + 1) <= n) k++; return k; };
/** a naturel tel que n/(a + c) soit naturel : balayage a = 0 … n */
const shift = (n, c) => Array.from({ length: n + 1 }, (_, a) => a).filter((a) => divides(a + c, n));
const yn = (d, n) => C(divides(d, n) ? 'A' : 'B');
const between = (n, lo, hi) => divisors(n).filter((d) => d >= lo && d <= hi);
/** plus grande valeur entière p telle que coef·p + fixe ≤ budget (exacte) */
const maxPrice = (coef, fixed, budget) => q(budget - fixed).div(coef).toString();

/* — Niveau 5 : situations recalculées — */
const dates = [4, 5, 6, 7, 8, 9].filter((m) => divides(m, 336));
const datesBoxes = 336 / Math.max(...dates);
const fence = pairs(240).reduce((best, [a, b]) => Math.min(best, 2 * (a + b)), Infinity);
const groups216 = between(216, 20, 40);
const nGroups216 = 216 / Math.max(...groups216);
const offers = { 1: [4, 6500], 2: [5, 7800], 3: [6, 9200], 4: [8, 12500] };
const validOffers = Object.keys(offers).map(Number).filter((k) => divides(offers[k][0], 72));
const offerCost = (k) => (72 / offers[k][0]) * offers[k][1];
const bestOffer = validOffers.reduce((b, k) => (offerCost(k) < offerCost(b) ? k : b));
const rows198 = divisors(198).filter((d) => d > 5 && d < 15);
const maxRows198 = Math.max(...rows198);
const contractor = 2100000 - (198 * 9500 + maxRows198 * 12000);
const rows280 = between(280, 10, 20);
const rows280ok = rows280.filter((r) => 280 / r > r);
const bestRows280 = rows280ok.reduce((b, r) => (280 / r - r < 280 / b - b ? r : b));
const shelves252 = between(252, 15, 30);
const nShelves252 = 252 / Math.max(...shelves252);
const teams324 = between(324, 5, 12);
const nTeams324 = 324 / Math.min(...teams324);
const bags1500 = [10, 20, 25, 40, 50].filter((m) => divides(m, 1500));
const nBags25 = 1500 / 25;

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted — نشاط 2 : 60
  'ex-4am-qawasim-adad-tabii-l1-001:q1': R(pairs(60).length),
  'ex-4am-qawasim-adad-tabii-l1-001:q2': S(divisors(60)),
  // adapted — تمرين 3 : 84
  'ex-4am-qawasim-adad-tabii-l1-002:q1': R(testBound(84)),
  'ex-4am-qawasim-adad-tabii-l1-002:q2': S(divisors(84)),
  // على منوال BEM 2008 — 76 ; 19/76 (counted:false)
  'ex-4am-qawasim-adad-tabii-l1-003:q1': S(divisors(76)),
  'ex-4am-qawasim-adad-tabii-l1-003:q2': R(q('19/76').toString()),
  // على منوال BEM 2009 — 121
  'ex-4am-qawasim-adad-tabii-l1-004:q1': S(divisors(121)),
  // على منوال BEM 2015 — 98
  'ex-4am-qawasim-adad-tabii-l1-005:q1': S(divisors(98)),
  'ex-4am-qawasim-adad-tabii-l1-005:q2': R(divisors(98).length),
  // على منوال BEM 2024 — 112 قصة : 14 ? 12 ?
  'ex-4am-qawasim-adad-tabii-l1-006:q1': yn(14, 112),
  'ex-4am-qawasim-adad-tabii-l1-006:q2': yn(12, 112),
  'ex-4am-qawasim-adad-tabii-l1-006:q3': S(divisors(112)),
  // على منوال BEM 2016 — 63 ; plus grand diviseur ≠ 63
  'ex-4am-qawasim-adad-tabii-l1-007:q1': S(divisors(63)),
  'ex-4am-qawasim-adad-tabii-l1-007:q2': R(Math.max(...divisors(63).filter((d) => d !== 63))),
  // على منوال BEM 2021 — 187
  'ex-4am-qawasim-adad-tabii-l1-008:q1': S(divisors(187)),
  // على منوال BEM 2023 — A = 684/6
  'ex-4am-qawasim-adad-tabii-l1-009:q1': R(q('684/6').toString()),
  'ex-4am-qawasim-adad-tabii-l1-009:q2': S(divisors(684 / 6)),
  // على منوال BEM 2025 — 95
  'ex-4am-qawasim-adad-tabii-l1-010:q1': S(divisors(95)),

  /* ── Niveau 2 ── */
  // adapted — نشاط 2 ب : 48 et 17
  'ex-4am-qawasim-adad-tabii-l2-001:q1': S(divisors(48)),
  'ex-4am-qawasim-adad-tabii-l2-001:q2': S(divisors(17)),
  // adapted — تمرين 8 : 18/a naturel ⇔ a | 18 ; puis 18/a pair
  'ex-4am-qawasim-adad-tabii-l2-002:q1': S(Array.from({ length: 18 }, (_, i) => i + 1).filter((a) => divides(a, 18))),
  'ex-4am-qawasim-adad-tabii-l2-002:q2': S(divisors(18).filter((a) => (18 / a) % 2 === 0)),
  // على منوال BEM 2008 — 132 ; diviseurs pairs
  'ex-4am-qawasim-adad-tabii-l2-003:q1': S(divisors(132)),
  'ex-4am-qawasim-adad-tabii-l2-003:q2': S(divisors(132).filter((d) => d % 2 === 0)),
  // على منوال BEM 2010 — 56 m² : largeurs ≤ longueurs ; longueur 14
  'ex-4am-qawasim-adad-tabii-l2-004:q1': S(divisors(56)),
  'ex-4am-qawasim-adad-tabii-l2-004:q2': S(pairs(56).map(([w]) => w)),
  'ex-4am-qawasim-adad-tabii-l2-004:q3': R(56 / 14),
  // على منوال BEM 2024 — 126 feuilles : 12 ? 14 ? ; diviseurs strictement entre 5 et 20
  'ex-4am-qawasim-adad-tabii-l2-005:q1': yn(12, 126),
  'ex-4am-qawasim-adad-tabii-l2-005:q2': yn(14, 126),
  'ex-4am-qawasim-adad-tabii-l2-005:q3': S(divisors(126).filter((d) => d > 5 && d < 20)),
  // على منوال BEM 2015 — 221
  'ex-4am-qawasim-adad-tabii-l2-006:q1': R(testBound(221)),
  'ex-4am-qawasim-adad-tabii-l2-006:q2': S(divisors(221)),
  // على منوال BEM 2016 — 225
  'ex-4am-qawasim-adad-tabii-l2-007:q1': S(divisors(225)),
  'ex-4am-qawasim-adad-tabii-l2-007:q2': R(divisors(225).length),
  // على منوال BEM 2021 — 116 ; 116/(a + 3)
  'ex-4am-qawasim-adad-tabii-l2-008:q1': S(divisors(116)),
  'ex-4am-qawasim-adad-tabii-l2-008:q2': S(shift(116, 3)),
  // على منوال BEM 2023 — A = 476/4
  'ex-4am-qawasim-adad-tabii-l2-009:q1': R(q('476/4').toString()),
  'ex-4am-qawasim-adad-tabii-l2-009:q2': S(divisors(476 / 4)),
  // على منوال BEM 2025 — 1134 : par 9 ? ; parmi 2, 3, 4, 5, 9
  'ex-4am-qawasim-adad-tabii-l2-010:q1': yn(9, 1134),
  'ex-4am-qawasim-adad-tabii-l2-010:q2': S([2, 3, 4, 5, 9].filter((d) => divides(d, 1134))),

  /* ── Niveau 3 ── */
  // adapted — طريقة : 105
  'ex-4am-qawasim-adad-tabii-l3-001:q1': R(testBound(105)),
  'ex-4am-qawasim-adad-tabii-l3-001:q2': S(divisors(105)),
  // adapted — تمرين 4 : 5 × 11, 910, 1000
  'ex-4am-qawasim-adad-tabii-l3-002:q1': S(divisors(5 * 11)),
  'ex-4am-qawasim-adad-tabii-l3-002:q2': S(divisors(910)),
  'ex-4am-qawasim-adad-tabii-l3-002:q3': S(divisors(1000)),
  // adapted — سلسلة التفوق، تمرين 1 : 48, 75, 2 × 13, 3 × 11 × 17
  'ex-4am-qawasim-adad-tabii-l3-003:q1': S(divisors(48)),
  'ex-4am-qawasim-adad-tabii-l3-003:q2': S(divisors(75)),
  'ex-4am-qawasim-adad-tabii-l3-003:q3': S(divisors(2 * 13)),
  'ex-4am-qawasim-adad-tabii-l3-003:q4': S(divisors(3 * 11 * 17)),
  // على منوال BEM 2008 — 228 ; 57/228 (counted:false)
  'ex-4am-qawasim-adad-tabii-l3-004:q1': S(divisors(228)),
  'ex-4am-qawasim-adad-tabii-l3-004:q2': R(q('57/228').toString()),
  // على منوال BEM 2010 — salle 168 m² ; L − ℓ = 2
  'ex-4am-qawasim-adad-tabii-l3-005:q1': S(divisors(168)),
  'ex-4am-qawasim-adad-tabii-l3-005:q2': S(pairs(168).map(([w]) => w)),
  'ex-4am-qawasim-adad-tabii-l3-005:q3': R(pairs(168).find(([w, l]) => l - w === 2)[0]),
  // على منوال BEM 2015 — 391 ; P = 391/17 − 391/23 (counted:false)
  'ex-4am-qawasim-adad-tabii-l3-006:q1': R(testBound(391)),
  'ex-4am-qawasim-adad-tabii-l3-006:q2': S(divisors(391)),
  'ex-4am-qawasim-adad-tabii-l3-006:q3': R(q('391/17').sub(q('391/23')).toString()),
  // على منوال BEM 2016 — 210 ; nombre de produits ; 210/(a + 11)
  'ex-4am-qawasim-adad-tabii-l3-007:q1': S(divisors(210)),
  'ex-4am-qawasim-adad-tabii-l3-007:q2': R(pairs(210).length),
  'ex-4am-qawasim-adad-tabii-l3-007:q3': S(shift(210, 11)),
  // على منوال BEM 2021 — 256 ; 256/a impair
  'ex-4am-qawasim-adad-tabii-l3-008:q1': S(divisors(256)),
  'ex-4am-qawasim-adad-tabii-l3-008:q2': R(divisors(256).length),
  'ex-4am-qawasim-adad-tabii-l3-008:q3': S(divisors(256).filter((a) => (256 / a) % 2 === 1)),
  // على منوال BEM 2023 — A = 3960/18 ; diviseurs impairs
  'ex-4am-qawasim-adad-tabii-l3-009:q1': R(q('3960/18').toString()),
  'ex-4am-qawasim-adad-tabii-l3-009:q2': S(divisors(3960 / 18)),
  'ex-4am-qawasim-adad-tabii-l3-009:q3': S(divisors(3960 / 18).filter((d) => d % 2 === 1)),
  // على منوال BEM 2024 — 240 œufs : 18 ? 16 ? ; diviseurs de 6 à 30
  'ex-4am-qawasim-adad-tabii-l3-010:q1': yn(18, 240),
  'ex-4am-qawasim-adad-tabii-l3-010:q2': yn(16, 240),
  'ex-4am-qawasim-adad-tabii-l3-010:q3': S(between(240, 6, 30)),

  /* ── Niveau 4 ── */
  // adapted — تمرين 9 : 24/(a + 7)
  'ex-4am-qawasim-adad-tabii-l4-001:q1': S(divisors(24)),
  'ex-4am-qawasim-adad-tabii-l4-001:q2': S(shift(24, 7)),
  // adapted — تمرين 7 : réservoir 30 m³, hauteur 1 m
  'ex-4am-qawasim-adad-tabii-l4-002:q1': R(q(30).div(1).toString()),
  'ex-4am-qawasim-adad-tabii-l4-002:q2': S(pairs(30).map(([w]) => w)),
  'ex-4am-qawasim-adad-tabii-l4-002:q3': R(pairs(30).length),
  // على منوال BEM 2016 — N = 2x4 : par 3, puis par 4 ; diviseurs de 264
  'ex-4am-qawasim-adad-tabii-l4-003:q1': S([...Array(10).keys()].filter((x) => divides(3, 200 + 10 * x + 4))),
  'ex-4am-qawasim-adad-tabii-l4-003:q2': S([...Array(10).keys()].filter((x) => divides(3, 204 + 10 * x) && divides(4, 204 + 10 * x))),
  'ex-4am-qawasim-adad-tabii-l4-003:q3': S(divisors(200 + 10 * 6 + 4)),
  // على منوال BEM 2009 — 144 : produits, diviseurs, 9 rangées
  'ex-4am-qawasim-adad-tabii-l4-004:q1': R(pairs(144).length),
  'ex-4am-qawasim-adad-tabii-l4-004:q2': S(divisors(144)),
  'ex-4am-qawasim-adad-tabii-l4-004:q3': R(144 / 9),
  // على منوال BEM 2010 — 300 m² ; périmètre 70 m
  'ex-4am-qawasim-adad-tabii-l4-005:q1': S(divisors(300)),
  'ex-4am-qawasim-adad-tabii-l4-005:q2': S(pairs(300).map(([w]) => w)),
  'ex-4am-qawasim-adad-tabii-l4-005:q3': R(pairs(300).find(([w, l]) => 2 * (w + l) === 70)[0]),
  // على منوال BEM 2015 — 527 ; 527/(a + 4)
  'ex-4am-qawasim-adad-tabii-l4-006:q1': R(testBound(527)),
  'ex-4am-qawasim-adad-tabii-l4-006:q2': S(divisors(527)),
  'ex-4am-qawasim-adad-tabii-l4-006:q3': S(shift(527, 4)),
  // على منوال BEM 2021 — 196 ; d² | 196 ; √196 (counted:false, k² = 196 par balayage)
  'ex-4am-qawasim-adad-tabii-l4-007:q1': S(divisors(196)),
  'ex-4am-qawasim-adad-tabii-l4-007:q2': S(divisors(196).filter((d) => divides(d * d, 196))),
  'ex-4am-qawasim-adad-tabii-l4-007:q3': R(Array.from({ length: 197 }, (_, k) => k).find((k) => k * k === 196)),
  // على منوال BEM 2023 — A = 4410/15 ; A/a naturel impair
  'ex-4am-qawasim-adad-tabii-l4-008:q1': R(q('4410/15').toString()),
  'ex-4am-qawasim-adad-tabii-l4-008:q2': S(divisors(4410 / 15)),
  'ex-4am-qawasim-adad-tabii-l4-008:q3': S(divisors(4410 / 15).filter((a) => ((4410 / 15) / a) % 2 === 1)),
  // على منوال BEM 2024 — 192 plants : 15 ? 16 ? ; rangées si 10 ≤ plants/rangée ≤ 30
  'ex-4am-qawasim-adad-tabii-l4-009:q1': yn(15, 192),
  'ex-4am-qawasim-adad-tabii-l4-009:q2': yn(16, 192),
  'ex-4am-qawasim-adad-tabii-l4-009:q3': S(divisors(192).filter((rows) => 192 / rows >= 10 && 192 / rows <= 30)),
  // على منوال BEM 2025 — 4x2y divisible par 5 et 9 (balayage des chiffres) ; 4320 par 4
  'ex-4am-qawasim-adad-tabii-l4-010:q1': S([...Array(10).keys()].flatMap((x) => [...Array(10).keys()].map((y) => 4020 + 100 * x + y)).filter((n) => divides(5, n) && divides(9, n))),
  'ex-4am-qawasim-adad-tabii-l4-010:q2': yn(4, 4320),

  /* ── Niveau 5 — الوضعيات الإدماجية ── */
  // على منوال BEM 2022 II — تمر بسكرة 336 kg : 4…9 ; plus grandes boîtes ; 42 × (6800 − 150)
  'ex-4am-qawasim-adad-tabii-l5-001:q1': S(dates),
  'ex-4am-qawasim-adad-tabii-l5-001:q2': R(datesBoxes),
  'ex-4am-qawasim-adad-tabii-l5-001:q3': R(datesBoxes * (6800 - 150)),
  // على منوال BEM 2020 II — سياج 240 m² : couples ; périmètre minimal ; p·P + 3200 ≤ 40400
  'ex-4am-qawasim-adad-tabii-l5-002:q1': R(pairs(240).length),
  'ex-4am-qawasim-adad-tabii-l5-002:q2': R(fence),
  'ex-4am-qawasim-adad-tabii-l5-002:q3': R(maxPrice(fence, 3200, 40400)),
  // على منوال BEM 2021 II — رحلة تيمقاد 216 : groupes de 20 à 40 ; moins de groupes ; 216p + bus ≤ 118800
  'ex-4am-qawasim-adad-tabii-l5-003:q1': S(groups216),
  'ex-4am-qawasim-adad-tabii-l5-003:q2': R(nGroups216),
  'ex-4am-qawasim-adad-tabii-l5-003:q3': R(maxPrice(216, nGroups216 * 9000, 118800)),
  // على منوال BEM 2022 II — فراولة سكيكدة 375 kg : 2…6 ; diviseurs ; caisses de 5 ; bénéfice
  'ex-4am-qawasim-adad-tabii-l5-004:q1': S([2, 3, 4, 5, 6].filter((m) => divides(m, 375))),
  'ex-4am-qawasim-adad-tabii-l5-004:q2': S(divisors(375)),
  'ex-4am-qawasim-adad-tabii-l5-004:q3': R(375 / 5),
  'ex-4am-qawasim-adad-tabii-l5-004:q4': R((375 / 5) * (1450 - 30) - 4500),
  // على منوال BEM 2024 II — 72 ordinateurs, 4 offres ; tables des offres 1, 3, 4 ; offre la moins chère
  'ex-4am-qawasim-adad-tabii-l5-005:q1': S(validOffers),
  'ex-4am-qawasim-adad-tabii-l5-005:q2': R(72 / offers[validOffers[0]][0]),
  'ex-4am-qawasim-adad-tabii-l5-005:q3': R(72 / offers[validOffers[1]][0]),
  'ex-4am-qawasim-adad-tabii-l5-005:q4': R(72 / offers[validOffers[2]][0]),
  'ex-4am-qawasim-adad-tabii-l5-005:q5': C(`O${bestOffer}`),
  // على منوال BEM 2023 II — موقف 198 places : rangées entre 5 et 15 ; max ; bénéfice / perte
  'ex-4am-qawasim-adad-tabii-l5-006:q1': S(divisors(198)),
  'ex-4am-qawasim-adad-tabii-l5-006:q2': S(rows198),
  'ex-4am-qawasim-adad-tabii-l5-006:q3': R(198 / maxRows198),
  'ex-4am-qawasim-adad-tabii-l5-006:q4': C(contractor > 0 ? 'A' : 'B'),
  'ex-4am-qawasim-adad-tabii-l5-006:q5': R(Math.abs(contractor)),
  // على منوال BEM 2020 II — زيتون معسكر 280 : rangées de 10 à 20 ; plants/rangée > rangées, écart minimal ; 280p + tuyaux ≤ 191800
  'ex-4am-qawasim-adad-tabii-l5-007:q1': S(rows280),
  'ex-4am-qawasim-adad-tabii-l5-007:q2': R(bestRows280),
  'ex-4am-qawasim-adad-tabii-l5-007:q3': R(maxPrice(280, bestRows280 * 60 * 45, 191800)),
  // على منوال BEM 2022 II — نحاس قسنطينة 252 : diviseurs ; 15 à 30 ; moins d'étagères ; vente − étagères
  'ex-4am-qawasim-adad-tabii-l5-008:q1': S(divisors(252)),
  'ex-4am-qawasim-adad-tabii-l5-008:q2': S(shelves252),
  'ex-4am-qawasim-adad-tabii-l5-008:q3': R(nShelves252),
  'ex-4am-qawasim-adad-tabii-l5-008:q4': R(252 * 1800 - nShelves252 * 2400),
  // على منوال BEM 2021 II — مسابقة ورقلة 324 : équipes de 5 à 12 ; plus d'équipes ; n·p + 324 × 850 ≤ 410400
  'ex-4am-qawasim-adad-tabii-l5-009:q1': S(teams324),
  'ex-4am-qawasim-adad-tabii-l5-009:q2': R(nTeams324),
  'ex-4am-qawasim-adad-tabii-l5-009:q3': R(maxPrice(nTeams324, 324 * 850, 410400)),
  // على منوال BEM 2022 II — سميد سيدي بلعباس 1500 kg : sacs ; sacs de 25 ; commerçants (4 à 10 sacs chacun) ; recette
  'ex-4am-qawasim-adad-tabii-l5-010:q1': S(bags1500),
  'ex-4am-qawasim-adad-tabii-l5-010:q2': R(nBags25),
  'ex-4am-qawasim-adad-tabii-l5-010:q3': S(divisors(nBags25).filter((m) => nBags25 / m >= 4 && nBags25 / m <= 10)),
  'ex-4am-qawasim-adad-tabii-l5-010:q4': R(nBags25 * 1650),
};

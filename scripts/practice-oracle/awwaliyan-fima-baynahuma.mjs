// Oracle du banc « awwaliyan-fima-baynahuma » (العددان الأوّليّان فيما بينهما), réécrit au format BEM le
// 2026-10-06 — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon,
// bloc « // awwaliyan-fima-baynahuma » : l2-001 q1, l3-001 q1, l5-001 q2, l3-003 q1 — mêmes ids, mêmes réponses).
//
// Outils (indépendants du contenu) : reste par SOUSTRACTIONS successives, diviseurs par balayage complet,
// PGCD = plus grand diviseur commun de la liste, recoupé par Euclide (assertion) ; plus petit diviseur
// commun > 1 par balayage ; fractions exactes via q(...) ; racines a√m par recherche de k tel que r = k²·m.
// Les questions « بيّن أن … » en selfCheck (l4-007 q3) n'ont pas de clé et ne figurent pas ici.
// Choix : نعم = A, لا = B ; l3-003 q1 : A = « لا، مهما كان a و b ».
import { R, C, q } from './helpers.mjs';

const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const divides = (d, n) => rem(n, d) === 0;
/** n ÷ d exact — lève si d ne divise pas n */
const quo = (n, d) => { const [qq, r] = ediv(n, d); if (r !== 0) throw new Error(`${d} ne divise pas ${n}`); return qq; };
const divisors = (n) => { const out = []; for (let d = 1; d <= n; d++) if (divides(d, n)) out.push(d); return out; };
const euclid = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
/** PGCD par balayage des diviseurs communs, recoupé par Euclide */
const pgcd = (a, b) => {
  let g = 1;
  for (let d = 1; d <= Math.min(a, b); d++) if (divides(d, a) && divides(d, b)) g = d;
  if (g !== euclid(Math.max(a, b), Math.min(a, b))) throw new Error(`pgcd(${a}, ${b}) incohérent`);
  return g;
};
/** plus petit diviseur commun > 1 (lève si les nombres sont premiers entre eux) */
const smallest = (a, b) => { for (let d = 2; d <= Math.min(a, b); d++) if (divides(d, a) && divides(d, b)) return d; throw new Error(`${a}, ${b} premiers entre eux`); };
/** entiers de lo à hi INCLUS */
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
const yn = (b) => C(b ? 'A' : 'B');
const frac = (a, b) => R(q(`${a}/${b}`).toString());
/** côté s possible pour un rectangle w × l découpé en carrés sans perte */
const side = (s, w, l) => yn(divides(s, w) && divides(s, l));
const squaresOf = (w, l, s) => quo(w, s) * quo(l, s);
/** arbres sur le périmètre d'un rectangle w × l, espacement s, un arbre à chaque coin */
const trees = (w, l, s) => quo(2 * (w + l), s);
/** nombre minimal de bus de c places pour n personnes */
const buses = (n, c) => { let k = 0; while (k * c < n) k++; return k; };
/** mètres (écriture décimale du sujet) → centimètres, entier exact */
const cm = (m) => Number(q(m).mul(100).toString());
/** k tel que r = k²·m — lève sinon */
const root = (r, m) => { const k2 = quo(r, m); let k = 0; while (k * k < k2) k++; if (k * k !== k2) throw new Error(`${r} ≠ k²·${m}`); return k; };
/** coefficient a de Σ c·√r = a√m */
const coef = (terms, m) => terms.reduce((s, [c, r]) => s + c * root(r, m), 0);
/** plus grand entier p de [lo ; hi] tel que ok(p) */
const maxPrice = (lo, hi, ok) => { let best = null; for (let p = lo; p <= hi; p++) if (ok(p)) best = p; if (best === null) throw new Error('aucun prix'); return best; };

/* — سلسلة التفوق، تمرين 7 : 3 divise toujours 3a et 6b quand PGCD(a ; b) = 1 (balayage) — */
for (let a = 1; a <= 40; a++) for (let b = 1; b <= 40; b++) {
  if (pgcd(a, b) === 1 && !(divides(3, 3 * a) && divides(3, 6 * b))) throw new Error('l3-003 : 3 ne divise pas');
}
/* — l3-003 : PGCD(3a ; 6b) n'est pas toujours 3 (a = 4, b = 3) — */
if (pgcd(3 * 4, 6 * 3) === 3) throw new Error('l3-003 q4');
/* — l4-007 : deux entiers consécutifs sont premiers entre eux (balayage) — */
for (let a = 1; a <= 300; a++) if (pgcd(a, a + 1) !== 1) throw new Error('consécutifs');

export const ORACLE = {

  /* ── Niveau 1 ── */
  'ex-4am-awwaliyan-fima-baynahuma-l1-001:q1': S(divisors(17)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-001:q2': S(divisors(18)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-001:q3': R(pgcd(17, 18)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-002:q1': R(pgcd(209, 144)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-002:q2': yn(pgcd(209, 144) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l1-003:q1': R(pgcd(275, 162)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-004:q1': R(pgcd(128, 135)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-004:q2': frac(135, 128),
  'ex-4am-awwaliyan-fima-baynahuma-l1-005:q1': R(pgcd(437, 342)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-005:q2': yn(pgcd(437, 342) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l1-006:q1': R(pgcd(256, 81)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-007:q1': R(smallest(1158, 426)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-007:q2': R(pgcd(1158, 426)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-008:q1': R(pgcd(1240, 735)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-008:q2': R(pgcd(248, 147)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-009:q1': R(pgcd(189, 160)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-009:q2': yn(pgcd(189, 160) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l1-010:q1': R(pgcd(351, 208)),
  'ex-4am-awwaliyan-fima-baynahuma-l1-010:q2': frac(351, 208),

  /* ── Niveau 2 ── */
  'ex-4am-awwaliyan-fima-baynahuma-l2-001:q1': R(pgcd(15, 22)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-001:q2': yn(pgcd(15, 22) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l2-002:q1': R(pgcd(133, 90)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-002:q2': R(pgcd(cm('1,33'), cm('0,9'))),
  'ex-4am-awwaliyan-fima-baynahuma-l2-002:q3': R(squaresOf(cm('1,33'), cm('0,9'), pgcd(133, 90))),
  'ex-4am-awwaliyan-fima-baynahuma-l2-003:q1': side(2, 46, 75),
  'ex-4am-awwaliyan-fima-baynahuma-l2-003:q2': side(3, 46, 75),
  'ex-4am-awwaliyan-fima-baynahuma-l2-003:q3': R(pgcd(46, 75)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-003:q4': R(squaresOf(46, 75, pgcd(46, 75))),
  'ex-4am-awwaliyan-fima-baynahuma-l2-004:q1': R(pgcd(546, 385)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-004:q2': frac(546, 385),
  'ex-4am-awwaliyan-fima-baynahuma-l2-004:q3': R(pgcd(78, 55)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-005:q1': R(pgcd(325, 252)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-005:q2': yn(pgcd(325, 250) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l2-006:q1': R(pgcd(625, 128)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-006:q2': yn(pgcd(625, 125) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l2-007:q1': R(pgcd(1176, 1105)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-007:q2': S(range(31, 39).filter((n) => pgcd(n, 1176) === 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-008:q1': R(pgcd(255, 238)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-008:q2': frac(255, 238),
  'ex-4am-awwaliyan-fima-baynahuma-l2-008:q3': R(pgcd(15, 14)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-009:q1': R(smallest(2835, 1485)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-009:q2': R(pgcd(2835, 1485)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-010:q1': R(pgcd(2025, 2024)),
  'ex-4am-awwaliyan-fima-baynahuma-l2-010:q2': R(pgcd(2025, 2026)),

  /* ── Niveau 3 ── */
  'ex-4am-awwaliyan-fima-baynahuma-l3-001:q1': R(pgcd(56, 65)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-001:q2': yn(pgcd(65, 104) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l3-001:q3': frac(104, 65),
  'ex-4am-awwaliyan-fima-baynahuma-l3-002:q1': yn(pgcd(27, 36) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l3-002:q2': R(pgcd(27, 36)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-002:q3': R(pgcd(22, 35)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-003:q1': C('A'),
  'ex-4am-awwaliyan-fima-baynahuma-l3-003:q2': R(pgcd(5, 8)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-003:q3': R(pgcd(15, 48)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-003:q4': R(pgcd(12, 18)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-004:q1': R(pgcd(1173, 1360)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-004:q2': frac(1173, 1360),
  'ex-4am-awwaliyan-fima-baynahuma-l3-004:q3': R(pgcd(69, 80)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-005:q1': R(pgcd(1575, 1088)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-005:q2': yn(pgcd(1575, 1088) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l3-005:q3': R(coef([[1, 1575], [-2, 252]], 7)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-006:q1': R(pgcd(1225, 936)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-006:q2': R(root(1225, 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-006:q3': S(range(21, 29).filter((n) => pgcd(n, 1225) === 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-007:q1': R(smallest(805, 1265)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-007:q2': R(pgcd(805, 1265)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-007:q3': frac(805, 1265),
  'ex-4am-awwaliyan-fima-baynahuma-l3-008:q1': side(5, 65, 126),
  'ex-4am-awwaliyan-fima-baynahuma-l3-008:q2': side(7, 65, 126),
  'ex-4am-awwaliyan-fima-baynahuma-l3-008:q3': R(pgcd(65, 126)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-008:q4': R(pgcd(65, 126)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-008:q5': R(squaresOf(65, 126, pgcd(65, 126))),
  'ex-4am-awwaliyan-fima-baynahuma-l3-009:q1': R(pgcd(1311, 1007)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-009:q2': frac(1311, 1007),
  'ex-4am-awwaliyan-fima-baynahuma-l3-009:q3': R(pgcd(69, 53)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-009:q4': R(q('1311/1007').sub(q('8/53').mul(2)).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l3-010:q1': R(pgcd(2002, 1287)),
  'ex-4am-awwaliyan-fima-baynahuma-l3-010:q2': R(quo(2002, pgcd(2002, 1287))),
  'ex-4am-awwaliyan-fima-baynahuma-l3-010:q3': R(quo(1287, pgcd(2002, 1287))),
  'ex-4am-awwaliyan-fima-baynahuma-l3-010:q4': R(pgcd(14, 9)),

  /* ── Niveau 4 ── */
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q1': R(smallest(152, 250)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q2': R(smallest(18, 135)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q3': R(smallest(235, 1840)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q4': R(smallest(87, 84)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q5': R(smallest(12345, 67895)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-001:q6': R(pgcd(12345, 67895)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-002:q1': R(pgcd(1859, 1430)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-002:q2': frac(1859, 1430),
  'ex-4am-awwaliyan-fima-baynahuma-l4-002:q3': R(pgcd(13, 10)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-002:q4': R(coef([[1, 1859], [2, 99]], 11)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-003:q1': R(pgcd(845, 672)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-003:q2': R(coef([[1, 845], [-1, 320]], 5)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-003:q3': S(range(1, 12).filter((n) => pgcd(n, 672) === 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-004:q1': R(pgcd(1463, 1045)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-004:q2': frac(1463, 1045),
  'ex-4am-awwaliyan-fima-baynahuma-l4-004:q3': R(coef([[1, 147], [1, 300], [-1, 48]], 3)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-004:q4': yn(pgcd(1463, 1464) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l4-005:q1': R(pgcd(170, 117)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-005:q2': R(pgcd(cm('1,70'), cm('1,17'))),
  'ex-4am-awwaliyan-fima-baynahuma-l4-005:q3': R(squaresOf(cm('1,70'), cm('1,17'), 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-005:q4': R(smallest(168, 117)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-005:q5': R(squaresOf(168, 117, pgcd(168, 117))),
  'ex-4am-awwaliyan-fima-baynahuma-l4-006:q1': side(7, 175, 288),
  'ex-4am-awwaliyan-fima-baynahuma-l4-006:q2': side(9, 175, 288),
  'ex-4am-awwaliyan-fima-baynahuma-l4-006:q3': R(pgcd(175, 288)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-006:q4': R(pgcd(180, 288)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-006:q5': R(squaresOf(180, 288, pgcd(180, 288))),
  'ex-4am-awwaliyan-fima-baynahuma-l4-007:q1': R(pgcd(48, 47)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-007:q2': R(pgcd(121, 120)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-007:q4': C('B'),
  'ex-4am-awwaliyan-fima-baynahuma-l4-008:q1': R(pgcd(2717, 1729)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-008:q2': frac(2717, 1729),
  'ex-4am-awwaliyan-fima-baynahuma-l4-008:q3': R(q('2717/1729').sub(q('3/7').mul(q('2/3'))).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l4-008:q4': R(pgcd(9, 7)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-009:q1': R(pgcd(1365, 1001)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-009:q2': R(q(3 + 1365).div(2).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l4-009:q3': R(q(1 + 1001).div(2).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l4-009:q4': yn(pgcd(684, 501) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l4-010:q1': R(pgcd(150, 77)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-010:q2': R(range(2, 150).find((n) => pgcd(n, 150) === 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l4-010:q3': S(range(41, 59).filter((n) => pgcd(n, 150) === 1)),

  /* ── Niveau 5 ── */
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q1': yn(pgcd(253, 407) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q2': R(pgcd(253, 407)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q3': R(pgcd(253, 407)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q4': R(quo(253, pgcd(253, 407))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q5': R(quo(407, pgcd(253, 407))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-001:q6': R(3000 - (quo(253, 11) * 45 + quo(407, 11) * 25)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q1': R(pgcd(187, 156)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q2': R(pgcd(187, 156)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q3': R(pgcd(195, 156)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q4': R(quo(187 + 8, pgcd(187 + 8, 156))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q5': R(quo(156, pgcd(187 + 8, 156))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-002:q6': R(8 * 180 + pgcd(187 + 8, 156) * 150),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q1': R(pgcd(77, 50)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q2': R(pgcd(77, 50)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q3': R(trees(77, 50, pgcd(77, 50))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q4': R(pgcd(77, 55)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q5': R(trees(77, 55, pgcd(77, 55))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-003:q6': R(trees(77, 50, 1) * 1200 - (77 * 5 * 400 + trees(77, 55, pgcd(77, 55)) * 1200)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q1': R(pgcd(899, 667)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q2': yn(pgcd(899, 667) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q3': R(quo(899, pgcd(899, 667))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q4': R(quo(667, pgcd(899, 667))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q5': R(pgcd(31, 23)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-004:q6': R(q(quo(899, 29) * 450 + quo(667, 29) * 200).mul(q('90/100')).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q1': R(pgcd(221, 160)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q2': R(pgcd(cm('2,21'), cm('1,60'))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q3': R(squaresOf(cm('2,21'), cm('1,60'), 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q4': R(pgcd(220, 160)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q5': R(squaresOf(220, 160, pgcd(220, 160))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-005:q6': R(squaresOf(221, 160, 1) * 5 - squaresOf(220, 160, pgcd(220, 160)) * 1500),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q1': R(pgcd(106, 85)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q2': R(pgcd(106, 85)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q3': R(pgcd(102, 85)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q4': R(quo(106 - 4, pgcd(106 - 4, 85))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q5': R(quo(85, pgcd(106 - 4, 85))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-006:q6': R(buses(102 + 85 + pgcd(102, 85), 50) * 15000),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q1': R(pgcd(1001, 768)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q2': yn(pgcd(1001, 768) > 1),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q3': R(pgcd(960, 768)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q4': R(quo(1001 - 41, pgcd(1001 - 41, 768))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q5': R(quo(768, pgcd(1001 - 41, 768))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-007:q6': R(q(quo(960, 192) * 1200 + quo(768, 192) * 350).mul(q('95/100')).mul(pgcd(960, 768)).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l5-008:q1': R(pgcd(247, 330)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-008:q2': R(quo(247, pgcd(247, 330)) + quo(330, pgcd(247, 330))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-008:q3': R(pgcd(240, 330)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-008:q4': R(quo(247 - 7, pgcd(240, 330)) + quo(330, pgcd(240, 330))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-008:q5': R(maxPrice(1, 76000, (p) => 19 * (p + 2500) <= 76000)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q1': R(pgcd(286, 195)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q2': yn(pgcd(286, 195) === 1),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q3': R(quo(286, pgcd(286, 195))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q4': R(quo(195, pgcd(286, 195))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q5': R(pgcd(22, 15)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-009:q6': R(q(286 * 1400 + 195 * 600).mul(q('60/100')).toString()),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q1': S(range(41, 49).filter((n) => pgcd(n, 70) === 1)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q2': R(range(41, 49).filter((n) => pgcd(n, 70) === 1 && divides(5, n + 3))[0]),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q3': R(pgcd(70, 49)),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q4': R(quo(70, pgcd(70, 47 + 2))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q5': R(quo(47 + 2, pgcd(70, 47 + 2))),
  'ex-4am-awwaliyan-fima-baynahuma-l5-010:q6': R(pgcd(70, 49) * 3800 + (70 + 49) * 650 - 85000),
};

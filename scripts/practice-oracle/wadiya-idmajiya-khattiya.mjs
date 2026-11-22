// Oracle du banc « wadiya-idmajiya-khattiya » au format BEM (unité 6 « الدالة الخطية والتناسبية », أدمج تعلّماتي,
// banque réécrite le 2026-10-07) — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, en rationnels
// exacts (helpers.mjs), sans lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les étapes « مثّل بيانيا » (selfCheck) n'ont pas de clé ; les questions fermées (choice) en ont une, calculée.
//
// Outils :
//   coef(y, x)       le معامل d'une fonction linéaire passant par (x ; y) : y ÷ x
//   pre(a, y)        l'antécédent de y par x ↦ ax : y ÷ a
//   lin(a, x)        l'image a × x
//   pays(t)          ce qui reste après une réduction de t % : 1 − t/100 (et up(t) = 1 + t/100)
//   family(n, k, t)  coefficient d'un groupe : n plein tarif + k bénéficiaires d'une réduction de t %
//   hyp(a, b)        hypoténuse ENTIÈRE (Pythagore, carré parfait exigé), étapes counted:false
//   floorInt(v)      le plus grand entier ≤ v ; ceilInt(v) le plus petit entier ≥ v ; roundInt(v) l'entier le plus proche
//   r2(v)            arrondi au centième (énoncés « بالتدوير إلى 0,01 »)
//   yes(b)           question « هل … ؟ برّر » : A = نعم, B = لا (ordre du contenu)
//   cheaper(u, v)    A si u < v, B si v < u (le plus petit montant ; égalité → erreur)
//   grid(v, unit)    une lecture graphique : la valeur v doit tomber sur un nœud de la grille (v ÷ unit entier)
// Unités : 1 h = 60 min = 3600 s, 1 km = 1000 m = 100000 cm, 1 L = 100 cL = 1000 mL, 1 m³ = 1000 L,
//          1 kg = 1000 g, 1 g = 100 cg, 1 t = 1000 kg, 1 MWh = 1000 kWh.
import { R, C, q, poly } from './helpers.mjs';

const coef = (y, x) => q(y).div(q(x));
const pre = (a, y) => q(y).div(q(a));
const lin = (a, x) => q(a).mul(q(x));
const pays = (t) => q(1).sub(q(t).div(100));
const up = (t) => q(1).add(q(t).div(100));
const family = (n, k, t) => q(n).add(q(k).mul(pays(t)));
const cmp = (u, v) => { const d = q(u).sub(q(v)); return d.n === 0n ? 0 : (d.n > 0n ? 1 : -1); };
function isqrt(n) {
  const N = BigInt(n); let r = BigInt(Math.floor(Math.sqrt(Number(N))));
  while (r * r > N) r -= 1n; while ((r + 1n) * (r + 1n) <= N) r += 1n;
  if (r * r !== N) throw new Error(`wadiya-khattiya oracle: ${n} n'est pas un carré parfait`);
  return r;
}
const hyp = (a, b) => String(isqrt(BigInt(a) ** 2n + BigInt(b) ** 2n));
function floorInt(v) { const x = q(v); let n = x.n / x.d; if (x.n < 0n && x.n % x.d !== 0n) n -= 1n; return n; }
const ceilInt = (v) => { const f = floorInt(v); return cmp(q(String(f)), v) === 0 ? f : f + 1n; };
const roundInt = (v) => floorInt(q(v).add(q(1).div(2)));
const r2 = (v) => q(String(roundInt(q(v).mul(100)))).div(100);
const yes = (b) => C(b ? 'A' : 'B');
function cheaper(u, v) { const c = cmp(u, v); if (c === 0) throw new Error('wadiya-khattiya oracle: égalité'); return C(c < 0 ? 'A' : 'B'); }
function grid(v, unit) { const k = q(v).div(q(unit)); if (k.d !== 1n) throw new Error(`wadiya-khattiya oracle: ${v} hors de la grille (pas ${unit})`); return q(v); }
/** Le plus grand prix ENTIER p tel que a·p ≤ budget (vérifié des deux côtés). */
function maxWhole(a, budget) {
  const p = floorInt(pre(a, budget));
  if (cmp(lin(a, String(p)), budget) > 0 || cmp(lin(a, String(p + 1n)), budget) <= 0) throw new Error('wadiya-khattiya oracle: maxWhole');
  return String(p);
}
/** Une valeur exacte qui doit être entière (compte de rondes, d'objets…). */
function whole(v) { const x = q(v); if (x.d !== 1n) throw new Error(`wadiya-khattiya oracle: ${x} non entier`); return x; }

const K = (s) => `ex-4am-wadiya-idmajiya-khattiya-${s}`;

// ── Données répétées (une seule source par exercice) ──
const L3_01 = { low: 600, high: 1000, horiz: 300, v: 4 };
const L3_05 = { top: 25, bottom: 5, horiz: 48, v: 4, fee: 250, income: 21000 };
const L4_01 = { low: 800, high: 1100, horiz: 400, kmh: 9 };
const L4_03 = { low: 900, high: 1400, AH: 2500, v: '5.5', adults: 2, kids: 3, t: 40, budget: 2000 };
const L4_04 = { p1: 350, p2: 250, sub: 1500 };
const L4_07 = { AB: 30, BC: 16, BE: 10 };
const L5_06 = { p1: 600, p2: 400, ins: 1200 };
const L5_09 = { rate: '2.5', tank: 30, price: 29 };

// ex-32 : g(x) = x√8(1/2 − x√2) + 8 − 16(x/2 − √2)², en écrivant √2 = s (s² = 2), √8 = 2s : partie rationnelle et
// partie en s développées séparément (polynômes de x).
const EX32 = (() => {
  const x = poly.x;
  // x·2s·(1/2) − x·2s·x·s = s·x − 4x²
  let rat = x.mul(x).mul(-4); let sPart = x;
  // (x/2 − s)² = x²/4 − s·x + s² = x²/4 + 2 − s·x  →  8 − 16(…) = 8 − 4x² − 32 + 16s·x
  rat = rat.add(poly.of(8)).sub(x.mul(x).mul(q('1/4')).add(2).mul(16));
  sPart = sPart.add(x.mul(16));
  return { x2: rat.coef(2), x1: sPart.coef(1), x0: rat.coef(0), linear: rat.coef(2) === '0' && rat.coef(0) === '0' };
})();
// h(x) = (x + 2)² − x² − 4 ; k(x) = x(x + 1) − x² + 3
const H = poly.x.add(2).pow(2).sub(poly.x.pow(2)).sub(4);
const Kf = poly.x.mul(poly.x.add(1)).sub(poly.x.pow(2)).add(3);
if (H.coef(0) !== '0' || H.coef(2) !== '0') throw new Error('wadiya-khattiya oracle: h non linéaire');

export const ORACLE = {
  // ── Niveau 1 ──
  [K('l1-001:q1')]: R(coef(7, 2)),
  [K('l1-001:q2')]: R(lin(coef(7, 2), -4)),
  [K('l1-002:q1')]: R(coef(-9, -6)),
  [K('l1-002:q2')]: R(pre(coef(-9, -6), 12)),
  [K('l1-003:q1')]: R(coef(14, 8)),
  [K('l1-003:q2')]: R(lin(coef(14, 8), -4)),
  [K('l1-004:q1')]: R(coef(1, 4)) /* A(4 ; 1) lu sur la grille, même droite que (1 ; 0,25) du manuel */,
  [K('l1-004:q2')]: R(lin(coef(1, 4), 10)),
  [K('l1-005:q1')]: R(coef(10, -4)),
  [K('l1-005:q2')]: R(lin(coef(10, -4), 6)),
  [K('l1-006:q1')]: R((() => { const a = coef(2, -5); if (cmp(coef(-10, 25), a) || cmp(coef(-4, 10), a)) throw new Error('l1-006'); return a; })()),
  [K('l1-006:q2')]: R(lin(coef(2, -5), 15)),
  [K('l1-007:q1')]: R(coef('135.1', 7)),
  [K('l1-007:q2')]: R(coef('135.1', 7).mul(1000)) /* g/cm³ → kg/m³ : × 10⁻³ ÷ 10⁻⁶ */,
  [K('l1-008:q1')]: R(pays(10)),
  [K('l1-008:q2')]: R(lin(pays(10), 4500)),
  [K('l1-009:q1')]: R(hyp(50, 120)),
  [K('l1-009:q2')]: R(pre(5, hyp(50, 120))),
  [K('l1-010:q1')]: R(pays(40)),
  [K('l1-010:q2')]: R(lin(pays(40), 300)),

  // ── Niveau 2 ──
  [K('l2-001:q1')]: R(EX32.x2) /* −8x² + 17√2·x − 24 */,
  [K('l2-001:q2')]: yes(EX32.linear),
  [K('l2-002:q1')]: R(r2(coef(8, '0.13'))),
  [K('l2-002:q2')]: yes(cmp(coef(8, '0.13'), 45) <= 0),
  [K('l2-003:q1')]: R(r2(q(1).sub(q(1).div(6)).mul(100))),
  [K('l2-003:q2')]: yes(cmp(q(1).sub(q(1).div(6)).mul(100), 80) === 0),
  [K('l2-004:q1')]: R(q(500 + 40).div(1000)),
  [K('l2-004:q2')]: R(r2(q(40).div(100).div(q(540).div(1000)))),
  [K('l2-005:q1')]: R(coef(18, '1.5')),
  [K('l2-005:q2')]: R(pre(coef(18, '1.5'), 5).mul(60)),
  [K('l2-006:q1')]: R(family(3, 1, 50)),
  [K('l2-006:q2')]: R(lin(family(3, 1, 50), 400)),
  [K('l2-007:q1')]: R(up(20)),
  [K('l2-007:q2')]: R(lin(up(20), 350)),
  [K('l2-008:q1')]: R(grid(pre(4, 1000), 50)) /* nœud (5 ; 5) : 50 DA et 200 DA par carreau */,
  [K('l2-008:q2')]: R(lin(4, 175)),
  [K('l2-009:q1')]: R(lin(100, 3).add(200)),
  [K('l2-009:q2')]: yes(lin(100, 0).add(200).isZero()) /* P(0) = 200 ≠ 0 */,
  [K('l2-010:q1')]: R(q(15).div(100)),
  [K('l2-010:q2')]: R(pre(q(15).div(100), 27000)),

  // ── Niveau 3 ──
  [K('l3-001:q1')]: R(L3_01.high - L3_01.low),
  [K('l3-001:q2')]: R(hyp(L3_01.horiz, L3_01.high - L3_01.low)),
  [K('l3-001:q3')]: R(L3_01.v),
  [K('l3-001:q4')]: R(pre(L3_01.v, hyp(L3_01.horiz, L3_01.high - L3_01.low))),
  [K('l3-002:q1')]: R(family(1, 4, 25)),
  [K('l3-002:q2')]: R(lin(family(1, 4, 25), 320)),
  [K('l3-002:q3')]: R(maxWhole(family(1, 4, 25), 1800)),
  [K('l3-003:q1')]: R(15),
  [K('l3-003:q2')]: R(maxWhole(15, 500)),
  [K('l3-003:q3')]: R(q(500).sub(lin(15, maxWhole(15, 500)))),
  [K('l3-004:q1')]: R(lin(100, pays(20))),
  [K('l3-004:q2')]: R(lin(lin(100, pays(20)), 7)),
  [K('l3-004:q3')]: R(maxWhole(lin(100, pays(20)), 1000)),
  [K('l3-005:q1')]: R(hyp(L3_05.horiz, L3_05.top - L3_05.bottom)),
  [K('l3-005:q2')]: R(pre(L3_05.v, hyp(L3_05.horiz, L3_05.top - L3_05.bottom))),
  [K('l3-005:q3')]: R(L3_05.fee),
  [K('l3-005:q4')]: R(whole(pre(L3_05.fee, L3_05.income))),
  [K('l3-006:q1')]: R(grid(lin('2.5', grid(600, 100)), 250)),
  [K('l3-006:q2')]: R(grid(pre('2.5', grid(2000, 250)), 100)),
  [K('l3-006:q3')]: R(lin('2.5', 450)),
  [K('l3-007:q1')]: R(lin(30, 10)),
  [K('l3-007:q2')]: R(whole(pre(30, 450))),
  [K('l3-007:q3')]: R(whole(pre(lin(30, pays(20)), 600))),
  [K('l3-007:q4')]: R(lin(30, pays(20))),
  [K('l3-007:q5')]: R(lin(30, 46).sub(lin(lin(30, pays(20)), 46))),
  [K('l3-008:q1')]: R(coef(2, q(250).div(1000))),
  [K('l3-008:q2')]: R(coef(2, q(250 + 150).div(1000))),
  [K('l3-008:q3')]: R(lin(coef(2, q(250).div(1000)), '1.5')),
  [K('l3-009:q1')]: R(lin(240, '2.5')),
  [K('l3-009:q2')]: R(240),
  [K('l3-009:q3')]: R(pre(240, 1500)),
  [K('l3-009:q4')]: R(whole(q(1500).div('0.75'))),
  [K('l3-010:q1')]: R(coef(4, 6)),
  [K('l3-010:q2')]: yes(cmp(lin(coef(4, 6), -9), -6) === 0),
  [K('l3-010:q3')]: yes(cmp(lin(coef(4, 6), 15), 11) === 0),
  [K('l3-010:q4')]: R(pre(coef(4, 6), -10)),

  // ── Niveau 4 ──
  [K('l4-001:q1')]: R(hyp(L4_01.horiz, L4_01.high - L4_01.low)),
  [K('l4-001:q2')]: R(q(L4_01.kmh).mul(1000).div(3600)),
  [K('l4-001:q3')]: R(pre(q(L4_01.kmh).mul(1000).div(3600), hyp(L4_01.horiz, L4_01.high - L4_01.low))),
  [K('l4-001:q4')]: R(floorInt(q(3600).div(pre(q(L4_01.kmh).mul(1000).div(3600), hyp(L4_01.horiz, L4_01.high - L4_01.low)).mul(2)))),
  [K('l4-002:q1')]: R(family(3, 2, 30)),
  [K('l4-002:q2')]: R(lin(family(3, 2, 30), 450)),
  [K('l4-002:q3')]: R(maxWhole(family(3, 2, 30), 2200)),
  [K('l4-002:q4')]: R(lin(5, 500).sub(lin(family(3, 2, 30), 500))),
  // Manuel p. 74 : AB² = 2500² + 500² = 6 500 000 (= 500²·26, pas un carré) ; AB arrondi au mètre par encadrement entier.
  [K('l4-003:q1')]: R((() => {
    const AB2 = BigInt(L4_03.AH) ** 2n + BigInt(L4_03.high - L4_03.low) ** 2n;
    let n = 0n; while ((n + 1n) ** 2n <= AB2) n += 1n; // n ≤ AB < n + 1
    return (2n * n + 1n) ** 2n <= 4n * AB2 ? n + 1n : n; // AB ≥ n + 1/2 ⇔ (2n + 1)² ≤ 4·AB²
  })()),
  // t = AB ÷ 5,5 : t ≥ m + 1/2 ⇔ AB² ≥ (5,5(m + 1/2))² — arrondi à la seconde sans valeur approchée de AB.
  [K('l4-003:q2')]: R((() => {
    const AB2 = q(L4_03.AH * L4_03.AH + (L4_03.high - L4_03.low) ** 2);
    const sq = (v) => q(v).mul(q(v));
    let m = 0n; while (cmp(sq(q(L4_03.v).mul(String(m + 1n))), AB2) <= 0) m += 1n; // m ≤ t < m + 1
    const half = q(L4_03.v).mul(q(String(m)).add(q(1).div(2)));
    return cmp(sq(half), AB2) <= 0 ? m + 1n : m;
  })()),
  [K('l4-003:q3')]: R(family(L4_03.adults, L4_03.kids, L4_03.t)),
  [K('l4-003:q4')]: R(maxWhole(family(L4_03.adults, L4_03.kids, L4_03.t), L4_03.budget)),
  [K('l4-004:q1')]: R(lin(L4_04.p1, 5)),
  [K('l4-004:q2')]: R(whole(pre(L4_04.p1, 5600))),
  [K('l4-004:q3')]: R(whole(pre(L4_04.p2, q(6500).sub(L4_04.sub)))),
  [K('l4-004:q4')]: R(L4_04.p1),
  [K('l4-004:q5')]: R(q(L4_04.sub).div(q(L4_04.p1).sub(L4_04.p2))) /* 350x > 250x + 1500 */,
  [K('l4-004:q6')]: C(cmp(q(L4_04.p1).sub(L4_04.p2), 0) > 0 ? 'C' : 'A') /* coefficient positif : « > » garde son sens */,
  [K('l4-004:q7')]: cheaper(lin(L4_04.p1, 12), lin(L4_04.p2, 12).add(L4_04.sub)),
  [K('l4-005:q1')]: R(H.coef(1)),
  [K('l4-005:q2')]: R(Kf.at(0)),
  [K('l4-005:q3')]: yes(Kf.at(0) === '0' && Kf.coef(2) === '0'),
  [K('l4-005:q4')]: R(H.at('-5/2')),
  [K('l4-006:q1')]: R(r2(coef(15, '0.33'))),
  [K('l4-006:q2')]: yes(cmp(coef(15, '0.33'), 45) <= 0),
  [K('l4-006:q3')]: R(lin(45, '0.33')),
  [K('l4-007:q1')]: R(L4_07.AB * L4_07.BC),
  [K('l4-007:q2')]: R(q(L4_07.BE).div(2)),
  [K('l4-007:q3')]: R(pre(q(L4_07.BE).div(2), 45)),
  [K('l4-007:q4')]: R((() => { const x = pre(q(L4_07.BE).div(2), lin('0.125', L4_07.AB * L4_07.BC)); if (cmp(x, L4_07.BC) > 0) throw new Error('l4-007'); return x; })()),
  [K('l4-007:q5')]: R(r2(lin(q(L4_07.BE).div(2), L4_07.BC).div(L4_07.AB * L4_07.BC).mul(100))),
  [K('l4-008:q1')]: R(lin(pays(20).mul(pays(10)), 45000)),
  [K('l4-008:q2')]: R(pays(20).mul(pays(10))),
  [K('l4-008:q3')]: R(q(1).sub(pays(20).mul(pays(10))).mul(100)),
  [K('l4-008:q4')]: R(pre(pays(20).mul(pays(10)), 25200)),
  [K('l4-009:q1')]: R(family(3, 30, 40)),
  [K('l4-009:q2')]: R(maxWhole(family(3, 30, 40), 8400)),
  [K('l4-009:q3')]: R(q(8400).sub(lin(family(3, 30, 40), 350))),
  [K('l4-009:q4')]: R(floorInt(q(8400).sub(lin(family(3, 30, 40), 350)).div(35))),
  [K('l4-010:q1')]: R(lin(800, 1800)),
  [K('l4-010:q2')]: R(lin(q(25).div(100), 2400000)),
  [K('l4-010:q3')]: C(cmp(lin(800, 1800).add(lin(q(25).div(100), 2400000)), 2400000) < 0 ? 'A' : 'B') /* A = ربح */,
  [K('l4-010:q4')]: R(q(2400000).sub(lin(800, 1800)).sub(lin(q(25).div(100), 2400000))),
  [K('l4-010:q5')]: R(q(2400000).sub(lin(800, 1800)).sub(lin(q(25).div(100), 2400000)).div(2400000).mul(100)),

  // ── Niveau 5 ──
  // 1 — Tlemcen → Ghazaouet
  [K('l5-001:q1')]: R(lin('14.4', 500000).div(100000)),
  [K('l5-001:q2')]: R(pre(80, lin('14.4', 500000).div(100000)).mul(60)),
  [K('l5-001:q3')]: R(q('6.5').div(100)),
  [K('l5-001:q4')]: R(lin(q('6.5').div(100), lin(2, lin('14.4', 500000).div(100000)))),
  [K('l5-001:q5')]: yes(cmp(lin(lin(q('6.5').div(100), lin(2, lin('14.4', 500000).div(100000))), 46), 500) <= 0),
  // 2 — orage : d(t) = 340t
  [K('l5-002:q1')]: R(lin(340, 5)),
  [K('l5-002:q2')]: R(340),
  [K('l5-002:q3')]: R(lin(340, 3600).div(1000)),
  [K('l5-002:q5')]: R(pre(340, 5100)),
  [K('l5-002:q6')]: yes(cmp(lin(340, 25), 10 * 1000) < 0),
  // 3 — charge : f(t) = 2t, g(t) = 1,25t ; grille 10 min × 10 %
  [K('l5-003:q1')]: R(lin(2, 20)),
  [K('l5-003:q2')]: R(pre(2, 70)),
  [K('l5-003:q3')]: R(pre('1.25', 75)),
  [K('l5-003:q4')]: R(2),
  [K('l5-003:q5')]: R('1.25'),
  [K('l5-003:q6')]: R(grid(pre('1.25', 100), 10)) /* fin de (D₂) au nœud (8 ; 10) */,
  [K('l5-003:q7')]: R(lin(2, 45)),
  [K('l5-003:q8')]: R(lin('1.25', 45)),
  // 4 — sel : 35 g/L, 80 % récupérés, taxe 15 %
  [K('l5-004:q1')]: R(lin(35, 1000).div(1000)),
  [K('l5-004:q2')]: R(lin(pays(20), lin(35, 1000).div(1000))),
  [K('l5-004:q3')]: R(pre(lin(pays(20), 35), lin(7, 1000))),
  [K('l5-004:q4')]: R(lin(7, 12000)),
  [K('l5-004:q5')]: R(lin(lin(7, 12000), pays(15))),
  [K('l5-004:q6')]: R(pre(lin(pays(20), 35), whole(pre(lin(12000, pays(15)), 214200)).mul(1000))),
  // 5 — impression 3D, frais 15 %
  [K('l5-005:q1')]: R(lin('1.25', 48)),
  [K('l5-005:q2')]: R(coef(3200, 1000)),
  [K('l5-005:q3')]: R(lin(coef(3200, 1000), lin('1.25', 48))),
  [K('l5-005:q4')]: R(lin(25, 400)),
  [K('l5-005:q5')]: R(lin(q(15).div(100), lin(25, 400))),
  [K('l5-005:q6')]: C(cmp(lin(25, 400), lin(25, lin(coef(3200, 1000), lin('1.25', 48))).add(lin(q(15).div(100), lin(25, 400)))) > 0 ? 'A' : 'B') /* A = ربح */,
  [K('l5-005:q7')]: R(lin(25, 400).sub(lin(25, lin(coef(3200, 1000), lin('1.25', 48)))).sub(lin(q(15).div(100), lin(25, 400)))),
  // 6 — camping : y1 = 600x, y2 = 400x + 1200 ; grille 1 jour × 400 DA
  [K('l5-006:q1')]: R(lin(L5_06.p1, 2)),
  [K('l5-006:q2')]: R(whole(pre(L5_06.p1, 3000))),
  [K('l5-006:q3')]: R(whole(pre(L5_06.p2, q(4400).sub(L5_06.ins)))),
  [K('l5-006:q4')]: R(L5_06.p1),
  [K('l5-006:q5')]: R(whole(q(L5_06.ins).div(q(L5_06.p1).sub(L5_06.p2)))),
  [K('l5-006:q6')]: R(grid(lin(L5_06.p1, 4), 400)),
  [K('l5-006:q7')]: cheaper(lin(L5_06.p1, 4), lin(L5_06.p2, 4).add(L5_06.ins)),
  // 7 — Adrar : 300 m × 200 m, S(x) = 200x, 0,8 L / 100 m², bidons de 20 L à 4500 DA
  [K('l5-007:q1')]: R(300 * 200),
  [K('l5-007:q2')]: R(200),
  [K('l5-007:q3')]: R(pre(200, lin(q(60).div(100), 300 * 200))),
  [K('l5-007:q4')]: R(q('0.8').div(100)),
  [K('l5-007:q5')]: R(lin(q('0.8').div(100), lin(200, pre(200, lin(q(60).div(100), 300 * 200))))),
  [K('l5-007:q6')]: R(lin(String(ceilInt(lin(q('0.8').div(100), lin(q(60).div(100), 300 * 200)).div(20))), 4500)),
  // 8 — train : 420 km en 4 h 12 min
  [K('l5-008:q1')]: R(coef(420, q(4).add(q(12).div(60)))),
  [K('l5-008:q2')]: R(coef(420, q(4).add(q(12).div(60))).div(60)),
  [K('l5-008:q3')]: R(lin(coef(420, q(4).add(q(12).div(60))).div(60), 126)),
  [K('l5-008:q4')]: R(pays(25)),
  [K('l5-008:q5')]: R(lin(pays(25), 1500)),
  [K('l5-008:q6')]: R(lin(2, lin(12, lin(pays(25), 1500)).add(lin(2, 1500)))),
  // 9 — groupe électrogène : g(x) = 2,5x, f(x) = 30 − 2,5x ; grille 1 h × 2,5 L
  [K('l5-009:q1')]: R(lin(L5_09.rate, 4)),
  [K('l5-009:q2')]: R(q(L5_09.tank).sub(lin(L5_09.rate, 4))),
  [K('l5-009:q3')]: R(L5_09.rate),
  [K('l5-009:q4')]: R(pre(L5_09.rate, grid(20, L5_09.rate))),
  [K('l5-009:q5')]: R(pre(q(L5_09.rate).mul(2), L5_09.tank)) /* 2,5x = 30 − 2,5x */,
  [K('l5-009:q6')]: R(lin(lin(lin(L5_09.rate, 8), 26), L5_09.price)),
  // 10 — éolien : E(t) = 9t (MWh)
  [K('l5-010:q1')]: R(lin(9, 24)),
  [K('l5-010:q2')]: R(9),
  [K('l5-010:q3')]: R(whole(lin(lin(9, 200), 1000).div(300))),
  [K('l5-010:q4')]: R(lin(lin(9, 200), 4500)),
  [K('l5-010:q5')]: R(lin(lin(lin(9, 200), 4500), pays(30))),
  [K('l5-010:q6')]: R(pre(9, lin(9000, 300).div(1000))),
};

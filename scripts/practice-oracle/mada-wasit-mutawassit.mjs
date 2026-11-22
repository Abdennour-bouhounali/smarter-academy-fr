// Oracle du banc « mada-wasit-mutawassit » au format BEM (unité 8 « الإحصاء », leçon 2 « مدى ووسيط ومتوسط سلسلة
// إحصائية », banque réécrite le 2026-10-08) — chaque réponse RECALCULÉE ici en rationnels exacts (helpers.mjs) à partir
// des nombres de l'ÉNONCÉ (séries, tableaux et diagrammes recopiés ci-dessous), sans lire le contenu ni
// packages/core/arithmetic/statistics.js. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils :
//   mean(v, f)        المتوسط (pondéré si f est donné) ;  median(v, f)  الوسيط par TRI de la série développée
//                     (effectif pair : demi-somme des deux valeurs centrales) ;  range(v)  المدى = max − min
//   rnd(x, k)         arrondi au plus proche à 10^-k (demi vers le haut) — les moyennes « مدوّرا إلى 0,1 / 0,01 »
//   centres(edges)    مراكز الفئات ;  medClass(f)  le n° (1-based) de la classe qui contient les rangs médians
//   rankOdd / rankEven   rang du médian ;  pick(flags)  la seule option vraie (A, B, C) d'une question fermée
// Généré avec le banc par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { R, C, q } from './helpers.mjs';

const cmp = (a, b) => { const d = q(a).sub(q(b)); return d.n < 0n ? -1 : d.n > 0n ? 1 : 0; };
const expand = (v, f) => v.flatMap((x, i) => Array(f ? f[i] : 1).fill(x));
const sum = (a) => a.reduce((s, x) => s.add(q(x)), q(0));
const mean = (v, f) => { const s = expand(v, f); return sum(s).div(s.length); };
const median = (v, f) => {
  const s = expand(v, f).map((x) => q(x)).sort(cmp); const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : s[n / 2 - 1].add(s[n / 2]).div(2);
};
const range = (v) => { const s = v.map((x) => q(x)).sort(cmp); return s[s.length - 1].sub(s[0]); };
function rnd(x, k) {
  const p = 10n ** BigInt(k); const v = q(x).mul(q(p.toString()));
  let n = v.n / v.d; if (q(v).sub(q(n.toString())).sub(q('1/2')).n >= 0n) n += 1n;
  return q(n.toString()).div(q(p.toString()));
}
const centres = (e) => e.slice(0, -1).map((a, i) => q(a).add(q(e[i + 1])).div(2));
function medClass(f) {
  const N = f.reduce((a, b) => a + b, 0); const ranks = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1];
  const cls = ranks.map((r) => { let c = 0; for (let i = 0; i < f.length; i++) { c += f[i]; if (c >= r) return i + 1; } return -1; });
  if (cls[0] !== cls[cls.length - 1]) throw new Error('rangs médians dans deux classes');
  return cls[0];
}
const rankOdd = (N) => (N + 1) / 2;
const LET = ['A', 'B', 'C', 'D'];
function pick(flags) {
  const ok = flags.map((x, i) => (x ? LET[i] : null)).filter(Boolean);
  if (ok.length !== 1) throw new Error(`mada-wasit-mutawassit oracle : ${ok.length} options vraies`);
  return C(ok[0]);
}
const eq = (a, b) => cmp(a, b) === 0;
const S = (arr) => ({ value: arr.join(', ') });

/* ── Les séries des énoncés ── */
const D = {
  sal: [30000, 35000, 40000, 45000, 50000, 60000, 75000],
  s2: [3, -3, 4, -2], s3: ['37.3', 39, 38, '38.7', '39.5'], s4: ['8.1', '5.7', 3, '2.8'], s5: [8, 20, 40, 60],
  s6: [4, 5, 11, 11, 15, 17, 23, 23, 25], s7: [2, 3, 3, 4, 8], s8: [12, 7, 19, 9], s9: [14, 9, 12, 20, 11, 16, 10], s10: [3, 5, 2, 4, 6],
  l2_001: [3, 5, 6, 8, 9, 12], l2_002: { v: [2, 5, 10, 1], f: [5, 2, 1, 5] },
  sal11: [42000, 35000, 55000, 42000, 60000, 50000, 35000, 42000, 50000, 65000, 35000],
  l2_005: [13, 1, 9, 3, 11, 5], s26: [2, 5, 7, 7, 9, 12, 13, 13, 20, 22], s27: [13, 1, 4, 10, 12],
  l2_008: [11, 14, 9, 15, '13.5'], bus: [34, 28, 41, 25, 37, 30, 44, 33], vol: [6, 9, 4, 12, 7, 9, 15],
  A: { v: [18, 15, 16, 20], f: [2, 18, 6, 4] }, B: { v: [10, 18, 15, 20], f: [3, 4, 16, 7] },
  oasis: [40, 35, 34, 41, 48, 37, 35, 46, 37, 40],
  pN: { v: [50, 51, 53, 54, 55, 56, 57, 58, 60], f: [11, 8, 12, 9, 6, 5, 2, 3, 1] }, pM: { v: [54, 55, 56, 57, 58, 60], f: [12, 18, 10, 8, 9, 3] },
  s36: [12, 8, 6, 10, 2, 4], heights: [5, 6, 14], rain: [62, 48, 75, 30, 12, 5], abs: { v: [0, 1, 2, 3, 4, 5], f: [8, 7, 5, 3, 1, 1] },
  weights: { e: [34, 38, 42, 46, 50, 54], f: [4, 10, 12, 9, 6] },
  s15: [3, 5, 4, 5, 11, 8, 10, 7, 4, 3, 10, 3, 4, 6, 7],
  fuel: ['6.4', '7.1', '5.8', '8.2', '6.9', '7.5', '6.4', '9', '7.1', '6.6'],
  ages: { e: [15, 20, 25, 30, 35, 40], f: [8, 14, 10, 5, 3] },
  wage: [32000, 35000, 30000, 38000, 35000, 34000, 160000],
  g1: [10, 11, 12, 13, 13, 14, 15, 15, 16, 16, 16, 17],
  honey: { v: [8, 10, 12, 14, 15], f: [2, 5, 6, 4, 3] },
  poultry: { e: ['1.5', 2, '2.5', 3, '3.5', 4], f: [6, 14, 18, 9, 3] },
  throws: { samir: ['8.2', '9.0', '7.6', '8.8', '8.4'], karim: ['6.9', '9.8', '8.1', '9.5', '7.7'], anis: ['8.0', '8.6', '8.3', '8.7', '8.4'] },
  tom: [120, 95, 140, 110, 130, 105], trees: { v: [2, 3, 4, 5, 6], f: [3, 5, 8, 6, 2] },
  LA: [32, 35, 30, 34, 33, 31, 36, 33, 32, 34], LB: [25, 40, 28, 38, 27, 41, 30, 26, 39, 36],
  gym: { v: [4, 6, 8, 10, 12], f: [2, 3, 6, 5, 4] },
  gas: [182, 175, 190, 168, 185, 179, 188, 172, 181, 180],
  wheat: [28, 35, 31, 40, 26, 33, 37, 30, 29, 38, 34, 35], bread: [820, 760, 905, 780, 850, 940, 825],
};

/* ── Calculs composés ── */
// l2-008 : sixième note pour une moyenne de 13 sur six devoirs.
const sixth = q(13).mul(6).sub(sum(D.l2_008));
// l2-005 : la 7e valeur x telle que la médiane des 7 valeurs vaille 7 (balayage des entiers 0…20).
const seventh = (() => { const ok = []; for (let x = 0; x <= 20; x++) if (eq(median([...D.l2_005, x]), 7)) ok.push(x); if (ok.length !== 1) throw new Error('l2-005'); return ok[0]; })();
// l3-002 : trois valeurs, la plus petite 1, moyenne 9, étendue 16.
const l3_002 = { tot: q(9).mul(3), max: q(1).add(16) };
// l3-004 : trois valeurs, médiane 20 = maximum, moyenne 17.
const l3_004min = q(17).mul(3).sub(20).sub(20);
// l3-008 : m = (t + f + 2e) / 4.
const m38 = q(15 + 11 + 2 * 12).div(4); const e38 = q(15).mul(4).sub(16).sub(12).div(2);
// l4-003 : diviseurs de 225 < 46, puis la série unique (moyenne 15,4 ; médiane 9 ; N = 5 ; étendue 42) par balayage exhaustif.
const div225 = []; for (let d = 1; d < 46; d++) if (225 % d === 0) div225.push(d);
const s97 = (() => {
  const out = []; const rec = (st, acc) => { if (acc.length === 5) { if (eq(mean(acc), '15.4') && eq(median(acc), 9) && eq(range(acc), 42)) out.push([...acc]); return; } for (let i = st; i < div225.length; i++) rec(i + 1, [...acc, div225[i]]); };
  rec(0, []); if (out.length !== 1) throw new Error('now-97'); return out[0];
})();
// l4-004 : a, 13, c — moyenne 13, étendue 8 (balayage) ; l4-005 : m/2, m, 3m/2 pour m = 10 (balayage).
const s13 = (() => { const o = []; for (let a = 0; a <= 13; a++) for (let c = 13; c <= 40; c++) if (c - a === 8 && eq(mean([a, 13, c]), 13)) o.push([a, c]); if (o.length !== 1) throw new Error('ex-13'); return o[0]; })();
const s17 = (() => { const o = []; for (let a = 0; a <= 10; a++) for (let c = 10; c <= 40; c++) { const v = [a, 10, c]; if (eq(range(v), 10) && eq(mean(v), 10) && eq(median(v), 10)) o.push([a, c]); } if (o.length !== 1) throw new Error('ex-17'); return o[0]; })();
// l4-006 : √12, 4√3, √75, 6√3, √27 = k√3 — coefficient k tel que k²·3 = n (balayage).
const k3 = (n) => { for (let k = 1; k <= 20; k++) if (3 * k * k === n) return k; throw new Error(`√${n}`); };
const roots = [k3(12), 4, k3(75), 6, k3(27)];
// Classes : moyenne par les centres.
const wC = centres(D.weights.e); const aC = centres(D.ages.e); const pC = centres(D.poultry.e);
const wMean = mean(wC, D.weights.f); const aMean = mean(aC, D.ages.f); const pMean = mean(pC, D.poultry.f);
const pTotal = pMean.mul(50);
// l4-010 : moyenne des deux groupes réunis.
const comb = mean(D.g1).mul(12).add(q(11).mul(18)).div(30);
// l5-001 : production totale × 3000.
const honeyTot = mean(D.honey.v, D.honey.f).mul(20);
// l5-005 : estimation pour 120 élèves, comparée à 480.
const treesEst = mean(D.trees.v, D.trees.f).mul(120);
// l5-007 : séances au médian ; adhérents pour qui 250x > 2000.
const gymBetter = D.gym.v.reduce((a, v, i) => (250 * v > 2000 ? a + D.gym.f[i] : a), 0);
// l5-008 : (ا) moyenne + étendue/2 (compté) ; (ب) × 25 × 200 (counted:false, 2026-10-08).
const gasDaily = mean(D.gas).add(range(D.gas).div(2));
const gasCost = gasDaily.mul(25).mul(200);
// l5-009 : parcelles au-dessus de la médiane ; recette = somme × 2 ha × 6000.
const wMed = median(D.wheat); const good = D.wheat.filter((v) => cmp(v, wMed) > 0);
// l5-010 : bénéfice = moyenne × 30 × (15 − 80 % de 15).
const breadProfit = mean(D.bread).mul(30).mul(q(15).sub(q(15).mul(80).div(100)));

const K = (s) => `ex-4am-mada-wasit-mutawassit-${s}`;

export const ORACLE = {
  // ── niveau 1
  [K('l1-001:q1')]: R(range(D.sal)),
  [K('l1-002:q1')]: R(mean(D.s2)), [K('l1-002:q2')]: R(range(D.s2)),
  [K('l1-003:q1')]: R(range(D.s3)), [K('l1-003:q2')]: R(median(D.s3)),
  [K('l1-004:q1')]: R(range(D.s4)),
  [K('l1-005:q1')]: R(median(D.s5)),
  [K('l1-006:q1')]: R(median(D.s6)),
  [K('l1-007:q1')]: R(mean(D.s7)), [K('l1-007:q2')]: R(median(D.s7)),
  [K('l1-008:q1')]: R(range(D.s8)), [K('l1-008:q2')]: R(median(D.s8)),
  [K('l1-009:q1')]: R(median(D.s9)), [K('l1-009:q2')]: R(range(D.s9)),
  [K('l1-010:q1')]: R(mean(D.s10)), [K('l1-010:q2')]: R(range(D.s10)),
  // ── niveau 2
  [K('l2-001:q1')]: R(q(7).mul(7)), [K('l2-001:q2')]: R(q(49).sub(sum(D.l2_001))),
  [K('l2-002:q1')]: R(mean(D.l2_002.v, D.l2_002.f)), [K('l2-002:q2')]: R(rnd(mean(D.l2_002.v, D.l2_002.f), 2)),
  [K('l2-003:q1')]: R(median(D.sal11)), [K('l2-003:q2')]: R(range(D.sal11)),
  [K('l2-004:q1')]: R(rankOdd(97)), [K('l2-004:q2')]: R(120 / 2), [K('l2-004:q3')]: R(120 / 2 + 1),
  [K('l2-005:q1')]: R(rankOdd(7)), [K('l2-005:q2')]: R(seventh),
  [K('l2-006:q1')]: R(D.s26.filter((v) => v < 12).length), [K('l2-006:q2')]: R(median(D.s26)),
  [K('l2-007:q1')]: R(mean(D.s27)), [K('l2-007:q2')]: R(median(D.s27)),
  [K('l2-007:q3')]: pick([cmp(mean(D.s27), median(D.s27)) < 0, cmp(mean(D.s27), median(D.s27)) > 0, eq(mean(D.s27), median(D.s27))]),
  [K('l2-008:q1')]: R(mean(D.l2_008)), [K('l2-008:q2')]: R(sixth),
  [K('l2-009:q1')]: R(mean(D.bus)), [K('l2-009:q2')]: R(median(D.bus)),
  [K('l2-010:q1')]: pick([D.vol.filter((v) => v >= 9).length * 2 >= D.vol.length, D.vol.filter((v) => v >= 9).length * 2 < D.vol.length]),
  [K('l2-010:q2')]: pick([cmp(mean(D.vol), 9) > 0, cmp(mean(D.vol), 9) <= 0]),
  [K('l2-010:q3')]: R(median([...D.vol, 3])),
  // ── niveau 3
  [K('l3-001:q1')]: R(range(D.A.v)), [K('l3-001:q2')]: R(range(D.B.v)),
  [K('l3-001:q3')]: R(rnd(mean(D.A.v, D.A.f), 2)), [K('l3-001:q4')]: R(rnd(mean(D.B.v, D.B.f), 2)),
  [K('l3-001:q5')]: pick([cmp(mean(D.A.v, D.A.f), mean(D.B.v, D.B.f)) > 0, cmp(mean(D.B.v, D.B.f), mean(D.A.v, D.A.f)) > 0, eq(mean(D.A.v, D.A.f), mean(D.B.v, D.B.f)) && cmp(range(D.B.v), range(D.A.v)) > 0]),
  [K('l3-002:q1')]: R(l3_002.tot), [K('l3-002:q2')]: R(l3_002.max), [K('l3-002:q3')]: R(l3_002.tot.sub(1).sub(l3_002.max)),
  [K('l3-003:q1')]: R(range(D.oasis)), [K('l3-003:q2')]: R(mean(D.oasis)), [K('l3-003:q3')]: R(median(D.oasis)),
  [K('l3-004:q1')]: R(q(17).mul(3)), [K('l3-004:q2')]: R(l3_004min), [K('l3-004:q3')]: R(range([l3_004min, 20, 20])),
  [K('l3-005:q1')]: R(median(D.pN.v, D.pN.f)), [K('l3-005:q2')]: R(median(D.pM.v, D.pM.f)),
  [K('l3-006:q1')]: R(median(D.s36)), [K('l3-006:q2')]: R(median(D.s36.map((v) => 3 * v))),
  [K('l3-007:q1')]: R(rankOdd(D.heights.reduce((a, b) => a + b, 0))), [K('l3-007:q2')]: R(D.heights[0] + D.heights[1]),
  [K('l3-007:q3')]: pick([1, 2, 3].map((k) => medClass(D.heights) === k)),
  [K('l3-008:q1')]: R(m38), [K('l3-008:q2')]: R(e38),
  [K('l3-009:q1')]: R(range(D.rain)), [K('l3-009:q2')]: R(rnd(mean(D.rain), 1)), [K('l3-009:q3')]: R(median(D.rain)),
  [K('l3-010:q1')]: R(mean(D.abs.v, D.abs.f)), [K('l3-010:q2')]: R(rankOdd(25)), [K('l3-010:q3')]: R(median(D.abs.v, D.abs.f)),
  // ── niveau 4
  [K('l4-001:q1')]: R(wC[2]), [K('l4-001:q2')]: R(rnd(wMean, 2)), [K('l4-001:q3')]: R(rankOdd(41)),
  [K('l4-001:q4')]: pick([2, 3, 4].map((k) => medClass(D.weights.f) === k)),
  [K('l4-002:q1')]: R(mean(D.s15)), [K('l4-002:q2')]: R(median(D.s15)), [K('l4-002:q3')]: R(range(D.s15)),
  [K('l4-002:q4')]: R(mean([...D.s15, 3, 43])), [K('l4-002:q5')]: R(median([...D.s15, 3, 43])), [K('l4-002:q6')]: R(range([...D.s15, 3, 43])),
  [K('l4-003:q1')]: S(div225), [K('l4-003:q2')]: R(q('15.4').mul(5)), [K('l4-003:q3')]: R(s97[0]), [K('l4-003:q4')]: R(s97[4]), [K('l4-003:q5')]: S(s97),
  [K('l4-004:q1')]: R(s13[0] + s13[1]), [K('l4-004:q2')]: R(s13[1] - s13[0]), [K('l4-004:q3')]: R(s13[0]), [K('l4-004:q4')]: R(s13[1]),
  [K('l4-005:q1')]: R(range([4, 8, 12])), [K('l4-005:q2')]: R(mean([4, 8, 12])), [K('l4-005:q3')]: R(median([4, 8, 12])),
  [K('l4-005:q5')]: R(s17[0]), [K('l4-005:q6')]: R(s17[1]),
  [K('l4-006:q1')]: R(roots[0]), [K('l4-006:q2')]: R(roots[2]), [K('l4-006:q3')]: R(roots[4]),
  [K('l4-006:q4')]: R(range(roots)), [K('l4-006:q5')]: R(median(roots)), [K('l4-006:q6')]: R(mean(roots)),
  [K('l4-007:q1')]: R(mean(D.fuel)), [K('l4-007:q2')]: R(median(D.fuel)), [K('l4-007:q3')]: R(range(D.fuel)),
  [K('l4-007:q4')]: R(q(D.fuel.filter((v) => cmp(v, 7) > 0).length).mul(100).div(D.fuel.length)),
  [K('l4-008:q1')]: R(rnd(aMean, 1)), [K('l4-008:q2')]: R(q(D.ages.f[0] + D.ages.f[1]).mul(100).div(40)),
  [K('l4-008:q3')]: pick([1, 2, 3].map((k) => medClass(D.ages.f) === k)),
  [K('l4-009:q1')]: R(mean(D.wage)), [K('l4-009:q2')]: R(median(D.wage)),
  // le vrai indicateur « typique » : celui qui reste dans l'intervalle des salaires des six ouvriers
  [K('l4-009:q3')]: pick([cmp(median(D.wage), 38000) <= 0, cmp(mean(D.wage), 38000) <= 0]),
  [K('l4-010:q1')]: R(mean(D.g1)), [K('l4-010:q2')]: R(comb), [K('l4-010:q3')]: R(median(D.g1)), [K('l4-010:q4')]: R(range(D.g1)),
  // ── niveau 5
  [K('l5-001:q1')]: R(range(D.honey.v)), [K('l5-001:q2')]: R(mean(D.honey.v, D.honey.f)), [K('l5-001:q3')]: R(median(D.honey.v, D.honey.f)),
  [K('l5-001:q4')]: R(honeyTot.mul(3000)),
  [K('l5-002:q1')]: R(pC[2]), [K('l5-002:q2')]: R(pMean), [K('l5-002:q3')]: pick([2, 3, 4].map((k) => medClass(D.poultry.f) === k)),
  [K('l5-002:q4')]: R(pTotal.mul(420)),
  [K('l5-003:q1')]: R(mean(D.throws.samir)), [K('l5-003:q2')]: R(mean(D.throws.karim)), [K('l5-003:q3')]: R(mean(D.throws.anis)),
  [K('l5-003:q4')]: R(range(D.throws.samir)), [K('l5-003:q5')]: R(range(D.throws.karim)), [K('l5-003:q6')]: R(range(D.throws.anis)),
  [K('l5-003:q7')]: (() => {
    const names = ['samir', 'karim', 'anis']; const ms = names.map((n) => mean(D.throws[n]));
    const best = ms.reduce((a, m) => (cmp(m, a) > 0 ? m : a), ms[0]); const tied = names.filter((n, i) => eq(ms[i], best));
    const win = tied.reduce((a, n) => (cmp(range(D.throws[n]), range(D.throws[a])) < 0 ? n : a), tied[0]);
    return C(LET[names.indexOf(win)]);
  })(),
  [K('l5-004:q1')]: R(rnd(mean(D.tom), 2)), [K('l5-004:q2')]: R(q(120).mul(7).sub(sum(D.tom))),
  [K('l5-005:q1')]: R(rnd(mean(D.trees.v, D.trees.f), 2)), [K('l5-005:q2')]: R(median(D.trees.v, D.trees.f)),
  [K('l5-005:q3')]: R(treesEst), [K('l5-005:q4')]: pick([cmp(treesEst, 480) >= 0, cmp(treesEst, 480) < 0]),
  [K('l5-006:q1')]: R(mean(D.LA)), [K('l5-006:q2')]: R(mean(D.LB)), [K('l5-006:q3')]: R(median(D.LA)), [K('l5-006:q4')]: R(median(D.LB)),
  [K('l5-006:q5')]: R(range(D.LA)), [K('l5-006:q6')]: R(range(D.LB)),
  [K('l5-006:q7')]: pick([cmp(range(D.LA), range(D.LB)) < 0, cmp(range(D.LB), range(D.LA)) < 0, eq(range(D.LA), range(D.LB))]),
  [K('l5-007:q1')]: R(mean(D.gym.v, D.gym.f)), [K('l5-007:q2')]: R(median(D.gym.v, D.gym.f)),
  [K('l5-007:q3')]: R(median(D.gym.v, D.gym.f).mul(250)), [K('l5-007:q4')]: R(gymBetter),
  [K('l5-008:q1')]: R(gasDaily),
  [K('l5-008:q2')]: R(gasCost),
  [K('l5-009:q1')]: R(mean(D.wheat)), [K('l5-009:q2')]: R(wMed), [K('l5-009:q3')]: R(range(D.wheat)),
  [K('l5-009:q4')]: R(good.length), [K('l5-009:q5')]: R(sum(good).mul(2).mul(6000)),
  [K('l5-010:q1')]: R(mean(D.bread)), [K('l5-010:q2')]: R(median(D.bread)), [K('l5-010:q3')]: R(range(D.bread)), [K('l5-010:q4')]: R(breadProfit),
};

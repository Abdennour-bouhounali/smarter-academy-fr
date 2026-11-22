// Oracle du banc « adad-ashri-mustaqim-mudarraj » (الأعداد العشرية ونصف المستقيم المدرّج, 1AM, 2026-10-30) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique décimale EXACTE en BigInt (fractions n/d) : l'évaluateur
// d'expressions `val` du banc frère muqaranat-adad-ashriya (BigInt, aucun flottant, aucun import de packages/core ni du laboratoire).
// Chaque question est RETAPÉE ci-dessous (`SPECS`) à partir des nombres de l'énoncé :
//  - `val`    réponse numérique = la valeur exacte de l'expression `e` (une abscisse w + t/p, un nombre de graduations (x − w) × p, une
//             extrapolation d'une suite a_n + k·(a_2 − a_1)…) ; `floor:x:s` = la graduation à gauche d'un point (le plus grand multiple de s ≤ x) ;
//             `minparts:v1,v2,…` = le plus petit nombre p d'une partition de l'unité qui met chaque v sur une graduation (v·p entier) ;
//  - `valc`   QCM : chaque option est retapée en valeur, il y a EXACTEMENT UNE option égale à la valeur de `e` ;
//  - `bounds` QCM d'encadrement : l'option juste est (lo, hi) = (⌊x/s⌋·s, ⌊x/s⌋·s + s), strictement autour de x ;
//  - `tf`     vrai / faux : `between` (lo < x < hi), `farther` (y > x), `tickcount` (x = w + t/10).
// Chaque signature de misconception d'une réponse numérique est vérifiée DIFFÉRENTE de la clé. `audit(bank)` relit les fichiers : clé égale
// au calcul, une seule option juste, options et signatures égales à celles retapées.
import { R, C } from './helpers.mjs';
import { val } from './muqaranat-adad-ashriya.mjs';

const eqQ = (x, y) => x.n === y.n && x.d === y.d;
const cmpQ = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l < r ? -1 : l > r ? 1 : 0; };
const lit = (s) => val(String(s));
const mulQ = (x, y) => val(`(${x.n}/${x.d})*(${y.n}/${y.d})`);
const floorQ = (x) => { const q = x.n / x.d; return x.n % x.d !== 0n && x.n < 0n ? q - 1n : q; };
const decText = (x) => {
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) throw new Error(`${x.n}/${x.d} n'est pas un nombre décimal`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const neg = x.n < 0n; const N = (neg ? -x.n : x.n) * (10n ** k / x.d);
  if (k === 0n) return `${neg ? '-' : ''}${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${neg ? '-' : ''}${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};

/** la valeur exacte d'une expression `e` d'un spec `val` (formes spéciales : floor, minparts) */
const keyOf = (e) => {
  if (e.startsWith('floor:')) {
    const [, x, s] = e.split(':');
    const X = lit(x); const S = lit(s);
    const q = val(`(${X.n}/${X.d})/(${S.n}/${S.d})`);
    return mulQ(val(String(floorQ(q))), S);
  }
  if (e.startsWith('minparts:')) {
    const vs = e.slice(9).split(',').map(lit);
    for (let p = 1n; p <= 1000n; p++) if (vs.every((v) => (v.n * p) % v.d === 0n)) return val(String(p));
    throw new Error(`minparts ${e} : aucun p ≤ 1000`);
  }
  return val(e);
};

/* ── énoncés retapés ── */
const SPECS = {
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-001:q1": {"k": "val", "e": "1/10", "sigs": [["10", "MISC-ABSC-PARTSASVALUE"], ["0.01", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-001:q2": {"k": "val", "e": "2+4/10", "sigs": [["4.2", "MISC-ABSC-SWAP"], ["6", "MISC-ABSC-TICKUNIT"], ["2.04", "MISC-ABSC-HUNDREDTH"], ["0.4", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-001:q3": {"k": "val", "e": "0+7/10", "sigs": [["7", "MISC-ABSC-SWAP"], ["0.07", "MISC-ABSC-HUNDREDTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-002:q1": {"k": "val", "e": "1+3/10", "sigs": [["3.1", "MISC-ABSC-SWAP"], ["4", "MISC-ABSC-TICKUNIT"], ["1.03", "MISC-ABSC-HUNDREDTH"], ["0.3", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-002:q2": {"k": "valc", "e": "1+8/10", "opts": [{"e": "8.1", "misc": "MISC-ABSC-SWAP"}, {"e": "9", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "1.8", "misc": null}, {"e": "1.08", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-002:q3": {"k": "val", "e": "(0.8-0)*10", "sigs": []},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-003:q1": {"k": "val", "e": "3+1/10", "sigs": [["1.3", "MISC-ABSC-SWAP"], ["4", "MISC-ABSC-TICKUNIT"], ["3.01", "MISC-ABSC-HUNDREDTH"], ["0.1", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-003:q2": {"k": "valc", "e": "2+9/10", "opts": [{"e": "2.9", "misc": null}, {"e": "9.2", "misc": "MISC-ABSC-SWAP"}, {"e": "11", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "2.09", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-003:q3": {"k": "val", "e": "(2.5-2)*10", "sigs": [["25", "MISC-ABSC-TOTALTICKS"], ["7", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-004:q1": {"k": "val", "e": "0+4/10", "sigs": [["4", "MISC-ABSC-SWAP"], ["0.04", "MISC-ABSC-HUNDREDTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-004:q2": {"k": "val", "e": "1.6*10", "sigs": [["7", "MISC-ABSC-TICKUNIT"], ["1.6", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-004:q3": {"k": "valc", "e": "4+2/10", "opts": [{"e": "2.4", "misc": "MISC-ABSC-SWAP"}, {"e": "4.2", "misc": null}, {"e": "6", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "4.02", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-005:q1": {"k": "val", "e": "(3.2-3)*10", "sigs": [["32", "MISC-ABSC-TOTALTICKS"], ["5", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-005:q2": {"k": "val", "e": "(1.7-1)*10", "sigs": [["17", "MISC-ABSC-TOTALTICKS"], ["8", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-005:q3": {"k": "val", "e": "2.9*10", "sigs": [["11", "MISC-ABSC-TICKUNIT"], ["2.9", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-006:q1": {"k": "val", "e": "5+5/10", "sigs": [["10", "MISC-ABSC-TICKUNIT"], ["5.05", "MISC-ABSC-HUNDREDTH"], ["0.5", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-006:q2": {"k": "valc", "e": "1/10", "opts": [{"e": "10", "misc": "MISC-ABSC-PARTSASVALUE"}, {"e": "0.01", "misc": "MISC-ABSC-TICKTENTH"}, {"e": "0.1", "misc": null}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-006:q3": {"k": "val", "e": "(5.8-5)*10", "sigs": [["58", "MISC-ABSC-TOTALTICKS"], ["13", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-007:q1": {"k": "valc", "e": "1+2/10", "opts": [{"e": "1.2", "misc": null}, {"e": "2.1", "misc": "MISC-ABSC-SWAP"}, {"e": "3", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "1.02", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-007:q2": {"k": "val", "e": "2+6/10", "sigs": [["6.2", "MISC-ABSC-SWAP"], ["8", "MISC-ABSC-TICKUNIT"], ["2.06", "MISC-ABSC-HUNDREDTH"], ["0.6", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-007:q3": {"k": "valc", "e": "3+8/10", "opts": [{"e": "8.3", "misc": "MISC-ABSC-SWAP"}, {"e": "11", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "3.08", "misc": "MISC-ABSC-HUNDREDTH"}, {"e": "3.8", "misc": null}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-008:q1": {"k": "valc", "e": "3+5/10", "opts": [{"e": "5.3", "misc": "MISC-ABSC-SWAP"}, {"e": "3.5", "misc": null}, {"e": "8", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "3.05", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-008:q2": {"k": "tf", "claim": "between", "x": "3.2", "lo": "3", "hi": "4"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-008:q3": {"k": "val", "e": "(3.7-3)*10", "sigs": [["37", "MISC-ABSC-TOTALTICKS"], ["10", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-009:q1": {"k": "val", "e": "0.9*10", "sigs": [["0.9", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-009:q2": {"k": "val", "e": "0+5/10", "sigs": [["5", "MISC-ABSC-SWAP"], ["0.05", "MISC-ABSC-HUNDREDTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-009:q3": {"k": "tf", "claim": "tickcount", "x": "1.4", "w": "1", "t": "4"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-010:q1": {"k": "val", "e": "4+6/10", "sigs": [["6.4", "MISC-ABSC-SWAP"], ["10", "MISC-ABSC-TICKUNIT"], ["4.06", "MISC-ABSC-HUNDREDTH"], ["0.6", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-010:q2": {"k": "valc", "e": "1+1/10", "opts": [{"e": "2", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "1.1", "misc": null}, {"e": "1.01", "misc": "MISC-ABSC-HUNDREDTH"}, {"e": "0.1", "misc": "MISC-ABSC-FROMO"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l1-010:q3": {"k": "tf", "claim": "tickcount", "x": "4.6", "w": "4", "t": "6"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-001:q1": {"k": "val", "e": "1/2", "sigs": [["2", "MISC-ABSC-PARTSASVALUE"], ["0.1", "MISC-ABSC-TICKTENTH"], ["0.2", "MISC-ABSC-PARTSASVALUE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-001:q2": {"k": "val", "e": "3+1/2", "sigs": [["4", "MISC-ABSC-TICKUNIT"], ["0.5", "MISC-ABSC-FROMO"], ["3.1", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-001:q3": {"k": "val", "e": "1+3/2", "sigs": [["4", "MISC-ABSC-TICKUNIT"], ["1.5", "MISC-ABSC-FROMO"], ["1.3", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-002:q1": {"k": "val", "e": "3+2/10", "sigs": [["2.3", "MISC-ABSC-SWAP"], ["0.5", "MISC-ABSC-ADDALL"], ["3.02", "MISC-ABSC-HUNDREDTH"], ["5", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-002:q2": {"k": "valc", "e": "1+7/10", "opts": [{"e": "1.7", "misc": null}, {"e": "7.1", "misc": "MISC-ABSC-SWAP"}, {"e": "0.8", "misc": "MISC-ABSC-ADDALL"}, {"e": "1.07", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-002:q3": {"k": "val", "e": "(3.2-3)*10", "sigs": [["32", "MISC-ABSC-TOTALTICKS"], ["5", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-003:q1": {"k": "valc", "e": "1/4", "opts": [{"e": "0.25", "misc": null}, {"e": "4", "misc": "MISC-ABSC-PARTSASVALUE"}, {"e": "0.1", "misc": "MISC-ABSC-TICKTENTH"}, {"e": "0.4", "misc": "MISC-ABSC-PARTSASVALUE"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-003:q2": {"k": "val", "e": "2+3/4", "sigs": [["5", "MISC-ABSC-TICKUNIT"], ["0.75", "MISC-ABSC-FROMO"], ["2.3", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-003:q3": {"k": "val", "e": "0+3/4", "sigs": [["3", "MISC-ABSC-TICKUNIT"], ["0.3", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-004:q1": {"k": "val", "e": "1/5", "sigs": [["5", "MISC-ABSC-PARTSASVALUE"], ["0.1", "MISC-ABSC-TICKTENTH"], ["0.5", "MISC-ABSC-PARTSASVALUE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-004:q2": {"k": "val", "e": "1+4/5", "sigs": [["5", "MISC-ABSC-TICKUNIT"], ["0.8", "MISC-ABSC-FROMO"], ["1.4", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-004:q3": {"k": "valc", "e": "3+2/5", "opts": [{"e": "5", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "0.4", "misc": "MISC-ABSC-FROMO"}, {"e": "3.4", "misc": null}, {"e": "3.2", "misc": "MISC-ABSC-TICKTENTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-005:q1": {"k": "val", "e": "3+0/10", "sigs": [["0.3", "MISC-ABSC-SWAP"], ["0", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-005:q2": {"k": "val", "e": "3*10", "sigs": [["3", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-005:q3": {"k": "tf", "claim": "between", "x": "3", "lo": "2", "hi": "3"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-006:q1": {"k": "val", "e": "2+6/10", "sigs": [["6.2", "MISC-ABSC-SWAP"], ["0.8", "MISC-ABSC-ADDALL"], ["2.06", "MISC-ABSC-HUNDREDTH"], ["8", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-006:q2": {"k": "valc", "e": "0+9/10", "opts": [{"e": "9", "misc": "MISC-ABSC-SWAP"}, {"e": "0.09", "misc": "MISC-ABSC-HUNDREDTH"}, {"e": "0.9", "misc": null}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-006:q3": {"k": "val", "e": "(0.9-0)*10", "sigs": []},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-007:q1": {"k": "val", "e": "minparts:0.5,1.5,2", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-007:q2": {"k": "val", "e": "minparts:0.25,1.75", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-007:q3": {"k": "val", "e": "minparts:0.2,0.6,1.4", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-008:q1": {"k": "val", "e": "(4.3-4)*10", "sigs": [["43", "MISC-ABSC-TOTALTICKS"], ["7", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-008:q2": {"k": "val", "e": "(2.6-2)*10", "sigs": [["26", "MISC-ABSC-TOTALTICKS"], ["8", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-008:q3": {"k": "val", "e": "4+3/10", "sigs": [["3.4", "MISC-ABSC-SWAP"], ["0.7", "MISC-ABSC-ADDALL"], ["4.03", "MISC-ABSC-HUNDREDTH"], ["7", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-009:q1": {"k": "valc", "e": "1+5/10", "opts": [{"e": "5.1", "misc": "MISC-ABSC-SWAP"}, {"e": "1.5", "misc": null}, {"e": "6", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "1.05", "misc": "MISC-ABSC-HUNDREDTH"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-009:q2": {"k": "val", "e": "1+4/10", "sigs": [["4.1", "MISC-ABSC-SWAP"], ["5", "MISC-ABSC-TICKUNIT"], ["1.04", "MISC-ABSC-HUNDREDTH"], ["0.4", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-009:q3": {"k": "tf", "claim": "farther", "x": "1.5", "y": "1.4"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-010:q1": {"k": "val", "e": "2+0/10", "sigs": [["0.2", "MISC-ABSC-SWAP"], ["0", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-010:q2": {"k": "valc", "e": "2+5/10", "opts": [{"e": "5.2", "misc": "MISC-ABSC-SWAP"}, {"e": "7", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "2.05", "misc": "MISC-ABSC-HUNDREDTH"}, {"e": "2.5", "misc": null}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l2-010:q3": {"k": "tf", "claim": "farther", "x": "2", "y": "2.5"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-001:q1": {"k": "val", "e": "14+2*(12-10)", "sigs": [["54", "MISC-ABSC-STEPPLACE"], ["14.4", "MISC-ABSC-STEPPLACE"], ["14.2", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-001:q2": {"k": "val", "e": "1+2*(0.5-0)", "sigs": [["11", "MISC-ABSC-STEPPLACE"], ["1.1", "MISC-ABSC-STEPPLACE"], ["1.2", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-001:q3": {"k": "valc", "e": "5+2*(5.1-5.2)", "opts": [{"e": "3", "misc": "MISC-ABSC-STEPPLACE"}, {"e": "4.98", "misc": "MISC-ABSC-STEPPLACE"}, {"e": "4.8", "misc": null}, {"e": "5.2", "misc": "MISC-ABSC-SEQDIR"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-002:q1": {"k": "val", "e": "1.11+1*(1.08-1.05)", "sigs": [["1.41", "MISC-ABSC-STEPPLACE"], ["1.113", "MISC-ABSC-STEPPLACE"], ["1.21", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-002:q2": {"k": "val", "e": "90+2*(70-50)", "sigs": [["490", "MISC-ABSC-STEPPLACE"], ["94", "MISC-ABSC-STEPPLACE"], ["90.2", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-002:q3": {"k": "val", "e": "6+2*(6.2-6.4)", "sigs": [["2", "MISC-ABSC-STEPPLACE"], ["5.96", "MISC-ABSC-STEPPLACE"], ["6.4", "MISC-ABSC-SEQDIR"], ["6.2", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-003:q1": {"k": "val", "e": "2+3/10", "sigs": [["3.2", "MISC-ABSC-SWAP"], ["0.5", "MISC-ABSC-ADDALL"], ["2.03", "MISC-ABSC-HUNDREDTH"], ["5", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-003:q2": {"k": "val", "e": "1+8/10", "sigs": [["8.1", "MISC-ABSC-SWAP"], ["9", "MISC-ABSC-TICKUNIT"], ["1.08", "MISC-ABSC-HUNDREDTH"], ["0.8", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-003:q3": {"k": "tf", "claim": "between", "x": "2.3", "lo": "3", "hi": "4"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-004:q1": {"k": "val", "e": "9+3*(10-9)/10", "sigs": [["0.3", "MISC-ABSC-SHIFTORIGIN"], ["12", "MISC-ABSC-TICKUNIT"], ["9.4", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-004:q2": {"k": "valc", "e": "4+7*(5-4)/10", "opts": [{"e": "0.7", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "11", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "4.7", "misc": null}, {"e": "4.8", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-004:q3": {"k": "val", "e": "20+5*(21-20)/10", "sigs": [["0.5", "MISC-ABSC-SHIFTORIGIN"], ["25", "MISC-ABSC-TICKUNIT"], ["20.6", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-005:q1": {"k": "val", "e": "9+4*(10-9)/10", "sigs": [["0.4", "MISC-ABSC-SHIFTORIGIN"], ["13", "MISC-ABSC-TICKUNIT"], ["9.5", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-005:q2": {"k": "val", "e": "10+6*(11-10)/10", "sigs": [["0.6", "MISC-ABSC-SHIFTORIGIN"], ["16", "MISC-ABSC-TICKUNIT"], ["10.7", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-005:q3": {"k": "valc", "e": "11+8*(12-11)/10", "opts": [{"e": "11.8", "misc": null}, {"e": "0.8", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "19", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "11.9", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-006:q1": {"k": "val", "e": "0+3*(0.1-0)/10", "sigs": [["3", "MISC-ABSC-TICKUNIT"], ["0.04", "MISC-ABSC-COUNTMARKS"], ["0.3", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-006:q2": {"k": "val", "e": "0.2+7*(0.3-0.2)/10", "sigs": [["0.07", "MISC-ABSC-SHIFTORIGIN"], ["7.2", "MISC-ABSC-TICKUNIT"], ["0.28", "MISC-ABSC-COUNTMARKS"], ["0.9", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-006:q3": {"k": "val", "e": "0.1/10", "sigs": [["0.1", "MISC-ABSC-PARTSASVALUE"], ["10", "MISC-ABSC-PARTSASVALUE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-007:q1": {"k": "val", "e": "12+4*(13-12)/10", "sigs": [["0.4", "MISC-ABSC-SHIFTORIGIN"], ["16", "MISC-ABSC-TICKUNIT"], ["12.5", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-007:q2": {"k": "valc", "e": "7+9*(8-7)/10", "opts": [{"e": "0.9", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "7.9", "misc": null}, {"e": "16", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "8", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-007:q3": {"k": "val", "e": "minparts:0.5,2.5,3", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-008:q1": {"k": "val", "e": "5.3+2*(5.6-5.9)", "sigs": [["5.24", "MISC-ABSC-STEPPLACE"], ["5.9", "MISC-ABSC-SEQDIR"], ["5.5", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-008:q2": {"k": "valc", "e": "7+2*(7.5-8)", "opts": [{"e": "6.9", "misc": "MISC-ABSC-STEPPLACE"}, {"e": "6", "misc": null}, {"e": "8", "misc": "MISC-ABSC-SEQDIR"}, {"e": "7.2", "misc": "MISC-ABSC-STEPPLACE"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-008:q3": {"k": "val", "e": "1.8+2*(1.9-2)", "sigs": [["1.78", "MISC-ABSC-STEPPLACE"], ["2", "MISC-ABSC-SEQDIR"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-009:q1": {"k": "val", "e": "1+5*(2-1)/10", "sigs": [["0.5", "MISC-ABSC-SHIFTORIGIN"], ["6", "MISC-ABSC-TICKUNIT"], ["1.6", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-009:q2": {"k": "val", "e": "30+4*(40-30)/10", "sigs": [["4", "MISC-ABSC-SHIFTORIGIN"], ["35", "MISC-ABSC-COUNTMARKS"], ["70", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-009:q3": {"k": "val", "e": "2.5+6*(2.6-2.5)/10", "sigs": [["0.06", "MISC-ABSC-SHIFTORIGIN"], ["8.5", "MISC-ABSC-TICKUNIT"], ["2.57", "MISC-ABSC-COUNTMARKS"], ["3.1", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-010:q1": {"k": "val", "e": "2+8/10", "sigs": [["8.2", "MISC-ABSC-SWAP"], ["10", "MISC-ABSC-TICKUNIT"], ["2.08", "MISC-ABSC-HUNDREDTH"], ["0.8", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-010:q2": {"k": "val", "e": "3+1/10", "sigs": [["1.3", "MISC-ABSC-SWAP"], ["4", "MISC-ABSC-TICKUNIT"], ["3.01", "MISC-ABSC-HUNDREDTH"], ["0.1", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l3-010:q3": {"k": "tf", "claim": "farther", "x": "2.8", "y": "3.1"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-001:q1": {"k": "bounds", "x": "2.35", "s": "0.1", "opts": [{"lo": "2.2", "hi": "2.3", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "2.3", "hi": "2.4", "misc": null}, {"lo": "2.4", "hi": "2.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "2.4", "hi": "2.3", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-001:q2": {"k": "val", "e": "floor:1.27:0.1", "sigs": [["1.3", "MISC-ABSC-BOUNDSSHIFT"], ["1.1", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-001:q3": {"k": "bounds", "x": "0.64", "s": "0.1", "opts": [{"lo": "0.5", "hi": "0.6", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "0.6", "hi": "0.7", "misc": null}, {"lo": "0.7", "hi": "0.8", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "0.7", "hi": "0.6", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-002:q1": {"k": "bounds", "x": "3.72", "s": "0.1", "opts": [{"lo": "3.6", "hi": "3.7", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "3.7", "hi": "3.8", "misc": null}, {"lo": "3.8", "hi": "3.9", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "3.8", "hi": "3.7", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-002:q2": {"k": "bounds", "x": "1.05", "s": "0.1", "opts": [{"lo": "0.9", "hi": "1", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "1", "hi": "1.1", "misc": null}, {"lo": "1.1", "hi": "1.2", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "1.1", "hi": "1", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-002:q3": {"k": "val", "e": "floor:2.98:0.1", "sigs": [["3", "MISC-ABSC-BOUNDSSHIFT"], ["2.8", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-003:q1": {"k": "val", "e": "9.1+3*(9.2-9.1)/10", "sigs": [["0.03", "MISC-ABSC-SHIFTORIGIN"], ["12.1", "MISC-ABSC-TICKUNIT"], ["9.14", "MISC-ABSC-COUNTMARKS"], ["9.4", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-003:q2": {"k": "valc", "e": "9.1+7*(9.2-9.1)/10", "opts": [{"e": "0.07", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "16.1", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "9.17", "misc": null}, {"e": "9.18", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-003:q3": {"k": "valc", "e": "0.1/10", "opts": [{"e": "0.01", "misc": null}, {"e": "0.1", "misc": "MISC-ABSC-PARTSASVALUE"}, {"e": "10", "misc": "MISC-ABSC-PARTSASVALUE"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-004:q1": {"k": "tf", "claim": "between", "x": "4.6", "lo": "4", "hi": "5"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-004:q2": {"k": "tf", "claim": "between", "x": "3.05", "lo": "3.1", "hi": "3.2"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-004:q3": {"k": "tf", "claim": "farther", "x": "6.08", "y": "6.8"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-005:q1": {"k": "val", "e": "5+3/10", "sigs": [["3.5", "MISC-ABSC-SWAP"], ["8", "MISC-ABSC-TICKUNIT"], ["5.03", "MISC-ABSC-HUNDREDTH"], ["0.3", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-005:q2": {"k": "bounds", "x": "5.37", "s": "0.1", "opts": [{"lo": "5.2", "hi": "5.3", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "5.3", "hi": "5.4", "misc": null}, {"lo": "5.4", "hi": "5.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "5.4", "hi": "5.3", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-005:q3": {"k": "val", "e": "floor:5.88:0.1", "sigs": [["5.9", "MISC-ABSC-BOUNDSSHIFT"], ["5.7", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-006:q1": {"k": "val", "e": "9+5*(10-9)/10", "sigs": [["0.5", "MISC-ABSC-SHIFTORIGIN"], ["14", "MISC-ABSC-TICKUNIT"], ["9.6", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-006:q2": {"k": "valc", "e": "10+2*(11-10)/10", "opts": [{"e": "0.2", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "10.2", "misc": null}, {"e": "12", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "10.3", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-006:q3": {"k": "bounds", "x": "11.45", "s": "0.1", "opts": [{"lo": "11.3", "hi": "11.4", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "11.4", "hi": "11.5", "misc": null}, {"lo": "11.5", "hi": "11.6", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "11.5", "hi": "11.4", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-007:q1": {"k": "bounds", "x": "0.38", "s": "0.1", "opts": [{"lo": "0.2", "hi": "0.3", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "0.3", "hi": "0.4", "misc": null}, {"lo": "0.4", "hi": "0.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "0.4", "hi": "0.3", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-007:q2": {"k": "val", "e": "0.7*10", "sigs": [["0.7", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-007:q3": {"k": "val", "e": "floor:4.04:0.1", "sigs": [["4.1", "MISC-ABSC-BOUNDSSHIFT"], ["3.9", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-008:q1": {"k": "val", "e": "20+3*(21-20)/10", "sigs": [["0.3", "MISC-ABSC-SHIFTORIGIN"], ["23", "MISC-ABSC-TICKUNIT"], ["20.4", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-008:q2": {"k": "bounds", "x": "20.52", "s": "0.1", "opts": [{"lo": "20.4", "hi": "20.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "20.5", "hi": "20.6", "misc": null}, {"lo": "20.6", "hi": "20.7", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "20.6", "hi": "20.5", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-008:q3": {"k": "valc", "e": "20+8*(21-20)/10", "opts": [{"e": "20.8", "misc": null}, {"e": "0.8", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "28", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "20.9", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-009:q1": {"k": "val", "e": "4+6*(4.1-4)/10", "sigs": [["0.06", "MISC-ABSC-SHIFTORIGIN"], ["10", "MISC-ABSC-TICKUNIT"], ["4.07", "MISC-ABSC-COUNTMARKS"], ["4.6", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-009:q2": {"k": "valc", "e": "4+3*(4.1-4)/10", "opts": [{"e": "0.03", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "4.03", "misc": null}, {"e": "7", "misc": "MISC-ABSC-TICKUNIT"}, {"e": "4.04", "misc": "MISC-ABSC-COUNTMARKS"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-009:q3": {"k": "val", "e": "0.1/10", "sigs": [["0.1", "MISC-ABSC-PARTSASVALUE"], ["10", "MISC-ABSC-PARTSASVALUE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-010:q1": {"k": "bounds", "x": "7.91", "s": "0.1", "opts": [{"lo": "7.8", "hi": "7.9", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "7.9", "hi": "8", "misc": null}, {"lo": "8", "hi": "8.1", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "8", "hi": "7.9", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-010:q2": {"k": "val", "e": "floor:7.91:0.1", "sigs": [["8", "MISC-ABSC-BOUNDSSHIFT"], ["7.8", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l4-010:q3": {"k": "tf", "claim": "between", "x": "7.91", "lo": "7.9", "hi": "8"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-001:q1": {"k": "val", "e": "1/10", "sigs": [["10", "MISC-ABSC-PARTSASVALUE"], ["0.01", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-001:q2": {"k": "val", "e": "2+6/10", "sigs": [["6.2", "MISC-ABSC-SWAP"], ["8", "MISC-ABSC-TICKUNIT"], ["2.06", "MISC-ABSC-HUNDREDTH"], ["0.6", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-001:q3": {"k": "val", "e": "(3.1-3)*10", "sigs": [["31", "MISC-ABSC-TOTALTICKS"], ["4", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-001:q4": {"k": "bounds", "x": "1.85", "s": "0.1", "opts": [{"lo": "1.7", "hi": "1.8", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "1.8", "hi": "1.9", "misc": null}, {"lo": "1.9", "hi": "2", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "1.9", "hi": "1.8", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-002:q1": {"k": "val", "e": "1/5", "sigs": [["5", "MISC-ABSC-PARTSASVALUE"], ["0.1", "MISC-ABSC-TICKTENTH"], ["0.5", "MISC-ABSC-PARTSASVALUE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-002:q2": {"k": "val", "e": "1+3/5", "sigs": [["4", "MISC-ABSC-TICKUNIT"], ["0.6", "MISC-ABSC-FROMO"], ["1.3", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-002:q3": {"k": "val", "e": "2+4/5", "sigs": [["6", "MISC-ABSC-TICKUNIT"], ["0.8", "MISC-ABSC-FROMO"], ["2.4", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-002:q4": {"k": "val", "e": "minparts:0.4,1.6,2.2", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-003:q1": {"k": "val", "e": "3+6*(4-3)/10", "sigs": [["0.6", "MISC-ABSC-SHIFTORIGIN"], ["9", "MISC-ABSC-TICKUNIT"], ["3.7", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-003:q2": {"k": "val", "e": "3+2*(4-3)/10", "sigs": [["0.2", "MISC-ABSC-SHIFTORIGIN"], ["5", "MISC-ABSC-TICKUNIT"], ["3.3", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-003:q3": {"k": "bounds", "x": "3.55", "s": "0.1", "opts": [{"lo": "3.4", "hi": "3.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "3.5", "hi": "3.6", "misc": null}, {"lo": "3.6", "hi": "3.7", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "3.6", "hi": "3.5", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-003:q4": {"k": "tf", "claim": "farther", "x": "3.6", "y": "3.2"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-004:q1": {"k": "val", "e": "5+3/10", "sigs": [["3.5", "MISC-ABSC-SWAP"], ["8", "MISC-ABSC-TICKUNIT"], ["5.03", "MISC-ABSC-HUNDREDTH"], ["0.3", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-004:q2": {"k": "val", "e": "7+4/10", "sigs": [["4.7", "MISC-ABSC-SWAP"], ["1.1", "MISC-ABSC-ADDALL"], ["7.04", "MISC-ABSC-HUNDREDTH"], ["11", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-004:q3": {"k": "val", "e": "(8.6-8)*10", "sigs": [["86", "MISC-ABSC-TOTALTICKS"], ["14", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-004:q4": {"k": "tf", "claim": "between", "x": "7.4", "lo": "7", "hi": "8"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-005:q1": {"k": "val", "e": "9+7*(10-9)/10", "sigs": [["0.7", "MISC-ABSC-SHIFTORIGIN"], ["16", "MISC-ABSC-TICKUNIT"], ["9.8", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-005:q2": {"k": "val", "e": "10+5*(11-10)/10", "sigs": [["0.5", "MISC-ABSC-SHIFTORIGIN"], ["15", "MISC-ABSC-TICKUNIT"], ["10.6", "MISC-ABSC-COUNTMARKS"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-005:q3": {"k": "bounds", "x": "11.62", "s": "0.1", "opts": [{"lo": "11.5", "hi": "11.6", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "11.6", "hi": "11.7", "misc": null}, {"lo": "11.7", "hi": "11.8", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "11.7", "hi": "11.6", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-005:q4": {"k": "val", "e": "floor:10.58:0.1", "sigs": [["10.6", "MISC-ABSC-BOUNDSSHIFT"], ["10.4", "MISC-ABSC-BOUNDSSHIFT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-006:q1": {"k": "val", "e": "2+4/10", "sigs": [["4.2", "MISC-ABSC-SWAP"], ["0.6", "MISC-ABSC-ADDALL"], ["2.04", "MISC-ABSC-HUNDREDTH"], ["6", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-006:q2": {"k": "val", "e": "1+9/10", "sigs": [["9.1", "MISC-ABSC-SWAP"], ["10", "MISC-ABSC-TICKUNIT"], ["1.09", "MISC-ABSC-HUNDREDTH"], ["0.9", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-006:q3": {"k": "tf", "claim": "farther", "x": "1.9", "y": "2.4"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-006:q4": {"k": "val", "e": "(2.4-2)*10", "sigs": [["24", "MISC-ABSC-TOTALTICKS"], ["6", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-007:q1": {"k": "val", "e": "6+5/10", "sigs": [["5.6", "MISC-ABSC-SWAP"], ["11", "MISC-ABSC-TICKUNIT"], ["6.05", "MISC-ABSC-HUNDREDTH"], ["0.5", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-007:q2": {"k": "val", "e": "(6.8-6)*10", "sigs": [["68", "MISC-ABSC-TOTALTICKS"], ["14", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-007:q3": {"k": "tf", "claim": "between", "x": "6.5", "lo": "6", "hi": "7"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-007:q4": {"k": "bounds", "x": "6.55", "s": "0.1", "opts": [{"lo": "6.4", "hi": "6.5", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "6.5", "hi": "6.6", "misc": null}, {"lo": "6.6", "hi": "6.7", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "6.6", "hi": "6.5", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-008:q1": {"k": "val", "e": "40+3*(50-40)/10", "sigs": [["3", "MISC-ABSC-SHIFTORIGIN"], ["44", "MISC-ABSC-COUNTMARKS"], ["70", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-008:q2": {"k": "valc", "e": "40+7*(50-40)/10", "opts": [{"e": "7", "misc": "MISC-ABSC-SHIFTORIGIN"}, {"e": "48", "misc": "MISC-ABSC-COUNTMARKS"}, {"e": "47", "misc": null}, {"e": "110", "misc": "MISC-ABSC-TICKUNIT"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-008:q3": {"k": "val", "e": "10/10", "sigs": [["10", "MISC-ABSC-PARTSASVALUE"], ["0.1", "MISC-ABSC-TICKTENTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-008:q4": {"k": "val", "e": "minparts:41.25,47.5", "sigs": [["10", "MISC-ABSC-ALWAYSTEN"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-009:q1": {"k": "val", "e": "13+2*(12.7-12.4)", "sigs": [["19", "MISC-ABSC-STEPPLACE"], ["13.06", "MISC-ABSC-STEPPLACE"], ["13.2", "MISC-ABSC-STEPPLACE"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-009:q2": {"k": "val", "e": "12+6/10", "sigs": [["7.2", "MISC-ABSC-SWAP"], ["18", "MISC-ABSC-TICKUNIT"], ["12.06", "MISC-ABSC-HUNDREDTH"], ["0.6", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-009:q3": {"k": "bounds", "x": "13.45", "s": "0.1", "opts": [{"lo": "13.3", "hi": "13.4", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "13.4", "hi": "13.5", "misc": null}, {"lo": "13.5", "hi": "13.6", "misc": "MISC-ABSC-BOUNDSSHIFT"}, {"lo": "13.5", "hi": "13.4", "misc": "MISC-ABSC-BOUNDSREV"}]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-009:q4": {"k": "tf", "claim": "farther", "x": "12.4", "y": "12.6"},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-010:q1": {"k": "val", "e": "2.7*10", "sigs": [["9", "MISC-ABSC-TICKUNIT"], ["2.7", "MISC-ABSC-FROMO"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-010:q2": {"k": "val", "e": "(2.7-2)*10", "sigs": [["27", "MISC-ABSC-TOTALTICKS"], ["9", "MISC-ABSC-TICKUNIT"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-010:q3": {"k": "val", "e": "0+8/10", "sigs": [["8", "MISC-ABSC-SWAP"], ["0.08", "MISC-ABSC-HUNDREDTH"]]},
  "ex-1am-adad-ashri-mustaqim-mudarraj-l5-010:q4": {"k": "tf", "claim": "tickcount", "x": "1.6", "w": "1", "t": "6"},
};

const bracketOf = (x, s) => {
  const X = lit(x); const S = lit(s);
  const lo = mulQ(val(String(floorQ(val(`(${X.n}/${X.d})/(${S.n}/${S.d})`)))), S);
  const hi = val(`(${lo.n}/${lo.d})+(${S.n}/${S.d})`);
  if (!(cmpQ(lo, X) < 0 && cmpQ(X, hi) < 0)) throw new Error(`${x} n'est pas strictement entre deux graduations de pas ${s}`);
  return { lo, hi };
};

const truth = (s) => {
  if (s.claim === 'between') return cmpQ(lit(s.lo), lit(s.x)) < 0 && cmpQ(lit(s.x), lit(s.hi)) < 0;
  if (s.claim === 'farther') return cmpQ(lit(s.y), lit(s.x)) > 0;
  if (s.claim === 'tickcount') return eqQ(lit(s.x), val(`${s.w}+${s.t}/10`));
  throw new Error(s.claim);
};

const choiceIndex = (key, s) => {
  let hits;
  if (s.k === 'valc') { const K = keyOf(s.e); hits = s.opts.map((o, i) => (eqQ(lit(o.e), K) ? i : -1)).filter((i) => i >= 0); }
  else { const { lo, hi } = bracketOf(s.x, s.s); hits = s.opts.map((o, i) => (eqQ(lit(o.lo), lo) && eqQ(lit(o.hi), hi) ? i : -1)).filter((i) => i >= 0); }
  if (hits.length !== 1) throw new Error(`${key} : ${hits.length} options justes`);
  return hits[0];
};

const answerOf = (key, s) => {
  if (s.k === 'val') return R(decText(keyOf(s.e)));
  if (s.k === 'tf') return C(truth(s) ? 'A' : 'B');
  return C('ABCDEF'[choiceIndex(key, s)]);
};

export const ORACLE = Object.fromEntries(Object.entries(SPECS).map(([k, s]) => [k, answerOf(k, s)]));

/** relit les fichiers du banc : clé, QCM et signatures de misconception */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const [key, s] of Object.entries(SPECS)) {
    const q = byKey.get(key);
    if (!q) { errs.push(`${key} : question absente`); continue; }
    if (s.k === 'val') {
      if (q.answerType !== 'rational') { errs.push(`${key} : devrait être rational`); continue; }
      const K = keyOf(s.e);
      if (!eqQ(lit(String(q.expectedAnswer).replace(',', '.')), K)) errs.push(`${key} : clé ${q.expectedAnswer} ≠ ${decText(K)}`);
      const sigs = q.misconceptionSignatures ?? [];
      if (sigs.length !== s.sigs.length) errs.push(`${key} : ${sigs.length} signatures, ${s.sigs.length} retapées`);
      for (const sg of sigs) {
        if (eqQ(lit(String(sg.value).replace(',', '.')), K)) errs.push(`${key} : signature ${sg.id} = la bonne réponse`);
        if (!s.sigs.some(([v, id]) => id === sg.id && eqQ(lit(v), lit(String(sg.value).replace(',', '.'))))) errs.push(`${key} : signature ${sg.id}=${sg.value} non retapée`);
      }
    } else {
      if (q.answerType !== 'choice') { errs.push(`${key} : devrait être choice`); continue; }
      if (s.k === 'tf') {
        const good = truth(s) ? 'A' : 'B';
        q.choices.forEach((c) => { if (c.isCorrect !== (c.id === good)) errs.push(`${key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${c.id === good}`); });
        continue;
      }
      if (q.choices.length !== s.opts.length) errs.push(`${key} : ${q.choices.length} options, ${s.opts.length} retapées`);
      const good = choiceIndex(key, s);
      q.choices.forEach((c, k) => {
        if (c.isCorrect !== (k === good)) errs.push(`${key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
        if ((s.opts[k]?.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${s.opts[k]?.misc}`);
        const nums = (c.content.replace(/\{,\}/g, '.').match(/-?\d+(?:\.\d+)?/g) ?? []);
        const want = s.k === 'valc' ? [s.opts[k]?.e] : [s.opts[k]?.lo, s.opts[k]?.hi];
        // l'option « bounds » s'écrit « lo < P < hi » : deux nombres
        if (nums.length !== want.length || nums.some((n, i) => !eqQ(lit(n), lit(want[i])))) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(want)}`);
      });
    }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in SPECS)) errs.push(`${b.key} : sans vérification`);
  return errs;
};

// Oracle du banc « adad-nisbiya-siyaqat » (الأعداد النسبية وسياقات استعمالها, 1AM, 2026-10-30) — feuilles d'examen de فصل (« على منوال اختبار الفصل … »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique décimale EXACTE en BigInt (fractions n/d, aucun flottant, aucun import
// de packages/core ni du laboratoire). Chaque question est RETAPÉE ci-dessous (`SPECS`) à partir des nombres de l'énoncé :
//  - `read`     la valeur relative d'une situation : « d » au-dessus du zéro (ou du niveau de la mer, du rez-de-chaussée, après l'ère) = d ; au-dessous = −d ;
//  - `dist`     la distance au zéro : |v| ;            - `opp`   l'opposé : −v (0 pour 0) ;
//  - `age`      la durée entre deux dates : e − b ;    - `count`  le nombre de négatifs d'une liste ;     - `both`  le nombre de nombres à la distance d du zéro : 2 (1 si d = 0) ;
//  - `lowest`   QCM : l'option égale au plus petit de la liste ;     - `farther` QCM : l'option de plus grande distance au zéro (jamais « البعد نفسه ») ;
//  - `side`     QCM : au-dessus / au-dessous / sur le zéro ;           - `older`  QCM : le plus petit des deux nombres ;
//  - `tf`       vrai / faux : `opp` (a + b = 0), `less` (a < b), `dist` (|v| = d), `oppneg` (−v < 0), `sign` (v < 0 ou v > 0), `selfopp` (−v = v).
// Chaque signature de misconception d'une réponse numérique est vérifiée DIFFÉRENTE de la clé. `audit(bank)` relit les fichiers : clé égale au calcul, une seule
// option juste, options et signatures égales à celles retapées.
import { R, C } from './helpers.mjs';

const B = (v) => BigInt(v);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const lit = (s) => {
  const t = String(s).replace(/\{,\}/g, '.').replace(/[$,]/g, (c) => (c === ',' ? '.' : '')).replace(/−/g, '-').trim();
  const neg = t.startsWith('-'); const [i, f = ''] = t.replace('-', '').split('.');
  return Q((neg ? -1n : 1n) * B(i + f), 10n ** B(f.length));
};
const neg = (x) => Q(-x.n, x.d);
const absQ = (x) => Q(x.n < 0n ? -x.n : x.n, x.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l < r ? -1 : l > r ? 1 : 0; };
const eq = (x, y) => cmp(x, y) === 0;
const decText = (x) => {
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) throw new Error(`${x.n}/${x.d} n'est pas décimal`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const ng = x.n < 0n; const N = (ng ? -x.n : x.n) * (10n ** k / x.d);
  if (k === 0n) return `${ng ? '-' : ''}${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${ng ? '-' : ''}${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};
const ZERO = Q(0n);

/* ── énoncés retapés ── */
const SPECS = {
  "ex-1am-adad-nisbiya-siyaqat-l1-001:q1": {"k":"read","side":"below","d":"3","sigs":[["3","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-001:q2": {"k":"read","side":"above","d":"5","sigs":[["-5","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-001:q3": {"k":"read","side":"below","d":"8","sigs":[["8","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-002:q1": {"k":"dist","v":"-7","sigs":[["-7","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-002:q2": {"k":"dist","v":"5.5","sigs":[["-5.5","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-002:q3": {"k":"dist","v":"-0.1","sigs":[["-0.1","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-003:q1": {"k":"opp","v":"-4.5","sigs":[["-4.5","MISC-REL-OPPSAME"],["-5.5","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-003:q2": {"k":"opp","v":"20","sigs":[["20","MISC-REL-OPPSAME"],["21","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-003:q3": {"k":"opp","v":"-0.36","sigs":[["-0.36","MISC-REL-OPPSAME"],["-1.36","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-004:q1": {"k":"read","side":"above","d":"4","sigs":[["-4","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-004:q2": {"k":"read","side":"below","d":"2","sigs":[["2","MISC-REL-FLOORPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-004:q3": {"k":"side","v":"-3","opts":[{"label":"فوق الصفر","misc":"MISC-REL-ABOVENEG"},{"label":"تحت الصفر","misc":null},{"label":"على الصفر","misc":"MISC-REL-ZERONONE"}]},
  "ex-1am-adad-nisbiya-siyaqat-l1-005:q1": {"k":"read","side":"below","d":"40","sigs":[["40","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-005:q2": {"k":"read","side":"above","d":"30","sigs":[["-30","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-005:q3": {"k":"side","v":"0","opts":[{"label":"فوق الصفر","misc":"MISC-REL-ZERONONE"},{"label":"تحت الصفر","misc":"MISC-REL-ZERONONE"},{"label":"على الصفر","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l1-006:q1": {"k":"read","side":"below","d":"12","sigs":[["12","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-006:q2": {"k":"read","side":"below","d":"25","sigs":[["25","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-006:q3": {"k":"dist","v":"-12","sigs":[["-12","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-007:q1": {"k":"read","side":"below","d":"287","sigs":[["287","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-007:q2": {"k":"read","side":"above","d":"780","sigs":[["-780","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-007:q3": {"k":"read","side":"below","d":"238","sigs":[["238","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-008:q1": {"k":"side","v":"-6","opts":[{"label":"تحت الصفر","misc":null},{"label":"فوق الصفر","misc":"MISC-REL-ABOVENEG"},{"label":"على الصفر","misc":"MISC-REL-ZERONONE"}]},
  "ex-1am-adad-nisbiya-siyaqat-l1-008:q2": {"k":"side","v":"9","opts":[{"label":"تحت الصفر","misc":"MISC-REL-SIGNLOST"},{"label":"على الصفر","misc":"MISC-REL-ZERONONE"},{"label":"فوق الصفر","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l1-008:q3": {"k":"side","v":"0","opts":[{"label":"فوق الصفر","misc":"MISC-REL-ZERONONE"},{"label":"على الصفر","misc":null},{"label":"تحت الصفر","misc":"MISC-REL-ZERONONE"}]},
  "ex-1am-adad-nisbiya-siyaqat-l1-009:q1": {"k":"opp","v":"15","sigs":[["15","MISC-REL-OPPSAME"],["16","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-009:q2": {"k":"opp","v":"-0.8","sigs":[["-0.8","MISC-REL-OPPSAME"],["-1.8","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-009:q3": {"k":"opp","v":"0","sigs":[["1","MISC-REL-ZERONONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-010:q1": {"k":"dist","v":"12","sigs":[["-12","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-010:q2": {"k":"dist","v":"-0.5","sigs":[["-0.5","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l1-010:q3": {"k":"both","d":"9","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-001:q1": {"k":"lowest","list":["4","-1","-5","0","2"],"opts":[{"e":"4","misc":"MISC-REL-SIGNBIG"},{"e":"-5","misc":null},{"e":"2","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-001:q2": {"k":"read","side":"below","d":"6","sigs":[["6","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-001:q3": {"k":"dist","v":"-5","sigs":[["-5","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-002:q1": {"k":"count","list":["15","-4.8","-13","7.9"],"sigs":[]},
  "ex-1am-adad-nisbiya-siyaqat-l2-002:q2": {"k":"side","v":"-4.8","opts":[{"label":"فوق الصفر","misc":"MISC-REL-ABOVENEG"},{"label":"تحت الصفر","misc":null},{"label":"على الصفر","misc":"MISC-REL-ZERONONE"}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-002:q3": {"k":"dist","v":"-13","sigs":[["-13","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-003:q1": {"k":"read","side":"below","d":"212","sigs":[["212","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-003:q2": {"k":"older","a":"-287","b":"780","opts":[{"label":"الخوارزمي","of":"b","misc":null},{"label":"أرخميدس","of":"a","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-003:q3": {"k":"read","side":"above","d":"965","sigs":[["-965","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-004:q1": {"k":"age","b":"-287","e":"-212","sigs":[["499","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-004:q2": {"k":"read","side":"below","d":"212","sigs":[["212","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-004:q3": {"k":"older","a":"-287","b":"-238","opts":[{"label":"أرخميدس","of":"a","misc":null},{"label":"ماسينيسا","of":"b","misc":"MISC-REL-NEGORDER"}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-005:q1": {"k":"tf","claim":"sign","v":"-0.5","s":"neg"},
  "ex-1am-adad-nisbiya-siyaqat-l2-005:q2": {"k":"tf","claim":"oppneg","v":"-3"},
  "ex-1am-adad-nisbiya-siyaqat-l2-005:q3": {"k":"tf","claim":"less","a":"-9","b":"2"},
  "ex-1am-adad-nisbiya-siyaqat-l2-006:q1": {"k":"farther","a":"-30","b":"20","opts":[{"e":"-30","misc":null},{"e":"20","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-006:q2": {"k":"dist","v":"-30","sigs":[["-30","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-006:q3": {"k":"opp","v":"20","sigs":[["20","MISC-REL-OPPSAME"],["21","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-007:q1": {"k":"read","side":"below","d":"1","sigs":[["1","MISC-REL-FLOORPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-007:q2": {"k":"read","side":"above","d":"6","sigs":[["-6","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-007:q3": {"k":"opp","v":"-2","sigs":[["-2","MISC-REL-OPPSAME"],["-3","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-008:q1": {"k":"opp","v":"-9","sigs":[["-9","MISC-REL-OPPSAME"],["-10","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-008:q2": {"k":"tf","claim":"opp","a":"6","b":"-6"},
  "ex-1am-adad-nisbiya-siyaqat-l2-008:q3": {"k":"tf","claim":"selfopp","v":"0"},
  "ex-1am-adad-nisbiya-siyaqat-l2-009:q1": {"k":"read","side":"below","d":"18","sigs":[["18","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-009:q2": {"k":"lowest","list":["3","-12","-5","0"],"opts":[{"e":"3","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"},{"e":"-5","misc":"MISC-REL-NEGORDER"},{"e":"-12","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-009:q3": {"k":"both","d":"18","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-010:q1": {"k":"lowest","list":["6","-3","2","-1"],"opts":[{"e":"-3","misc":null},{"e":"6","misc":"MISC-REL-SIGNBIG"},{"e":"2","misc":"MISC-REL-SIGNBIG"},{"e":"-1","misc":"MISC-REL-NEGORDER"}]},
  "ex-1am-adad-nisbiya-siyaqat-l2-010:q2": {"k":"count","list":["6","-3","2","-1","4"],"sigs":[["3","MISC-REL-COUNTPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l2-010:q3": {"k":"dist","v":"-3","sigs":[["-3","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-001:q1": {"k":"count","list":["-8","5","12","-0.5","4","-4"],"sigs":[]},
  "ex-1am-adad-nisbiya-siyaqat-l3-001:q2": {"k":"opp","v":"4","sigs":[["4","MISC-REL-OPPSAME"],["5","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-001:q3": {"k":"tf","claim":"opp","a":"4","b":"-4"},
  "ex-1am-adad-nisbiya-siyaqat-l3-001:q4": {"k":"farther","a":"-8","b":"5","opts":[{"e":"5","misc":"MISC-REL-SIGNDIST"},{"e":"-8","misc":null},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l3-002:q1": {"k":"tf","claim":"opp","a":"-2.5","b":"-2.5"},
  "ex-1am-adad-nisbiya-siyaqat-l3-002:q2": {"k":"tf","claim":"oppneg","v":"-8"},
  "ex-1am-adad-nisbiya-siyaqat-l3-002:q3": {"k":"tf","claim":"dist","v":"-7","d":"-7"},
  "ex-1am-adad-nisbiya-siyaqat-l3-002:q4": {"k":"tf","claim":"selfopp","v":"3"},
  "ex-1am-adad-nisbiya-siyaqat-l3-003:q1": {"k":"count","list":["-4","4","-0.5","12","5","-8"],"sigs":[]},
  "ex-1am-adad-nisbiya-siyaqat-l3-003:q2": {"k":"opp","v":"-4","sigs":[["-4","MISC-REL-OPPSAME"],["-5","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-003:q3": {"k":"tf","claim":"opp","a":"4","b":"-4"},
  "ex-1am-adad-nisbiya-siyaqat-l3-004:q1": {"k":"lowest","list":["7","-4","3","-9","0"],"opts":[{"e":"7","misc":"MISC-REL-SIGNBIG"},{"e":"3","misc":"MISC-REL-SIGNBIG"},{"e":"-9","misc":null},{"e":"0","misc":"MISC-REL-SIGNBIG"}]},
  "ex-1am-adad-nisbiya-siyaqat-l3-004:q2": {"k":"dist","v":"-9","sigs":[["-9","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-004:q3": {"k":"opp","v":"-9","sigs":[["-9","MISC-REL-OPPSAME"],["-10","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-004:q4": {"k":"tf","claim":"less","a":"-9","b":"4"},
  "ex-1am-adad-nisbiya-siyaqat-l3-005:q1": {"k":"older","a":"-238","b":"780","opts":[{"label":"ماسينيسا","of":"a","misc":null},{"label":"الخوارزمي","of":"b","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l3-005:q2": {"k":"age","b":"-238","e":"-148","sigs":[["386","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-005:q3": {"k":"read","side":"below","d":"148","sigs":[["148","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-006:q1": {"k":"read","side":"below","d":"50","sigs":[["50","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-006:q2": {"k":"farther","a":"-50","b":"30","opts":[{"e":"30","misc":"MISC-REL-SIGNDIST"},{"e":"-50","misc":null},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l3-006:q3": {"k":"opp","v":"30","sigs":[["30","MISC-REL-OPPSAME"],["31","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-006:q4": {"k":"both","d":"50","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-007:q1": {"k":"read","side":"below","d":"3","sigs":[["3","MISC-REL-FLOORPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-007:q2": {"k":"read","side":"above","d":"5","sigs":[["-5","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-007:q3": {"k":"dist","v":"-3","sigs":[["-3","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-007:q4": {"k":"tf","claim":"sign","v":"-4","s":"pos"},
  "ex-1am-adad-nisbiya-siyaqat-l3-008:q1": {"k":"dist","v":"-2.4","sigs":[["-2.4","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-008:q2": {"k":"opp","v":"-2.4","sigs":[["-2.4","MISC-REL-OPPSAME"],["-3.4","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-008:q3": {"k":"both","d":"2.4","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-008:q4": {"k":"tf","claim":"dist","v":"-2.4","d":"2.4"},
  "ex-1am-adad-nisbiya-siyaqat-l3-009:q1": {"k":"tf","claim":"sign","v":"-0.5","s":"neg"},
  "ex-1am-adad-nisbiya-siyaqat-l3-009:q2": {"k":"tf","claim":"oppneg","v":"-5"},
  "ex-1am-adad-nisbiya-siyaqat-l3-009:q3": {"k":"tf","claim":"less","a":"-3","b":"0"},
  "ex-1am-adad-nisbiya-siyaqat-l3-009:q4": {"k":"tf","claim":"selfopp","v":"-5"},
  "ex-1am-adad-nisbiya-siyaqat-l3-010:q1": {"k":"read","side":"below","d":"11","sigs":[["11","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l3-010:q2": {"k":"lowest","list":["-2","8","-7","0"],"opts":[{"e":"8","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"},{"e":"-2","misc":"MISC-REL-NEGORDER"},{"e":"-7","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l3-010:q3": {"k":"count","list":["-2","8","-7","0.5","-1"],"sigs":[["2","MISC-REL-COUNTPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-001:q1": {"k":"tf","claim":"opp","a":"-5","b":"5"},
  "ex-1am-adad-nisbiya-siyaqat-l4-001:q2": {"k":"tf","claim":"oppneg","v":"-11"},
  "ex-1am-adad-nisbiya-siyaqat-l4-001:q3": {"k":"tf","claim":"dist","v":"-6","d":"6"},
  "ex-1am-adad-nisbiya-siyaqat-l4-001:q4": {"k":"opp","v":"-6","sigs":[["-6","MISC-REL-OPPSAME"],["-7","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-001:q5": {"k":"dist","v":"-6","sigs":[["-6","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-002:q1": {"k":"lowest","list":["0.4","-0.3","0.7","-0.5"],"opts":[{"e":"0.7","misc":"MISC-REL-SIGNBIG"},{"e":"-0.5","misc":null},{"e":"0.4","misc":"MISC-REL-SIGNBIG"},{"e":"-0.3","misc":"MISC-REL-NEGORDER"}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-002:q2": {"k":"dist","v":"-0.5","sigs":[["-0.5","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-002:q3": {"k":"farther","a":"-0.5","b":"0.3","opts":[{"e":"-0.5","misc":null},{"e":"0.3","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-002:q4": {"k":"opp","v":"0.7","sigs":[["0.7","MISC-REL-OPPSAME"],["1.7","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-003:q1": {"k":"opp","v":"-12","sigs":[["-12","MISC-REL-OPPSAME"],["-13","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-003:q2": {"k":"opp","v":"0.75","sigs":[["0.75","MISC-REL-OPPSAME"],["1.75","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-003:q3": {"k":"tf","claim":"opp","a":"0.75","b":"-0.75"},
  "ex-1am-adad-nisbiya-siyaqat-l4-003:q4": {"k":"dist","v":"-12","sigs":[["-12","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-004:q1": {"k":"read","side":"below","d":"40","sigs":[["40","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-004:q2": {"k":"read","side":"above","d":"30","sigs":[["-30","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-004:q3": {"k":"farther","a":"-40","b":"30","opts":[{"e":"30","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"},{"e":"-40","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-004:q4": {"k":"opp","v":"30","sigs":[["30","MISC-REL-OPPSAME"],["31","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-005:q1": {"k":"read","side":"below","d":"287","sigs":[["287","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-005:q2": {"k":"age","b":"-287","e":"-212","sigs":[["499","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-005:q3": {"k":"older","a":"-287","b":"-238","opts":[{"label":"ماسينيسا","of":"b","misc":"MISC-REL-NEGORDER"},{"label":"أرخميدس","of":"a","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-005:q4": {"k":"opp","v":"-287","sigs":[["-287","MISC-REL-OPPSAME"],["-288","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-006:q1": {"k":"read","side":"below","d":"3","sigs":[["3","MISC-REL-FLOORPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-006:q2": {"k":"read","side":"above","d":"7","sigs":[["-7","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-006:q3": {"k":"farther","a":"-3","b":"2","opts":[{"e":"-3","misc":null},{"e":"2","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-006:q4": {"k":"opp","v":"-3","sigs":[["-3","MISC-REL-OPPSAME"],["-4","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-007:q1": {"k":"lowest","list":["2","-6","4","-2","0"],"opts":[{"e":"-6","misc":null},{"e":"4","misc":"MISC-REL-SIGNBIG"},{"e":"2","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-007:q2": {"k":"farther","a":"-6","b":"4","opts":[{"e":"4","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"},{"e":"-6","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-007:q3": {"k":"dist","v":"-6","sigs":[["-6","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-007:q4": {"k":"opp","v":"-6","sigs":[["-6","MISC-REL-OPPSAME"],["-7","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-008:q1": {"k":"read","side":"below","d":"9","sigs":[["9","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-008:q2": {"k":"dist","v":"-9","sigs":[["-9","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-008:q3": {"k":"both","d":"9","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-008:q4": {"k":"tf","claim":"less","a":"-9","b":"3"},
  "ex-1am-adad-nisbiya-siyaqat-l4-009:q1": {"k":"count","list":["-3","6","-1.5","8","-9","2"],"sigs":[]},
  "ex-1am-adad-nisbiya-siyaqat-l4-009:q2": {"k":"lowest","list":["-3","6","-1.5","-9"],"opts":[{"e":"6","misc":"MISC-REL-SIGNBIG"},{"e":"-1.5","misc":"MISC-REL-NEGORDER"},{"e":"-3","misc":"MISC-REL-NEGORDER"},{"e":"-9","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-009:q3": {"k":"opp","v":"-1.5","sigs":[["-1.5","MISC-REL-OPPSAME"],["-2.5","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-009:q4": {"k":"tf","claim":"sign","v":"-1.5","s":"neg"},
  "ex-1am-adad-nisbiya-siyaqat-l4-010:q1": {"k":"dist","v":"-0.9","sigs":[["-0.9","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-010:q2": {"k":"opp","v":"0.9","sigs":[["0.9","MISC-REL-OPPSAME"],["1.9","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l4-010:q3": {"k":"farther","a":"0.9","b":"-0.5","opts":[{"e":"-0.5","misc":"MISC-REL-NEGDIST"},{"e":"0.9","misc":null},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l4-010:q4": {"k":"tf","claim":"dist","v":"-0.9","d":"0.9"},
  "ex-1am-adad-nisbiya-siyaqat-l5-001:q1": {"k":"read","side":"below","d":"7","sigs":[["7","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-001:q2": {"k":"lowest","list":["4","-3","-7","0","3"],"opts":[{"e":"4","misc":"MISC-REL-SIGNBIG"},{"e":"-7","misc":null},{"e":"3","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-001:q3": {"k":"opp","v":"-3","sigs":[["-3","MISC-REL-OPPSAME"],["-4","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-001:q4": {"k":"dist","v":"-7","sigs":[["-7","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-002:q1": {"k":"read","side":"below","d":"40","sigs":[["40","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-002:q2": {"k":"farther","a":"-40","b":"30","opts":[{"e":"-40","misc":null},{"e":"30","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-002:q3": {"k":"opp","v":"30","sigs":[["30","MISC-REL-OPPSAME"],["31","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-002:q4": {"k":"both","d":"40","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-003:q1": {"k":"read","side":"below","d":"287","sigs":[["287","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-003:q2": {"k":"age","b":"-287","e":"-212","sigs":[["499","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-003:q3": {"k":"age","b":"780","e":"850","sigs":[["1630","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-003:q4": {"k":"older","a":"-287","b":"780","opts":[{"label":"أرخميدس","of":"a","misc":null},{"label":"الخوارزمي","of":"b","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-004:q1": {"k":"read","side":"below","d":"3","sigs":[["3","MISC-REL-FLOORPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-004:q2": {"k":"read","side":"above","d":"7","sigs":[["-7","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-004:q3": {"k":"opp","v":"-3","sigs":[["-3","MISC-REL-OPPSAME"],["-4","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-004:q4": {"k":"tf","claim":"sign","v":"-4","s":"pos"},
  "ex-1am-adad-nisbiya-siyaqat-l5-005:q1": {"k":"lowest","list":["5","-2","-6","0","2"],"opts":[{"e":"5","misc":"MISC-REL-SIGNBIG"},{"e":"2","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"},{"e":"-6","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-005:q2": {"k":"dist","v":"-6","sigs":[["-6","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-005:q3": {"k":"opp","v":"-2","sigs":[["-2","MISC-REL-OPPSAME"],["-3","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-005:q4": {"k":"count","list":["5","-2","-6","0.5","2"],"sigs":[["3","MISC-REL-COUNTPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-006:q1": {"k":"read","side":"below","d":"15","sigs":[["15","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-006:q2": {"k":"read","side":"above","d":"4","sigs":[["-4","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-006:q3": {"k":"farther","a":"-15","b":"4","opts":[{"e":"4","misc":"MISC-REL-SIGNDIST"},{"e":"-15","misc":null},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-006:q4": {"k":"opp","v":"-15","sigs":[["-15","MISC-REL-OPPSAME"],["-16","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-007:q1": {"k":"count","list":["-3","8","-6","2","-1"],"sigs":[["2","MISC-REL-COUNTPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-007:q2": {"k":"tf","claim":"opp","a":"8","b":"-8"},
  "ex-1am-adad-nisbiya-siyaqat-l5-007:q3": {"k":"tf","claim":"dist","v":"-6","d":"6"},
  "ex-1am-adad-nisbiya-siyaqat-l5-007:q4": {"k":"lowest","list":["-3","8","-6","2"],"opts":[{"e":"-6","misc":null},{"e":"8","misc":"MISC-REL-SIGNBIG"},{"e":"2","misc":"MISC-REL-SIGNBIG"},{"e":"-3","misc":"MISC-REL-NEGORDER"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-008:q1": {"k":"lowest","list":["0","0.6","-0.4","0.9","-0.7"],"opts":[{"e":"0.9","misc":"MISC-REL-SIGNBIG"},{"e":"-0.7","misc":null},{"e":"0.6","misc":"MISC-REL-SIGNBIG"},{"e":"0","misc":"MISC-REL-SIGNBIG"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-008:q2": {"k":"farther","a":"-0.7","b":"0.6","opts":[{"e":"0.6","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"},{"e":"-0.7","misc":null}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-008:q3": {"k":"dist","v":"-0.7","sigs":[["-0.7","MISC-REL-NEGDIST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-008:q4": {"k":"opp","v":"0.9","sigs":[["0.9","MISC-REL-OPPSAME"],["1.9","MISC-REL-OPPNEXT"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-009:q1": {"k":"read","side":"below","d":"35","sigs":[["35","MISC-REL-SIGNLOST"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-009:q2": {"k":"read","side":"above","d":"25","sigs":[["-25","MISC-REL-ABOVENEG"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-009:q3": {"k":"farther","a":"-35","b":"25","opts":[{"e":"-35","misc":null},{"e":"25","misc":"MISC-REL-SIGNDIST"},{"e":null,"misc":"MISC-REL-SIGNONLY"}]},
  "ex-1am-adad-nisbiya-siyaqat-l5-009:q4": {"k":"both","d":"35","sigs":[["1","MISC-REL-ONLYONE"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-010:q1": {"k":"read","side":"below","d":"238","sigs":[["238","MISC-REL-BCPOS"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-010:q2": {"k":"age","b":"-238","e":"-148","sigs":[["386","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-010:q3": {"k":"age","b":"965","e":"1040","sigs":[["2005","MISC-REL-AGESUM"]]},
  "ex-1am-adad-nisbiya-siyaqat-l5-010:q4": {"k":"opp","v":"-238","sigs":[["-238","MISC-REL-OPPSAME"],["-239","MISC-REL-OPPNEXT"]]},
};

const lowestOf = (xs) => xs.reduce((a, b) => (cmp(b, a) < 0 ? b : a));
const truth = (s) => {
  const [a, b, v, d] = [s.a, s.b, s.v, s.d].map((x) => (x === undefined ? null : lit(x)));
  if (s.claim === 'opp') return eq(Q(a.n * b.d + b.n * a.d, a.d * b.d), ZERO);
  if (s.claim === 'less') return cmp(a, b) < 0;
  if (s.claim === 'dist') return eq(absQ(v), d);
  if (s.claim === 'oppneg') return cmp(neg(v), ZERO) < 0;
  if (s.claim === 'sign') return s.s === 'neg' ? cmp(v, ZERO) < 0 : cmp(v, ZERO) > 0;
  if (s.claim === 'selfopp') return eq(neg(v), v);
  throw new Error(s.claim);
};
const valueOf = (s) => {
  if (s.k === 'read') return s.side === 'below' ? neg(lit(s.d)) : lit(s.d);
  if (s.k === 'dist') return absQ(lit(s.v));
  if (s.k === 'opp') return neg(lit(s.v));
  if (s.k === 'age') return sub(lit(s.e), lit(s.b));
  if (s.k === 'count') return Q(B(s.list.filter((x) => cmp(lit(x), ZERO) < 0).length));
  if (s.k === 'both') return Q(eq(lit(s.d), ZERO) ? 1n : 2n);
  throw new Error(`valeur : ${s.k}`);
};
const sideLabel = (x) => (cmp(x, ZERO) > 0 ? 'فوق الصفر' : cmp(x, ZERO) < 0 ? 'تحت الصفر' : 'على الصفر');

const choiceIndex = (key, s) => {
  let hits;
  if (s.k === 'lowest') { const lo = lowestOf(s.list.map(lit)); hits = s.opts.map((o, i) => (eq(lit(o.e), lo) ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'farther') {
    const [x, y] = [lit(s.a), lit(s.b)];
    if (eq(absQ(x), absQ(y))) throw new Error(`${key} : distances égales`);
    const far = cmp(absQ(x), absQ(y)) > 0 ? x : y;
    hits = s.opts.map((o, i) => (o.e !== null && eq(lit(o.e), far) ? i : -1)).filter((i) => i >= 0);
  } else if (s.k === 'side') { const want = sideLabel(lit(s.v)); hits = s.opts.map((o, i) => (o.label === want ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'older') { const [x, y] = [lit(s.a), lit(s.b)]; const want = cmp(x, y) < 0 ? 'a' : 'b'; hits = s.opts.map((o, i) => (o.of === want ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'tf') return truth(s) ? 0 : 1;
  if (hits.length !== 1) throw new Error(`${key} : ${hits.length} options justes`);
  return hits[0];
};
const isChoice = (s) => ['lowest', 'farther', 'side', 'older', 'tf'].includes(s.k);
const answerOf = (key, s) => (isChoice(s) ? C('ABCDEF'[choiceIndex(key, s)]) : R(decText(valueOf(s))));

export const ORACLE = Object.fromEntries(Object.entries(SPECS).map(([k, s]) => [k, answerOf(k, s)]));

/** relit les fichiers du banc : clé, QCM et signatures de misconception */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const [key, s] of Object.entries(SPECS)) {
    const q = byKey.get(key);
    if (!q) { errs.push(`${key} : question absente`); continue; }
    if (!isChoice(s)) {
      if (q.answerType !== 'rational') { errs.push(`${key} : devrait être rational`); continue; }
      const K = valueOf(s);
      if (!eq(lit(String(q.expectedAnswer)), K)) errs.push(`${key} : clé ${q.expectedAnswer} ≠ ${decText(K)}`);
      const sigs = q.misconceptionSignatures ?? [];
      const want = s.sigs ?? [];
      if (sigs.length !== want.length) errs.push(`${key} : ${sigs.length} signatures, ${want.length} retapées`);
      for (const sg of sigs) {
        if (eq(lit(String(sg.value)), K)) errs.push(`${key} : signature ${sg.id} = la bonne réponse`);
        if (!want.some(([v, id]) => id === sg.id && eq(lit(v), lit(String(sg.value))))) errs.push(`${key} : signature ${sg.id}=${sg.value} non retapée`);
      }
    } else {
      if (q.answerType !== 'choice') { errs.push(`${key} : devrait être choice`); continue; }
      const good = choiceIndex(key, s);
      if (s.k === 'tf') {
        q.choices.forEach((c) => { if (c.isCorrect !== (c.id === (good === 0 ? 'A' : 'B'))) errs.push(`${key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit le contraire`); });
        continue;
      }
      if (q.choices.length !== s.opts.length) errs.push(`${key} : ${q.choices.length} options, ${s.opts.length} retapées`);
      q.choices.forEach((c, k) => {
        if (c.isCorrect !== (k === good)) errs.push(`${key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
        if ((s.opts[k]?.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${s.opts[k]?.misc}`);
        if (s.k === 'side') { if (c.content !== s.opts[k]?.label) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ « ${s.opts[k]?.label} »`); }
        else if (s.k === 'older') { if (s.opts[k] && c.content !== s.opts[k].label) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ « ${s.opts[k].label} »`); }
        else if (s.opts[k]?.e === null) { if (c.content === undefined || /\$/.test(c.content)) errs.push(`${key} : option ${c.id} devrait être textuelle`); }
        else if (!eq(lit(c.content), lit(s.opts[k].e))) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ ${s.opts[k]?.e}`);
      });
    }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in SPECS)) errs.push(`${b.key} : sans vérification`);
  return errs;
}

// Oracle du banc « talim-mustaqim-mudarraj » (التعليم على مستقيم مدرّج, 1AM, 2026-10-30) — feuilles d'examen de فصل (« على منوال اختبار الفصل … »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique décimale EXACTE en BigInt (fractions n/d, aucun flottant, aucun import
// de packages/core ni du laboratoire `stride-stamp`). Chaque question est RETAPÉE ci-dessous (`SPECS`) à partir des nombres de l'énoncé :
//  - `abs`      l'abscisse d'un point à `u` unités et `t` petites graduations (`div` par unité) du côté `side` de l'origine : ±(u + t/div) ;
//  - `figread`  l'abscisse lue sur la figure : `n` petites graduations signées depuis l'origine, une petite graduation = `step / minor` ;
//  - `floor`    / `figfloor` le plus grand entier a ≤ x (x n'est pas entier) : a < x < a + 1 ;         - `sym` l'abscisse du symétrique par rapport à O : −x ;
//  - `dist`     la distance à l'origine |x| ;                                                          - `nbr` le voisin entier : x − 1 (gauche) ou x + 1 (droite) ;
//  - `hidden`   l'abscisse de la graduation de rang j quand deux graduations (rang i1, abscisse x1 ; rang i2, abscisse x2) sont écrites : x1 + (j − i1)(x2 − x1)/(i2 − i1) ;
//  - `originidx` le rang de l'origine : i1 + (0 − x1)(i2 − i1)/(x2 − x1) ;   - `mark` la position en cm : x × cm (signée par le côté) ;
//  - `fit`      la plus grande unité (cm) qui fait tenir A(xw) et B(xe) sur une bande : min(ws / |xw|, es / xe) ;
//  - QCM : `side` (côté du signe), `far` (plus grande distance à O, jamais « البعد نفسه »), `ext` (plus petit / plus grand d'une liste), `symc` (−x), `between` (la borne basse est ⌊x⌋) ;
//  - `tf`       vrai / faux : `opp` (a + b = 0), `samedist` (|a| = |b|), `dist` (|x| = d), `side` (x > 0 ou x < 0), `between` (lo < x < lo + 1).
// Chaque signature de misconception d'une réponse numérique est vérifiée DIFFÉRENTE de la clé ; `audit(bank)` relit les fichiers : clé égale au calcul, une seule option juste,
// options et signatures égales à celles retapées, énoncé qui cite les nombres retapés, et — pour une figure — la position de chaque point et de chaque graduation écrite.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const B = (v) => BigInt(v);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const lit = (s) => {
  const t = String(s).replace(/\{,\}/g, '.').replace(/[$]/g, '').replace(/,/g, '.').replace(/−/g, '-').trim();
  const neg = t.startsWith('-'); const [i, f = ''] = t.replace('-', '').split('.');
  return Q((neg ? -1n : 1n) * B(i + f), 10n ** B(f.length));
};
const neg = (x) => Q(-x.n, x.d);
const absQ = (x) => Q(x.n < 0n ? -x.n : x.n, x.d);
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => add(x, neg(y));
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
const div = (x, y) => Q(x.n * y.d, x.d * y.n);
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l < r ? -1 : l > r ? 1 : 0; };
const eq = (x, y) => cmp(x, y) === 0;
const ZERO = Q(0n);
const ONE = Q(1n);
const int = (s) => Q(B(s));
const floorQ = (x) => { let q = x.n / x.d; if (x.n % x.d !== 0n && x.n < 0n) q -= 1n; return Q(q); };
const isInt = (x) => x.d === 1n;
const decText = (x) => {
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) throw new Error(`${x.n}/${x.d} n'est pas décimal`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const ng = x.n < 0n; const N = (ng ? -x.n : x.n) * (10n ** k / x.d);
  if (k === 0n) return `${ng ? '-' : ''}${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${ng ? '-' : ''}${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};
const tx = (x) => decText(x).replace(',', '{,}');
const mnTxt = (x) => decText(x).replace('-', '−');

/* ── énoncés retapés ── */
const SPECS = {
  "ex-1am-talim-mustaqim-mudarraj-l1-001:q1": {"side":"east","u":"5","t":"0","div":"10","k":"abs","sigs":[["-5","MISC-TALIM1-SIGNSIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-001:q2": {"x":"5","k":"sym","sigs":[["5","MISC-TALIM1-SYMSAME"],["6","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-001:q3": {"x":"-5","k":"dist","sigs":[["-5","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-002:q1": {"side":"west","u":"3","t":"0","div":"10","k":"abs","sigs":[["3","MISC-TALIM1-SIGNSIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-002:q2": {"side":"east","u":"6","t":"0","div":"10","k":"abs","sigs":[["-6","MISC-TALIM1-SIGNSIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-002:q3": {"x":"-4","k":"side","opts":[{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"على يسار المبدإ","misc":null},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"}]},
  "ex-1am-talim-mustaqim-mudarraj-l1-003:q1": {"x":"2.5","k":"side","opts":[{"label":"على يسار المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"على يمين المبدإ","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l1-003:q2": {"x":"-1.5","k":"side","opts":[{"label":"على يسار المبدإ","misc":null},{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"}]},
  "ex-1am-talim-mustaqim-mudarraj-l1-003:q3": {"x":"-7","k":"dist","sigs":[["-7","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-004:q1": {"pt":"A","n":"-6","step":"1","minor":"1","k":"figread","sigs":[["6","MISC-TALIM1-SIGNSIDE"],["-0.6","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-004:q2": {"pt":"B","n":"4","step":"1","minor":"1","k":"figread","sigs":[["0.4","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-004:q3": {"list":["-6","4","-5"],"which":"min","k":"ext","opts":[{"e":"4","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-6","misc":null},{"e":"-5","misc":"MISC-TALIM1-LEFTMAX"}]},
  "ex-1am-talim-mustaqim-mudarraj-l1-005:q1": {"x":"-3","cm":"2","k":"mark","sigs":[["6","MISC-TALIM1-SIGNSIDE"],["-3","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-005:q2": {"x":"4","cm":"2","k":"mark","sigs":[["4","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-005:q3": {"x":"-3.5","cm":"2","k":"mark","sigs":[["7","MISC-TALIM1-SIGNSIDE"],["-3.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-006:q1": {"k":"tf","claim":"samedist","a":"-3","b":"3"},
  "ex-1am-talim-mustaqim-mudarraj-l1-006:q2": {"k":"tf","claim":"side","x":"-2","s":"right"},
  "ex-1am-talim-mustaqim-mudarraj-l1-006:q3": {"k":"tf","claim":"dist","x":"-6","d":"6"},
  "ex-1am-talim-mustaqim-mudarraj-l1-007:q1": {"pt":"A","n":"-3","step":"10","minor":"2","k":"figread","sigs":[["15","MISC-TALIM1-SIGNSIDE"],["-1.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-007:q2": {"pt":"B","n":"-5","step":"10","minor":"2","k":"figread","sigs":[["25","MISC-TALIM1-SIGNSIDE"],["-2.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-007:q3": {"pt":"C","n":"4","step":"10","minor":"2","k":"figread","sigs":[["2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-008:q1": {"P":"P","j":"7","i1":"3","x1":"0","i2":"4","x2":"5","k":"hidden","sigs":[["4","MISC-TALIM1-UNITIGNORED"],["7","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-008:q2": {"P":"Q","j":"1","i1":"3","x1":"0","i2":"4","x2":"5","k":"hidden","sigs":[["-2","MISC-TALIM1-UNITIGNORED"],["1","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-008:q3": {"P":"R","j":"0","i1":"3","x1":"0","i2":"4","x2":"5","k":"hidden","sigs":[["-3","MISC-TALIM1-UNITIGNORED"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-009:q1": {"pt":"A","n":"-5","step":"100","minor":"4","k":"figread","sigs":[["125","MISC-TALIM1-SIGNSIDE"],["-1.25","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-009:q2": {"pt":"B","n":"7","step":"100","minor":"4","k":"figread","sigs":[["1.75","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-009:q3": {"pt":"C","n":"-2","step":"100","minor":"4","k":"figread","sigs":[["50","MISC-TALIM1-SIGNSIDE"],["-0.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-009:q4": {"pt":"D","n":"9","step":"100","minor":"4","k":"figread","sigs":[["2.25","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-010:q1": {"x":"4.5","k":"symc","opts":[{"e":"4.5","misc":"MISC-TALIM1-SYMSAME"},{"e":"-4.5","misc":null},{"e":"5.5","misc":"MISC-TALIM1-SYMNEXT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l1-010:q2": {"x":"-6","k":"sym","sigs":[["-6","MISC-TALIM1-SYMSAME"],["-7","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l1-010:q3": {"k":"tf","claim":"opp","a":"2.5","b":"-2.5"},
  "ex-1am-talim-mustaqim-mudarraj-l2-001:q1": {"x":"3","cm":"4","k":"mark","sigs":[["3","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-001:q2": {"x":"-2","cm":"4","k":"mark","sigs":[["8","MISC-TALIM1-SIGNSIDE"],["-2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-001:q3": {"x":"-0.75","cm":"4","k":"mark","sigs":[["3","MISC-TALIM1-SIGNSIDE"],["-0.75","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-001:q4": {"x":"2.5","cm":"4","k":"mark","sigs":[["2.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-002:q1": {"x":"2.5","cm":"2","k":"mark","sigs":[["2.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-002:q2": {"x":"3.5","cm":"2","k":"mark","sigs":[["3.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-002:q3": {"x":"-3","cm":"2","k":"mark","sigs":[["6","MISC-TALIM1-SIGNSIDE"],["-3","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-002:q4": {"x":"0.5","cm":"2","k":"mark","sigs":[["0.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-003:q1": {"x":"-1.5","k":"between","opts":[{"lo":"-2","misc":null},{"lo":"-1","misc":"MISC-TALIM1-BOUNDTRUNC"},{"lo":"0","misc":"MISC-TALIM1-BOUNDOUT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-003:q2": {"x":"2.7","k":"between","opts":[{"lo":"1","misc":"MISC-TALIM1-BOUNDOUT"},{"lo":"2","misc":null},{"lo":"3","misc":"MISC-TALIM1-BOUNDOUT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-003:q3": {"x":"-0.4","k":"between","opts":[{"lo":"0","misc":"MISC-TALIM1-BOUNDTRUNC"},{"lo":"-2","misc":"MISC-TALIM1-BOUNDOUT"},{"lo":"-1","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-004:q1": {"i1":"2","x1":"-3","i2":"8","x2":"3","k":"originidx","sigs":[["-1","MISC-TALIM1-ORIGINDIR"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-004:q2": {"P":"P","j":"7","i1":"2","x1":"-3","i2":"8","x2":"3","k":"hidden","sigs":[["7","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-004:q3": {"P":"Q","j":"0","i1":"2","x1":"-3","i2":"8","x2":"3","k":"hidden","sigs":[["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-005:q1": {"x":"-2.2","cm":"3","k":"mark","sigs":[["6.6","MISC-TALIM1-SIGNSIDE"],["-2.2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-005:q2": {"x":"1.7","cm":"3","k":"mark","sigs":[["1.7","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-005:q3": {"x":"-0.7","cm":"3","k":"mark","sigs":[["2.1","MISC-TALIM1-SIGNSIDE"],["-0.7","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-006:q1": {"x":"2.3","cm":"2","k":"mark","sigs":[["2.3","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-006:q2": {"x":"1.4","cm":"2","k":"mark","sigs":[["1.4","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-006:q3": {"x":"3.1","cm":"2","k":"mark","sigs":[["3.1","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-006:q4": {"x":"-0.5","cm":"2","k":"mark","sigs":[["1","MISC-TALIM1-SIGNSIDE"],["-0.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-007:q1": {"x":"-3.2","k":"floor","sigs":[["-3","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-007:q2": {"x":"4.8","k":"floor","sigs":[["5","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-007:q3": {"x":"-0.6","k":"floor","sigs":[["0","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-008:q1": {"side":"west","u":"2","t":"3","div":"10","k":"abs","sigs":[["2.3","MISC-TALIM1-SIGNSIDE"],["-1.7","MISC-TALIM1-FRACDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-008:q2": {"side":"east","u":"1","t":"4","div":"5","k":"abs","sigs":[["-1.8","MISC-TALIM1-SIGNSIDE"],["1.4","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-008:q3": {"side":"west","u":"3","t":"1","div":"4","k":"abs","sigs":[["3.25","MISC-TALIM1-SIGNSIDE"],["-2.75","MISC-TALIM1-FRACDIR"],["-3.1","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-009:q1": {"a":"-5.5","b":"4.2","k":"far","opts":[{"e":"4.2","misc":"MISC-TALIM1-FARSIGN"},{"e":"-5.5","misc":null},{"e":null,"misc":"MISC-TALIM1-FARSAME"}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-009:q2": {"list":["3.5","-1.2","0.8","-4"],"which":"max","k":"ext","opts":[{"e":"3.5","misc":null},{"e":"-1.2","misc":"MISC-TALIM1-LEFTMAX"},{"e":"0.8","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-4","misc":"MISC-TALIM1-LEFTMAX"}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-009:q3": {"a":"-0.8","b":"0.5","k":"far","opts":[{"e":"0.5","misc":"MISC-TALIM1-FARSIGN"},{"e":null,"misc":"MISC-TALIM1-FARSAME"},{"e":"-0.8","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l2-010:q1": {"x":"2","cm":"2","k":"mark","sigs":[["2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-010:q2": {"x":"-5","cm":"2","k":"mark","sigs":[["10","MISC-TALIM1-SIGNSIDE"],["-5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-010:q3": {"x":"4.5","cm":"2","k":"mark","sigs":[["4.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l2-010:q4": {"x":"0","cm":"2","k":"mark","sigs":[]},
  "ex-1am-talim-mustaqim-mudarraj-l3-001:q1": {"pt":"E","n":"-4","step":"1","minor":"1","k":"figread","sigs":[["4","MISC-TALIM1-SIGNSIDE"],["-0.4","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-001:q2": {"pt":"F","n":"7","step":"1","minor":"1","k":"figread","sigs":[["0.7","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-001:q3": {"x":"-3.5","k":"floor","sigs":[["-3","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-001:q4": {"x":"2.1","k":"floor","sigs":[["3","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-002:q1": {"pt":"A","n":"-12","step":"1","minor":"5","k":"figread","sigs":[["2.4","MISC-TALIM1-SIGNSIDE"],["-1.2","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-002:q2": {"pt":"B","n":"3","step":"1","minor":"5","k":"figread","sigs":[["0.3","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-002:q3": {"pt":"C","n":"9","step":"1","minor":"5","k":"figread","sigs":[["0.9","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-002:q4": {"pt":"D","n":"-4","step":"1","minor":"5","k":"figread","sigs":[["0.8","MISC-TALIM1-SIGNSIDE"],["-0.4","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-003:q1": {"pt":"M","n":"-8","step":"25","minor":"5","k":"figread","sigs":[["40","MISC-TALIM1-SIGNSIDE"],["-1.6","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-003:q2": {"pt":"J","n":"-4","step":"25","minor":"5","k":"figread","sigs":[["20","MISC-TALIM1-SIGNSIDE"],["-0.8","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-003:q3": {"pt":"K","n":"5","step":"25","minor":"5","k":"figread","sigs":[["1","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-003:q4": {"pt":"N","n":"14","step":"25","minor":"5","k":"figread","sigs":[["2.8","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-004:q1": {"P":"P","j":"8","i1":"1","x1":"-1","i2":"5","x2":"1","k":"hidden","sigs":[["6","MISC-TALIM1-UNITIGNORED"],["8","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-004:q2": {"P":"Q","j":"3","i1":"1","x1":"-1","i2":"5","x2":"1","k":"hidden","sigs":[["1","MISC-TALIM1-UNITIGNORED"],["3","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-004:q3": {"P":"R","j":"0","i1":"1","x1":"-1","i2":"5","x2":"1","k":"hidden","sigs":[["-2","MISC-TALIM1-UNITIGNORED"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-005:q1": {"i1":"3","x1":"-6","i2":"9","x2":"12","k":"originidx","sigs":[["1","MISC-TALIM1-ORIGINDIR"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-005:q2": {"P":"P","j":"11","i1":"3","x1":"-6","i2":"9","x2":"12","k":"hidden","sigs":[["2","MISC-TALIM1-UNITIGNORED"],["11","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-005:q3": {"P":"Q","j":"0","i1":"3","x1":"-6","i2":"9","x2":"12","k":"hidden","sigs":[["-9","MISC-TALIM1-UNITIGNORED"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-006:q1": {"x":"-30","dir":"left","k":"nbr","sigs":[["-29","MISC-TALIM1-NBRDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-006:q2": {"x":"-30","dir":"right","k":"nbr","sigs":[["-31","MISC-TALIM1-NBRDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-006:q3": {"x":"-100","dir":"left","k":"nbr","sigs":[["-99","MISC-TALIM1-NBRDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-006:q4": {"list":["-31","-30","-29"],"which":"min","k":"ext","opts":[{"e":"-30","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-29","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-31","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l3-007:q1": {"x":"-3","cm":"1.5","k":"mark","sigs":[["4.5","MISC-TALIM1-SIGNSIDE"],["-3","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-007:q2": {"x":"2.7","k":"between","opts":[{"lo":"1","misc":"MISC-TALIM1-BOUNDOUT"},{"lo":"3","misc":"MISC-TALIM1-BOUNDOUT"},{"lo":"2","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l3-007:q3": {"xw":"-3","ws":"6","xe":"2.7","es":"8.1","k":"fit","sigs":[["3","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-008:q1": {"x":"2.4","k":"sym","sigs":[["2.4","MISC-TALIM1-SYMSAME"],["3.4","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-008:q2": {"x":"-6.5","k":"symc","opts":[{"e":"6.5","misc":null},{"e":"-6.5","misc":"MISC-TALIM1-SYMSAME"},{"e":"-7.5","misc":"MISC-TALIM1-SYMNEXT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l3-008:q3": {"x":"-8.2","k":"dist","sigs":[["-8.2","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-008:q4": {"x":"-3.5","k":"sym","sigs":[["-3.5","MISC-TALIM1-SYMSAME"],["-4.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-009:q1": {"k":"tf","claim":"opp","a":"-2.5","b":"2.5"},
  "ex-1am-talim-mustaqim-mudarraj-l3-009:q2": {"k":"tf","claim":"samedist","a":"-4","b":"3"},
  "ex-1am-talim-mustaqim-mudarraj-l3-009:q3": {"k":"tf","claim":"between","x":"-1.5","lo":"-1"},
  "ex-1am-talim-mustaqim-mudarraj-l3-009:q4": {"k":"tf","claim":"side","x":"-0.3","s":"left"},
  "ex-1am-talim-mustaqim-mudarraj-l3-010:q1": {"x":"-0.5","k":"side","opts":[{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"على يسار المبدإ","misc":null},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"}]},
  "ex-1am-talim-mustaqim-mudarraj-l3-010:q2": {"side":"west","u":"1","t":"2","div":"5","k":"abs","sigs":[["1.4","MISC-TALIM1-SIGNSIDE"],["-0.6","MISC-TALIM1-FRACDIR"],["-1.2","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-010:q3": {"xw":"-4","ws":"10","xe":"6","es":"18","k":"fit","sigs":[["3","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l3-010:q4": {"x":"-1.5","cm":"4","k":"mark","sigs":[["6","MISC-TALIM1-SIGNSIDE"],["-1.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-001:q1": {"x":"-1.5","cm":"6","k":"mark","sigs":[["9","MISC-TALIM1-SIGNSIDE"],["-1.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-001:q2": {"x":"2.5","cm":"6","k":"mark","sigs":[["2.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-001:q3": {"x":"-0.5","cm":"6","k":"mark","sigs":[["3","MISC-TALIM1-SIGNSIDE"],["-0.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-001:q4": {"x":"-1.5","k":"sym","sigs":[["-1.5","MISC-TALIM1-SYMSAME"],["-2.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-002:q1": {"x":"1.5","cm":"4","k":"mark","sigs":[["1.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-002:q2": {"x":"-2.5","cm":"4","k":"mark","sigs":[["10","MISC-TALIM1-SIGNSIDE"],["-2.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-002:q3": {"x":"4.5","cm":"4","k":"mark","sigs":[["4.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-002:q4": {"xw":"-2.5","ws":"15","xe":"4.5","es":"36","k":"fit","sigs":[["8","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-003:q1": {"pt":"G","n":"-7","step":"1","minor":"2","k":"figread","sigs":[["3.5","MISC-TALIM1-SIGNSIDE"],["-0.7","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-003:q2": {"pt":"H","n":"1","step":"1","minor":"2","k":"figread","sigs":[["0.1","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-003:q3": {"pt":"I","n":"9","step":"1","minor":"2","k":"figread","sigs":[["0.9","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-003:q4": {"pt":"J","n":"-3","step":"1","minor":"2","k":"figread","sigs":[["1.5","MISC-TALIM1-SIGNSIDE"],["-0.3","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-004:q1": {"xw":"-6","ws":"12","xe":"10","es":"25","k":"fit","sigs":[["2.5","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-004:q2": {"x":"-5","cm":"2","k":"mark","sigs":[["10","MISC-TALIM1-SIGNSIDE"],["-5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-004:q3": {"x":"5","cm":"2","k":"mark","sigs":[["5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-004:q4": {"x":"-6","k":"dist","sigs":[["-6","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-005:q1": {"x":"-3.1","k":"sym","sigs":[["-3.1","MISC-TALIM1-SYMSAME"],["-4.1","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-005:q2": {"x":"2.5","k":"symc","opts":[{"e":"2.5","misc":"MISC-TALIM1-SYMSAME"},{"e":"-2.5","misc":null},{"e":"3.5","misc":"MISC-TALIM1-SYMNEXT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l4-005:q3": {"k":"tf","claim":"opp","a":"-4","b":"4"},
  "ex-1am-talim-mustaqim-mudarraj-l4-005:q4": {"x":"-4","k":"dist","sigs":[["-4","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-006:q1": {"P":"P","j":"10","i1":"5","x1":"2","i2":"8","x2":"5","k":"hidden","sigs":[["10","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-006:q2": {"P":"Q","j":"0","i1":"5","x1":"2","i2":"8","x2":"5","k":"hidden","sigs":[["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-006:q3": {"i1":"5","x1":"2","i2":"8","x2":"5","k":"originidx","sigs":[["7","MISC-TALIM1-ORIGINDIR"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-006:q4": {"x":"-4","k":"dist","sigs":[["-4","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-007:q1": {"pt":"A","x":"-2.5","k":"figfloor","sigs":[["-2","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-007:q2": {"pt":"B","x":"1.5","k":"figfloor","sigs":[["2","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-007:q3": {"pt":"C","x":"3.2","k":"figfloor","sigs":[["4","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-007:q4": {"pt":"D","x":"-0.4","k":"figfloor","sigs":[["0","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-008:q1": {"k":"tf","claim":"between","x":"2.3","lo":"2"},
  "ex-1am-talim-mustaqim-mudarraj-l4-008:q2": {"k":"tf","claim":"between","x":"-2.3","lo":"-2"},
  "ex-1am-talim-mustaqim-mudarraj-l4-008:q3": {"k":"tf","claim":"side","x":"-0.7","s":"right"},
  "ex-1am-talim-mustaqim-mudarraj-l4-008:q4": {"k":"tf","claim":"samedist","a":"-2.5","b":"2.5"},
  "ex-1am-talim-mustaqim-mudarraj-l4-009:q1": {"xw":"-4","ws":"14","xe":"5","es":"25","k":"fit","sigs":[["5","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-009:q2": {"x":"-4","cm":"3.5","k":"mark","sigs":[["14","MISC-TALIM1-SIGNSIDE"],["-4","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-009:q3": {"x":"-1.5","cm":"3.5","k":"mark","sigs":[["5.25","MISC-TALIM1-SIGNSIDE"],["-1.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-009:q4": {"x":"-1.5","k":"side","opts":[{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"على يسار المبدإ","misc":null},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"}]},
  "ex-1am-talim-mustaqim-mudarraj-l4-010:q1": {"side":"west","u":"4","t":"5","div":"10","k":"abs","sigs":[["4.5","MISC-TALIM1-SIGNSIDE"],["-3.5","MISC-TALIM1-FRACDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-010:q2": {"side":"east","u":"2","t":"3","div":"4","k":"abs","sigs":[["-2.75","MISC-TALIM1-SIGNSIDE"],["2.3","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-010:q3": {"x":"-4.5","k":"sym","sigs":[["-4.5","MISC-TALIM1-SYMSAME"],["-5.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l4-010:q4": {"x":"2.75","k":"sym","sigs":[["2.75","MISC-TALIM1-SYMSAME"],["3.75","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-001:q1": {"side":"west","u":"2","t":"3","div":"4","k":"abs","sigs":[["2.75","MISC-TALIM1-SIGNSIDE"],["-1.25","MISC-TALIM1-FRACDIR"],["-2.3","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-001:q2": {"side":"east","u":"3","t":"1","div":"4","k":"abs","sigs":[["-3.25","MISC-TALIM1-SIGNSIDE"],["3.1","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-001:q3": {"x":"-2.75","k":"dist","sigs":[["-2.75","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-001:q4": {"x":"-2.75","k":"sym","sigs":[["-2.75","MISC-TALIM1-SYMSAME"],["-3.75","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-001:q5": {"x":"-2.75","k":"floor","sigs":[["-2","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-002:q1": {"x":"-2","cm":"3","k":"mark","sigs":[["6","MISC-TALIM1-SIGNSIDE"],["-2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-002:q2": {"x":"4.5","cm":"3","k":"mark","sigs":[["4.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-002:q3": {"xw":"-5","ws":"9","xe":"7","es":"21","k":"fit","sigs":[["3","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-002:q4": {"x":"-2","k":"side","opts":[{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"على يسار المبدإ","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-002:q5": {"a":"-2","b":"4.5","k":"far","opts":[{"e":"4.5","misc":null},{"e":"-2","misc":"MISC-TALIM1-FARSIGN"},{"e":null,"misc":"MISC-TALIM1-FARSAME"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-003:q1": {"i1":"1","x1":"-6","i2":"4","x2":"3","k":"originidx","sigs":[["-1","MISC-TALIM1-ORIGINDIR"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-003:q2": {"P":"P","j":"9","i1":"1","x1":"-6","i2":"4","x2":"3","k":"hidden","sigs":[["2","MISC-TALIM1-UNITIGNORED"],["9","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-003:q3": {"P":"Q","j":"6","i1":"1","x1":"-6","i2":"4","x2":"3","k":"hidden","sigs":[["-1","MISC-TALIM1-UNITIGNORED"],["6","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-003:q4": {"P":"R","j":"0","i1":"1","x1":"-6","i2":"4","x2":"3","k":"hidden","sigs":[["-7","MISC-TALIM1-UNITIGNORED"],["0","MISC-TALIM1-ORIGINLEFT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-004:q1": {"x":"-3","k":"dist","sigs":[["-3","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-004:q2": {"x":"-1.5","k":"sym","sigs":[["-1.5","MISC-TALIM1-SYMSAME"],["-2.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-004:q3": {"list":["-1.5","2.5","-3"],"which":"min","k":"ext","opts":[{"e":"-1.5","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-3","misc":null},{"e":"2.5","misc":"MISC-TALIM1-LEFTMAX"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-004:q4": {"x":"-1.5","k":"floor","sigs":[["-1","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-004:q5": {"k":"tf","claim":"samedist","a":"-1.5","b":"2.5"},
  "ex-1am-talim-mustaqim-mudarraj-l5-005:q1": {"pt":"A","n":"-16","step":"1","minor":"5","k":"figread","sigs":[["3.2","MISC-TALIM1-SIGNSIDE"],["-1.6","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-005:q2": {"pt":"B","n":"-7","step":"1","minor":"5","k":"figread","sigs":[["1.4","MISC-TALIM1-SIGNSIDE"],["-0.7","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-005:q3": {"pt":"C","n":"13","step":"1","minor":"5","k":"figread","sigs":[["1.3","MISC-TALIM1-TICKDIV"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-005:q4": {"pt":"B","x":"-1.4","k":"figfloor","sigs":[["-1","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-005:q5": {"x":"-3.2","k":"sym","sigs":[["-3.2","MISC-TALIM1-SYMSAME"],["-4.2","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-006:q1": {"x":"-2","cm":"20","k":"mark","sigs":[["40","MISC-TALIM1-SIGNSIDE"],["-2","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-006:q2": {"x":"3.5","cm":"20","k":"mark","sigs":[["3.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-006:q3": {"x":"-0.5","cm":"20","k":"mark","sigs":[["10","MISC-TALIM1-SIGNSIDE"],["-0.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-006:q4": {"xw":"-2","ws":"60","xe":"3.5","es":"140","k":"fit","sigs":[["40","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-006:q5": {"x":"-0.5","k":"side","opts":[{"label":"على يسار المبدإ","misc":null},{"label":"على يمين المبدإ","misc":"MISC-TALIM1-SIGNSIDE"},{"label":"عند المبدإ","misc":"MISC-TALIM1-SIGNSIDE"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-007:q1": {"x":"-4.5","k":"dist","sigs":[["-4.5","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-007:q2": {"x":"-4.5","k":"sym","sigs":[["-4.5","MISC-TALIM1-SYMSAME"],["-5.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-007:q3": {"list":["-4.5","3","-1"],"which":"max","k":"ext","opts":[{"e":"-4.5","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-1","misc":"MISC-TALIM1-LEFTMAX"},{"e":"3","misc":null}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-007:q4": {"x":"-4.5","cm":"10","k":"mark","sigs":[["45","MISC-TALIM1-SIGNSIDE"],["-4.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-007:q5": {"x":"-4.5","k":"between","opts":[{"lo":"-4","misc":"MISC-TALIM1-BOUNDTRUNC"},{"lo":"-5","misc":null},{"lo":"-3","misc":"MISC-TALIM1-BOUNDOUT"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-008:q1": {"a":"-6","b":"1.5","k":"far","opts":[{"e":"-6","misc":null},{"e":"1.5","misc":"MISC-TALIM1-FARSIGN"},{"e":null,"misc":"MISC-TALIM1-FARSAME"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-008:q2": {"list":["-6","-2.5","1.5"],"which":"min","k":"ext","opts":[{"e":"-2.5","misc":"MISC-TALIM1-LEFTMAX"},{"e":"-6","misc":null},{"e":"1.5","misc":"MISC-TALIM1-LEFTMAX"}]},
  "ex-1am-talim-mustaqim-mudarraj-l5-008:q3": {"x":"-2.5","k":"floor","sigs":[["-2","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-008:q4": {"x":"1.5","k":"sym","sigs":[["1.5","MISC-TALIM1-SYMSAME"],["2.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-008:q5": {"k":"tf","claim":"between","x":"-2.5","lo":"-2"},
  "ex-1am-talim-mustaqim-mudarraj-l5-009:q1": {"side":"west","u":"1","t":"7","div":"10","k":"abs","sigs":[["1.7","MISC-TALIM1-SIGNSIDE"],["-0.3","MISC-TALIM1-FRACDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-009:q2": {"side":"east","u":"0","t":"6","div":"10","k":"abs","sigs":[["-0.6","MISC-TALIM1-SIGNSIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-009:q3": {"side":"west","u":"2","t":"3","div":"10","k":"abs","sigs":[["2.3","MISC-TALIM1-SIGNSIDE"],["-1.7","MISC-TALIM1-FRACDIR"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-009:q4": {"x":"-1.7","k":"floor","sigs":[["-1","MISC-TALIM1-BOUNDUP"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-009:q5": {"x":"-2.3","k":"dist","sigs":[["-2.3","MISC-TALIM1-DISTNEG"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-010:q1": {"xw":"-4","ws":"30","xe":"6","es":"48","k":"fit","sigs":[["8","MISC-TALIM1-ONESIDE"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-010:q2": {"x":"-3.5","cm":"5","k":"mark","sigs":[["17.5","MISC-TALIM1-SIGNSIDE"],["-3.5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-010:q3": {"x":"5","cm":"5","k":"mark","sigs":[["5","MISC-TALIM1-UNITIGNORED"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-010:q4": {"x":"-3.5","k":"sym","sigs":[["-3.5","MISC-TALIM1-SYMSAME"],["-4.5","MISC-TALIM1-SYMNEXT"]]},
  "ex-1am-talim-mustaqim-mudarraj-l5-010:q5": {"k":"tf","claim":"opp","a":"-3.5","b":"3.5"},
};

const valueOf = (s) => {
  switch (s.k) {
    case 'abs': return mul(s.side === 'west' ? Q(-1n) : ONE, add(int(s.u), div(int(s.t), int(s.div))));
    case 'figread': return div(mul(int(s.n), lit(s.step)), int(s.minor));
    case 'floor': case 'figfloor': return floorQ(lit(s.x));
    case 'sym': return neg(lit(s.x));
    case 'dist': return absQ(lit(s.x));
    case 'nbr': return s.dir === 'left' ? sub(lit(s.x), ONE) : add(lit(s.x), ONE);
    case 'hidden': return add(lit(s.x1), div(mul(sub(int(s.j), int(s.i1)), sub(lit(s.x2), lit(s.x1))), sub(int(s.i2), int(s.i1))));
    case 'originidx': return add(int(s.i1), div(mul(neg(lit(s.x1)), sub(int(s.i2), int(s.i1))), sub(lit(s.x2), lit(s.x1))));
    case 'mark': return mul(lit(s.x), lit(s.cm));
    case 'fit': { const a = div(lit(s.ws), absQ(lit(s.xw))); const b = div(lit(s.es), lit(s.xe)); return cmp(a, b) <= 0 ? a : b; }
    default: throw new Error(`valeur : ${s.k}`);
  }
};
const truth = (s) => {
  const g = (k) => (s[k] === undefined ? null : lit(s[k]));
  if (s.claim === 'opp') return eq(add(g('a'), g('b')), ZERO);
  if (s.claim === 'samedist') return eq(absQ(g('a')), absQ(g('b')));
  if (s.claim === 'dist') return eq(absQ(g('x')), g('d'));
  if (s.claim === 'side') return s.s === 'right' ? cmp(g('x'), ZERO) > 0 : cmp(g('x'), ZERO) < 0;
  if (s.claim === 'between') return cmp(g('lo'), g('x')) < 0 && cmp(g('x'), add(g('lo'), ONE)) < 0;
  throw new Error(s.claim);
};
const sideLabel = (x) => (cmp(x, ZERO) > 0 ? 'على يمين المبدإ' : cmp(x, ZERO) < 0 ? 'على يسار المبدإ' : 'عند المبدإ');
const extOf = (s) => s.list.map(lit).reduce((a, b) => ((s.which === 'min' ? cmp(b, a) < 0 : cmp(b, a) > 0) ? b : a));

const choiceIndex = (key, s) => {
  let hits;
  if (s.k === 'tf') return truth(s) ? 0 : 1;
  if (s.k === 'side') { const want = sideLabel(lit(s.x)); hits = s.opts.map((o, i) => (o.label === want ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'far') {
    const [x, y] = [lit(s.a), lit(s.b)];
    if (eq(absQ(x), absQ(y))) throw new Error(`${key} : distances égales`);
    const far = cmp(absQ(x), absQ(y)) > 0 ? x : y;
    hits = s.opts.map((o, i) => (o.e !== null && eq(lit(o.e), far) ? i : -1)).filter((i) => i >= 0);
  } else if (s.k === 'ext') { const best = extOf(s); hits = s.opts.map((o, i) => (eq(lit(o.e), best) ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'symc') { const want = neg(lit(s.x)); hits = s.opts.map((o, i) => (eq(lit(o.e), want) ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'between') { const fl = floorQ(lit(s.x)); hits = s.opts.map((o, i) => (eq(lit(o.lo), fl) ? i : -1)).filter((i) => i >= 0); }
  else throw new Error(`QCM : ${s.k}`);
  if (hits.length !== 1) throw new Error(`${key} : ${hits.length} options justes`);
  return hits[0];
};
const isChoice = (s) => ['side', 'far', 'ext', 'symc', 'between', 'tf'].includes(s.k);
const answerOf = (key, s) => (isChoice(s) ? C('ABCDEF'[choiceIndex(key, s)]) : R(decText(valueOf(s))));

export const ORACLE = Object.fromEntries(Object.entries(SPECS).map(([k, s]) => [k, answerOf(k, s)]));

/** les nombres retapés doivent figurer dans l'énoncé de la question (sinon la clé et le texte divergent) */
const mentions = (key, s) => {
  const need = [];
  const D = (v) => `${tx(lit(v))}`;
  if (s.k === 'floor' || s.k === 'sym' || s.k === 'dist' || s.k === 'nbr' || s.k === 'figfloor') { if (s.k !== 'figfloor') need.push(D(s.x)); }
  if (s.k === 'mark') need.push(D(s.x), D(s.cm));
  if (s.k === 'fit') need.push(D(s.xw), D(s.ws), D(s.xe), D(s.es));
  if (s.k === 'figread') need.push(`$${s.pt}$`);
  if (s.k === 'hidden') need.push(`$${s.P}$`);
  return need;
};

const figOf = (key) => {
  const [id] = key.split(':');
  const lv = id.match(/-l(\d)-/)[1];
  const p = fileURLToPath(new URL(`../../content/practice/1am/talim-mustaqim-mudarraj/level-${lv}/${id}.json`, import.meta.url));
  return JSON.parse(readFileSync(p, 'utf8')).statement.figure ?? null;
};

/** relit les fichiers du banc : clé, QCM, signatures de misconception, nombres cités et figure */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const [key, s] of Object.entries(SPECS)) {
    const q = byKey.get(key);
    if (!q) { errs.push(`${key} : question absente`); continue; }
    for (const m of mentions(key, s)) if (!q.statement.includes(m)) errs.push(`${key} : l'énoncé ne cite pas « ${m} »`);
    if (!isChoice(s)) {
      if (q.answerType !== 'rational') { errs.push(`${key} : devrait être rational`); continue; }
      const K = valueOf(s);
      if (!eq(lit(String(q.expectedAnswer)), K)) errs.push(`${key} : clé ${q.expectedAnswer} ≠ ${decText(K)}`);
      if (s.k === 'originidx' && !(isInt(K) && K.n >= 0n)) errs.push(`${key} : le rang de l'origine n'est pas un naturel`);
      if (['floor', 'figfloor'].includes(s.k) && isInt(lit(s.x))) errs.push(`${key} : x est entier, pas de encadrement strict`);
      const sigs = q.misconceptionSignatures ?? [];
      const want = s.sigs ?? [];
      if (sigs.length !== want.length) errs.push(`${key} : ${sigs.length} signatures, ${want.length} retapées`);
      for (const sg of sigs) {
        if (eq(lit(String(sg.value)), K)) errs.push(`${key} : signature ${sg.id} = la bonne réponse`);
        if (!want.some(([v, id]) => id === sg.id && eq(lit(v), lit(String(sg.value))))) errs.push(`${key} : signature ${sg.id}=${sg.value} non retapée`);
      }
      // la figure : la position du point nommé / des graduations écrites
      const fig = ['figread', 'figfloor', 'hidden', 'originidx'].includes(s.k) ? figOf(key) : null;
      if (['figread', 'figfloor', 'hidden', 'originidx'].includes(s.k) && !fig) errs.push(`${key} : figure absente`);
      if (fig) {
        const near = (a, b) => Math.abs(a - b) < 1e-9;
        if (s.k === 'figread') { const P = fig.points[s.pt]; if (!P) errs.push(`${key} : point ${s.pt} absent`); else if (!near(P[0] * Number(lit(s.step).n) / Number(lit(s.step).d), Number(K.n) / Number(K.d))) errs.push(`${key} : le point ${s.pt} n'est pas à ${decText(K)} sur la figure`); }
        if (s.k === 'figfloor') { const P = fig.points[s.pt]; if (!P || !near(P[0], Number(lit(s.x).n) / Number(lit(s.x).d))) errs.push(`${key} : le point ${s.pt} n'est pas à ${s.x}`); }
        if (s.k === 'hidden' || s.k === 'originidx') {
          for (const [i, x] of [[s.i1, s.x1], [s.i2, s.x2]]) { const P = fig.points[mnTxt(lit(x))]; if (!P || !near(P[0], Number(i))) errs.push(`${key} : la graduation écrite ${x} n'est pas au rang ${i}`); }
        }
        if (s.k === 'hidden') { const P = fig.points[s.P]; if (!P || !near(P[0], Number(s.j))) errs.push(`${key} : le point ${s.P} n'est pas au rang ${s.j}`); }
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
        else if (s.k === 'between') { const lo = lit(s.opts[k].lo); if (c.content !== `بين $${tx(lo)}$ و $${tx(add(lo, ONE))}$`) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ la borne ${s.opts[k].lo}`); }
        else if (s.opts[k]?.e === null) { if (c.content === undefined || /\$/.test(c.content)) errs.push(`${key} : option ${c.id} devrait être textuelle`); }
        else if (!eq(lit(c.content), lit(s.opts[k].e))) errs.push(`${key} : option ${c.id} « ${c.content} » ≠ ${s.opts[k]?.e}`);
      });
      if (s.k === 'far' || s.k === 'ext') {
        const want = s.k === 'far' ? [s.a, s.b] : s.list;
        const names = want.map((v) => (s.k === 'far' ? `(${tx(lit(v))})` : `$${tx(lit(v))}$`));
        for (const n of names) if (!q.statement.includes(n)) errs.push(`${key} : l'énoncé ne cite pas ${n}`);
      }
      if (s.k === 'symc' || s.k === 'between' || s.k === 'side') { const n = `(${tx(lit(s.x))})`; if (!q.statement.includes(n)) errs.push(`${key} : l'énoncé ne cite pas ${n}`); }
    }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in SPECS)) errs.push(`${b.key} : sans vérification`);
  return errs;
}

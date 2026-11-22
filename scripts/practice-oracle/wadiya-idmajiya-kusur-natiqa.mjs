// Oracle du banc « wadiya-idmajiya-kusur-natiqa » (« أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة », synthèse de l'unité 2 de 3AM, 2026-10-26).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` :
//  - l'évaluateur de chaînes est celui du banc frère `amaliyat-natiqa` (E : rationnels EXACTS en BigInt, priorités, parenthèses, moins
//    unaire, fraction composée « [a|b] », « {a/-b} » pour un signe au dénominateur ; TEX : second analyseur du LaTeX), IMPORTÉ, pas recopié ;
//  - les nombres de l'ÉNONCÉ sont retapés en ASCII dans la spec (« 3/4*(1-2/5) ») ; l'oracle vérifie que chaque littéral de l'expression
//    figure dans la feuille (énoncé, formules, questions) — sauf ceux déclarés `der` : valeurs DÉRIVÉES d'une étape précédente (300, 5/12…) ;
//  - les formules `A = …` de la feuille (`statement.formulas`) sont RELUES en LaTeX (TEX) et doivent valoir la même chose que la chaîne retapée ;
//  - un QCM n'a qu'UNE bonne option : chaque option (valeur, expression, ou nom) est évaluée, la marquée est la seule juste ;
//    « le plus grand / le plus petit » se recalcule sur les valeurs exactes, un « نعم / لا » sur la relation exacte ;
//  - `audit` contrôle chaque ÉTIQUETTE MISC-* : la signature (ou le distracteur) vaut EXACTEMENT ce que l'erreur nommée produit, recalculé :
//      NOFLIP = ÷ lu comme ×  · FLIPFIRST = on retourne le dividende  · REVERSED = diviseur ÷ dividende  · PRODSIGN / RECIPSIGN / SUMSIGN /
//      TWONEG = l'opposé de la clé  · ADDDIST = −(somme des valeurs absolues)  · ACROSS = (Σ numérateurs) / (Σ dénominateurs)  ·
//      PRIORITY = de gauche à droite sans priorités  · SUBNEG = « − (−x) » lu « − x »  · DROPSIGN / INVERT = signe du dénominateur
//      oublié / fraction retournée  · FARQ-MAQLUB = différence à l'envers  · JUZ-NAQIS = un terme oublié  · MAJMU-FARQ = la somme au lieu du
//      reste (somme + clé = 1)  · INTEGER = n − a/b lu (n − a)/b  · MAQLUB-OPPOSITE / NUMONLY = opposé / 1 sur le numérateur  ·
//      SYN-KUSUR-WHOLE = f × Tout au lieu de f × Reste (reconstruit sur le gabarit retapé)  · WRONGFRAC / DIFFWHOLES = même numérateur,
//      autre dénominateur  · OVERLAP = clé + terme commun  · ROUNDUP = partie entière + 1  · NOHALF = 2 × clé  · MASAHA-AREA-PERIM-CONFUSED =
//      périmètre au lieu de l'aire (et inversement)  · KULL-JUZ / FRACASQTY = réécriture littérale de l'expression juste ;
//      TASAWI-NUMERATORS / DENOMS = on choisit par numérateur seul / dénominateur seul (calculé sur les littéraux a/b de l'énoncé) ;
//      NATIQ-NEGORDER = on compare les distances à zéro.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';
import { E, TEX } from './amaliyat-natiqa.mjs';

/* ── petits outils sur les rationnels de amaliyat-natiqa ─────────────────── */
const same = (x, y) => x.eq(y);
const cmp = (x, y) => (x.lt(y) ? -1 : y.lt(x) ? 1 : 0);
const ZERO = E('0');
const absQ = (x) => (x.lt(ZERO) ? x.neg() : x);
const floorQ = (x) => { let q = x.n / x.d; if (x.n % x.d < 0n) q -= 1n; return E(String(q)); };
const recipQ = (x) => E('1').div(x);

/** Découpe de premier niveau (profondeur 0) aux opérateurs `ops` ; un « - » ou « + » en tête d'opérande est unaire. */
function splitTop(s, ops) {
  s = s.replace(/\s+/g, ''); const parts = []; const used = []; let depth = 0; let cur = '';
  for (const c of s) {
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth--;
    if (depth === 0 && ops.includes(c) && cur !== '' && !'+-*:('.includes(cur[cur.length - 1])) { parts.push(cur); used.push(c); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur); return { parts, used };
}
/** Termes d'une somme de premier niveau : [{ s: '+'|'-', t }] (le premier terme garde son propre signe éventuel). */
function terms(s) { const { parts, used } = splitTop(s, '+-'); return parts.map((t, i) => ({ s: i === 0 ? '+' : used[i - 1], t })); }
const termVal = ({ s, t }) => (s === '-' ? E(t).neg() : E(t));
/** Évaluation de gauche à droite SANS priorités (opérandes parenthésés évalués normalement). */
function flatEval(s) {
  const { parts, used } = splitTop(s, '+-*:'); let v = E(parts[0]);
  used.forEach((op, i) => { const r = E(parts[i + 1]); v = op === '+' ? v.add(r) : op === '-' ? v.sub(r) : op === '*' ? v.mul(r) : v.div(r); });
  return v;
}
const lit = (t) => { const m = /^(\d+)\/(\d+)$/.exec(t); return m ? [Number(m[1]), Number(m[2])] : null; };

/* ── lecture du banc ───────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '3am', 'wadiya-idmajiya-kusur-natiqa');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex);
  }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const numsOf = (t) => new Set([...String(t).replace(/\{,\}/g, '.').matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]));
const corpusOf = (ex) => { const c = new Set(); const add = (t) => numsOf(t).forEach((n) => c.add(n)); add(ex.statement.content); (ex.statement.formulas ?? []).forEach(add); ex.questions.forEach((q) => add(q.statement)); return c; };
const litsOf = (e) => [...String(e).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
const formulaOf = (ex, L) => { const f = (ex.statement.formulas ?? []).find((x) => x.trim().startsWith(`${L} =`)); if (!f) throw new Error(`${ex.id} : formule « ${L} » absente`); return f.slice(f.indexOf('=') + 1); };
const pickOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const keyVal = (sp) => { const v = E(sp.e); return sp.fl ? floorQ(v) : v; };

/* ── mauvaises lectures prédites pour un « le plus grand / le plus petit » ─── */
function traps(items, dir) {
  const lits = items.map(([, x]) => lit(x));
  const out = items.map(() => []);
  const vals = items.map(([, x]) => E(x));
  if (vals.every((v) => v.lt(ZERO))) { // nombres négatifs : on les range par distance à zéro
    const ab = vals.map(absQ); let pk = 0;
    ab.forEach((v, j) => { if ((dir === 'max' && cmp(v, ab[pk]) > 0) || (dir === 'min' && cmp(v, ab[pk]) < 0)) pk = j; });
    out[pk].push('MISC-NATIQ-NEGORDER'); return out;
  }
  if (!lits.every(Boolean)) return out;
  const pick = (f) => lits.reduce((bi, l, j) => (f(l, lits[bi]) ? j : bi), 0);
  const byNum = dir === 'max' ? pick((a, b) => a[0] > b[0]) : pick((a, b) => a[0] < b[0]);
  const byDen = dir === 'max' ? pick((a, b) => a[1] > b[1]) : pick((a, b) => a[1] < b[1]);
  out[byNum].push('MISC-TASAWI-NUMERATORS'); out[byDen].push('MISC-TASAWI-DENOMS');
  return out;
}
function argext(items, dir) {
  const vals = items.map(([, x]) => E(x)); let best = 0;
  vals.forEach((v, i) => { if ((dir === 'max' && cmp(v, vals[best]) > 0) || (dir === 'min' && cmp(v, vals[best]) < 0)) best = i; });
  if (vals.filter((v) => same(v, vals[best])).length !== 1) throw new Error('égalité pour le plus grand / plus petit');
  return best;
}
const relOf = (a, b) => (cmp(a, b) < 0 ? '<' : cmp(a, b) > 0 ? '>' : '=');

/* ── les questions (généré une fois, relu et maintenu à la main ensuite) ───── */
const SPEC = {
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-001:q1": {"k":"e","e":"3/4+5/6","of":"A","sigs":[["[3+5|4+6]","MISC-JAMTARH-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-001:q2": {"k":"e","e":"7/8:21/16","of":"B","sigs":[["7/8*21/16","MISC-AMAL-NOFLIP"],["8/7*21/16","MISC-AMAL-FLIPFIRST"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-001:q3": {"k":"e","e":"5/6-2/3*3/4","of":"C","sigs":[["(5/6-2/3)*3/4","MISC-AMAL-PRIORITY"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-001:q4": {"k":"recip","e":"12/19","x":"3/4+5/6","of":"A","sigs":[["-19/12","MISC-MAQLUB-OPPOSITE"],["1/19","MISC-MAQLUB-NUMONLY"]],"der":["12","19"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-002:q1": {"k":"e","e":"7/10-3/4","of":"A","sigs":[["3/4-7/10","MISC-JAMTARH-FARQ-MAQLUB"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-002:q2": {"k":"e","e":"(-5/6):(-10/9)","of":"B","sigs":[["-(5/6*9/10)","MISC-AMAL-PRODSIGN"],["(-5/6)*(-10/9)","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-002:q3": {"k":"e","e":"1/3-1/2*4/9","of":"C","sigs":[["(1/3-1/2)*4/9","MISC-AMAL-PRIORITY"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-002:q4": {"k":"ext","dir":"max","items":[["","7/12"],["","5/8"]],"labels":"tex"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-003:q1": {"k":"e","e":"{9/-12}","of":"A","sigs":[["3/4","MISC-NATIQ-DROPSIGN"],["-12/9","MISC-NATIQ-INVERT"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-003:q2": {"k":"e","e":"{-8/-20}","of":"B","sigs":[["-2/5","MISC-NATIQ-TWONEG"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-003:q3": {"k":"e","e":"-3/5:9/10","of":"C","sigs":[["-3/5*9/10","MISC-AMAL-NOFLIP"],["3/5:9/10","MISC-AMAL-PRODSIGN"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-003:q4": {"k":"ext","dir":"max","items":[["","-3/4"],["","-2/3"]],"labels":"tex"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-004:q1": {"k":"recip","e":"-3/7","x":"-7/3","of":"A","sigs":[["3/7","MISC-AMAL-RECIPSIGN"],["7/3","MISC-MAQLUB-OPPOSITE"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-004:q2": {"k":"recip","e":"{8/-5}","x":"{5/-8}","of":"B","sigs":[["8/5","MISC-AMAL-RECIPSIGN"],["5/8","MISC-MAQLUB-OPPOSITE"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-004:q3": {"k":"e","e":"5/6:(1/4+1/6)","of":"C","sigs":[["25/72","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-005:q1": {"k":"e","e":"(3/4-1/3)*6/5","of":"A"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-005:q2": {"k":"e","e":"7/4:(1/2+1/3)","of":"B","sigs":[["7/4*5/6","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-005:q3": {"k":"e","e":"-1/2+3/4:(-3/2)","of":"C","sigs":[["(-1/2+3/4):(-3/2)","MISC-AMAL-PRIORITY"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-006:q1": {"k":"e","e":"-5/6+3/4","of":"A","sigs":[["1/12","MISC-AMAL-SUMSIGN"],["-19/12","MISC-AMAL-ADDDIST"],["[-5+3|6+4]","MISC-AMAL-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-006:q2": {"k":"e","e":"-2/3-1/4","of":"B","sigs":[["[-2-1|3+4]","MISC-AMAL-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-006:q3": {"k":"e","e":"2/5-(-1/2)","of":"C","sigs":[["2/5-1/2","MISC-QISMA-SUBNEG"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-007:q1": {"k":"ext","dir":"max","items":[["$a = \\dfrac{3}{5}$","3/5"],["$b = \\dfrac{4}{7}$","4/7"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-007:q2": {"k":"e","e":"3/5-4/7","sigs":[["[3-4|5+7]","MISC-JAMTARH-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-007:q3": {"k":"ext","dir":"max","items":[["$c = -\\dfrac{5}{6}$","-5/6"],["$d = -\\dfrac{7}{9}$","-7/9"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-008:q1": {"k":"e","e":"3/8*40","of":"A"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-008:q2": {"k":"e","e":"5/6*9/10","of":"B"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-008:q3": {"k":"e","e":"9/2:(3/4)","of":"C","sigs":[["9/2*3/4","MISC-AMAL-NOFLIP"],["3/4:(9/2)","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-009:q1": {"k":"e","e":"2/5+1/4-3/10","of":"A"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-009:q2": {"k":"e","e":"1-3/7-2/5","of":"B","sigs":[["(1-3):7-2/5","MISC-JAMTARH-INTEGER"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-009:q3": {"k":"e","e":"(1-3/5)*5/6","of":"C"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-009:q4": {"k":"yn","l":"7/20+6/35+1/3","r":"1","rel":">","yes":"نعم","no":"لا","der":["20","35"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-010:q1": {"k":"e","e":"{-12/-18}","of":"A","sigs":[["-2/3","MISC-NATIQ-TWONEG"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-010:q2": {"k":"e","e":"-4/9+{5/-6}","of":"B","sigs":[["-4/9+5/6","MISC-NATIQ-DROPSIGN"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l1-010:q3": {"k":"e","e":"-7/12:(-14/9)","of":"C","sigs":[["-3/8","MISC-AMAL-PRODSIGN"],["-7/12*(-14/9)","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-001:q1": {"k":"e","e":"3/4*(1-2/5)","sigs":[["3/4*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/4","rest":"1-2/5","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-001:q2": {"k":"e","e":"1-2/5-3/4*(1-2/5)","sigs":[["1-2/5-3/4*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/4","rest":"1-2/5","whole":"1","wrap":"1-2/5-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-001:q3": {"k":"e","e":"15:(3/20)","sigs":[["15*3/20","MISC-AMAL-NOFLIP"],["15:(9/20)","MISC-SYN-KUSUR-WRONGFRAC"]],"der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-002:q1": {"k":"e","e":"1-3/8-5/12","sigs":[["1-3/8","MISC-JAMTARH-JUZ-NAQIS"]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-002:q2": {"k":"ext","dir":"min","items":[["المرحلة الأولى","3/8"],["المرحلة الثانية","5/12"],["المرحلة الثالثة","5/24"]],"labels":"text","der":["24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-002:q3": {"k":"e","e":"1200000:(5/24)","sigs":[["1200000*5/24","MISC-AMAL-NOFLIP"]],"der":["24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-003:q1": {"k":"e","e":"5/8*(1-3/5)","sigs":[["5/8*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"5/8","rest":"1-3/5","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-003:q2": {"k":"e","e":"1-3/5-5/8*(1-3/5)","sigs":[["1-3/5-5/8*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"5/8","rest":"1-3/5","whole":"1","wrap":"1-3/5-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-003:q3": {"k":"e","e":"3:(3/20)","sigs":[["3*3/20","MISC-AMAL-NOFLIP"],["3:(1/4)","MISC-SYN-KUSUR-WRONGFRAC"]],"der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-004:q1": {"k":"ext","dir":"max","items":[["ياسين","7/12"],["أنيس","5/8"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-004:q2": {"k":"self","facts":[["7/12","14/24"],["5/8","15/24"]],"der":["14","24","15"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-004:q3": {"k":"e","e":"5/8-7/12","sigs":[["7/12-5/8","MISC-JAMTARH-FARQ-MAQLUB"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-004:q4": {"k":"e","e":"1/24*240","der":["1","24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-005:q1": {"k":"e","e":"180:(3/8)","sigs":[["180*3/8","MISC-AMAL-NOFLIP"],["180:(5/8)","MISC-SYN-KUSUR-WRONGFRAC"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-005:q2": {"k":"e","e":"5/8*(180:(3/8))","der":["5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-005:q3": {"k":"yn","l":"3/8","r":"1/2","rel":">","yes":"نعم","no":"لا","der":["1","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-006:q1": {"k":"e","e":"3/7*(1-2/9)","sigs":[["3/7*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/7","rest":"1-2/9","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-006:q2": {"k":"e","e":"1-2/9-3/7*(1-2/9)","sigs":[["1-2/9-3/7*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/7","rest":"1-2/9","whole":"1","wrap":"1-2/9-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-006:q3": {"k":"e","e":"120:(4/9)","sigs":[["120*4/9","MISC-AMAL-NOFLIP"],["120:(1/3)","MISC-SYN-KUSUR-WRONGFRAC"]],"der":["4"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-007:q1": {"k":"e","e":"13/2:(5/4)","sigs":[["13/2*5/4","MISC-AMAL-NOFLIP"],["5/4:(13/2)","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-007:q2": {"k":"e","e":"13/2:(5/4)","fl":1,"sigs":[["6","MISC-SYN-KUSUR-ROUNDUP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-007:q3": {"k":"e","e":"13/2-5*5/4"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-008:q1": {"k":"e","e":"5/9*36"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-008:q2": {"k":"e","e":"3/4*(5/9*36)","sigs":[["3/4*(36)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/4","rest":"5/9*36","whole":"36","wrap":"#"}}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-008:q3": {"k":"e","e":"3/4*5/9","sigs":[["3/4*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/4","rest":"5/9","whole":"1","wrap":"#"}}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-009:q1": {"k":"e","e":"5/8*2/5"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-009:q2": {"k":"e","e":"1/4*48","der":["1","4"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-009:q3": {"k":"e","e":"15:(1/4)","sigs":[["15*1/4","MISC-AMAL-NOFLIP"]],"der":["1","4"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-010:q1": {"k":"e","e":"1/5+1/4-1/10","sigs":[["1/5+1/4","MISC-SYN-KUSUR-OVERLAP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-010:q2": {"k":"e","e":"1-(1/5+1/4-1/10)"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l2-010:q3": {"k":"e","e":"260:(13/20)","sigs":[["260*13/20","MISC-AMAL-NOFLIP"],["260:(7/20)","MISC-SYN-KUSUR-WRONGFRAC"]],"der":["13","20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-001:q1": {"k":"ext","dir":"max","items":[["الطماطم","3/10"],["الفلفل","4/15"],["الكوسة","7/30"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-001:q2": {"k":"self","facts":[["3/10","9/30"],["4/15","8/30"]],"der":["9","8"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-001:q3": {"k":"yn","l":"3/10+4/15+7/30","r":"1","rel":"=","yes":"نعم","no":"لا","der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-001:q4": {"k":"e","e":"1-3/10-4/15-7/30","sigs":[["3/10+4/15+7/30","MISC-JAMTARH-MAJMU-FARQ"]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-001:q5": {"k":"e","e":"1/5*1500","der":["1","5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-002:q1": {"k":"ext","dir":"max","items":[["اليوم الأوّل","3/8"],["اليوم الثاني","1/6"],["اليوم الثالث","5/16"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-002:q2": {"k":"yn","l":"3/8+1/6+5/16","r":"1","rel":"=","yes":"نعم","no":"لا"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-002:q3": {"k":"e","e":"3/8*960"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-002:q4": {"k":"e","e":"(3/8+1/6+5/16)*960"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-002:q5": {"k":"e","e":"(1-3/8-1/6-5/16)*960"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-003:q1": {"k":"e","e":"1-1/3-3/8","sigs":[["1-1/3","MISC-JAMTARH-JUZ-NAQIS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-003:q2": {"k":"e","e":"91:(7/24)","sigs":[["91*7/24","MISC-AMAL-NOFLIP"],["91:(1/3)","MISC-SYN-KUSUR-WRONGFRAC"]],"der":["7","24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-003:q3": {"k":"e","e":"1/3*(91:(7/24))","der":["7","24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-003:q4": {"k":"ext","dir":"max","items":[["الزيتون","1/3"],["التين","3/8"],["الرمّان","7/24"]],"labels":"text","der":["7","24"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-004:q1": {"k":"e","e":"3/8*(1-1/3)","sigs":[["3/8*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/8","rest":"1-1/3","whole":"1","wrap":"#"}}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-004:q2": {"k":"e","e":"1-1/3-3/8*(1-1/3)","sigs":[["1-1/3-3/8*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/8","rest":"1-1/3","whole":"1","wrap":"1-1/3-#"}}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-004:q3": {"k":"e","e":"5/12*54000","der":["5","12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-004:q4": {"k":"ext","dir":"max","items":[["الأوّل","1/3"],["الثاني","1/4"],["الثالث","5/12"]],"labels":"text","der":["4","5","12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-005:q1": {"k":"e","e":"3/5*(1-4/9)","sigs":[["3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-4/9","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-005:q2": {"k":"e","e":"1-4/9-3/5*(1-4/9)","sigs":[["1-4/9-3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-4/9","whole":"1","wrap":"1-4/9-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-005:q3": {"k":"e","e":"2/9*2700","der":["2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-005:q4": {"k":"yn","l":"1/3","r":"2/9","rel":">","yes":"نعم","no":"لا","der":["1","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-006:q1": {"k":"e","e":"3/5*(1-2/7)","sigs":[["3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-2/7","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-006:q2": {"k":"e","e":"1-2/7-3/7","sigs":[["1-2/7-3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-2/7","whole":"1","wrap":"1-2/7-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-006:q3": {"k":"e","e":"24:(2/7)","sigs":[["24*2/7","MISC-AMAL-NOFLIP"],["24:(3/7)","MISC-SYN-KUSUR-WRONGFRAC"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-006:q4": {"k":"e","e":"3/7*(24:(2/7))"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-007:q1": {"k":"e","e":"1/3+1/4+1/5","sigs":[["[1+1+1|3+4+5]","MISC-JAMTARH-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-007:q2": {"k":"yn","l":"1/3+1/4+1/5","r":"1","rel":"=","yes":"نعم","no":"لا"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-007:q3": {"k":"e","e":"1-1/3-1/4-1/5","sigs":[["1/3+1/4+1/5","MISC-JAMTARH-MAJMU-FARQ"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-007:q4": {"k":"e","e":"13/60*120000","der":["13","60"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-008:q1": {"k":"ext","dir":"max","items":[["الأوّل","3/4"],["الثاني","7/9"],["الثالث","5/6"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-008:q2": {"k":"e","e":"5/6-3/4","sigs":[["3/4-5/6","MISC-JAMTARH-FARQ-MAQLUB"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-008:q3": {"k":"e","e":"1/12*1800","der":["1","12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-009:q1": {"k":"e","e":"2/3*(1-3/4)","sigs":[["2/3*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"2/3","rest":"1-3/4","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-009:q2": {"k":"e","e":"1-3/4-2/3*(1-3/4)","sigs":[["1-3/4-2/3*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"2/3","rest":"1-3/4","whole":"1","wrap":"1-3/4-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-009:q3": {"k":"e","e":"25:(1/12)","sigs":[["25*1/12","MISC-AMAL-NOFLIP"]],"der":["1","12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-009:q4": {"k":"e","e":"3/4*(25:(1/12))","der":["1","12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-010:q1": {"k":"e","e":"1-1/4-2/5","sigs":[["1-1/4","MISC-JAMTARH-JUZ-NAQIS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-010:q2": {"k":"e","e":"7:(7/20)","sigs":[["7*7/20","MISC-AMAL-NOFLIP"]],"der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-010:q3": {"k":"e","e":"2800000:(7/20)","sigs":[["2800000*7/20","MISC-AMAL-NOFLIP"]],"der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l3-010:q4": {"k":"e","e":"1/4*20","der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-001:q1": {"k":"e","e":"5/2*6/5","rect":["5/2","6/5"],"sigs":[["2*(5/2+6/5)","MISC-MASAHA-AREA-PERIM-CONFUSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-001:q2": {"k":"e","e":"1/2*1/3"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-001:q3": {"k":"e","e":"1-1/3-1/4-1/6","sigs":[["1/3+1/4+1/6","MISC-JAMTARH-MAJMU-FARQ"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-001:q4": {"k":"yn","l":"1/3+1/4+1/6","r":"1","rel":"=","yes":"نعم","no":"لا"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-001:q5": {"k":"e","e":"(1-1/3-1/4-1/6)*(5/2*6/5)"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-002:q1": {"k":"e","e":"9/4*5/3","rect":["9/4","5/3"],"sigs":[["2*(9/4+5/3)","MISC-MASAHA-AREA-PERIM-CONFUSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-002:q2": {"k":"e","e":"2*(9/4+5/3)","rect":["9/4","5/3"],"sigs":[["9/4*5/3","MISC-MASAHA-AREA-PERIM-CONFUSED"]],"der":["2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-002:q3": {"k":"e","e":"9/4:(5/3)","sigs":[["9/4*5/3","MISC-AMAL-NOFLIP"],["5/3:(9/4)","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-003:q1": {"k":"e","e":"1/2*7/4*6/5","sigs":[["7/4*6/5","MISC-SYN-KUSUR-NOHALF"]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-003:q2": {"k":"e","e":"1/2*5/2*3/7","sigs":[["5/2*3/7","MISC-SYN-KUSUR-NOHALF"]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-003:q3": {"k":"ext","dir":"max","items":[["المثلث الأوّل","21/20"],["المثلث الثاني","15/28"]],"labels":"text","der":["21","20","15","28"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-003:q4": {"k":"e","e":"21/20-15/28","sigs":[["15/28-21/20","MISC-JAMTARH-FARQ-MAQLUB"]],"der":["21","20","15","28"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-004:q1": {"k":"e","e":"3*9/4"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-004:q2": {"k":"e","e":"3/20*3/20"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-004:q3": {"k":"e","e":"(3*9/4):(3/20*3/20)","sigs":[["3*9/4*3/20*3/20","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-005:q1": {"k":"e","e":"2/5*15/2"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-005:q2": {"k":"e","e":"1/3*(15/2-2/5*15/2)","sigs":[["1/3*(15/2)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"1/3","rest":"15/2-2/5*15/2","whole":"15/2","wrap":"#"}}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-005:q3": {"k":"e","e":"15/2-3-3/2"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-005:q4": {"k":"yn","l":"3","r":"15/2-3-3/2","rel":"=","yes":"نعم","no":"لا"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-006:q1": {"k":"e","e":"-3/2+9/4","sigs":[["-3/4","MISC-AMAL-SUMSIGN"],["-(3/2+9/4)","MISC-AMAL-ADDDIST"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-006:q2": {"k":"e","e":"3/4-7/2","sigs":[["11/4","MISC-AMAL-SUMSIGN"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-006:q3": {"k":"e","e":"3/4-(-11/4)","sigs":[["3/4-11/4","MISC-QISMA-SUBNEG"]],"der":["11"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-006:q4": {"k":"yn","l":"-11/4","r":"-3/2","rel":"<","yes":"نعم","no":"لا","der":["11"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-007:q1": {"k":"e","e":"-3/4*8","sigs":[["3/4*8","MISC-AMAL-PRODSIGN"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-007:q2": {"k":"e","e":"-6+5/4*2","sigs":[["(-6+5/4)*2","MISC-AMAL-PRIORITY"]],"der":["6","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-007:q3": {"k":"e","e":"(0-(-7/2)):(5/4)","sigs":[["5/4:(7/2)","MISC-MAQLUB-REVERSED"],["(-7/2):(5/4)","MISC-AMAL-PRODSIGN"]],"der":["7","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-008:q1": {"k":"e","e":"-3/4-3*1/6"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-008:q2": {"k":"e","e":"-5/4+11/8","sigs":[["-1/8","MISC-AMAL-SUMSIGN"]],"der":["5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-008:q3": {"k":"yn","l":"1/8","r":"0","rel":">","yes":"نعم","no":"لا"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-009:q1": {"k":"e","e":"5/6+7/4","sigs":[["[5+7|6+4]","MISC-JAMTARH-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-009:q2": {"k":"e","e":"1/2*(5/6+7/4)*4/3","sigs":[["(5/6+7/4)*4/3","MISC-SYN-KUSUR-NOHALF"]],"der":["1","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-009:q3": {"k":"e","e":"1/2*5/6*4/3","sigs":[["5/6*4/3","MISC-SYN-KUSUR-NOHALF"]],"der":["1","2"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-010:q1": {"k":"pick","key":"13/2","show":"x","opts":[["16-3/4*16+5/2",null],["3/4*16+5/2","MISC-JAMTARH-KULL-JUZ",{"from":"16-","to":""}],["16-3/4+5/2","MISC-SYN-KUSUR-FRACASQTY",{"from":"3/4*16","to":"3/4"}]],"der":["13"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-010:q2": {"k":"e","e":"16-3/4*16+5/2","sigs":[["(16-3/4)*16+5/2","MISC-AMAL-PRIORITY"],["3/4*16+5/2","MISC-JAMTARH-KULL-JUZ",{"from":"16-","to":""}]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l4-010:q3": {"k":"self","facts":[["2/3*12+5/6","53/6"]],"der":["53"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q1": {"k":"e","e":"2/3*3/10"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q2": {"k":"e","e":"2*(2/3*3/10)"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q3": {"k":"ext","dir":"min","items":[["سمير","3/10"],["كريم","1/5"],["ياسر","2/5"]],"labels":"text","der":["1","5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q4": {"k":"e","e":"1-3/10-1/5-2/5","sigs":[["3/10+1/5+2/5","MISC-JAMTARH-MAJMU-FARQ"]],"der":["1","5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q5": {"k":"e","e":"1/10*2400000","der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q6": {"k":"e","e":"240000:3","der":["240000"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-001:q7": {"k":"ext","dir":"max","items":[["سمير","3/10*2400000+80000"],["كريم","1/5*2400000+80000"],["ياسر","2/5*2400000+80000"]],"labels":"text","der":["80000","1","5"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-002:q1": {"k":"ext","dir":"min","items":[["الأوّل","2/5"],["الثاني","1/6"],["الثالث","2*1/6"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-002:q2": {"k":"e","e":"1-2/5-1/6-2*1/6","sigs":[["2/5+1/6+1/3","MISC-JAMTARH-MAJMU-FARQ"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-002:q3": {"k":"e","e":"1/10*150000","der":["10"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-002:q4": {"k":"e","e":"1/3*150000+15000","der":["3","15000"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-002:q5": {"k":"yn","l":"65000","r":"2/5*150000","rel":">","yes":"نعم","no":"لا","der":["65000"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q1": {"k":"e","e":"900:(5/4)","sigs":[["900*5/4","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q2": {"k":"e","e":"875:(7/6)","sigs":[["875*7/6","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q3": {"k":"ext","dir":"min","items":[["المحلّ الأوّل","720"],["المحلّ الثاني","750"]],"labels":"text","der":["720","750"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q4": {"k":"e","e":"15/2*720","der":["720"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q5": {"k":"e","e":"15/2*750","der":["750"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-003:q6": {"k":"yn","l":"5625","r":"5500","rel":"<","yes":"نعم","no":"لا","der":["5625"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q1": {"k":"e","e":"5/8*480"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q2": {"k":"e","e":"1/5*300","sigs":[["1/5*(480)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"1/5","rest":"300","whole":"480","wrap":"#"}}]],"der":["300"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q3": {"k":"e","e":"3/8*(300-60)","sigs":[["3/8*(300)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/8","rest":"300-60","whole":"300","wrap":"#"}}]],"der":["300","60"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q4": {"k":"e","e":"300-60-90","der":["300","60","90"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q5": {"k":"yn","l":"100","r":"150","rel":"<","yes":"نعم","no":"لا","der":["150"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-004:q6": {"k":"e","e":"(150-100):480","sigs":[["50:150","MISC-SYN-KUSUR-DIFFWHOLES"]],"der":["150"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-005:q1": {"k":"e","e":"3/10+1/4+2/5","sigs":[["[3+1+2|10+4+5]","MISC-JAMTARH-ACROSS"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-005:q2": {"k":"e","e":"1-3/10-1/4-2/5","sigs":[["3/10+1/4+2/5","MISC-JAMTARH-MAJMU-FARQ"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-005:q3": {"k":"e","e":"1/20*120000","der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-005:q4": {"k":"e","e":"2/5*120000:32"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-005:q5": {"k":"ext","dir":"max","items":[["القسم الأوّل","3/10*120000:30"],["القسم الثاني","1/4*120000:25"],["القسم الثالث","2/5*120000:32"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q1": {"k":"e","e":"3/5*(1-2/7)","sigs":[["3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-2/7","whole":"1","wrap":"#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q2": {"k":"e","e":"1-2/7-3/7","sigs":[["1-2/7-3/5*(1)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"1-2/7","whole":"1","wrap":"1-2/7-#"}}]],"der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q3": {"k":"e","e":"3/7*84000"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q4": {"k":"yn","l":"2/7","r":"1-2/7-3/7","rel":"=","yes":"نعم","no":"لا","der":["1"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q5": {"k":"ext","dir":"max","items":[["الأوّل","2/7"],["الثاني","3/7"],["الثالث","2/7"]],"labels":"text"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-006:q6": {"k":"e","e":"3/7*84000-2/7*84000"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q1": {"k":"e","e":"3/8*1200"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q2": {"k":"e","e":"1/4*1200"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q3": {"k":"e","e":"1200-450-300","der":["450","300"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q4": {"k":"e","e":"2/5*450","sigs":[["2/5*(1200)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"2/5","rest":"450","whole":"1200","wrap":"#"}}]],"der":["450"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q5": {"k":"e","e":"450-180","der":["450","180"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-007:q6": {"k":"yn","l":"270","r":"250","rel":"<","yes":"نعم","no":"لا","der":["270"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q1": {"k":"e","e":"5/2:(15/4)","sigs":[["5/2*15/4","MISC-AMAL-NOFLIP"],["15/4:(5/2)","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q2": {"k":"e","e":"9/4:(7/2)","sigs":[["9/4*7/2","MISC-AMAL-NOFLIP"],["7/2:(9/4)","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q3": {"k":"ext","dir":"min","items":[["المسار الأوّل","2/3"],["المسار الثاني","9/14"]],"labels":"text","der":["3","14"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q4": {"k":"e","e":"2/3-9/14","sigs":[["9/14-2/3","MISC-JAMTARH-FARQ-MAQLUB"]],"der":["3","14"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q5": {"k":"e","e":"1/42*60","der":["1","42","60"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-008:q6": {"k":"yn","l":"9/14","r":"2/3","rel":"<","yes":"نعم","no":"لا","der":["14","3"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-009:q1": {"k":"e","e":"1/3*18000"},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-009:q2": {"k":"e","e":"3/5*(18000-6000)","sigs":[["3/5*(18000)","MISC-SYN-KUSUR-WHOLE",{"wh":{"f":"3/5","rest":"18000-6000","whole":"18000","wrap":"#"}}]],"der":["6000"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-009:q3": {"k":"e","e":"18000-6000-7200","der":["6000","7200"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-009:q4": {"k":"e","e":"-4500+4800","sigs":[["-(4500+4800)","MISC-AMAL-ADDDIST"],["-300","MISC-AMAL-SUMSIGN"]],"der":["4800"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-009:q5": {"k":"yn","l":"300","r":"0","rel":">","yes":"نعم","no":"لا","der":["300","0"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-010:q1": {"k":"e","e":"45:(15/4)","sigs":[["45*15/4","MISC-AMAL-NOFLIP"],["15/4:45","MISC-MAQLUB-REVERSED"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-010:q2": {"k":"e","e":"12*30","der":["12"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-010:q3": {"k":"e","e":"45:(9/4)","sigs":[["45*9/4","MISC-AMAL-NOFLIP"]]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-010:q4": {"k":"e","e":"20*16","der":["20"]},
  "ex-3am-wadiya-idmajiya-kusur-natiqa-l5-010:q5": {"k":"ext","dir":"max","items":[["الوصفة الأولى","12*30"],["الوصفة الثانية","20*16"]],"labels":"text","der":["12","20"]},
};

/* ── réponses attendues ────────────────────────────────────────────────────── */
const letterOfOption = (qq, k) => qq.choices[k].id;
function oracleOf(key, sp) {
  const [exId, qId] = key.split(':'); const ex = BANK.get(exId);
  if (!ex) throw new Error(`oracle kusur : feuille ${exId} introuvable`);
  const qq = ex.questions.find((x) => x.id === qId); if (!qq) throw new Error(`oracle kusur : ${key} introuvable`);
  switch (sp.k) {
    case 'e': return R(keyVal(sp).toString());
    case 'recip': return R(recipQ(E(sp.x)).toString());
    case 'pick': {
      const kv = E(sp.key);
      return C(letterOfOption(qq, pickOne(qq.choices.map((c) => same(TEX(islands(c.content)[0]), kv)), key)));
    }
    case 'ext': {
      const best = argext(sp.items, sp.dir); const [label, x] = sp.items[best];
      const idx = qq.choices.findIndex((c) => (sp.labels === 'tex' ? same(TEX(islands(c.content)[0]), E(x)) : c.content === label));
      if (idx < 0) throw new Error(`${key} : l'option juste (${label}) est absente`);
      return C(letterOfOption(qq, idx));
    }
    case 'yn': {
      const truth = relOf(E(sp.l), E(sp.r)) === sp.rel;
      return C(letterOfOption(qq, pickOne(qq.choices.map((c) => c.content === (truth ? sp.yes : sp.no)), key)));
    }
    case 'self': return undefined;
    default: throw new Error(`oracle kusur : kind « ${sp.k} » inconnu (${key})`);
  }
}
export const ORACLE = {};
for (const [key, sp] of Object.entries(SPEC)) { const v = oracleOf(key, sp); if (v !== undefined) ORACLE[key] = v; }

/* ── audit ─────────────────────────────────────────────────────────────────── */
const MISC = /^MISC-(AMAL-(NOFLIP|FLIPFIRST|PRODSIGN|RECIPSIGN|SUMSIGN|ADDDIST|ACROSS|PRIORITY)|MAQLUB-(REVERSED|OPPOSITE|NUMONLY)|JAMTARH-(ACROSS|FARQ-MAQLUB|JUZ-NAQIS|MAJMU-FARQ|INTEGER|KULL-JUZ)|QISMA-SUBNEG|NATIQ-(DROPSIGN|INVERT|TWONEG|NEGORDER)|TASAWI-(NUMERATORS|DENOMS|EYE)|MASAHA-AREA-PERIM-CONFUSED|SYN-KUSUR-(WHOLE|WRONGFRAC|OVERLAP|ROUNDUP|NOHALF|FRACASQTY|DIFFWHOLES))$/;

/** Ce que l'erreur `id` produit sur la question `sp` (clé `kv`), comparé à la valeur `sv` : null si conforme, sinon un message. */
function semantic(id, sp, kv, sv, extra) {
  const e = sp.e;
  const top = (op) => { const { parts } = splitTop(e, op); return parts; };
  switch (id) {
    case 'MISC-AMAL-NOFLIP': return same(E(e.replace(/:/g, '*')), sv) ? null : 'n\'est pas « ÷ lu comme × »';
    case 'MISC-AMAL-FLIPFIRST': { const [a, b] = top(':'); return same(recipQ(E(a)).mul(E(b)), sv) ? null : 'n\'est pas « on retourne le dividende »'; }
    case 'MISC-MAQLUB-REVERSED': { const [a, b] = top(':'); return same(E(b).div(E(a)), sv) ? null : 'n\'est pas « diviseur ÷ dividende »'; }
    case 'MISC-AMAL-PRODSIGN': case 'MISC-AMAL-SUMSIGN': case 'MISC-AMAL-RECIPSIGN': case 'MISC-NATIQ-TWONEG':
      return same(kv.neg(), sv) ? null : 'n\'est pas l\'opposé de la clé';
    case 'MISC-AMAL-ADDDIST': return same(terms(e).map((t) => absQ(E(t.t))).reduce((a, b) => a.add(b)).neg(), sv) ? null : 'n\'est pas −(somme des valeurs absolues)';
    case 'MISC-AMAL-ACROSS': case 'MISC-JAMTARH-ACROSS': {
      let nn = E('0'); let dd = E('0');
      for (const t of terms(e)) { const m = /^(-?)(\d+)\/(\d+)$/.exec(t.t); if (!m) return 'terme non fractionnaire'; const sg = (t.s === '-') !== (m[1] === '-') ? -1 : 1; nn = nn.add(E(`${sg * Number(m[2])}`)); dd = dd.add(E(m[3])); }
      return same(nn.div(dd), sv) ? null : 'n\'est pas (Σ numérateurs) / (Σ dénominateurs)';
    }
    case 'MISC-AMAL-PRIORITY': return same(flatEval(e), sv) ? null : 'n\'est pas l\'évaluation de gauche à droite';
    case 'MISC-QISMA-SUBNEG': { const r = e.replace(/-\(-([^()]*)\)/g, '-$1'); return r !== e && same(E(r), sv) ? null : 'n\'est pas « − (−x) lu − x »'; }
    case 'MISC-NATIQ-DROPSIGN': { const r = e.replace(/\{(-?\d+)\/-(\d+)\}/g, '{$1/$2}'); return r !== e && same(E(r), sv) ? null : 'n\'est pas « signe du dénominateur oublié »'; }
    case 'MISC-NATIQ-INVERT': { const m = /^\{(-?\d+)\/(-?\d+)\}$/.exec(e); return m && same(E(`{${m[2]}/${m[1]}}`), sv) ? null : 'n\'est pas « fraction retournée »'; }
    case 'MISC-MAQLUB-OPPOSITE': return same(E(sp.x).neg(), sv) ? null : 'n\'est pas l\'opposé du nombre';
    case 'MISC-MAQLUB-NUMONLY': return same(E(`1/${absQ(E(sp.x)).n}`), sv) ? null : 'n\'est pas 1 sur le numérateur';
    case 'MISC-JAMTARH-FARQ-MAQLUB': { const t = terms(e); return t.length === 2 && t[1].s === '-' && same(E(t[1].t).sub(E(t[0].t)), sv) ? null : 'n\'est pas la différence à l\'envers'; }
    case 'MISC-JAMTARH-JUZ-NAQIS': { const t = terms(e); const ok = t.slice(1).some((_, k) => same(t.filter((__, j) => j !== k + 1).map(termVal).reduce((a, b) => a.add(b)), sv)); return ok ? null : 'n\'est pas « un terme oublié »'; }
    case 'MISC-JAMTARH-MAJMU-FARQ': return same(sv.add(kv), E('1')) ? null : 'sv + clé ≠ 1 (n\'est pas « la somme au lieu du reste »)';
    case 'MISC-JAMTARH-INTEGER': {
      const t = terms(e); const m = /^(\d+)\/(\d+)$/.exec(t[1]?.t ?? ''); if (!m || t[1].s !== '-' || E(t[0].t).d !== 1n) return 'forme n − a/b attendue';
      let v = E(String(E(t[0].t).n - BigInt(m[1]))).div(E(m[2])); for (const x of t.slice(2)) v = v.add(termVal(x));
      return same(v, sv) ? null : 'n\'est pas (n − a)/b';
    }
    case 'MISC-SYN-KUSUR-WHOLE': {
      const w = extra?.wh; if (!w) return 'gabarit `wh` manquant';
      if (!same(E(w.wrap.replace('#', `${w.f}*(${w.rest})`)), kv)) return 'la clé n\'est pas f × Reste dans le gabarit';
      if (!(cmp(E(w.rest), E(w.whole)) < 0)) return 'le Reste doit être plus petit que le Tout';
      return same(E(w.wrap.replace('#', `${w.f}*(${w.whole})`)), sv) ? null : 'n\'est pas f × Tout dans le gabarit';
    }
    case 'MISC-SYN-KUSUR-WRONGFRAC': case 'MISC-SYN-KUSUR-DIFFWHOLES': {
      const [a, b] = top(':'); const { parts } = splitTop(extra?.sig ?? '', ':');
      if (!extra?.sig || parts.length !== 2) return 'sig attendue « a:b »';
      return same(E(a), E(parts[0])) && !same(E(b), E(parts[1])) && same(E(parts[0]).div(E(parts[1])), sv) ? null : 'même numérateur, autre dénominateur attendu';
    }
    case 'MISC-SYN-KUSUR-OVERLAP': { const t = terms(e); const l = t[t.length - 1]; return l.s === '-' && same(kv.add(E(l.t)), sv) ? null : 'n\'est pas « clé + terme commun »'; }
    case 'MISC-SYN-KUSUR-ROUNDUP': return sp.fl && same(floorQ(E(e)).add(E('1')), sv) ? null : 'n\'est pas « partie entière + 1 »';
    case 'MISC-SYN-KUSUR-NOHALF': return same(kv.mul(E('2')), sv) ? null : 'n\'est pas 2 × clé';
    case 'MISC-MASAHA-AREA-PERIM-CONFUSED': {
      if (!sp.rect) return 'rect manquant'; const [a, b] = sp.rect.map(E); const area = a.mul(b); const per = E('2').mul(a.add(b));
      return (same(kv, area) && same(sv, per)) || (same(kv, per) && same(sv, area)) ? null : 'n\'est pas l\'autre de (aire, périmètre)';
    }
    case 'MISC-JAMTARH-KULL-JUZ': return extra?.from !== undefined && same(E(e.replace(extra.from, extra.to)), sv) ? null : 'n\'est pas la réécriture littérale annoncée';
    default: return `étiquette ${id} sans règle`;
  }
}

export function audit(bank) {
  const problems = [];
  for (const { key } of bank) {
    const [exId, qId] = key.split(':'); const ex = BANK.get(exId); const qq = ex?.questions.find((x) => x.id === qId);
    if (!qq) { problems.push(`${key} : introuvable dans le banc de l'oracle`); continue; }
    const sp = SPEC[key]; if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    try {
      const corpus = corpusOf(ex); const der = new Set(sp.der ?? []);
      const exprs = [];
      if (sp.k === 'e' || sp.k === 'recip') { exprs.push(sp.e); if (sp.x) exprs.push(sp.x); }
      if (sp.k === 'pick') { exprs.push(sp.key); sp.opts.forEach((o) => exprs.push(o[0])); }
      if (sp.k === 'ext') sp.items.forEach((i) => exprs.push(i[1]));
      if (sp.k === 'yn') exprs.push(sp.l, sp.r);
      if (sp.k === 'self') sp.facts.forEach((f) => exprs.push(f[0], f[1]));
      for (const n of new Set(exprs.flatMap(litsOf))) if (!corpus.has(n) && !der.has(n)) problems.push(`${key} : le nombre ${n} de l'expression retapée n'est ni dans la feuille ni déclaré dérivé`);

      if (sp.k === 'e' || sp.k === 'recip') {
        const kv = sp.k === 'recip' ? recipQ(E(sp.x)) : keyVal(sp);
        if (sp.k === 'recip' && !same(E(sp.e), kv)) problems.push(`${key} : e ≠ 1/x`);
        if (qq.answerType !== 'rational') problems.push(`${key} : answerType ${qq.answerType}`);
        const e = String(qq.expectedAnswer);
        if (!/^-?\d+$|^-?\d+\/\d+$/.test(e)) problems.push(`${key} : clé illisible ou non réduite « ${e} »`);
        else if (!same(E(e), kv) || e !== kv.toString()) problems.push(`${key} : la clé « ${e} » ≠ ${kv} recalculé`);
        if (kv.d !== 1n && qq.evaluationPolicy?.requiredForm !== 'irreducible') problems.push(`${key} : fraction sans requiredForm irreducible`);
        if (sp.of) { const f = TEX(formulaOf(ex, sp.of)); const target = sp.k === 'recip' ? E(sp.x) : kv; if (!same(f, target)) problems.push(`${key} : la formule ${sp.of} de la feuille vaut ${f}, la chaîne retapée ${target}`); }
        const m = /^احسب \$([^$]+)\$/.exec(qq.statement); if (m && !/[A-Za-z]/.test(m[1]) && !same(TEX(m[1]), kv)) problems.push(`${key} : « احسب $${m[1]}$ » vaut ${TEX(m[1])}, la clé ${kv}`);
        const given = qq.misconceptionSignatures ?? [];
        const specSigs = sp.sigs ?? [];
        if (given.length !== specSigs.length) problems.push(`${key} : ${given.length} signatures dans le contenu, ${specSigs.length} dans la spec`);
        for (const [sx, id, extra] of specSigs) {
          if (!MISC.test(id)) { problems.push(`${key} : étiquette ${id} hors du jeu autorisé`); continue; }
          const sv = E(sx);
          if (same(sv, kv)) problems.push(`${key} : la signature ${id} vaut la bonne réponse`);
          const g = given.find((s) => s.id === id && same(E(s.value), sv));
          if (!g) problems.push(`${key} : la signature ${id} (${sv}) est absente du contenu`);
          const msg = semantic(id, sp, kv, sv, { ...(extra ?? {}), sig: sx });
          if (msg) problems.push(`${key} : ${id} (${sv}) ${msg}`);
          if (extra?.from !== undefined && id !== 'MISC-JAMTARH-KULL-JUZ' && !same(E(sp.e.replace(extra.from, extra.to)), sv)) problems.push(`${key} : réécriture ${id} incohérente`);
        }
      } else if (sp.k === 'pick') {
        const kv = E(sp.key);
        if (qq.answerType !== 'choice') problems.push(`${key} : answerType ${qq.answerType}`);
        const good = sp.opts.filter((o) => same(E(o[0]), kv));
        if (good.length !== 1) problems.push(`${key} : ${good.length} options justes dans la spec`);
        for (const c of qq.choices) {
          const v = TEX(islands(c.content)[0]);
          const so = sp.opts.filter((o) => same(E(o[0]), v));
          if (so.length !== 1) { problems.push(`${key} : l'option ${c.id} ne correspond pas à exactement une expression retapée`); continue; }
          const [, id, extra] = so[0];
          if (same(v, kv) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est marquée ${c.isCorrect} mais vaut ${v} (clé ${kv})`);
          if (c.isCorrect) { if (c.misconceptionId) problems.push(`${key} : le choix juste porte une étiquette`); continue; }
          if (!id || c.misconceptionId !== id) problems.push(`${key} : l'option ${c.id} devrait porter ${id}`);
          else if (!MISC.test(id)) problems.push(`${key} : étiquette ${id} hors du jeu autorisé`);
          else if (extra?.from !== undefined) { const base = good[0][0]; if (!same(E(base.replace(extra.from, extra.to)), v)) problems.push(`${key} : ${id} n'est pas la réécriture littérale de ${base}`); }
        }
      } else if (sp.k === 'ext') {
        const best = argext(sp.items, sp.dir); const tr = traps(sp.items, sp.dir);
        const eyeOk = (i) => (tr[i].length ? tr[i] : ['MISC-TASAWI-EYE']);
        for (const c of qq.choices) {
          const i = sp.labels === 'tex' ? sp.items.findIndex(([, x]) => same(TEX(islands(c.content)[0]), E(x))) : sp.items.findIndex(([l]) => l === c.content);
          if (i < 0) { problems.push(`${key} : l'option ${c.id} n'est pas dans la spec`); continue; }
          if ((i === best) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est mal marquée`);
          if (i === best) continue;
          if (!eyeOk(i).includes(c.misconceptionId)) problems.push(`${key} : l'option ${c.id} porte ${c.misconceptionId}, attendu ${eyeOk(i).join(' ou ')}`);
        }
      } else if (sp.k === 'yn') {
        const truth = relOf(E(sp.l), E(sp.r)) === sp.rel;
        for (const c of qq.choices) {
          const isYes = c.content === sp.yes; if (!isYes && c.content !== sp.no) { problems.push(`${key} : option inconnue « ${c.content} »`); continue; }
          if ((isYes === truth) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est mal marquée`);
          if (c.isCorrect || !c.misconceptionId) continue;
          const id = c.misconceptionId; const ml = lit(sp.l); const mr = lit(sp.r);
          const studentYes = (r) => r === sp.rel; // l'élève qui juge par cette relation répond « oui » si elle vaut la relation demandée
          const sgn = (x, y) => (x < y ? '<' : x > y ? '>' : '=');
          let ok = false;
          if (id === 'MISC-TASAWI-NUMERATORS' && ml && mr) ok = studentYes(sgn(ml[0], mr[0])) === isYes;
          else if (id === 'MISC-TASAWI-DENOMS' && ml && mr) ok = studentYes(sgn(ml[1], mr[1])) === isYes;
          else if (id === 'MISC-NATIQ-NEGORDER') ok = E(sp.l).lt(ZERO) && E(sp.r).lt(ZERO) && studentYes(relOf(absQ(E(sp.l)), absQ(E(sp.r)))) === isYes;
          if (!ok) problems.push(`${key} : l'option « ${c.content} » ne produit pas l'erreur ${id}`);
        }
      } else if (sp.k === 'self') {
        for (const [l, r] of sp.facts) if (!same(E(l), E(r))) problems.push(`${key} : fait faux dans le corrigé : ${l} ≠ ${r}`);
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}

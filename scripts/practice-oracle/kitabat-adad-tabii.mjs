// Oracle du banc « kitabat-adad-tabii » (كتابة الأعداد الطبيعية ودلالة الأرقام, 1AM, 2026-10-14) — feuilles d'examen de
// فصل (« على منوال اختبار الفصل الأول »). Chaque clé est RECALCULÉE ICI à partir des nombres de l'énoncé, avec un code
// entier / chaîne écrit dans ce fichier — jamais en important packages/core/arithmetic/placeValue.js (deux implémentations
// indépendantes se contrôlent l'une l'autre) et jamais en lisant `expectedAnswer`. Fusionné dans
// scripts/practice-answer-oracle.test.mjs.
//
// L'ÉPELEUR `spell(n)` est le nôtre (convention de la plateforme : extraction.json › discrepancies « words » — ة pour 3–9,
// « مائة / ثمانمائة », ألف / ألفان / آلاف / ألفا, « مائتا ألف », ملايين / ملايير, classes jointes par « و »). Au chargement,
// il est confronté à TOUTES les réponses `words` de docs/sources/1am/unit1/extraction.json (ex-3, know-1, deep-1, deep-2,
// act-1, prep 4, self-1), et nos outils de rang aux réponses chiffrées (ex-1, ex-2, ex-12 ①, act-1, deep-3) : un écart fait
// échouer l'import, donc le test.
//
// Outils : `digitOf` (le chiffre d'un rang, sur la chaîne écrite, des deux côtés de la virgule), `countOf` (« عدد » d'un rang :
// Math.floor(n / 10**k)), `rankName` / `rankKey` (le nom du rang d'un chiffre), `spelt` (le nombre dont l'énoncé donne
// l'écriture en lettres), `wordsKey` (la seule lecture juste), `spacedKey` (classes de trois depuis la DROITE), `decompKey`
// (le seul مفكوك canonique de valeur n), `evalExpr` (valeur d'un مفكوك en désordre), `blank` (la valeur de rang manquante),
// `maxPerm` / `minPerm` (cartes, jamais de 0 en tête), `nextOf` / `prevOf`, `comma` (placer la virgule pour qu'un chiffre
// prenne un rang), `fromRanks` (un nombre donné rang par rang), `valueOfDigit`, `counts` (une réserve non écrite : 1 · 13 ·
// 24 · 37 → 2577), `fewestPieces` / `notesNeeded` (billets), et, pour les étapes `counted: false` d'une autre leçon du
// même فصل : `fraction`, `sumFractions`, `product`, `tenthsCount`, `checkDecomp`, `exprKey`, `orderKey`, `largerKey`,
// `shiftRule`. Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

/* ── L'épeleur (indépendant de placeValue.js › toArabicWords) ── */
const UNIT = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const DECADE = { 2: 'عشرون', 3: 'ثلاثون', 4: 'أربعون', 5: 'خمسون', 6: 'ستون', 7: 'سبعون', 8: 'ثمانون', 9: 'تسعون' };
const NOUNS = [ // [مفرد, مثنى, جمع (3–10), تمييز منصوب (11–99)]
  null,
  ['ألف', 'ألفان', 'آلاف', 'ألفا'],
  ['مليون', 'مليونان', 'ملايين', 'مليونا'],
  ['مليار', 'ملياران', 'ملايير', 'مليارا'],
];
function twoDigits(n) {
  if (n === 0) return '';
  if (n === 10) return 'عشرة';
  if (n === 11) return 'أحد عشر';
  if (n === 12) return 'اثنا عشر';
  if (n < 10) return UNIT[n];
  if (n < 20) return `${UNIT[n % 10]} عشر`;
  const u = n % 10, t = (n - u) / 10;
  return u === 0 ? DECADE[t] : `${UNIT[u]} و${DECADE[t]}`;
}
function hundredWord(h, beforeNoun) {
  if (h === 1) return 'مائة';
  if (h === 2) return beforeNoun ? 'مائتا' : 'مائتان';
  const stem = h === 8 ? 'ثمان' : UNIT[h].slice(0, -1); // ثلاث، أربع، خمس، ست، سبع، تسع + مائة
  return `${stem}مائة`;
}
function threeDigits(n, beforeNoun = false) {
  const h = Math.floor(n / 100), rest = n % 100;
  const words = [];
  if (h > 0) words.push(hundredWord(h, beforeNoun && rest === 0));
  if (rest > 0) words.push(twoDigits(rest));
  return words.join(' و');
}
function counted(c, scale) {
  const [one, two, few, many] = NOUNS[scale];
  if (c === 1) return one;
  if (c === 2) return two;
  const tail = c % 100;
  const noun = c < 100 ? (c <= 10 ? few : many) : (tail <= 2 ? one : tail <= 10 ? few : many);
  return `${threeDigits(c, c >= 100)} ${noun}`;
}
export function spell(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n >= 1e12) throw new Error(`spell: ${n} hors domaine`);
  if (n === 0) return 'صفر';
  const digits = String(n).padStart(12, '0'); // 4 classes : ملايير | ملايين | آلاف | وحدات
  const parts = [];
  for (let c = 0; c < 4; c++) {
    const v = Number(digits.slice(3 * c, 3 * c + 3));
    if (v === 0) continue;
    const scale = 3 - c;
    parts.push(scale === 0 ? threeDigits(v) : counted(v, scale));
  }
  return parts.join(' و');
}

/* ── Rangs, sur la chaîne écrite ── */
const RANKS = new Map([
  [9, 'الملايير'], [8, 'مئات الملايين'], [7, 'عشرات الملايين'], [6, 'الملايين'], [5, 'مئات الآلاف'], [4, 'عشرات الآلاف'],
  [3, 'الآلاف'], [2, 'المئات'], [1, 'العشرات'], [0, 'الآحاد'], [-1, 'الأعشار'], [-2, 'الأجزاء من مائة'], [-3, 'الأجزاء من ألف'],
]);
const split = (s) => { const [ip, dp = ''] = String(s).replace('.', ',').split(','); return { ip, dp }; };
/** Le chiffre de rang k (k < 0 : après la virgule) dans l'écriture s. */
export function digitOf(s, k) {
  const { ip, dp } = split(s);
  const d = k >= 0 ? ip[ip.length - 1 - k] : dp[-k - 1];
  if (d === undefined) throw new Error(`digitOf ${s} ${k}`);
  return d;
}
/** « عدد » de rang k d'un entier : Math.floor(n / 10**k). */
export const countOf = (n, k) => Math.floor(n / 10 ** k);
/** Le rang du chiffre d (unique) dans l'écriture s. */
function rankOf(s, d) {
  const { ip, dp } = split(s);
  const hits = [];
  [...ip].forEach((c, i) => { if (c === String(d)) hits.push(ip.length - 1 - i); });
  [...dp].forEach((c, i) => { if (c === String(d)) hits.push(-(i + 1)); });
  if (hits.length !== 1) throw new Error(`rankOf ${s} ${d}: ${hits.length} positions`);
  return hits[0];
}
export const rankName = (s, d) => RANKS.get(rankOf(s, d));
const LETTERS = 'ABCD';
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
const indexWhere = (opts, pred) => opts.map((o, i) => (pred(o) ? i : -1)).filter((i) => i >= 0);
export const pick = (v, opts) => only(indexWhere(opts, (o) => String(o) === String(v)), `pick ${v}`);
const rankKey = (s, d, opts) => pick(rankName(s, d), opts);
const yn = (t) => C(t ? 'A' : 'B');

/* ── Lettres ↔ chiffres ── */
const spellOf = (n) => spell(n);
/** L'énoncé écrit `text` en lettres : la clé est n, à condition que n s'écrive exactement ainsi. */
function spelt(text, n) {
  if (spell(n) !== text) throw new Error(`spelt: « ${text} » n'est pas ${n} (« ${spell(n)} »)`);
  return R(n);
}
const wordsKey = (n, opts) => pick(spell(n), opts);
/** Classes de trois chiffres depuis la DROITE (regex, indépendante du découpage de l'auteur). */
const spaced = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const unTex = (o) => String(o).replace(/\$/g, '').replace(/\\,/g, ' ').trim();
const spacedKey = (n, opts) => only(indexWhere(opts, (o) => unTex(o) === spaced(n)), `spacedKey ${n}`);

/* ── مفكوك ── */
const isPow10 = (v) => /^10*$/.test(String(v));
/** Termes d'une écriture « a \times b + … » (parenthèses tolérées) : [[a, b], …] (b = 1 pour un terme seul). */
function terms(expr) {
  return unTex(expr).replace(/[()]/g, '').split('+').map((t) => {
    const f = t.split('\\times').map((x) => x.replace(/\s/g, ''));
    return f.length === 1 ? [Number(f[0]), 1] : [Number(f[0]), Number(f[1])];
  });
}
const evalExpr = (expr) => terms(expr).reduce((s, [a, b]) => s + a * b, 0);
/** Un مفكوك نموذجي : chiffres 1..9, chacun × une puissance de 10 distincte, de valeur n. */
function canonical(expr, n) {
  const ts = terms(expr);
  const ranks = ts.map(([, b]) => b);
  return ts.every(([a, b]) => Number.isInteger(a) && a >= 1 && a <= 9 && isPow10(b)) && new Set(ranks).size === ranks.length
    && ts.reduce((s, [a, b]) => s + a * b, 0) === n;
}
const decompKey = (n, opts) => only(indexWhere(opts, (o) => canonical(o, n)), `decompKey ${n}`);
/** La valeur de rang manquante « (d × …) » : 10**k, pourvu que le chiffre de rang k ne soit pas nul. */
function blank(n, k) {
  if (digitOf(String(n), k) === '0') throw new Error(`blank ${n} ${k}: rang vide`);
  return 10 ** k;
}

/* ── Cartes, successeur, virgule, rangs donnés ── */
function permutations(cs) {
  if (cs.length <= 1) return [cs.join('')];
  const out = [];
  cs.forEach((c, i) => { for (const p of permutations(cs.filter((_, j) => j !== i))) out.push(String(c) + p); });
  return out;
}
const writable = (cards, pred) => permutations(cards).filter((s) => s[0] !== '0' && (!pred || pred(s))).map(Number);
const maxPerm = (cards, pred) => Math.max(...writable(cards, pred));
const minPerm = (cards, pred) => Math.min(...writable(cards, pred));
const nextOf = (n) => n + 1;
const prevOf = (n) => n - 1;
/** La virgule placée dans `digits` pour que le chiffre `d` (unique) prenne le rang k. */
function comma(digits, d, k) {
  const s = String(digits);
  const i = s.indexOf(String(d));
  if (i < 0 || s.indexOf(String(d), i + 1) >= 0) throw new Error(`comma ${s} ${d}`);
  const decimals = s.length - 1 - i - k;
  if (decimals < 0 || decimals >= s.length) throw new Error(`comma ${s} ${d} ${k}: impossible`);
  const out = decimals === 0 ? s : `${s.slice(0, s.length - decimals)}.${s.slice(s.length - decimals)}`;
  if (rankOf(out, d) !== k) throw new Error(`comma ${out}`);
  return out;
}
/** Le nombre écrit rang par rang ({ rang: chiffre }), les rangs absents valant 0. */
function fromRanks(map) {
  const ks = Object.keys(map).map(Number);
  let int = '', dec = '';
  for (let k = Math.max(0, ...ks); k >= 0; k--) int += String(map[k] ?? 0);
  for (let k = -1; k >= Math.min(0, ...ks); k--) dec += String(map[k] ?? 0);
  int = int.replace(/^0+(?=\d)/, '');
  return dec ? `${int}.${dec}` : int;
}
const valueOfDigit = (s, d) => Number(d) * 10 ** rankOf(s, d);
/** Une réserve non écrite { rang: quantité } (quantités ≥ 10 permises). */
const counts = (map) => Object.entries(map).reduce((s, [k, c]) => s + c * 10 ** Number(k), 0);
/** Le moins de billets / pièces pour payer n exactement (rendu glouton sur 1000, 100, 10, 1). */
function fewestPieces(n, denoms) {
  let left = n, pieces = 0;
  for (const d of denoms) { pieces += Math.floor(left / d); left %= d; }
  if (left !== 0) throw new Error('fewestPieces');
  return pieces;
}
/** Le nombre minimal de billets de valeur d pour couvrir n. */
const notesNeeded = (n, d) => Math.floor((n + d - 1) / d);

/* ── Étapes d'une autre leçon du même فصل (counted: false), en décimaux EXACTS ── */
/** L'écriture décimale exacte d'un rationnel décimal (helpers.q). */
function toDecimal(v) {
  const r = q(v);
  const [n, d] = r.toString().split('/').map(BigInt);
  if (d === undefined) return String(n);
  for (let k = 1n; k <= 12n; k++) {
    const scaled = n * 10n ** k;
    if (scaled % d === 0n) {
      const digits = (scaled / d).toString().replace('-', '').padStart(Number(k) + 1, '0');
      return `${n < 0n ? '-' : ''}${digits.slice(0, -Number(k))}.${digits.slice(-Number(k))}`;
    }
  }
  throw new Error(`toDecimal ${v}: pas décimal`);
}
const fraction = (f) => toDecimal(f);
const sumFractions = (fs) => toDecimal(fs.reduce((s, f) => s.add(f), q(0)));
const product = (a, b) => toDecimal(q(a).mul(b));
/** « عدد الأعشار » d'un décimal : la partie entière de 10 × x. */
function tenthsCount(x) {
  const { ip, dp } = split(x);
  return Number(ip + (dp[0] ?? '0'));
}
/** Le facteur manquant de terms[idx] dans x = Σ a × v (valeurs exactes). */
function checkDecomp(x, ts, idx) {
  const others = ts.reduce((s, [a, v], i) => (i === idx ? s : s.add(q(a).mul(v))), q(0));
  return toDecimal(q(x).sub(others).div(ts[idx][0]));
}
/** Valeur exacte d'une option LaTeX « a \times b + \frac{c}{d} + … ». */
function exactValue(expr) {
  return unTex(expr).split('+').reduce((s, t) => {
    const fr = /\\frac\{(\d+)\}\{(\d+)\}/.exec(t);
    if (fr) return s.add(q(`${fr[1]}/${fr[2]}`));
    return s.add(t.split('\\times').reduce((p, x) => p.mul(x.trim()), q(1)));
  }, q(0));
}
const exprKey = (x, opts) => only(indexWhere(opts, (o) => exactValue(o).sub(x).isZero()), `exprKey ${x}`);
/** « a < b < c » : la seule option qui range les nombres donnés dans l'ordre croissant. */
function orderKey(nums, opts) {
  const want = [...nums].sort((a, b) => a - b).join(',');
  return only(indexWhere(opts, (o) => unTex(o).split('<').map((x) => Number(x.trim())).join(',') === want), 'orderKey');
}
const largerKey = (named, opts) => pick(Object.entries(named).sort((a, b) => b[1] - a[1])[0][0], opts);
/** « × 10^p déplace la virgule de p rangs vers la droite », vérifié sur des décimaux exacts. */
function shiftRule(factor, p) {
  const samples = ['3.75', '0.4', '12.06', '7.125', '250.5', '0.008'];
  return samples.every((x) => {
    const { ip, dp } = split(x);
    const moved = (ip + dp.padEnd(p, '0').slice(0, p)).replace(/^0+(?=\d)/, '');
    const rest = dp.slice(p);
    return q(product(x, factor)).sub(rest ? `${moved}.${rest}` : moved).toString() === '0';
  });
}

/* ── Auto-contrôle sur l'extraction du manuel (réponses `words` et chiffrées) ── */
{
  const here = dirname(fileURLToPath(import.meta.url));
  const ex = JSON.parse(readFileSync(join(here, '../../docs/sources/1am/unit1/extraction.json'), 'utf8'));
  const el = (id) => ex.elements.find((e) => e.id === id);
  const fail = (m) => { throw new Error(`oracle kitabat-adad-tabii — extraction : ${m}`); };
  const words = [];
  for (const a of el('ex-3').answer) { words.push([a.n, a.words]); if (spaced(a.n) !== a.spaced) fail(`spaced ${a.n}`); }
  for (const [n, a] of Object.entries(el('know-1').answer)) if (a.words) { words.push([Number(n), a.words]); if (spaced(Number(n)) !== a.spaced) fail(`spaced ${n}`); }
  const d2 = el('deep-2').answer;
  words.push([9999999999, d2['9999999999']], [10000000000, d2.next.words]);
  const planets = { 'نبتون': 4467070000, 'زحل': 1427000000, 'الأرض': 149600000 };
  for (const [p, w] of Object.entries(d2.words)) words.push([planets[p], w]);
  const a1 = el('act-1').answer;
  words.push([a1.next.digits, a1.next.words], [a1.previous.digits, a1.previous.words]);
  const prep4 = el('prep').items.find((i) => i.n === 4);
  words.push([20892, prep4.options[prep4.correct[0]]]);
  words.push([el('self-1').answer.a, el('self-1').answer.wordsCheck]);
  words.push([el('deep-1').answer.largest, el('deep-1').answer.largestWords]);
  for (const [n, w] of words) if (spell(n) !== w) fail(`spell(${n}) = « ${spell(n)} » ≠ « ${w} »`);
  if (words.length < 15) fail('trop peu de réponses words');
  // Réponses chiffrées : ex-1 (رقم / عدد de 2017), ex-2 (1345 DA en billets de 100), ex-12 ①, act-1, deep-3, self-1 b.
  const R1 = { 'الآحاد': 0, 'العشرات': 1, 'المئات': 2, 'الآلاف': 3 };
  for (const a of el('ex-1').answer) if (Number(digitOf('2017', R1[a.rank])) !== a.digit || countOf(2017, R1[a.rank]) !== a.count) fail(`ex-1 ${a.rank}`);
  if (countOf(1345, 2) !== el('ex-2').answer.notes || 1345 % 100 !== el('ex-2').answer.coinsKept) fail('ex-2');
  if (String(evalExpr('(5 \\times 1000) + (2 \\times 100) + (7 \\times 10) + 6')) !== el('ex-12').answer[0]) fail('ex-12');
  if (maxPerm([0, 1, 3, 8]) !== a1.largest || minPerm([0, 1, 3, 8]) !== a1.smallest) fail('act-1 ①');
  if (minPerm([9, 0, 7, 3]) !== el('deep-3').answer['1'] || maxPerm([9, 0, 7, 3]) !== el('deep-3').answer['2']) fail('deep-3');
  if (countOf(el('self-1').answer.a, 1) !== el('self-1').answer.b) fail('self-1');
  // Balayage : aucune lecture vide, sans double espace ni « و » final, et deux nombres distincts ne se lisent jamais pareil.
  const seen = new Map();
  for (let n = 0; n <= 100000; n++) {
    const w = spell(n);
    if (!w || /\s{2}|undefined|(^|\s)و(\s|$)|\sو?$/.test(w)) fail(`spell(${n}) = « ${w} »`);
    if (seen.has(w)) fail(`spell(${n}) = spell(${seen.get(w)})`);
    seen.set(w, n);
  }
}

const L = 'ex-1am-kitabat-adad-tabii';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  // l1-001 — رقم العشرات وعدد العشرات (textbook prep)
  [K(1, 1, 'q1')]: pick(digitOf('4083', 1), ["408","8","0"]),
  [K(1, 1, 'q2')]: pick(countOf(4083, 1), ["408","40","8"]),
  // l1-002 — على منوال اختبار الفصل الأول — أكتب بالأرقام (platform_addition)
  [K(1, 2, 'q1')]: spelt("خمسة وثلاثون ألفا وثمانية", 35008),
  [K(1, 2, 'q2')]: spelt("ستة آلاف وأربعمائة", 6400),
  [K(1, 2, 'q3')]: spelt("مليون وخمسون ألفا", 1050000),
  // l1-003 — تنسيق الكتابة والقراءة (textbook ex-3)
  [K(1, 3, 'q1')]: spacedKey(56419, ["$56\\,419$","$564\\,19$","$5\\,64\\,19$"]),
  [K(1, 3, 'q2')]: spacedKey(7382, ["$7\\,382$","$738\\,2$","$73\\,82$"]),
  [K(1, 3, 'q3')]: wordsKey(56419, ["خمسمائة وأربعة وستون ألفا وتسعة عشر","خمسة ستة أربعة واحد تسعة","خمسة آلاف وستمائة وواحد وأربعون","ستة وخمسون ألفا وأربعمائة وتسعة عشر"]),
  // l1-004 — على منوال اختبار الفصل الأول — مرتبة رقم (platform_addition)
  [K(1, 4, 'q1')]: rankKey("46205", 6, ["المئات","عشرات الآلاف","الآلاف"]),
  [K(1, 4, 'q2')]: rankKey("85,63", 3, ["الأعشار","الأجزاء من ألف","الأجزاء من مائة"]),
  [K(1, 4, 'q3')]: rankKey("4,95", 9, ["الأجزاء من مائة","العشرات","الأعشار"]),
  // l1-005 — من المفكوك إلى العدد (textbook ex-12)
  [K(1, 5, 'q1')]: R(evalExpr("(4 \\times 1000) + (9 \\times 100) + (3 \\times 10) + 8")),
  [K(1, 5, 'q2')]: R(evalExpr("(6 \\times 1000) + (5 \\times 10) + 2")),
  // l1-006 — على منوال اختبار الفصل الأول — أكمل المفكوك (platform_addition)
  [K(1, 6, 'q1')]: R(blank(7418, 3)),
  [K(1, 6, 'q2')]: R(blank(7418, 1)),
  // l1-007 — أكوّن أعدادا (textbook act-1)
  [K(1, 7, 'q1')]: R(maxPerm([0,2,5,9])),
  [K(1, 7, 'q2')]: R(minPerm([0,2,5,9])),
  // l1-008 — على منوال اختبار الفصل الأول — العدد الذي يلي والعدد الذي يسبق (platform_addition)
  [K(1, 8, 'q1')]: R(nextOf(4999)),
  [K(1, 8, 'q2')]: R(prevOf(7000)),
  [K(1, 8, 'q3')]: wordsKey(5000, ["خمسة آلاف","خمسمائة","خمسون ألفا"]),
  // l1-009 — ثلاثة آلاف وخمسة (textbook self-1)
  [K(1, 9, 'q1')]: spelt("أربعة آلاف وثمانية", 4008),
  [K(1, 9, 'q2')]: R(countOf(4008, 1)),
  // l1-010 — على منوال اختبار الفصل الأول — صحيح أم خطأ (platform_addition)
  [K(1, 10, 'q1')]: yn(digitOf('70482', 4) === '7'),
  [K(1, 10, 'q2')]: yn(digitOf('3609', 2) === '3'),
  [K(1, 10, 'q3')]: yn(digitOf('25,07', -1) === '7'),
  // l2-001 — رقم المرتبة وعدد وحداتها (textbook ex-1)
  [K(2, 1, 'q1')]: R(digitOf("4165", 1)),
  [K(2, 1, 'q2')]: R(countOf(4165, 1)),
  [K(2, 1, 'q3')]: R(countOf(4165, 2)),
  // l2-002 — حصّالة سلمى (textbook ex-2)
  [K(2, 2, 'q1')]: R(countOf(2375, 2)),
  [K(2, 2, 'q2')]: R(2375 % 100),
  // l2-003 — دلالة الرقم 8 (textbook act-1)
  [K(2, 3, 'q1')]: R(valueOfDigit('418', 8)),
  [K(2, 3, 'q2')]: R(valueOfDigit('841', 8)),
  // l2-004 — على منوال اختبار الفصل الأول — المراتب الفارغة (platform_addition)
  [K(2, 4, 'q1')]: spelt("تسعة آلاف وأربعون", 9040),
  [K(2, 4, 'q2')]: spelt("ستون ألفا وخمسمائة", 60500),
  // l2-005 — على منوال اختبار الفصل الأول — قراءة عدد بفئاته (platform_addition)
  [K(2, 5, 'q1')]: wordsKey(30408, ["ثلاثة آلاف وأربعمائة وثمانية","ثلاثون ألفا وأربعمائة وثمانية","ثلاثمائة ألف وأربعمائة وثمانية","ثلاثة صفر أربعة صفر ثمانية"]),
  // l2-006 — بطاقات الأرقام (textbook deep-3)
  [K(2, 6, 'q1')]: R(minPerm([6,0,4,1])),
  [K(2, 6, 'q2')]: R(maxPerm([6,0,4,1])),
  // l2-007 — على منوال اختبار الفصل الأول — مفكوك عدد فيه أصفار (platform_addition)
  [K(2, 7, 'q1')]: decompKey(50708, ["$5 \\times 10\\,000 + 7 \\times 10 + 8$","$5 \\times 10\\,000 + 7 \\times 100 + 8$","$5 \\times 1000 + 7 \\times 100 + 8$"]),
  // l2-008 — على منوال اختبار الفصل الأول — عدّاد يتغيّر كله (platform_addition)
  [K(2, 8, 'q1')]: R(nextOf(29999)),
  [K(2, 8, 'q2')]: R(prevOf(40000)),
  // l2-009 — على منوال اختبار الفصل الأول — أين نضع الفاصلة؟ (platform_addition)
  [K(2, 9, 'q1')]: R(comma("52863", 8, -1)),
  [K(2, 9, 'q2')]: R(comma("52863", 6, 0)),
  // l2-010 — المليون والمليار (textbook deep-2)
  [K(2, 10, 'q1')]: spelt("مليون", 1000000),
  [K(2, 10, 'q2')]: spelt("مليار", 1000000000),
  [K(2, 10, 'q3')]: R(countOf(1000000000, 6)),
  // l3-001 — على منوال اختبار الفصل الأول — مرتبة الرقم 4 (term_exam 1am-s1-94 ex. 1)
  [K(3, 1, 'q1')]: rankKey("586,423", 4, ["العشرات","الأجزاء من مائة","الأعشار"]),
  [K(3, 1, 'q2')]: rankKey("71,054", 4, ["الأعشار","الأجزاء من مائة","الأجزاء من ألف"]),
  [K(3, 1, 'q3')]: rankKey("4307,61", 4, ["عشرات الآلاف","المئات","الآلاف"]),
  [K(3, 1, 'q4')]: decompKey(6047, ["$6 \\times 1000 + 4 \\times 10 + 7$","$6 \\times 100 + 4 \\times 10 + 7$","$6 \\times 1000 + 4 \\times 100 + 7 \\times 10$"]),
  [K(3, 1, 'q5')]: R(comma("538406", 4, -1)),
  // l3-002 — على منوال اختبار الفصل الأول — مفكوك ووضع الفاصلة (term_exam 1am-s1-95 ex. 1)
  [K(3, 2, 'q1')]: R(blank(8305, 3)),
  [K(3, 2, 'q2')]: R(comma("694152", 5, -2)),
  [K(3, 2, 'q3')]: R(comma("694152", 1, 0)),
  // l3-003 — على منوال اختبار الفصل الأول — أرقام عدد عشري (term_exam 1am-s1-97 ex. 1)
  [K(3, 3, 'q1')]: R(digitOf("857,349", 0)),
  [K(3, 3, 'q2')]: R(digitOf("857,349", 2)),
  [K(3, 3, 'q3')]: R(digitOf("857,349", -1)),
  [K(3, 3, 'q4')]: R(digitOf("857,349", -2)),
  [K(3, 3, 'q5')]: R(comma("46182", 8, -2)),
  [K(3, 3, 'q6')]: R(comma("20700", 7, 1)),
  // l3-004 — على منوال اختبار الفصل الأول — صحيح أو خطأ مع التصحيح (term_exam 1am-s1-93 ex. 1)
  [K(3, 4, 'q1')]: yn(rankName('27,05', 5) === 'الأعشار'),
  [K(3, 4, 'q2')]: rankKey("27,05", 5, ["الأجزاء من مائة","الأعشار","الأجزاء من ألف"]),
  [K(3, 4, 'q3')]: yn(digitOf('3418', 1) === '1'),
  [K(3, 4, 'q4')]: yn(countOf(6250, 2) === 2),
  [K(3, 4, 'q5')]: R(countOf(6250, 2)),
  // l3-005 — على منوال اختبار الفصل الأول — عدد بالحروف ومراتب (term_exam 1am-s1-101 ex. 1)
  [K(3, 5, 'q1')]: wordsKey(23506, ["ألفان وثلاثمائة وستة وخمسون","ثلاثة وعشرون ألفا وخمسمائة وستة","ثلاثة وعشرون ألفا وخمسمائة وستون","اثنان ثلاثة خمسة صفر ستة"]),
  [K(3, 5, 'q2')]: R(fromRanks({ 1: 4, [-2]: 1, 0: 7, [-3]: 5, [-1]: 0 })),
  [K(3, 5, 'q3')]: decompKey(23506, ["$2 \\times 1000 + 3 \\times 100 + 5 \\times 10 + 6$","$2 \\times 10\\,000 + 3 \\times 1000 + 5 \\times 100 + 6$","$2 \\times 10\\,000 + 3 \\times 1000 + 5 \\times 10 + 6$"]),
  // l3-006 — على منوال اختبار الفصل الأول — بالحروف وبالأرقام (platform_addition)
  [K(3, 6, 'q1')]: spelt("مليونان وثلاثمائة ألف وخمسة عشر", 2300015),
  [K(3, 6, 'q2')]: spacedKey(7041250, ["$7\\,04\\,12\\,50$","$7\\,041\\,250$","$704\\,125\\,0$"]),
  [K(3, 6, 'q3')]: wordsKey(7041250, ["سبعة صفر أربعة واحد اثنان خمسة صفر","سبعة ملايين وواحد وأربعون ألفا ومائتان وخمسون","سبعمائة وواحد وأربعون ألفا ومائتان وخمسون","سبعمائة وأربعة آلاف ومائة وخمسة وعشرون"]),
  // l3-007 — جدول الرقم والعدد (textbook ex-1)
  [K(3, 7, 'q1')]: R(digitOf("6029", 2)),
  [K(3, 7, 'q2')]: R(countOf(6029, 2)),
  [K(3, 7, 'q3')]: R(digitOf("6029", 1)),
  [K(3, 7, 'q4')]: R(countOf(6029, 1)),
  // l3-008 — على منوال اختبار الفصل الأول — الكتابة من المفكوك (term_exam 1am-s1-93 ex. 2)
  [K(3, 8, 'q1')]: R(evalExpr("(7 \\times 1000) + (4 \\times 10) + 9")),
  [K(3, 8, 'q2')]: R(evalExpr("(3 \\times 100) + 5 + (6 \\times 1000)")),
  [K(3, 8, 'q3')]: R(evalExpr("(2 \\times 10\\,000) + (8 \\times 100)")),
  // l3-009 — مسافات بين الشمس والكواكب (textbook deep-2)
  [K(3, 9, 'q1')]: wordsKey(149600000, ["مائة وتسعة وأربعون مليونا وستمائة ألف","مليون وأربعمائة وستة وتسعون ألفا","مائة وتسعة وأربعون ألفا وستمائة"]),
  [K(3, 9, 'q2')]: wordsKey(1427000000, ["مليون وأربعمائة وسبعة وعشرون ألفا","مائة واثنان وأربعون مليونا وسبعمائة ألف","مليار وأربعمائة وسبعة وعشرون مليونا"]),
  [K(3, 9, 'q3')]: R(countOf(149600000, 6)),
  // l3-010 — على منوال اختبار الفصل الأول — أكمل المفكوك النموذجي (term_exam 1am-s1-97 ex. 2)
  [K(3, 10, 'q1')]: R(blank(3586, 3)),
  [K(3, 10, 'q2')]: R(blank(3586, 2)),
  [K(3, 10, 'q3')]: R(blank(3586, 1)),
  [K(3, 10, 'q4')]: R(evalExpr("(2 \\times 1000) + (6 \\times 10) + 4")),
  // l4-001 — على منوال اختبار الفصل الأول — مراتب ومفكوك وفاصلة (term_exam 1am-s1-94 ex. 1)
  [K(4, 1, 'q1')]: rankKey("813,46", 4, ["العشرات","الأعشار","الأجزاء من مائة"]),
  [K(4, 1, 'q2')]: rankKey("4052,7", 4, ["المئات","عشرات الآلاف","الآلاف"]),
  [K(4, 1, 'q3')]: R(checkDecomp('517.306', [[5, '100'], [1, '10'], [7, '1'], [3, null], [6, '0.001']], 3)),
  [K(4, 1, 'q4')]: R(comma("715843", 4, -1)),
  [K(4, 1, 'q5')]: decompKey(7158, ["$7 \\times 1000 + 1 \\times 100 + 8 \\times 10 + 5$","$7 \\times 1000 + 1 \\times 100 + 5 \\times 10 + 8$","$7 \\times 100 + 1 \\times 10 + 5 + 8$"]),
  // l4-002 — على منوال اختبار الفصل الأول — كسر عشري ومفكوك وفاصلة (term_exam 1am-s1-95 ex. 1)
  [K(4, 2, 'q1')]: R(fraction('3816/100')),
  [K(4, 2, 'q2')]: decompKey(5247, ["$5 \\times 1000 + 2 \\times 100 + 4 \\times 10 + 7$","$5 \\times 100 + 2 \\times 10 + 4 + 7$","$5 \\times 1000 + 2 \\times 100 + 7 \\times 10 + 4$"]),
  [K(4, 2, 'q3')]: R(comma("692538", 3, -2)),
  [K(4, 2, 'q4')]: rankKey("692,538", 9, ["العشرات","الأعشار","المئات"]),
  // l4-003 — على منوال اختبار الفصل الأول — أرقام وفاصلة وعدد الأعشار (term_exam 1am-s1-97 ex. 1)
  [K(4, 3, 'q1')]: R(digitOf("615,328", 0)),
  [K(4, 3, 'q2')]: R(digitOf("615,328", 2)),
  [K(4, 3, 'q3')]: R(digitOf("615,328", -1)),
  [K(4, 3, 'q4')]: R(digitOf("615,328", -2)),
  [K(4, 3, 'q5')]: R(comma("27469", 6, -2)),
  [K(4, 3, 'q6')]: R(comma("30800", 8, 1)),
  [K(4, 3, 'q7')]: R(tenthsCount('208.47')),
  // l4-004 — على منوال اختبار الفصل الأول — كتابة عشرية ومفكوك (term_exam 1am-s1-97 ex. 2)
  [K(4, 4, 'q1')]: R(fraction('47/100')),
  [K(4, 4, 'q2')]: R(sumFractions(['5', '3/10', '8/1000'])),
  [K(4, 4, 'q3')]: R(blank(2864, 3)),
  [K(4, 4, 'q4')]: R(blank(2864, 2)),
  [K(4, 4, 'q5')]: R(blank(2864, 1)),
  [K(4, 4, 'q6')]: R(product('3.8', 100)),
  // l4-005 — على منوال اختبار الفصل الأول — صحيح أو خطأ (term_exam 1am-s1-93 ex. 1)
  [K(4, 5, 'q1')]: yn(rankName('42,06', 6) === 'الأعشار'),
  [K(4, 5, 'q2')]: rankKey("42,06", 6, ["الأعشار","الأجزاء من ألف","الأجزاء من مائة"]),
  [K(4, 5, 'q3')]: yn(product('2.5', 5) === '12.5'),
  [K(4, 5, 'q4')]: yn(shiftRule(100, 2)),
  [K(4, 5, 'q5')]: yn(digitOf('25316', 2) === '3'),
  // l4-006 — على منوال اختبار الفصل الأول — بالحروف ومراتب ومفكوك (term_exam 1am-s1-101 ex. 1)
  [K(4, 6, 'q1')]: wordsKey(60215, ["ستة صفر اثنان واحد خمسة","ستون ألفا ومائتان وخمسة عشر","ستة آلاف ومائتان وخمسة عشر","ستمائة ألف ومائتان وخمسة عشر"]),
  [K(4, 6, 'q2')]: R(fromRanks({ 1: 3, 0: 8, [-1]: 0, [-2]: 7, [-3]: 2 })),
  [K(4, 6, 'q3')]: exprKey('38.072', ["$3 \\times 10 + 8 + \\frac{7}{10} + \\frac{2}{100}$","$3 \\times 100 + 8 \\times 10 + \\frac{7}{100} + \\frac{2}{1000}$","$3 \\times 10 + 8 + \\frac{7}{100} + \\frac{2}{1000}$"]),
  [K(4, 6, 'q4')]: decompKey(60215, ["$6 \\times 10\\,000 + 2 \\times 1000 + 1 \\times 10 + 5$","$6 \\times 1000 + 2 \\times 100 + 1 \\times 10 + 5$","$6 \\times 10\\,000 + 2 \\times 100 + 1 \\times 10 + 5$"]),
  // l4-007 — على منوال اختبار الفصل الأول — حملة الأقلام التضامنية (platform_addition)
  [K(4, 7, 'q1')]: R(1248 + 1765),
  [K(4, 7, 'q2')]: wordsKey(3013, ["ثلاثة آلاف ومائة وثلاثون","ثلاثمائة وثلاثة عشر","ثلاثة صفر واحد ثلاثة","ثلاثة آلاف وثلاثة عشر"]),
  [K(4, 7, 'q3')]: R(countOf(3013, 1)),
  [K(4, 7, 'q4')]: R(digitOf('3013', 0)),
  // l4-008 — على منوال اختبار الفصل الأول — قواميس مكتبة المتوسطة (platform_addition)
  [K(4, 8, 'q1')]: R(product('126.5', 100)),
  [K(4, 8, 'q2')]: R(countOf(12650, 3)),
  [K(4, 8, 'q3')]: R(countOf(12650, 2)),
  [K(4, 8, 'q4')]: wordsKey(12650, ["اثنا عشر ألفا وستمائة وخمسون","واحد اثنان ستة خمسة صفر","ألف ومائتان وخمسة وستون","مائة وعشرون ألفا وستمائة وخمسون"]),
  // l4-009 — على منوال اختبار الفصل الأول — من المفكوك إلى الترتيب (term_exam 1am-s1-93 ex. 2)
  [K(4, 9, 'q1')]: R(evalExpr("(4 \\times 1000) + (5 \\times 10) + 2")),
  [K(4, 9, 'q2')]: R(evalExpr("(5 \\times 100) + 2 + (4 \\times 1000)")),
  [K(4, 9, 'q3')]: R(evalExpr("(4 \\times 1000) + (5 \\times 100) + (2 \\times 10)")),
  [K(4, 9, 'q4')]: orderKey([4052, 4502, 4520], ["$4520 < 4502 < 4052$","$4502 < 4052 < 4520$","$4052 < 4502 < 4520$"]),
  // l4-010 — أبعاد المجموعة الشمسية (textbook deep-2)
  [K(4, 10, 'q1')]: spacedKey(2877380000, ["$2\\,877\\,380\\,000$","$28\\,77\\,38\\,00\\,00$","$287\\,738\\,000\\,0$"]),
  [K(4, 10, 'q2')]: wordsKey(4467070000, ["أربعمائة وستة وأربعون مليونا وسبعمائة وسبعة آلاف","أربعة ملايير وأربعمائة وسبعة وستون مليونا وسبعون ألفا","أربعة ملايير وأربعمائة وسبعة وستون مليونا وسبعمائة ألف"]),
  [K(4, 10, 'q3')]: R(nextOf(9999999999)),
  [K(4, 10, 'q4')]: largerKey({ 'أورانوس': 2877380000, 'نبتون': 4467070000 }, ["أورانوس","نبتون"]),
  // l5-001 — على منوال اختبار الفصل الأول — ورشة تغليف الأقلام (platform_addition)
  [K(5, 1, 'q1')]: R(counts({ 3: 3, 2: 12, 1: 15, 0: 8 })),
  [K(5, 1, 'q2')]: wordsKey(4358, ["أربعة آلاف وثلاثمائة وخمسة وثمانون","أربعة ثلاثة خمسة ثمانية","أربعة آلاف وثلاثمائة وثمانية وخمسون","ثلاثة وأربعون ألفا وثمانية وخمسون"]),
  [K(5, 1, 'q3')]: R(countOf(4358, 1)),
  [K(5, 1, 'q4')]: yn(countOf(4358, 1) >= 420),
  // l5-002 — على منوال اختبار الفصل الأول — صكّ التبرّع للمكتبة (platform_addition)
  [K(5, 2, 'q1')]: spelt("مائة وخمسة وعشرون ألفا وأربعمائة", 125400),
  [K(5, 2, 'q2')]: yn(spellOf(12540) === 'مائة وخمسة وعشرون ألفا وأربعمائة'),
  [K(5, 2, 'q3')]: R(countOf(125400, 3)),
  [K(5, 2, 'q4')]: yn(countOf(125400, 3) >= 130),
  // l5-003 — على منوال اختبار الفصل الأول — رمز خزانة نادي الروبوتيك (platform_addition)
  [K(5, 3, 'q1')]: R(maxPerm([3,0,8,5,1])),
  [K(5, 3, 'q2')]: R(minPerm([3,0,8,5,1])),
  [K(5, 3, 'q3')]: wordsKey(85310, ["ثمانية آلاف وخمسمائة وواحد وثلاثون","خمسة وثمانون ألفا وثلاثمائة وعشرة","ثمانمائة وثلاثة وخمسون ألفا ومائة","ثمانية خمسة ثلاثة واحد صفر"]),
  [K(5, 3, 'q4')]: R(minPerm([3,0,8,5,1], (s) => s[s.length - 3] === '0')),
  // l5-004 — على منوال اختبار الفصل الأول — نصف ماراطون المدينة (platform_addition)
  [K(5, 4, 'q1')]: wordsKey(21097, ["واحد وعشرون ألفا وتسعمائة وسبعون","واحد وعشرون ألفا وسبعة وتسعون","اثنان واحد صفر تسعة سبعة","ألفان ومائة وسبعة وتسعون"]),
  [K(5, 4, 'q2')]: R(countOf(21097, 3)),
  [K(5, 4, 'q3')]: R(countOf(1250, 2)),
  [K(5, 4, 'q4')]: R(1250 % 100),
  [K(5, 4, 'q5')]: yn(countOf(1250, 2) >= 15),
  // l5-005 — على منوال اختبار الفصل الأول — شجرة لكل ألف ساكن (platform_addition)
  [K(5, 5, 'q1')]: spacedKey(1042300, ["$1\\,04\\,23\\,00$","$104\\,230\\,0$","$1\\,042\\,300$"]),
  [K(5, 5, 'q2')]: wordsKey(1042300, ["مائة وأربعة آلاف ومائتان وثلاثون","مليون وأربعمائة وعشرون ألفا وثلاثمائة","مليون واثنان وأربعون ألفا وثلاثمائة"]),
  [K(5, 5, 'q3')]: R(digitOf("1042300", 5)),
  [K(5, 5, 'q4')]: R(countOf(1042300, 3)),
  [K(5, 5, 'q5')]: yn(countOf(1042300, 3) <= 1000),
  // l5-006 — دكّان العمّ أحمد (textbook ex-2)
  [K(5, 6, 'q1')]: decompKey(3475, ["$3 \\times 100 + 4 \\times 10 + 7$","$3 \\times 1000 + 4 \\times 100 + 5 \\times 10 + 7$","$3 \\times 1000 + 4 \\times 100 + 7 \\times 10 + 5$"]),
  [K(5, 6, 'q2')]: R(fewestPieces(3475, [1000, 100, 10, 1])),
  [K(5, 6, 'q3')]: R(notesNeeded(3475, 100)),
  [K(5, 6, 'q4')]: R(notesNeeded(3475, 100) * 100 - 3475),
  // l5-007 — على منوال اختبار الفصل الأول — عدّاد سيارة الأجرة (platform_addition)
  [K(5, 7, 'q1')]: R(nextOf(99999)),
  [K(5, 7, 'q2')]: wordsKey(100000, ["عشرة آلاف","مائة ألف","مليون"]),
  [K(5, 7, 'q3')]: R(countOf(100000, 4)),
  [K(5, 7, 'q4')]: R(countOf(100000, 3)),
  // l5-008 — رحلة في المجموعة الشمسية (textbook deep-2)
  [K(5, 8, 'q1')]: wordsKey(778300000, ["سبعة وسبعون مليونا وثمانمائة وثلاثون ألفا","سبعمائة وثمانية وسبعون ألفا وثلاثمائة","سبعمائة وثمانية وسبعون مليونا وثلاثمائة ألف"]),
  [K(5, 8, 'q2')]: R(countOf(778300000, 6)),
  [K(5, 8, 'q3')]: spacedKey(57900000, ["$579\\,000\\,00$","$57\\,90\\,00\\,00$","$57\\,900\\,000$"]),
  [K(5, 8, 'q4')]: spacedKey(4467070000, ["$4\\,467\\,070\\,000$","$44\\,67\\,07\\,00\\,00$","$446\\,707\\,000\\,0$"]),
  [K(5, 8, 'q5')]: R(countOf(4467070000, 9)),
  // l5-009 — على منوال اختبار الفصل الأول — مخزن الورشة الممتلئ (platform_addition)
  [K(5, 9, 'q1')]: R(counts({ 3: 9, 2: 9, 1: 9, 0: 9 })),
  [K(5, 9, 'q2')]: wordsKey(9999, ["تسعة تسعة تسعة تسعة","تسعة آلاف وتسعمائة وتسعة وتسعون","تسعة آلاف وتسعمائة وتسعون"]),
  [K(5, 9, 'q3')]: R(nextOf(9999)),
  [K(5, 9, 'q4')]: R(countOf(10000, 3)),
  [K(5, 9, 'q5')]: wordsKey(10000, ["مائة ألف","عشرة آلاف","ألف"]),
  // l5-010 — على منوال اختبار الفصل الأول — صكوك أمين صندوق الجمعية (platform_addition)
  [K(5, 10, 'q1')]: wordsKey(26080, ["ألفان وستمائة وثمانون","ستة وعشرون ألفا وثمانمائة","ستة وعشرون ألفا وثمانون","اثنان ستة صفر ثمانية صفر"]),
  [K(5, 10, 'q2')]: spelt("سبعة عشر ألفا وخمسة", 17005),
  [K(5, 10, 'q3')]: yn(spellOf(40700) === 'أربعة آلاف وسبعمائة'),
  [K(5, 10, 'q4')]: spelt("أربعة آلاف وسبعمائة", 4700),
  [K(5, 10, 'q5')]: R(countOf(40700, 2)),
};

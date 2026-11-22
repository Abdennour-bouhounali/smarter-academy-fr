/**
 * Les FRACTIONS de 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » (2026-10-25) — arithmétique EXACTE en BigInt, au-dessus des rationnels de
 * `powers.js` (`rat`, `mul`, `div`, `eq`, `ratText`, `ratTex`, `parseRat` : importés, JAMAIS réécrits).
 *
 * `powers.js › rat` RÉDUIT toujours. Les labos et les exercices ont aussi besoin d'une écriture NON réduite (6/8 doit rester 6/8 sur une carte) : le couple
 * brut `{ n, d }` (BigInt, d > 0, jamais réduit) vit ici, à côté de `rat`.
 *
 * Ajouté par la leçon 1 `maqlub-qismat-kasrayn` : `raw`, `valueOf`, `rawTex`, `reciprocal`, `isReciprocalPair`, `divideFractions`,
 * `simplifyBeforeMultiply`, `gearTurns`, `teethFor` (le labo `gear-crank`). Les leçons suivantes de l'unité y ajoutent leurs fonctions (plan README).
 *
 * Ajouté par la leçon 2 `tasawi-muqaranat-kasrayn` (2026-10-26) : `crossProducts`, `sameFraction`, `compareFractions`, `lcm`, `commonMultiples`, `toDenominator`, `missingTerm`,
 * `matchNumerator`, `shadeVerdict`, `unitsDigitOfProduct` (le labo `shade-match`).
 *
 * Ajouté par la leçon 3 `jam-tarh-kasrayn` (2026-10-26) : `isCommonMultiple`, `smallestCommonMultiple`, `multiplesUntil`, `cellsOf`, `sumWith`, `widestUnit`,
 * `zoneEnds` (le labo `seed-rake`) : sommes et différences de fractions POSITIVES par un dénominateur commun.
 *
 * Ajouté par la leçon 4 `adad-natiq` (2026-10-26) : `writingValue`, `normalize`, `writingsEqual`, `isDecimalRational`, `twelfths`, `integerAndFraction`, `sortRationals`, `unitOf`
 * (le labo `number-line-pegs`) : le nombre rationnel, ses écritures, sa place sur la droite.
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/fractions3.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §3–§4).
 */
import { rat, parseRat, mul, div, eq, sign, add, sub, ratText } from './powers.js';

const big = (x) => (typeof x === 'bigint' ? x : BigInt(x));
const abs = (x) => (x < 0n ? -x : x);
const gcdB = (a, b) => { a = abs(a); b = abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1n; };

/** Un couple NON réduit `{ n, d }` : d ≠ 0 (sinon exception), le dénominateur est rendu positif. `raw(6, 8)` reste 6/8. */
export function raw(n, d = 1) {
  let N = big(n); let D = big(d);
  if (D === 0n) throw new Error('dénominateur nul');
  if (D < 0n) { N = -N; D = -D; }
  return Object.freeze({ n: N, d: D });
}

const isRaw = (x) => x && typeof x === 'object' && 'n' in x && 'd' in x;

/** Toute entrée (naturel, « 0,8 », « 3/4 », rat, raw) → couple brut. Un décimal garde son dénominateur 10ᵏ : « 0,8 » → 8/10. */
export function toRaw(x) {
  if (isRaw(x)) return raw(x.n, x.d);
  if (typeof x === 'string') {
    const s = x.trim().replace(/−/g, '-').replace(/\s+/g, '').replace(',', '.');
    const m = /^([+-]?)(\d*)\.(\d+)$/.exec(s);
    if (m) return raw(BigInt(`${m[1]}${m[2] || '0'}${m[3]}`), 10n ** BigInt(m[3].length));
    const q = /^([+-]?\d+)\/([+-]?\d+)$/.exec(s);
    if (q) return raw(q[1], q[2]);
    return raw(parseRat(s).n, 1);
  }
  return raw(x, 1);
}

/** La valeur (rationnel irréductible de `powers.js`) d'un couple brut. */
export const valueOf = (x) => { const p = toRaw(x); return rat(p.n, p.d); };

/** LaTeX d'un couple brut, non réduit : « \frac{6}{8} » ; un dénominateur 1 s'écrit « 6 ». */
export function rawTex(x) {
  const p = toRaw(x);
  const body = p.d === 1n ? String(abs(p.n)) : `\\frac{${abs(p.n)}}{${p.d}}`;
  return p.n < 0n ? `-${body}` : body;
}

/** Texte « 6/8 » (ou « 6 ») d'un couple brut. */
export function rawText(x) { const p = toRaw(x); return p.d === 1n ? String(p.n) : `${p.n}/${p.d}`; }

/**
 * Le MIROIR (le mot de la leçon : مقلوب) d'un nombre non nul : naturel a → 1/a ; décimal « 0,8 » → 10/8 (la valeur est 5/4) ; fraction a/b → b/a. 0 n'a pas de inverse (exception).
 */
export function reciprocal(x) {
  const p = toRaw(x);
  if (p.n === 0n) throw new Error('0 n\'a pas de inverse');
  return raw(p.d, p.n);
}

/** Deux nombres sont-ils inverses l'un de l'autre : x · y = 1 ? (exact, sur les valeurs). */
export function isReciprocalPair(x, y) { return eq(mul(valueOf(x), valueOf(y)), 1); }

/**
 * a/b ÷ c/d = a/b × d/c. Retourne `{ product: [p, flip(q)], value }` : les deux facteurs écrits tels quels (non réduits) et la valeur réduite.
 * Diviser par 0 est refusé (exception).
 */
export function divideFractions(p, q) {
  const a = toRaw(p); const b = toRaw(q);
  if (b.n === 0n) throw new Error('division par 0');
  return { product: [a, reciprocal(b)], value: div(valueOf(a), valueOf(b)) };
}

/**
 * Simplifier AVANT de multiplier p × q (p = a/b, q = c/d) : on divise a et d par leur PGCD, c et b par le leur. Retourne
 * `{ cancels: [{ top, bottom, g }], after: { a, b, c, d }, result }` ; `result` est le produit (couple brut) des facteurs restants, donc irréductible
 * quand p et q le sont.
 */
export function simplifyBeforeMultiply(p, q) {
  const { n: a, d: b } = toRaw(p); const { n: c, d } = toRaw(q);
  const g1 = gcdB(a, d); const g2 = gcdB(c, b);
  const cancels = [];
  if (g1 > 1n) cancels.push({ top: 'a', bottom: 'd', g: g1 });
  if (g2 > 1n) cancels.push({ top: 'c', bottom: 'b', g: g2 });
  const after = { a: a / g1, b: b / g2, c: c / g2, d: d / g1 };
  return { cancels, after, result: raw(after.a * after.c, after.b * after.d) };
}

/**
 * Le labo `gear-crank` : un plateau de F dents et un pignon de R dents ; la chaîne avance de `teeth` dents. La pédale tourne de teeth/F tours et la roue
 * de teeth/R tours (rationnels réduits).
 */
export function gearTurns(F, R, teeth) {
  if (big(F) <= 0n || big(R) <= 0n) throw new Error('un plateau sans dents n\'entraîne rien');
  return { pedal: rat(big(teeth), big(F)), wheel: rat(big(teeth), big(R)) };
}

/** Le nombre de dents (rationnel) pour que la roue fasse `target` tours : target × R. Entier ⇔ le drapeau tombe pile sur une dent. */
export function teethFor(R, target) {
  if (big(R) <= 0n) throw new Error('un pignon sans dents n\'entraîne rien');
  return mul(valueOf(target), rat(big(R), 1));
}

/* ── Leçon 2 `tasawi-muqaranat-kasrayn` (2026-10-26) : l'égalité et la comparaison de deux fractions POSITIVES ─────────────────────────────────── */

const lcmB = (a, b) => (a / gcdB(a, b)) * b;

/** Les DEUX produits en croix de a/b et c/d : `left = a × d`, `right = b × c`. Les entrées sont des couples bruts (ou tout ce que `toRaw` lit), dénominateurs > 0. */
export function crossProducts(p, q) {
  const x = toRaw(p); const y = toRaw(q);
  return { left: x.n * y.d, right: x.d * y.n };
}

/** a/b = c/d ⇔ a × d = b × c (exact, les deux sens ne sont qu'une seule égalité). */
export function sameFraction(p, q) { const { left, right } = crossProducts(p, q); return left === right; }

/** −1 si p < q, 0 si égaux, 1 si p > q — par les produits en croix (dénominateurs positifs, car `raw` rend le dénominateur positif). */
export function compareFractions(p, q) {
  const { left, right } = crossProducts(p, q);
  return left === right ? 0 : left < right ? -1 : 1;
}

/** Le plus petit multiple commun non nul de deux naturels. */
export function lcm(a, b) {
  const x = abs(big(a)); const y = abs(big(b));
  if (x === 0n || y === 0n) throw new Error('multiple commun de 0');
  return lcmB(x, y);
}

/** Les `count` premiers multiples communs non nuls de b et d : le plus petit, puis ses multiples (le produit b × d en est un). */
export function commonMultiples(b, d, count = 3) {
  const m = lcm(b, d);
  return Array.from({ length: count }, (_, i) => m * BigInt(i + 1));
}

/** Écrit p = a/b avec le dénominateur D (multiple de b, sinon exception) : `{ k, n, d }` avec n = a × k, d = D, k = D / b. */
export function toDenominator(p, D) {
  const { n, d } = toRaw(p);
  const T = big(D);
  if (T <= 0n || T % d !== 0n) throw new Error(`${D} n'est pas un multiple de ${d}`);
  const k = T / d;
  return Object.freeze({ k, n: n * k, d: T });
}

/**
 * Le terme manquant de a/b = c/d. `terms` = [a, b, c, d] avec UN `null` (ou `undefined`). Retourne le rationnel exact (de `powers.js`) ; une division par 0
 * (b ou d inconnu et l'autre produit nul, ou b = 0 / d = 0 donnés) est refusée (exception).
 */
export function missingTerm(terms) {
  const holes = terms.map((t, i) => (t == null ? i : -1)).filter((i) => i >= 0);
  if (holes.length !== 1) throw new Error('un seul terme manque');
  const [a, b, c, d] = terms.map((t) => (t == null ? null : big(t)));
  const at = holes[0];
  // a × d = b × c
  if ((at !== 1 && b === 0n) || (at !== 3 && d === 0n)) throw new Error('dénominateur nul');
  if (at === 0) return rat(b * c, d);
  if (at === 1) { if (c === 0n) throw new Error('b indéterminé'); return rat(a * d, c); }
  if (at === 2) return rat(a * d, b);
  if (a === 0n) throw new Error('d indéterminé');
  return rat(b * c, a);
}

/**
 * Le labo `shade-match` : la référence a/b est dans un seau, B reçoit d mesures de blanc et c mesures de bleu (c entier ≥ 0). Quel c fait c/d = a/b ?
 * c = a × d / b : `exact` ⇔ c entier. Sinon `below` = ⌊a·d/b⌋ (trop clair) et `above` = below + 1 (trop foncé). Retourne aussi `value` (le rationnel a·d/b).
 */
export function matchNumerator(a, b, d) {
  const A = big(a); const B = big(b); const D = big(d);
  if (A < 0n || B <= 0n || D <= 0n) throw new Error('référence ou blanc invalide');
  const value = rat(A * D, B);
  const exact = value.d === 1n;
  const below = (A * D) / B;
  return Object.freeze({ exact, c: exact ? below : null, below, above: exact ? below : below + 1n, value });
}

/**
 * Le verdict d'une dose de bleu : le seau B (c bleus pour d blancs) contre la référence a/b — sur le signe de c × b − a × d.
 * 'lighter' (c × b < a × d : moins de bleu par blanc), 'match', 'darker'. `gap` = c × b − a × d (BigInt, signé).
 */
export function shadeVerdict(a, b, c, d) {
  const gap = big(c) * big(b) - big(a) * big(d);
  return { verdict: gap < 0n ? 'lighter' : gap === 0n ? 'match' : 'darker', gap };
}

/** Le dernier chiffre (l'unité) d'un produit de deux naturels, sans calculer le produit : (a mod 10)(b mod 10) mod 10. */
export function unitsDigitOfProduct(a, b) { return Number(((big(a) % 10n) * (big(b) % 10n)) % 10n); }

/* ── Leçon 3 `jam-tarh-kasrayn` (2026-10-26) : somme et différence de fractions POSITIVES par un dénominateur commun ─────────────────────────────── */

const posRaw = (x) => { const p = toRaw(x); if (p.n < 0n) throw new Error('fraction négative'); return p; };

/** N est-il un multiple commun (non nul) de tous les dénominateurs `dens` (naturels) ? */
export function isCommonMultiple(N, dens) {
  const n = big(N);
  return n > 0n && dens.every((d) => n % big(d) === 0n);
}

/** Le plus petit multiple commun non nul d'une liste de dénominateurs (naturels ≥ 1). */
export function smallestCommonMultiple(dens) {
  if (!dens.length) throw new Error('aucun dénominateur');
  return dens.map(big).reduce((m, d) => lcm(m, d));
}

/**
 * La méthode du livre pour le plus petit multiple commun de deux dénominateurs : on énumère les multiples du PLUS GRAND jusqu'au premier qui est
 * divisible par l'autre. Retourne `{ larger, other, list: [bigint…], lcm }` (la liste finit par le plus petit multiple commun).
 */
export function multiplesUntil(a, b) {
  const x = big(a); const y = big(b);
  if (x <= 0n || y <= 0n) throw new Error('dénominateur invalide');
  const [larger, other] = x >= y ? [x, y] : [y, x];
  const list = [];
  for (let m = larger; ; m += larger) { list.push(m); if (m % other === 0n) return Object.freeze({ larger, other, list, lcm: m }); }
}

/**
 * Le nombre de cases de largeur 1/N dans la fraction p (positive) : `{ whole, count, cells }` — `cells` = p × N (rationnel exact), `count` = p × N si entier
 * (sinon null). Une zone de largeur p est remplie de plants entiers ⇔ `whole`.
 */
export function cellsOf(p, N) {
  const x = posRaw(p); const n = big(N);
  if (n <= 0n) throw new Error('N doit être ≥ 1');
  const cells = rat(x.n * n, x.d);
  const whole = cells.d === 1n;
  return Object.freeze({ whole, count: whole ? cells.n : null, cells });
}

/** Les extrémités (rationnels exacts, croissantes depuis 0 sauf une récolte) des zones d'une somme algébrique : `terms` = [{ p, sub? }] ; une zone `sub` retire sa largeur de la fin. */
export function zoneEnds(terms) {
  let total = rat(0, 1);
  const out = [];
  for (const t of terms) {
    const w = valueOf(posRaw(t.p));
    const before = total;
    total = t.sub ? sub(total, w) : add(total, w);
    if (sign(total) < 0) throw new Error('résultat négatif : hors de cette leçon');
    out.push(Object.freeze({ from: t.sub ? total : before, to: t.sub ? before : total, sub: !!t.sub }));
  }
  return Object.freeze({ zones: out, total });
}

/**
 * Planter à l'espacement 1/N : chaque zone doit contenir un nombre ENTIER de cases. `terms` = [{ p, sub? }] (fractions positives, la dernière zone peut être une
 * récolte). Retourne `{ ok, counts: [bigint|null…], signed: bigint|null (le nombre net de plants), total (rationnel), borderAt: index de la 1re zone qui tombe en
 * travers d'une case (ou -1), cells }`. Aucun flottant.
 */
export function sumWith(terms, N) {
  const { zones, total } = zoneEnds(terms);
  const cells = terms.map((t) => cellsOf(t.p, N));
  const borderAt = cells.findIndex((c) => !c.whole);
  const ok = borderAt < 0;
  let signed = null;
  if (ok) signed = cells.reduce((acc, c, i) => acc + (terms[i].sub ? -c.count : c.count), 0n);
  return Object.freeze({ ok, counts: cells.map((c) => c.count), signed, total, borderAt, zones });
}

/** Le plus petit N ≤ maxN qui convient (le plus large espacement 1/N) ou null : un multiple commun des dénominateurs des zones. */
export function widestUnit(dens, maxN = 60) {
  const m = smallestCommonMultiple(dens);
  return m <= big(maxN) ? m : null;
}

/* ── Leçon 4 `adad-natiq` (2026-10-26) : le nombre rationnel, ses écritures, sa place ─────────────────────────────────────────────────────────── */

/**
 * La VALEUR (rationnel réduit) d'une écriture : « a/b » avec a et b relatifs (a peut être décimal : « -1,5/-8 »), ou un nombre seul (« -3 », « 2,5 »).
 * Les signes peuvent être n'importe où (« 6/-8 »). Exception si b = 0.
 */
export function writingValue(w) {
  if (isRaw(w)) return valueOf(w);
  if (typeof w === 'bigint' || typeof w === 'number') return rat(w, 1);
  const t = String(w).trim().replace(/−/g, '-').replace(/\s+/g, '');
  const i = t.indexOf('/');
  if (i < 0) return valueOf(toRaw(t));
  const a = valueOf(toRaw(t.slice(0, i)));
  const b = valueOf(toRaw(t.slice(i + 1)));
  if (b.n === 0n) throw new Error('division par 0');
  return div(a, b);
}

/** La forme MODÈLE d'un rationnel : dénominateur positif et fraction réduite. `{ sign: -1 | 0 | 1, n, d }` avec n ≥ 0 (la valeur est sign × n / d). Accepte une écriture, un `rat` ou un couple brut. */
export function normalize(x) {
  const v = rat_(x);
  return Object.freeze({ sign: v.n < 0n ? -1 : v.n > 0n ? 1 : 0, n: abs(v.n), d: v.d });
}
const rat_ = (x) => (x && typeof x === 'object' && 'n' in x && 'd' in x && !('sign' in x) ? rat(x.n, x.d) : writingValue(x));

/** Deux écritures désignent-elles le MÊME nombre ? (exact) */
export function writingsEqual(a, b) { return eq(rat_(a), rat_(b)); }

/** Le rationnel est-il décimal ? ⇔ son dénominateur réduit n'a que les facteurs 2 et 5. */
export function isDecimalRational(x) {
  let d = rat_(x).d;
  while (d % 2n === 0n) d /= 2n;
  while (d % 5n === 0n) d /= 5n;
  return d === 1n;
}

/** Le nombre k de douzièmes si x = k/12 (entier relatif, number), sinon null. */
export function twelfths(x) {
  const v = rat_(x);
  const k = v.n * 12n;
  return k % v.d === 0n ? Number(k / v.d) : null;
}

/** L'entier relatif ⌊x⌋ (le plus grand entier ≤ x) et la fraction qui reste, dans [0, 1[ : −17/3 = −6 + 1/3 ; 17/5 = 3 + 2/5. `alt` : la lecture « entier vers zéro + fraction négative » (−17/3 = −5 + (−2/3)). */
export function integerAndFraction(x) {
  const v = rat_(x);
  let k = v.n / v.d;
  if (v.n < 0n && v.n % v.d !== 0n) k -= 1n;
  const frac = rat(v.n - k * v.d, v.d);
  const toward = v.n / v.d;
  return Object.freeze({ k, frac, alt: Object.freeze({ k: toward, frac: rat(v.n - toward * v.d, v.d) }) });
}

/** L'entier ⌊x⌋ (number) : l'intervalle unité [k, k + 1[ où x se trouve. */
export const unitOf = (x) => Number(integerAndFraction(x).k);

/** Les écritures triées par valeur croissante (stable : deux écritures égales gardent leur ordre). Retourne un nouveau tableau. */
export function sortRationals(list) {
  return list.map((w, i) => ({ w, i, v: rat_(w) })).sort((p, q) => (eq(p.v, q.v) ? p.i - q.i : sign(sub(p.v, q.v)))).map((o) => o.w);
}

/* ── Leçon 5 `amaliyat-natiqa` (2026-10-26) : les quatre opérations sur les rationnels, les enchaînements ───────────────────────────────────── */

/**
 * LA CHAÎNE DE CALCUL (le labo `merge-board`). Un arbre de trois sortes de nœuds :
 *   `{ t: 'n', id, w, v, flip, merged }`  une TUILE : l'écriture `w` (« -5/4 », « 1,5/6 », « -2 »), sa valeur `v` (rat) ; `flip` = elle a été retournée (son مقلوب, le signe gardé) ;
 *   `{ t: 'g', items: [nœud, op, nœud, …], paren }`  un groupe plat (la bulle si `paren`) ; op ∈ + − × ÷ ;
 *   `{ t: 'b', top, bottom }`  une barre de fraction composée (deux groupes) : une division que l'élève fait en dernier.
 * Syntaxe de `parseChain` : nombres « -5/4 », « 1,5/6 », « 3 » ; opérateurs + - * × x ÷ : ; parenthèses ; la barre « (haut)@(bas) ». Un « - » est un SIGNE s'il suit un début, un
 * opérateur, « ( » ou « @ », une soustraction sinon. Une parenthèse autour d'un seul nombre n'est pas une bulle. Aucun flottant : tout est BigInt.
 */
const OPS = { '+': '+', '-': '-', '−': '-', '*': '×', '×': '×', x: '×', X: '×', '÷': '÷', ':': '÷' };
const isMD = (op) => op === '×' || op === '÷';

function tokenize(text) {
  const s = String(text).replace(/\s+/g, '').replace(/٫|،|\./g, ',');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const prev = out[out.length - 1];
    const signPos = !prev || prev.k === 'op' || prev.k === '(' || prev.k === '@';
    const m = /^(\d+(?:,\d+)?)(?:\/(\d+))?/.exec(s.slice(i + ((c === '-' || c === '−') && signPos ? 1 : 0)));
    if (m && (/\d/.test(c) || ((c === '-' || c === '−') && signPos))) {
      const neg = c === '-' || c === '−';
      out.push({ k: 'num', neg, a: m[1], b: m[2] });
      i += (neg ? 1 : 0) + m[0].length;
    } else if (c === '(' || c === ')' || c === '@') { out.push({ k: c }); i += 1; }
    else if (OPS[c]) { out.push({ k: 'op', v: OPS[c] }); i += 1; }
    else throw new Error(`caractère illisible : ${c}`);
  }
  return out;
}

const decRat = (a) => parseRat(a);
let SEQ = 0;
function makeTile(tok) {
  const num = `${tok.neg ? '-' : ''}${tok.a}`;
  const w = tok.b === undefined ? num : `${num}/${tok.b}`;
  if (tok.b !== undefined && /^0+$/.test(tok.b)) throw new Error('dénominateur nul');
  const v = tok.b === undefined ? decRat(num) : div(decRat(num), rat(BigInt(tok.b)));
  SEQ += 1;
  return { t: 'n', id: `t${SEQ}`, w, v, flip: false, merged: false };
}

export function parseChain(text) {
  const toks = tokenize(text);
  let p = 0;
  const group = () => {
    const items = [];
    for (;;) {
      const tk = toks[p];
      if (!tk) throw new Error('chaîne incomplète');
      let node;
      if (tk.k === 'num') { p += 1; node = makeTile(tk); }
      else if (tk.k === '(') {
        p += 1;
        const g = group();
        if (toks[p]?.k !== ')') throw new Error('parenthèse manquante');
        p += 1;
        if (toks[p]?.k === '@') {
          p += 1;
          if (toks[p]?.k !== '(') throw new Error('barre incomplète');
          p += 1;
          const b = group();
          if (toks[p]?.k !== ')') throw new Error('parenthèse manquante');
          p += 1;
          node = { t: 'b', top: g, bottom: b };
        } else node = g.items.length === 1 ? g.items[0] : { ...g, paren: true };
      } else throw new Error('nombre attendu');
      items.push(node);
      const nx = toks[p];
      if (nx?.k === 'op') { items.push(nx.v); p += 1; } else break;
    }
    return { t: 'g', items, paren: false };
  };
  const root = group();
  if (p !== toks.length) throw new Error('chaîne illisible');
  return root.items.length === 1 && root.items[0].t !== 'n' ? root.items[0] : root;
}

/** La valeur effective d'une tuile (son مقلوب si elle est retournée). Exception si 0 est retourné. */
export const tileValue = (n) => (n.flip ? div(1, n.v) : n.v);

/** Le signe du résultat d'une opération sur deux nombres p, q (rat ou texte) : −1, 0, 1. Pour ÷ : q ≠ 0. */
export function resultSign(op, p, q) {
  const a = rat_(p); const b = rat_(q);
  if (op === '+') return sign(add(a, b));
  if (op === '-') return sign(sub(a, b));
  if (op === '×') return sign(mul(a, b));
  if (b.n === 0n) throw new Error('division par 0');
  return sign(div(a, b));
}

const groupsOf = (node, path = []) => {
  if (node.t === 'g') {
    const kids = node.items.filter((_, i) => i % 2 === 0).flatMap((c, j) => groupsOf(c, [...path, j * 2]));
    return [...kids, { g: node, path }];
  }
  if (node.t === 'b') return [...groupsOf(node.top, [...path, 'top']), ...groupsOf(node.bottom, [...path, 'bottom']), { bar: node, path }];
  return [];
};

/** Tous les maillons (opérateurs) de la chaîne, du plus profond au plus haut : `{ id, path, i, op, bar?, left, right, ready }` ; `ready` = les deux voisins sont des tuiles. */
export function links(root) {
  const out = [];
  for (const e of groupsOf(root)) {
    if (e.g) {
      for (let i = 1; i < e.g.items.length; i += 2) {
        const l = e.g.items[i - 1]; const r = e.g.items[i + 1];
        out.push({ id: `${e.path.join('.') || 'r'}#${i}`, path: e.path, i, op: e.g.items[i], left: l, right: r, ready: l.t === 'n' && r.t === 'n', group: e.g });
      }
    } else {
      const top = e.bar.top.items.length === 1 ? e.bar.top.items[0] : null;
      const bot = e.bar.bottom.items.length === 1 ? e.bar.bottom.items[0] : null;
      out.push({ id: `${e.path.join('.') || 'r'}#bar`, path: e.path, i: -1, op: '÷', bar: e.bar, left: top, right: bot, ready: !!top && !!bot && top.t === 'n' && bot.t === 'n' });
    }
  }
  return out;
}

/** Le maillon peut-il être fusionné MAINTENANT ? `{ ok: true }` ou `{ ok: false, reason }` : 'bubble' (un voisin n'est pas encore une tuile), 'magnet' (un × ou ÷ voisin passe avant),
 *  'order' (de gauche à droite : le maillon précédent de même rang passe avant), 'noflip' (÷ : le diviseur n'est pas retourné). */
export function linkStatus(root, link) {
  if (!link.ready) return { ok: false, reason: 'bubble' };
  if (!link.bar) {
    const items = link.group.items;
    const prev = items[link.i - 2]; const next = items[link.i + 2];
    if (isMD(link.op)) { if (isMD(prev)) return { ok: false, reason: 'order' }; }
    else {
      if (isMD(prev) || isMD(next)) return { ok: false, reason: 'magnet' };
      if (prev === '+' || prev === '-') return { ok: false, reason: 'order' };
    }
  }
  if (link.op === '÷' && !link.right.flip) return { ok: false, reason: 'noflip' };
  return { ok: true };
}

/** Peut-on retourner cette tuile ? Seulement le DIVISEUR d'un ÷ (ou le bas d'une barre) ; `reason` : 'dividend' (le dividende), 'notdiv', 'zero'. */
export function flipStatus(root, id) {
  for (const l of links(root)) {
    if (l.op !== '÷') continue;
    if (l.right?.id === id) return l.right.v.n === 0n ? { ok: false, reason: 'zero' } : { ok: true, link: l };
    if (l.left?.id === id) return { ok: false, reason: 'dividend' };
  }
  return { ok: false, reason: 'notdiv' };
}

const mapNode = (node, fn) => {
  const r = fn(node);
  if (r !== undefined) return r;
  if (node.t === 'g') return { ...node, items: node.items.map((x, i) => (i % 2 ? x : mapNode(x, fn))) };
  if (node.t === 'b') return { ...node, top: mapNode(node.top, fn), bottom: mapNode(node.bottom, fn) };
  return node;
};
/** Retourne (ou remet) la tuile d'identifiant `id`. */
export function flipTile(root, id) {
  return mapNode(root, (n) => (n.t === 'n' ? (n.id === id ? { ...n, flip: !n.flip } : n) : undefined));
}
/** Le nœud d'identifiant `id`. */
export function findTile(root, id) {
  let hit = null;
  mapNode(root, (n) => { if (n.t === 'n' && n.id === id) hit = n; return undefined; });
  return hit;
}

const denOfTile = (n) => {
  if (!n.merged && !n.flip && n.w.includes('/')) return Number(n.w.split('/')[1]);
  return Number(tileValue(n).d);
};
const decText = (v) => {
  if (v.d === 1n) return String(v.n);
  if (!isDecimalRational(v)) return `${v.n}/${v.d}`;
  let k = 0n; let d = v.d;
  while (d !== 1n) { d = d / (d % 2n === 0n ? 2n : 5n); k += 1n; }
  const scaled = (abs(v.n) * 10n ** (k + 1n)) / v.d;       // assez de chiffres pour une fraction décimale finie
  let s = String(scaled);
  let digits = Number(k) + 1;
  while (s.length <= digits) s = `0${s}`;
  let frac = s.slice(-digits).replace(/0+$/, '');
  const int = s.slice(0, -digits);
  return `${v.n < 0n ? '-' : ''}${int}${frac ? `{,}${frac}` : ''}`;
};
const fixc = (t) => String(t).replace(',', '{,}');
/** LaTeX d'une tuile (écriture telle qu'elle est posée, signe devant). */
export function tileTex(n) {
  if (n.merged || n.flip) return ratTexSimple(tileValue(n));
  const [a, b] = n.w.split('/');
  const neg = a.startsWith('-');
  const ab = neg ? a.slice(1) : a;
  return b === undefined ? `${neg ? '-' : ''}${fixc(ab)}` : `${neg ? '-' : ''}\\frac{${fixc(ab)}}{${b}}`;
}
function ratTexSimple(v) { return v.d === 1n ? String(v.n) : `${v.n < 0n ? '-' : ''}\\frac{${abs(v.n)}}{${v.d}}`; }
export { ratTexSimple as ratTexStd };
const wrapNeg = (tex) => (tex.startsWith('-') ? `\\left(${tex}\\right)` : tex);

/** L'étape d'une fusion (sans la faire) : `{ op, left, right, result, sign, den?, trail }` ; `den` = le plus petit multiple commun des dénominateurs pour + et −. */
export function stepOf(link) {
  const l = link.left; const r = link.right;
  const a = tileValue(l);
  const flipped = link.op === '÷';
  const b = flipped ? r.v : tileValue(r);                      // pour ÷ : le diviseur ORIGINAL ; le retournement a été fait par l'élève
  let result; let den = null; let trail;
  const lt = tileTex(l); const rt = flipped ? ratTexSimple(r.v) : tileTex(r);
  if (link.op === '+' || link.op === '-') {
    result = link.op === '+' ? add(a, b) : sub(a, b);
    den = Number(lcm(denOfTile(l), denOfTile(r)));
    const na = mul(a, rat(BigInt(den))); const nb = mul(b, rat(BigInt(den)));
    const f = (x) => `\\frac{${decText(x)}}{${den}}`;
    trail = `${f(na)}${link.op === '+' ? '+' : '-'}${nb.n < 0n && link.op === '-' ? `\\left(${f(nb)}\\right)` : f(nb)}=${ratTexSimple(result)}`;
  } else if (link.op === '×') {
    result = mul(a, b);
    trail = `${wrapNeg(lt)}\\times${wrapNeg(rt)}=${ratTexSimple(result)}`;
  } else {
    if (b.n === 0n) throw new Error('division par 0');
    result = div(a, b);
    trail = `${wrapNeg(lt)}\\times${wrapNeg(ratTexSimple(div(1, b)))}=${ratTexSimple(result)}`;
  }
  return Object.freeze({ op: link.op, left: l, right: r, a, b, result, sign: sign(result), den, trail });
}

let MERGE_SEQ = 0;
/** Fusionne un maillon (qui doit être `ok`) : `{ root, step }`. La tuile résultat porte l'écriture réduite à dénominateur positif ; une bulle ou une barre résolue s'efface. */
export function mergeLink(root, link) {
  const st = linkStatus(root, link);
  if (!st.ok) throw new Error(`fusion refusée : ${st.reason}`);
  const step = stepOf(link);
  MERGE_SEQ += 1;
  const tile = { t: 'n', id: `m${MERGE_SEQ}`, w: ratText(step.result), v: step.result, flip: false, merged: true };
  const next = mapNode(root, (n) => {
    if (n === link.bar) return tile;
    if (n === link.group) {
      const items = [...n.items];
      items.splice(link.i - 1, 3, tile);
      if (items.length === 1 && n.paren) return tile;
      return { ...n, items };
    }
    return undefined;
  });
  return { root: collapse(next), step };
}
// une bulle ou une barre dont il ne reste qu'une tuile devient cette tuile
function collapse(node) {
  if (node.t === 'g') {
    const items = node.items.map((x, i) => (i % 2 ? x : collapse(x)));
    return items.length === 1 && node.paren ? items[0] : { ...node, items };
  }
  if (node.t === 'b') {
    const top = collapse(node.top); const bottom = collapse(node.bottom);
    return { ...node, top, bottom };
  }
  return node;
}

/** Le prochain maillon à fusionner dans l'ordre des priorités (bulle la plus profonde d'abord, × ÷ de gauche à droite, puis + −), ou null. */
export function nextLink(root) {
  const all = links(root);
  const pick = (pred) => all.find((l) => l.ready && pred(l) && (linkStatus(root, { ...l, right: l.right && l.op === '÷' ? { ...l.right, flip: true } : l.right }).ok));
  return pick((l) => l.bar || isMD(l.op)) ?? pick((l) => !l.bar && !isMD(l.op)) ?? null;
}

/** Le nombre de tuiles restantes (1 = fini). */
export function tileCount(root) {
  let c = 0; mapNode(root, (n) => { if (n.t === 'n') c += 1; return undefined; }); return c;
}

/** Évalue une chaîne dans l'ordre des priorités : `{ value, steps[] }` (chaque étape : `stepOf` + `flipped`). Exception si une division par 0. */
export function evaluateChain(text) {
  let root = typeof text === 'string' ? parseChain(text) : text;
  const steps = [];
  for (let guard = 0; guard < 64 && tileCount(root) > 1; guard += 1) {
    const l = nextLink(root);
    if (!l) throw new Error('chaîne bloquée');
    if (l.op === '÷') {
      if (l.right.v.n === 0n) throw new Error('division par 0');
      root = flipTile(root, l.right.id);
    }
    const cur = links(root).find((x) => x.id === l.id);
    const { root: next, step } = mergeLink(root, cur);
    steps.push({ ...step, flipped: l.op === '÷' });
    root = next;
  }
  const only = findFirstTile(root);
  return { value: tileValue(only), steps, root };
}
const findFirstTile = (root) => { let t = null; mapNode(root, (n) => { if (n.t === 'n' && !t) t = n; return undefined; }); return t; };

/** Le plus grand |valeur| rencontré (tuiles et résultats), au moins 1 : l'échelle des barres signées. */
export function chainScale(text) {
  const start = parseChain(text);
  let m = 1;
  const upd = (v) => { const x = Number(abs(v.n)) / Number(v.d); if (x > m) m = x; };
  mapNode(start, (n) => { if (n.t === 'n') upd(n.v); return undefined; });
  try {
    const { steps, root } = evaluateChain(text);
    steps.forEach((s) => upd(s.result));
    upd(findFirstTile(root).v);
  } catch { /* division par 0 : l'échelle des tuiles seules */ }
  return Math.min(m, 8);
}

/**
 * Les OPÉRATIONS sur les nombres relatifs (3AM, unité 1 « الأعداد النسبية », درس « جداء عددين نسبيين », 2026-10-26) —
 * arithmétique EXACTE (rationnels BigInt de `powers.js`, importés, jamais réécrits), sans virgule flottante. Module GRANDI
 * leçon par leçon (docs/sources/3am/unit1/plan/README.md) ; cette leçon (L1) ajoute : `parseRel`, `relText`, `relTex`,
 * `distance`, `productSign`, `times`, `repeatedSum`, `distributeCheck`. La leçon 2 ajoute `product`, `negativesIn`, `signByParity`, `opposite`, `square`, `factorize` ; la leçon 3 (`qismat-nisbiyayn`) ajoute `divide`, `missingFactor`, `quotientSign`, `sameValue`, `writingsOf` et `evaluate` (priorités, parenthèses, moins unaire, avec ses étapes). `relative.js` (2AM, centièmes) n'est PAS étendu :
 * son unité est le centième, et un produit de deux centièmes demande des dix-millièmes.
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/relativeOps.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */
import * as P from './powers.js';

/** Normalise un rationnel, un entier, un texte (powers.js n'exporte pas son `R`). */
const N = (x) => P.add(x, 0);

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** « −2,5 », « -2.5 », chiffres arabes-indiens, « 3/4 » → rationnel. Lève une erreur si illisible. */
export function parseRel(text) {
  const s = String(text)
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[٫،]/g, ',')
    .replace(/[−–—]/g, '-');
  return P.parseRat(s);
}

/** Le dénominateur est de la forme 2ᵃ5ᵇ : le nombre s'écrit avec un nombre fini de décimales. */
export function isFiniteDecimal(r) {
  let d = N(r).d;
  while (d % 2n === 0n) d /= 2n;
  while (d % 5n === 0n) d /= 5n;
  return d === 1n;
}

function decimalDigits(r) {
  const { n, d } = N(r);
  const a = n < 0n ? -n : n;
  let k = 0;
  let scale = 1n;
  while ((a * scale) % d !== 0n) { scale *= 10n; k += 1; }
  const whole = (a * scale) / d;
  let s = String(whole).padStart(k + 1, '0');
  if (k > 0) s = `${s.slice(0, -k)},${s.slice(-k)}`;
  return s;
}

/** Texte d'affichage : virgule décimale et vrai signe moins (« −2,5 », « 12 ») ; « −1/3 » si non décimal. */
export function relText(r) {
  const p = N(r);
  const neg = p.n < 0n;
  const body = isFiniteDecimal(p) ? decimalDigits(p) : `${neg ? -p.n : p.n}/${p.d}`;
  return `${neg ? '−' : ''}${body}`;
}

/** LaTeX : « -2{,}5 », « 12 », « -\frac{1}{3} ». */
export function relTex(r) {
  const p = N(r);
  if (isFiniteDecimal(p)) return `${p.n < 0n ? '-' : ''}${decimalDigits(p).replace(',', '{,}')}`;
  return P.ratTex(p);
}

/** La distance à zéro (valeur absolue). */
export const distance = (a) => (P.sign(a) < 0 ? P.neg(a) : N(a));

/** −1 (signes différents), 1 (même signe), 0 (un facteur nul). */
export const productSign = (a, b) => (P.sign(a) * P.sign(b)) || 0;

/** Le produit exact. */
export const times = (a, b) => P.mul(a, b);

/**
 * La somme répétée a + a + … + a (n termes, n entier naturel ≥ 1) : la liste des sommes partielles. Le sens du produit a × n
 * pour n naturel ; le dernier terme est a × n.
 */
export function repeatedSum(a, n) {
  const k = Number(n);
  if (!Number.isInteger(k) || k < 1) throw new Error('n doit être un entier naturel non nul');
  const out = [];
  let acc = P.rat(0);
  for (let i = 0; i < k; i += 1) { acc = P.add(acc, a); out.push(acc); }
  return out;
}

/** L'argument de la règle des signes : k × b + k × (−b) = k × (b + (−b)) = k × 0 = 0. */
export function distributeCheck(k, b) {
  return { left: P.add(P.mul(k, b), P.mul(k, P.neg(b))), right: P.mul(k, 0) };
}

/* ── Leçon 2 « جداء عدة أعداد نسبية » (jidaa-ida-nisbiya, 2026-10-26) ─────────────────────────────────────────────── */

/** Un facteur peut être un rationnel, un entier ou un texte (« −0,5 »). */
const asRat = (x) => (typeof x === 'string' ? parseRel(x) : N(x));

/** Le produit exact d'une liste de facteurs (1 pour la liste vide). */
export function product(list) {
  return list.reduce((acc, x) => P.mul(acc, asRat(x)), P.rat(1));
}

/** Le nombre de facteurs strictement négatifs. */
export const negativesIn = (list) => list.filter((x) => P.sign(asRat(x)) < 0).length;

/** −1 si le nombre de facteurs négatifs est impair, 1 s'il est pair, 0 si un facteur est nul (le produit est nul). */
export function signByParity(list) {
  if (list.some((x) => P.sign(asRat(x)) === 0)) return 0;
  return negativesIn(list) % 2 === 1 ? -1 : 1;
}

/** Le nombre opposé (le symétrique par rapport à 0) : (−1) × a. */
export const opposite = (a) => P.mul(P.rat(-1), asRat(a));

/** Le carré a × a : jamais négatif. */
export const square = (a) => P.mul(asRat(a), asRat(a));

/** Les deux membres de k × a ± k × b = k × (a ± b) (op = '+' ou '-'). */
export function factorize(k, a, b, op = '+') {
  const [K, A, B] = [asRat(k), asRat(a), asRat(b)];
  const inner = op === '-' ? P.sub(A, B) : P.add(A, B);
  const split = op === '-' ? P.sub(P.mul(K, A), P.mul(K, B)) : P.add(P.mul(K, A), P.mul(K, B));
  return { split, factored: P.mul(K, inner) };
}

/* ── Leçon 3 « حاصل قسمة عددين نسبيين » (qismat-nisbiyayn, 2026-10-26) ─────────────────────────────────────────────── */

/** Le quotient exact a ÷ b ; lève une erreur si b = 0 (aucun q ne vérifie 0 × q = a ≠ 0). */
export function divide(a, b) {
  const B = asRat(b);
  if (P.sign(B) === 0) throw new Error('division par 0');
  return P.div(asRat(a), B);
}

/** Le facteur manquant q de b × q = a (b ≠ 0) : c'est le quotient a ÷ b. */
export const missingFactor = (b, a) => divide(a, b);

/** Le signe du quotient : −1 (signes différents), 1 (même signe), 0 (dividende nul) ; lève une erreur si b = 0. */
export function quotientSign(a, b) {
  if (P.sign(asRat(b)) === 0) throw new Error('division par 0');
  return productSign(asRat(a), asRat(b));
}

/** Deux écritures (texte ou rationnel) valent le même nombre. */
export const sameValue = (x, y) => P.eq(asRat(x), asRat(y));

/**
 * Les trois écritures du MÊME nombre : (−a)/b, a/(−b) et −(a/b). Chacune : { text, value } (valeur exacte du quotient écrit).
 * `a` peut être négatif : les trois valent toujours a ÷ b ... au signe près de l'écriture, d'où la valeur recalculée.
 */
export function writingsOf(a, b) {
  const [A, B] = [asRat(a), asRat(b)];
  const t = (x) => relText(x);
  return [
    { text: `${t(P.neg(A))}/${t(B)}`, value: divide(P.neg(A), B) },
    { text: `${t(A)}/${t(P.neg(B))}`, value: divide(A, P.neg(B)) },
    { text: `−(${t(A)}/${t(B)})`, value: P.neg(divide(A, B)) },
  ];
}

/* ── evaluate : une série de calculs avec les priorités (parenthèses → × ÷ → + −), et ses étapes ──────────────────────── */

const OPS = { '+': '+', '-': '−', '−': '−', '×': '×', '*': '×', '÷': '÷', '/': '÷', ':': '÷' };

function tokenize(text) {
  const s = String(text).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace(/[٫،]/g, ',').replace(/\s+/g, '');
  const out = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9,.]/.test(s[j])) j += 1;
      out.push({ t: 'num', v: parseRel(s.slice(i, j)) });
      i = j;
    } else if (c === '(' || c === ')') { out.push({ t: c }); i += 1; } else if (OPS[c]) { out.push({ t: 'op', o: OPS[c] }); i += 1; } else throw new Error(`caractère inattendu « ${c} »`);
  }
  return out;
}

/** Unary minus / plus folded into the number (« −5 » → num) ; before a bracket it stays a `neg` token. */
function normalize(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const tk = tokens[i];
    const prev = out[out.length - 1];
    const unary = tk.t === 'op' && (tk.o === '−' || tk.o === '+') && (!prev || prev.t === '(' || prev.t === 'op');
    if (!unary) { out.push(tk); continue; }
    const next = tokens[i + 1];
    if (next && next.t === 'num') { out.push({ t: 'num', v: tk.o === '−' ? P.neg(next.v) : next.v, wrapped: tk.o === '−' }); i += 1; } else if (next && next.t === '(') { if (tk.o === '−') out.push({ t: 'neg' }); } else throw new Error('signe inattendu');
  }
  // « ( nombre ) » : le nombre signé écrit entre parenthèses est un seul nombre
  const res = [];
  for (let i = 0; i < out.length; i += 1) {
    if (out[i].t === '(' && out[i + 1]?.t === 'num' && out[i + 2]?.t === ')') { res.push({ ...out[i + 1], wrapped: true }); i += 2; } else res.push(out[i]);
  }
  return res;
}

function show(tokens) {
  const parts = [];
  tokens.forEach((tk, i) => {
    if (tk.t === 'num') {
      const neg = P.sign(tk.v) < 0;
      const afterOp = i > 0 && (tokens[i - 1].t === 'op');
      parts.push(neg && afterOp ? `(${relText(tk.v)})` : relText(tk.v));
    } else if (tk.t === 'op') parts.push(tk.o);
    else if (tk.t === 'neg') parts.push('−');
    else parts.push(tk.t);
  });
  return parts.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
}

function reduceFlat(seg) {
  let k = seg.findIndex((tk) => tk.t === 'op' && (tk.o === '×' || tk.o === '÷'));
  if (k < 0) k = seg.findIndex((tk) => tk.t === 'op');
  if (k < 1 || seg[k - 1].t !== 'num' || seg[k + 1]?.t !== 'num') throw new Error('expression mal formée');
  const [x, y, o] = [seg[k - 1].v, seg[k + 1].v, seg[k].o];
  const v = o === '×' ? P.mul(x, y) : o === '÷' ? divide(x, y) : o === '+' ? P.add(x, y) : P.sub(x, y);
  return [...seg.slice(0, k - 1), { t: 'num', v }, ...seg.slice(k + 2)];
}

/**
 * evaluate('5 − (3 × (−4) + 7)') → { value, steps } : `steps` = l'expression après chaque calcul (parenthèses les plus intérieures d'abord,
 * puis × et ÷ de gauche à droite, puis + et −), la première étant l'expression écrite. Lève une erreur sur une division par 0.
 */
export function evaluate(exprText) {
  let tokens = normalize(tokenize(exprText));
  const steps = [show(tokens)];
  for (let guard = 0; guard < 200; guard += 1) {
    if (tokens.length === 1 && tokens[0].t === 'num') return { value: tokens[0].v, steps };
    const close = tokens.findIndex((tk) => tk.t === ')');
    if (close >= 0) {
      let open = close;
      while (open >= 0 && tokens[open].t !== '(') open -= 1;
      if (open < 0) throw new Error('parenthèse fermante seule');
      const inner = tokens.slice(open + 1, close);
      const neg = tokens[open - 1]?.t === 'neg' ? 1 : 0;
      if (inner.length === 1 && inner[0].t === 'num') {
        const v = neg ? P.neg(inner[0].v) : inner[0].v;
        tokens = [...tokens.slice(0, open - neg), { t: 'num', v }, ...tokens.slice(close + 1)];
      } else {
        const red = reduceFlat(inner);
        // le contenu est devenu un seul nombre : la parenthèse se referme dans la même étape (−(…) devient l'opposé)
        if (red.length === 1) tokens = [...tokens.slice(0, open - neg), { t: 'num', v: neg ? P.neg(red[0].v) : red[0].v }, ...tokens.slice(close + 1)];
        else tokens = [...tokens.slice(0, open + 1), ...red, ...tokens.slice(close)];
      }
    } else tokens = reduceFlat(tokens);
    steps.push(show(tokens));
  }
  throw new Error('trop d’étapes');
}

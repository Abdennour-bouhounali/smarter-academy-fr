/**
 * chainOps — les SÉRIES D'OPÉRATIONS de 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » (2026-10-28). Importé PAR CHEMIN
 * (`@smarter-academy/core/arithmetic/chainOps.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4). Construit sur `powers.js` (rationnels exacts, aucun
 * flottant) et `relativeOps.js` (`parseRel`, `relText`) ; ne réécrit ni l'un ni l'autre. `relativeOps.evaluate` (3AM) sert de contre-épreuve dans le test.
 *
 * Grandit leçon par leçon (docs/sources/2am/unit1/plan/README.md « Shared maths module ») :
 *   L1 (silsila-bidun-aqwas, ICI)  tokenize · parseChain · evaluateChain · traceChain · operatorsOf · valueInOrder · conventionalOrder · chainText · isNonNegativeChain
 *   L2 (silsila-bi-aqwas)           parenthèses, crochets, barre de fraction, calculatrice
 *   L3 (wasf-silsila-hisab)         analyse positionnée · lastOperation · operands · chainName · describe · cutAt · staplesOf · build · sameStructure
 *   L4 (tawzi-darb-jam-tarh)        distributivité : expand · factorOut · commonFactor · mentalSplits · expandLetter
 *
 * LA CONVENTION (un accord, pas un théorème) : sans parenthèses, × et ÷ avant + et −, et à priorité égale de GAUCHE à DROITE.
 * Aucune parenthèse, aucun crochet, aucune barre de fraction, aucun littéral négatif (les relatifs sont l'unité 3 de 2AM) : `tokenize` les refuse.
 */
import * as P from './powers.js';
import { relText, parseRel } from './relativeOps.js';

const OPS = Object.freeze({ '+': '+', '−': '−', '×': '×', '÷': '÷' });
const PRIORITY = Object.freeze({ '+': 1, '−': 1, '×': 2, '÷': 2 });
const ALIAS = Object.freeze({ '-': '−', '–': '−', '—': '−', '*': '×', x: '×', X: '×', '·': '×', '/': '÷', ':': '÷' });
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const latin = (s) => String(s).replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d))).replace(/٫/g, ',').replace(/‎|‏|⁦|⁧|⁩/g, '');

/**
 * « 26 − 9 + 4 » → [{ t:'num', v, text }, { t:'op', o }, …]. Chiffres arabes ou latins, virgule décimale, alias ASCII (- * x / :). Refuse : un littéral négatif
 * (un signe là où un nombre est attendu), toute parenthèse / crochet / barre, un nombre ou un opérateur manquant.
 */
export function tokenize(text) {
  const s = latin(text).replace(/\s+/g, '');
  if (!s) throw new Error('chaîne vide');
  if (/[()[\]{}]/.test(s)) throw new Error('parenthèse : hors du périmètre de cette leçon');
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const m = /^\d+(?:[,.]\d+)?/.exec(s.slice(i));
    if (m) {
      if (tokens.length && tokens.at(-1).t === 'num') throw new Error('deux nombres de suite');
      tokens.push({ t: 'num', v: parseRel(m[0]), text: m[0].replace('.', ',') });
      i += m[0].length;
    } else {
      const o = ALIAS[ch] ?? ch;
      if (!OPS[o]) throw new Error(`symbole inconnu : ${ch}`);
      if (!tokens.length || tokens.at(-1).t === 'op') throw new Error('opérateur sans nombre à gauche (les nombres négatifs ne sont pas de cette unité)');
      tokens.push({ t: 'op', o });
      i += 1;
    }
  }
  if (tokens.at(-1).t === 'op') throw new Error('opérateur sans nombre à droite');
  return tokens;
}

/** L'arbre de la chaîne avec les priorités (× ÷ avant + −, gauche à droite à priorité égale) : `{ t:'num', v, text }` | `{ t:'op', o, l, r }`. */
export function parseChain(text) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  let pos = 0;
  const level = (prio) => {
    let left = prio === 2 ? { t: 'num', v: tokens[pos].v, text: tokens[pos++].text } : level(2);
    while (pos < tokens.length && tokens[pos].t === 'op' && PRIORITY[tokens[pos].o] === prio) {
      const o = tokens[pos++].o;
      const right = prio === 2 ? { t: 'num', v: tokens[pos].v, text: tokens[pos++].text } : level(2);
      left = { t: 'op', o, l: left, r: right };
    }
    return left;
  };
  return level(1);
}

const apply = (o, a, b) => {
  if (o === '+') return P.add(a, b);
  if (o === '−') return P.sub(a, b);
  if (o === '×') return P.mul(a, b);
  if (P.isZero(b)) throw new Error('division par 0');
  return P.div(a, b);
};

/** La valeur exacte (rationnel de `powers.js`) d'un arbre ou d'un texte. */
export function evaluateChain(treeOrText) {
  const tree = typeof treeOrText === 'string' ? parseChain(treeOrText) : treeOrText;
  if (tree.t === 'num') return tree.v;
  return apply(tree.o, evaluateChain(tree.l), evaluateChain(tree.r));
}

/** Un rationnel écrit pour l'élève : virgule décimale, fraction « n/d » si non décimal. */
export const numText = (v) => relText(v);

/** Le texte d'un arbre (sans parenthèses : seulement des chaînes lues dans l'ordre de l'arbre CONVENTIONNEL). */
export function chainText(tree) {
  if (tree.t === 'num') return tree.text ?? numText(tree.v);
  return `${chainText(tree.l)} ${tree.o} ${chainText(tree.r)}`;
}

/** Les puces d'opérateur d'une chaîne : `[{ index, o, left, right }]` (left / right = les nombres voisins, par position). */
export function operatorsOf(text) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  const out = [];
  tokens.forEach((tk, k) => { if (tk.t === 'op') out.push({ index: out.length, o: tk.o, left: (k - 1) / 2, right: (k + 1) / 2 }); });
  return out;
}

export const numbersOf = (text) => (typeof text === 'string' ? tokenize(text) : text).filter((tk) => tk.t === 'num');

/** L'ordre conventionnel : les × ÷ de gauche à droite, puis les + − de gauche à droite — une permutation des indices d'opérateurs. */
export function conventionalOrder(text) {
  const ops = operatorsOf(text);
  return [...ops.filter((p) => PRIORITY[p.o] === 2), ...ops.filter((p) => PRIORITY[p.o] === 1)].map((p) => p.index);
}

const isPermutation = (order, n) => Array.isArray(order) && order.length === n && new Set(order).size === n && order.every((k) => Number.isInteger(k) && k >= 0 && k < n);

/**
 * La chaîne calculée dans un ORDRE CHOISI (le plan de l'élève, lab `tram-route`) : `order[k]` = l'indice de l'opérateur qu'on fait à la k-ième étape.
 * Chaque opération prend le bloc de gauche et le bloc de droite de SON opérateur au moment où on la fait (un bloc déjà calculé compte comme un nombre).
 * → `{ value, steps: [{ k, index, o, left, right, value, negative }], lines, conventional, matches }` ; `lines` : la chaîne après chaque étape, blocs réduits à
 * leur valeur (« 26 − 13 ») ; `negative` : un résultat < 0 (hors périmètre de la leçon) ; `matches` : même valeur que l'ordre conventionnel.
 */
export function valueInOrder(text, order) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  const ops = operatorsOf(tokens);
  if (!isPermutation(order, ops.length)) throw new Error('ordre invalide');
  const nums = numbersOf(tokens).map((tk) => tk.v);
  const parent = nums.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const block = nums.map((v) => v);
  const span = nums.map((_, i) => [i, i]);   // les nombres (positions) que couvre chaque bloc : [premier, dernier]
  const done = new Set();
  const render = () => {
    const parts = [];
    nums.forEach((_, i) => {
      if (find(i) === i) {
        if (parts.length) { const gap = ops.find((p) => p.right === i && !done.has(p.index)); parts.push(gap ? gap.o : '·'); }
        parts.push(numText(block[i]));
      }
    });
    return parts.join(' ');
  };
  const steps = [];
  const lines = [render()];
  order.forEach((idx, k) => {
    const p = ops[idx];
    const a = find(p.left); const b = find(p.right);
    const v = apply(p.o, block[a], block[b]);
    const step = { k, index: idx, o: p.o, leftValue: block[a], rightValue: block[b], leftSpan: span[a], rightSpan: span[b], value: v, negative: P.sign(v) < 0 };
    parent[b] = a; block[a] = v; span[a] = [span[a][0], span[b][1]]; done.add(idx);
    steps.push(step);
    lines.push(render());
  });
  const value = block[find(0)];
  const conv = conventionalOrder(tokens);
  return { value, steps, lines, conventional: order.every((x, k) => x === conv[k]), matches: P.eq(value, evaluateChain(parseChain(tokens))) };
}

/**
 * Les lignes d'un calcul écrit dans l'ordre conventionnel (une opération par ligne, ou — `grouped` — tous les × ÷ d'un niveau sur une ligne, la manière du
 * cahier) : « 15 + 3 × 4 » → ['15 + 3 × 4', '15 + 12', '27'].
 */
export function traceChain(text, { grouped = false } = {}) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  const ops = operatorsOf(tokens);
  const conv = conventionalOrder(tokens);
  const first = tokens.map((tk) => (tk.t === 'num' ? tk.text ?? numText(tk.v) : tk.o)).join(' ');
  const { lines } = valueInOrder(tokens, conv);
  const all = [first, ...lines.slice(1)];
  if (!grouped) return all;
  // regrouper : toutes les opérations de même priorité consécutives dans l'ordre conventionnel tombent sur une ligne
  const out = [first];
  let k = 0;
  while (k < conv.length) {
    const prio = PRIORITY[ops[conv[k]].o];
    let j = k;
    while (j + 1 < conv.length && PRIORITY[ops[conv[j + 1]].o] === prio) j += 1;
    out.push(lines[j + 1]);
    k = j + 1;
  }
  return out.filter((l, i) => i === 0 || l !== out[i - 1]);
}

/** Tous les résultats intermédiaires de l'ordre conventionnel sont-ils ≥ 0 ? (la garde de 2AM tant que les relatifs ne sont pas enseignés) */
export function isNonNegativeChain(text) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  const { steps } = valueInOrder(tokens, conventionalOrder(tokens));
  return steps.every((s) => !s.negative);
}

/**
 * La première étape d'un plan qui QUITTE l'arbre conventionnel : l'opération est faite sur d'autres blocs que ceux que la convention lui donne
 * (ex. 9 + 4 avant de retrancher 9 dans « 26 − 9 + 4 »). `null` si toutes les étapes sont sur l'arbre (le plan donne alors la valeur conventionnelle).
 */
export function offTreeStep(text, order) {
  const tokens = typeof text === 'string' ? tokenize(text) : text;
  const conv = valueInOrder(tokens, conventionalOrder(tokens)).steps;
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  return valueInOrder(tokens, order).steps.find((s) => {
    const c = conv.find((x) => x.index === s.index);
    return !same(c.leftSpan, s.leftSpan) || !same(c.rightSpan, s.rightSpan);
  }) ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * L2 (silsila-bi-aqwas, 2026-10-29) — LES PARENTHÈSES, LES CROCHETS, LA BARRE DE FRACTION ET LA CALCULATRICE.
 *   tokenizeB · parseB · evaluateB · bracketPairs · bracketDepths · uselessBrackets · bracketForm · barToLine · lineToBar · calculatorRead · calcDisplay ·
 *   leftToRight · calculatorKeys
 * Les fonctions de L1 ci-dessus refusent toujours les parenthèses (`tokenize`) : celles-ci sont un autre étage, qui réutilise `numText` et le même évaluateur exact.
 * La LECTURE de la calculatrice (`calculatorRead`) est celle d'une calculatrice scientifique : priorités, parenthèses, « Syntax ERROR » si elles ne s'équilibrent pas,
 * « Math ERROR » pour une division par 0 ; un résultat négatif est AFFICHÉ tel quel (jamais enseigné : 2AM n'a pas encore les relatifs).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const OPEN = new Set(['(', '[']);
const CLOSE = new Set([')', ']']);

/** « (45 + 15) ÷ 4 » → jetons `{ t:'num'|'op'|'open'|'close' }` ; `[ ]` valent `( )` ; erreurs : symbole inconnu, deux nombres de suite. Les contrôles de syntaxe sont dans `parseB`. */
export function tokenizeB(text) {
  const s = latin(text).replace(/\s+/g, '');
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const m = /^\d+(?:[,.]\d+)?/.exec(s.slice(i));
    if (m) {
      tokens.push({ t: 'num', v: parseRel(m[0]), text: m[0].replace('.', ',') });
      i += m[0].length;
    } else if (OPEN.has(ch)) { tokens.push({ t: 'open', ch }); i += 1; }
    else if (CLOSE.has(ch)) { tokens.push({ t: 'close', ch }); i += 1; }
    else {
      const o = ALIAS[ch] ?? ch;
      if (!OPS[o]) throw new Error(`symbole inconnu : ${ch}`);
      tokens.push({ t: 'op', o });
      i += 1;
    }
  }
  return tokens;
}

/** Les paires de parenthèses d'une liste de jetons : `[{ open, close, depth }]` (indices de jetons ; depth 1 = la plus extérieure). Lève `syntax` si elles ne s'équilibrent pas. */
function bracketPairs(tokens) {
  const stack = [];
  const pairs = [];
  tokens.forEach((tk, i) => {
    if (tk.t === 'open') stack.push(i);
    else if (tk.t === 'close') {
      if (!stack.length) throw new Error('syntax');
      const open = stack.pop();
      pairs.push({ open, close: i, depth: stack.length + 1 });
    }
  });
  if (stack.length) throw new Error('syntax');
  return pairs.sort((a, b) => a.open - b.open);
}

/** La profondeur de parenthèses sous chaque jeton (0 = hors parenthèses ; un jeton `open` compte déjà dans sa propre paire). Tolère un mot non équilibré. */
export function bracketDepths(tokens) {
  let d = 0;
  return tokens.map((tk) => {
    if (tk.t === 'open') { d += 1; return d; }
    if (tk.t === 'close') { const x = d; d = Math.max(0, d - 1); return x; }
    return d;
  });
}

/** L'arbre avec priorités ET parenthèses : `{ t:'num' }` | `{ t:'op', o, l, r }` | `{ t:'group', e }`. `throw new Error('syntax')` si le mot n'est pas une expression. */
function parseB(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let pos = 0;
  const factor = () => {
    const tk = tokens[pos];
    if (!tk) throw new Error('syntax');
    if (tk.t === 'num') { pos += 1; return { t: 'num', v: tk.v, text: tk.text }; }
    if (tk.t === 'open') {
      pos += 1;
      const e = expr();
      if (!tokens[pos] || tokens[pos].t !== 'close') throw new Error('syntax');
      pos += 1;
      return { t: 'group', e };
    }
    throw new Error('syntax');
  };
  const term = () => {
    let left = factor();
    while (tokens[pos]?.t === 'op' && PRIORITY[tokens[pos].o] === 2) { const o = tokens[pos].o; pos += 1; left = { t: 'op', o, l: left, r: factor() }; }
    return left;
  };
  const expr = () => {
    let left = term();
    while (tokens[pos]?.t === 'op' && PRIORITY[tokens[pos].o] === 1) { const o = tokens[pos].o; pos += 1; left = { t: 'op', o, l: left, r: term() }; }
    return left;
  };
  if (!tokens.length) throw new Error('syntax');
  const tree = expr();
  if (pos !== tokens.length) throw new Error('syntax');
  return tree;
}

/** La valeur exacte (rationnel de `powers.js`) d'un mot avec parenthèses. */
export function evaluateB(treeOrText) {
  const tree = typeof treeOrText === 'string' ? parseB(treeOrText) : treeOrText;
  if (tree.t === 'num') return tree.v;
  if (tree.t === 'group') return evaluateB(tree.e);
  return apply(tree.o, evaluateB(tree.l), evaluateB(tree.r));
}

/** La forme d'un arbre SANS ses parenthèses (une chaîne canonique) : deux mots ont la même forme si les parenthèses n'y changent rien à l'ordre du calcul. */
const shapeOf = (tree) => {
  if (tree.t === 'num') return tree.text;
  if (tree.t === 'group') return shapeOf(tree.e);
  return `(${shapeOf(tree.l)}${tree.o}${shapeOf(tree.r)})`;
};

/**
 * Les paires INUTILES d'un mot : celles dont la suppression laisse le MÊME arbre de calcul (les parenthèses répètent ce que la priorité fait déjà, ex. 9 + (2 × 5),
 * ou entourent un nombre seul, ou toute l'expression). `[{ open, close, depth }]` ; `[]` si le mot n'est pas une expression.
 */
export function uselessBrackets(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let base;
  let pairs;
  try { base = shapeOf(parseB(tokens)); pairs = bracketPairs(tokens); } catch { return []; }
  return pairs.filter((p) => {
    const rest = tokens.filter((_, i) => i !== p.open && i !== p.close);
    try { return shapeOf(parseB(rest)) === base; } catch { return false; }
  });
}

const tokenText = (tk) => (tk.t === 'num' ? tk.text : tk.t === 'op' ? tk.o : tk.ch);

/** Le mot écrit avec ses parenthèses EXTÉRIEURES en crochets : une paire qui en contient une autre s'écrit [ ] (« 2 × [50 − (12 + 8)] »). */
export function bracketForm(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let pairs;
  try { pairs = bracketPairs(tokens); } catch { return tokens.map(tokenText).join(' '); }
  const outer = new Set();
  pairs.forEach((p) => { if (pairs.some((q) => q.open > p.open && q.close < p.close)) { outer.add(p.open); outer.add(p.close); } });
  return tokens.map((tk, i) => (outer.has(i) ? (tk.t === 'open' ? '[' : ']') : tokenText(tk))).join(' ');
}

/** La barre de fraction écrite sans barre : `(num) ÷ (den)`. Les parenthèses sont ajoutées autour de chaque côté qui n'est pas un nombre seul. */
export function barToLine(num, den) {
  const wrap = (x) => (/^\s*\d+(?:[,.]\d+)?\s*$/.test(x) ? String(x).trim() : `(${String(x).trim()})`);
  return `${wrap(num)} ÷ ${wrap(den)}`;
}

/** Le chemin inverse : `(A) ÷ (B)` (ou `n ÷ (B)`, `(A) ÷ n`) → `{ num, den }`, sinon `null` (l'opération du sommet n'est pas une division de deux blocs). */
export function lineToBar(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let tree;
  try { tree = parseB(tokens); } catch { return null; }
  if (tree.t !== 'op' || tree.o !== '÷') return null;
  const inner = (t) => (t.t === 'group' ? t.e : t);
  const show = (t) => bracketFormTree(inner(t));
  return { num: show(tree.l), den: show(tree.r) };
}
function bracketFormTree(tree) {
  if (tree.t === 'num') return tree.text;
  if (tree.t === 'group') return `(${bracketFormTree(tree.e)})`;
  return `${bracketFormTree(tree.l)} ${tree.o} ${bracketFormTree(tree.r)}`;
}

/** L'affichage d'une calculatrice : jusqu'à 8 décimales (arrondi), zéros inutiles retirés, virgule décimale, signe « − » pour un négatif. */
export function calcDisplay(v) {
  const neg = P.sign(v) < 0;
  const a = neg ? P.neg(v) : v;
  const n = BigInt(a.n); const d = BigInt(a.d);
  const scale = 10n ** 8n;
  const q = (n * scale * 2n + d) / (d * 2n);   // arrondi
  const int = q / scale; const frac = String(q % scale).padStart(8, '0').replace(/0+$/, '');
  return `${neg && (int > 0n || frac) ? '−' : ''}${int}${frac ? `,${frac}` : ''}`;
}

/**
 * Ce que lit une calculatrice scientifique : `{ status:'ok', value, display }` | `{ status:'syntax' }` (« Syntax ERROR » : parenthèses non équilibrées, opérateur sans nombre,
 * mot vide) | `{ status:'math' }` (« Math ERROR » : division par 0).
 */
export function calculatorRead(input) {
  let tree;
  try { tree = parseB(input); } catch { return { status: 'syntax' }; }
  try { const value = evaluateB(tree); return { status: 'ok', value, display: calcDisplay(value) }; } catch { return { status: 'math' }; }
}

/** Le mot lu de gauche à droite SANS priorité (une calculatrice simple), les parenthèses respectées : « 45 + 15 ÷ 4 » → 15. `null` si le mot n'est pas une expression. */
export function leftToRight(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let pos = 0;
  const seq = () => {
    let acc = factor();
    while (tokens[pos]?.t === 'op') { const o = tokens[pos].o; pos += 1; acc = apply(o, acc, factor()); }
    return acc;
  };
  const factor = () => {
    const tk = tokens[pos];
    if (!tk) throw new Error('syntax');
    pos += 1;
    if (tk.t === 'num') return tk.v;
    if (tk.t === 'open') { const v = seq(); if (tokens[pos]?.t !== 'close') throw new Error('syntax'); pos += 1; return v; }
    throw new Error('syntax');
  };
  try { if (!tokens.length) return null; const v = seq(); return pos === tokens.length ? v : null; } catch { return null; }
}

/** Les TOUCHES à presser pour un mot : un chiffre par touche, « , » pour la virgule, puis opérateurs et parenthèses, et « = » à la fin. */
export function calculatorKeys(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  const keys = [];
  tokens.forEach((tk) => { if (tk.t === 'num') keys.push(...tk.text.split('')); else keys.push(tokenText(tk) === '[' ? '(' : tokenText(tk) === ']' ? ')' : tokenText(tk)); });
  return [...keys, '='];
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * L3 (wasf-silsila-hisab, 2026-10-29) — LA DERNIÈRE OPÉRATION NOMME LA CHAÎNE : arbre positionné, nom, termes / facteurs, phrase qui la décrit, coupe, collage.
 *   analyse · lastOperation · operands · chainName · pieceText · describe · cutAt · staplesOf · build · sameStructure
 * `analyse` relit le mot avec parenthèses et garde la POSITION (indice de jeton, indice d'opérateur) de chaque nœud ; les groupes disparaissent de l'arbre (`wrapped: true` sur
 * le nœud qu'ils entouraient). Même grammaire que `parseB` (qu'on ne modifie pas : `mooringLines` en dépend). Tout est EXACT et réutilise `evaluateB`.
 * LA PHRASE (`describe`) : masculin « العدد / العددين », « و » entre les deux blocs, « على » pour un quotient (« حاصل قسمة 45 على 9 »), le premier bloc d'abord pour − et ÷ ; une virgule
 * sépare les deux blocs quand le premier contient lui-même une chaîne imbriquée (« مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5 »).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const NAMES = Object.freeze({ '+': 'مجموع', '−': 'فرق', '×': 'جداء', '÷': 'حاصل قسمة' });

/** Le mot → `{ tokens, root }`. Nœuds : `{ t:'num', text, v, lo, hi }` | `{ t:'op', o, opIndex, tok, l, r, lo, hi, wrapped }` (lo / hi : jetons couverts, sans les parenthèses qui entourent le nœud). */
export function analyse(input) {
  const tokens = typeof input === 'string' ? tokenizeB(input) : input;
  let pos = 0;
  let opCount = 0;
  const opIndexAt = tokens.map((tk) => (tk.t === 'op' ? opCount++ : -1));
  const factor = () => {
    const tk = tokens[pos];
    if (!tk) throw new Error('syntax');
    if (tk.t === 'num') { const lo = pos; pos += 1; return { t: 'num', text: tk.text, v: tk.v, lo, hi: lo, wrapped: false }; }
    if (tk.t === 'open') {
      pos += 1;
      const e = expr();
      if (!tokens[pos] || tokens[pos].t !== 'close') throw new Error('syntax');
      pos += 1;
      return { ...e, wrapped: true, wraps: (e.wraps ?? 0) + 1 };
    }
    throw new Error('syntax');
  };
  const join = (o, l, r, tok) => ({ t: 'op', o, opIndex: opIndexAt[tok], tok, l, r, lo: l.lo - (l.wraps ?? 0), hi: r.hi + (r.wraps ?? 0), wrapped: false });
  const term = () => {
    let left = factor();
    while (tokens[pos]?.t === 'op' && PRIORITY[tokens[pos].o] === 2) { const tok = pos; const o = tokens[pos].o; pos += 1; left = join(o, left, factor(), tok); }
    return left;
  };
  const expr = () => {
    let left = term();
    while (tokens[pos]?.t === 'op' && PRIORITY[tokens[pos].o] === 1) { const tok = pos; const o = tokens[pos].o; pos += 1; left = join(o, left, term(), tok); }
    return left;
  };
  if (!tokens.length) throw new Error('syntax');
  const root = expr();
  if (pos !== tokens.length) throw new Error('syntax');
  return { tokens, root };
}

const nodeOf = (x) => (typeof x === 'string' || Array.isArray(x) ? analyse(x).root : x);

/** La dernière opération ('+', '−', '×', '÷') — la racine de l'arbre ; `null` pour un nombre seul. */
export function lastOperation(x) { const n = nodeOf(x); return n.t === 'op' ? n.o : null; }
/** Les deux blocs de la dernière opération : `[gauche, droite]` (nœuds). */
export function operands(x) { const n = nodeOf(x); return n.t === 'op' ? [n.l, n.r] : []; }
/** Le nom de la chaîne : « مجموع » | « فرق » | « جداء » | « حاصل قسمة » ; `null` pour un nombre seul. */
export function chainName(x) { const n = nodeOf(x); return n.t === 'op' ? NAMES[n.o] : null; }
export const CHAIN_NAMES = NAMES;

/** Le texte d'un bloc (jetons lo … hi) ; les parenthèses non appariées sont retirées (une coupe peut en laisser), puis une paire qui entoure tout le bloc. */
function pieceText(tokens, lo, hi) {
  let part = tokens.slice(lo, hi + 1);
  const stack = []; const drop = new Set();
  part.forEach((tk, i) => { if (tk.t === 'open') stack.push(i); else if (tk.t === 'close') { if (stack.length) stack.pop(); else drop.add(i); } });
  stack.forEach((i) => drop.add(i));
  part = part.filter((_, i) => !drop.has(i));
  for (;;) {
    if (part[0]?.t !== 'open' || part.at(-1)?.t !== 'close') break;
    let d = 0; let whole = true;
    for (let i = 0; i < part.length - 1; i += 1) { if (part[i].t === 'open') d += 1; else if (part[i].t === 'close') d -= 1; if (d === 0) { whole = false; break; } }
    if (!whole) break;
    part = part.slice(1, -1);
  }
  return part.map(tokenText).join(' ').replace(/\[/g, '(').replace(/\]/g, ')');
}

const hasOpChild = (n) => n.t === 'op' && (n.l.t === 'op' || n.r.t === 'op');

/** La phrase d'un bloc non réduit à un nombre (« مجموع العدد 7 وجداء العددين 4 و 5 »). */
export function describe(input) {
  const n = nodeOf(input);
  if (n.t === 'num') return `العدد ${n.text}`;
  const side = (x) => (x.t === 'num' ? x.text : describe(x));
  const name = NAMES[n.o];
  if (n.o === '÷') return `${name} ${side(n.l)} على ${side(n.r)}`;
  if (n.l.t === 'num' && n.r.t === 'num') return `${name} العددين ${n.l.text} و ${n.r.text}`;
  if (n.l.t === 'num') return `${name} العدد ${n.l.text} و${describe(n.r)}`;
  if (n.r.t === 'num') return `${name} ${describe(n.l)}${hasOpChild(n.l) ? ' ،' : ''} و${'العدد'} ${n.r.text}`;
  return `${name} ${describe(n.l)}${hasOpChild(n.l) ? ' ،' : ''} و${describe(n.r)}`;
}

/** La forme canonique d'un mot SANS ses parenthèses (deux mots ont la même structure si leurs arbres de calcul sont les mêmes). */
function structureOf(input) {
  const walk = (n) => (n.t === 'num' ? n.text : `(${walk(n.l)}${n.o}${walk(n.r)})`);
  return walk(nodeOf(input));
}
export const sameStructure = (a, b) => { try { return structureOf(a) === structureOf(b); } catch { return false; } };

/**
 * COUPER le mot à l'opérateur numéro `opIndex` (le k-ième opérateur dans l'ordre d'écriture). → `{ ok, o, left, right, leftValue, rightValue, rebuilt, rebuiltValue, same, reason }`.
 * `ok` : c'est la DERNIÈRE opération ; sinon `reason: 'staple'` (les ciseaux mordent une agrafe) et `rebuilt` est la valeur qu'on trouverait en calculant les deux morceaux
 * chacun de son côté puis en les réunissant par cet opérateur (`null` si elle est négative ou si elle divise par 0) ; `same` : cette valeur est PAR HASARD la bonne.
 */
export function cutAt(input, opIndex) {
  const { tokens, root } = analyse(input);
  const tok = tokens.findIndex((tk, i) => tk.t === 'op' && tokens.slice(0, i).filter((x) => x.t === 'op').length === opIndex);
  if (tok < 0) throw new Error('opérateur inconnu');
  const o = tokens[tok].o;
  const left = pieceText(tokens, 0, tok - 1);
  const right = pieceText(tokens, tok + 1, tokens.length - 1);
  const leftValue = evaluateB(parseB(left));
  const rightValue = evaluateB(parseB(right));
  const ok = root.t === 'op' && root.tok === tok;
  let rebuiltValue = null;
  try { const v = apply(o, leftValue, rightValue); rebuiltValue = P.sign(v) < 0 ? null : v; } catch { rebuiltValue = null; }
  const whole = evaluateB(parseB(tokens));
  return {
    ok, o, left, right, leftValue, rightValue,
    rebuilt: rebuiltValue == null ? null : numText(rebuiltValue), rebuiltValue,
    same: !ok && rebuiltValue != null && P.eq(rebuiltValue, whole),
    reason: ok ? null : 'staple',
  };
}

/**
 * Les AGRAFES d'un mot calculé selon les règles : une par opération, dans l'ordre où la convention les fait (× ÷ puis + −, à égalité de gauche à droite) ; chacune
 * couvre ses deux blocs `[lo, hi]` (jetons), porte sa valeur et son niveau (1 = la plus basse) et le numéro de l'agrafe qui l'englobe (`parent`, -1 pour la dernière).
 */
export function staplesOf(input) {
  const { tokens, root } = analyse(input);
  const out = [];
  const walk = (n, parent) => {
    if (n.t === 'num') return 0;
    const idx = out.length;
    out.push({ opIndex: n.opIndex, o: n.o, lo: n.lo, hi: n.hi, tok: n.tok, parent, level: 1, value: evaluateB(pieceText(tokens, n.lo, n.hi)), text: numText(evaluateB(pieceText(tokens, n.lo, n.hi))) });
    const h = Math.max(walk(n.l, idx), walk(n.r, idx)) + 1;
    out[idx].level = h;
    return h;
  };
  walk(root, -1);
  return out;
}

/**
 * COLLER deux blocs par une opération : `build('×', '3 + 5', '10 − 4', { clipLeft, clipRight })`. Sans `clip*` l'élève écrit les blocs tels quels ; `needs` dit quelles parenthèses la
 * structure exige (un bloc qui n'est pas un nombre et dont la dernière opération est moins prioritaire — ou de même priorité à droite, pour garder la forme `bloc op bloc`).
 * → `{ text, name, needs: { left, right }, clipped: { left, right }, structure }`.
 */
export function build(op, leftText, rightText, { clipLeft = false, clipRight = false } = {}) {
  const need = (text, side) => {
    const n = analyse(text).root;
    if (n.t === 'num') return false;
    const pn = PRIORITY[n.o]; const po = PRIORITY[op];
    return side === 'left' ? pn < po : pn <= po;
  };
  const needs = { left: need(leftText, 'left'), right: need(rightText, 'right') };
  const wrap = (t, on) => (on ? `(${t})` : t);
  const text = `${wrap(leftText, clipLeft)} ${op} ${wrap(rightText, clipRight)}`.replace(/\s+/g, ' ').trim();
  let name = null;
  try { name = chainName(text); } catch { name = null; }
  return { text, name, needs, clipped: { left: clipLeft, right: clipRight }, structure: (() => { try { return structureOf(text); } catch { return null; } })() };
}

/* ══════════════ L4 — la distributivité (tawzi-darb-jam-tarh, 2026-10-29) ══════════════
 * k × (a ± b) = k × a ± k × b sur les entiers et les décimaux (a ≥ b : aucun négatif avant l'unité 3), lue dans les deux sens (نشر / تحليل). Les nombres sont écrits comme
 * dans les leçons (virgule décimale) ; les valeurs viennent de `powers.js` (exact). `relativeOps.factorize` est la contre-épreuve du test. */
const rt = (x) => parseRel(String(x));
const isSub = (op) => op === '−' || op === '-';

/** « 6 × (8 − 3) » et « 6 × 8 − 6 × 3 » : les deux écritures, leur valeur commune et celle de chaque produit. */
export function expand(k, a, b, op = '+') {
  const sub = isSub(op);
  const [K, A, B] = [rt(k), rt(a), rt(b)];
  if (sub && P.sign(P.sub(A, B)) < 0) throw new Error('a < b : différence négative');
  const o = sub ? '−' : '+';
  const kA = P.mul(K, A); const kB = P.mul(K, B);
  const inner = sub ? P.sub(A, B) : P.add(A, B);
  const whole = P.mul(K, inner);
  const split = sub ? P.sub(kA, kB) : P.add(kA, kB);
  return {
    op: o, factored: `${k} × (${a} ${o} ${b})`, split: `${k} × ${a} ${o} ${k} × ${b}`,
    inner: numText(inner), kA: numText(kA), kB: numText(kB), products: `${numText(kA)} ${o} ${numText(kB)}`,
    value: numText(whole), valueText: numText(whole), equal: P.eq(whole, split),
  };
}

/** Le facteur COMMUN visible de deux produits « k × a » et « a × k » (dans n'importe quel ordre) → `{ factor, rest: [x, y] }` ou `null`. */
export function commonFactor(t1, t2) {
  const parts = (t) => String(t).split('×').map((x) => x.trim());
  const p1 = parts(t1); const p2 = parts(t2);
  if (p1.length !== 2 || p2.length !== 2) return null;
  for (let i = 0; i < 2; i += 1) for (let j = 0; j < 2; j += 1) {
    if (P.eq(rt(p1[i]), rt(p2[j]))) return { factor: p1[i], rest: [p1[1 - i], p2[1 - j]] };
  }
  return null;
}

/** Les écritures de n « près d'un nombre rond » : 99 → [90 + 9, 100 − 1] ; 48 → [40 + 8, 50 − 2] ; 101 → [100 + 1, 110 − 9]. `n` entier ≥ 3. */
export function mentalSplits(n) {
  const N = Number(n);
  if (!Number.isInteger(N) || N < 3) return [];
  const out = [];
  const scales = N > 100 ? [10, 100] : [10];
  for (const sc of scales) {
    const lo = Math.floor(N / sc) * sc; const up = lo + sc;
    if (N % sc === 0) continue;
    if (lo > 0) out.push({ parts: [lo, N - lo], op: '+' });
    out.push({ parts: [up, up - N], op: '−' });
  }
  return out;
}

/** k × (x ± b) avec UNE lettre : « 4 × (x − 3) » → « 4x − 12 » (la notation 4 × x = 4x) et sa valeur pour une valeur de x. */
export function expandLetter({ k, b, op = '+' }) {
  const sub = isSub(op);
  const o = sub ? '−' : '+';
  const kb = numText(P.mul(rt(k), rt(b)));
  const at = (x) => {
    const X = rt(x);
    if (sub && P.sign(P.sub(X, rt(b))) < 0) throw new Error('x < b : différence négative');
    const inner = sub ? P.sub(X, rt(b)) : P.add(X, rt(b));
    const viaFactored = P.mul(rt(k), inner);
    const viaExpanded = sub ? P.sub(P.mul(rt(k), X), rt(kb)) : P.add(P.mul(rt(k), X), rt(kb));
    return { factored: numText(viaFactored), expanded: numText(viaExpanded), equal: P.eq(viaFactored, viaExpanded) };
  };
  return { factored: `${k} × (x ${o} ${b})`, text: `${k}x ${o} ${kb}`, kb, at };
}

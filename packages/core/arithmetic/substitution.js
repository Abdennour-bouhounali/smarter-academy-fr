/**
 * La SUBSTITUTION d'une lettre par un nombre (3AM, unité 4 « الحساب الحرفي », درس « حساب قيمة عبارة حرفية », 2026-10-26) —
 * arithmétique EXACTE (rationnels BigInt de `powers.js`), importée PAR CHEMIN (`@smarter-academy/core/arithmetic/substitution.js`),
 * jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 *
 * L'idée. Une expression est un ARBRE (ce que la ligne écrite SIGNIFIE) ; la ligne que l'élève écrit sous le labo `marble-run` est une
 * suite de JETONS (ce qu'un lecteur strict LIT). `evaluate` calcule l'arbre ; `readLine` lit la ligne littéralement — des chiffres
 * juxtaposés se fondent (« 4 » « 3 » → 43), une puissance lie avant un moins de tête (−2² = −4), deux signes côte à côte sont
 * illisibles (4 × −2) ; `judgeLine` compare les deux et dit OÙ ils se séparent (la première station, dans l'ordre du calcul).
 *
 * Arbre : { t: 'num', v } · { t: 'var', name, i } · { t: 'neg', a } · { t: 'add'|'sub', a, b } · { t: 'mul', a, b, implicit } ·
 * { t: 'pow', a, n } ; chaque nœud d'opération porte un `id` (numéro d'ordre de calcul, de 0) ; chaque lettre un indice de case `i`
 * (de gauche à droite).
 * Jeton : { k: 'num', s } · { k: 'op', s: '+'|'-'|'*'|'/' } · { k: '(' } · { k: ')' } · { k: 'pow', n } · { k: 'hole' }, plus
 * `slot` (indice de case) et `gap: true` (la case « × » avant une lettre) quand ils viennent d'une case.
 */
import { rat, parseRat, add, sub, mul, div, pow, neg, eq, sign } from './powers.js';

const ZERO = rat(0);

/* ═════════════ Analyse d'une expression écrite ═════════════ */

const DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
const MAX_EXPR_LENGTH = 24;

function normalize(text) {
  return String(text)
    .replace(/[٠-٩]/g, (d) => DIGITS[d])
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/،/g, ',').replace(/,/g, '.')
    .replace(/\s+/g, '');
}

/** Les lettres acceptées par défaut (3AM) ; les leçons de 2AM (unité 4) passent `{ letters: LETTERS_2AM }` (2026-10-29, `ibara-harfiya-intaj`). */
const DEFAULT_LETTERS = ['x', 'y'];
export const LETTERS_2AM = ['n', 'x', 'y', 'a', 'b', 'c', 'm'];

function tokenize(src, letters = DEFAULT_LETTERS) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\d/.test(c)) {
      let j = i; while (j < src.length && /\d/.test(src[j])) j += 1;
      if (src[j] === '.' && /\d/.test(src[j + 1] ?? '')) { j += 1; while (j < src.length && /\d/.test(src[j])) j += 1; }
      out.push({ k: 'num', s: src.slice(i, j) }); i = j;
    } else if (letters.includes(c.toLowerCase())) { out.push({ k: 'var', s: c.toLowerCase() }); i += 1; }
    else if ('+-*()^'.includes(c)) { out.push({ k: c }); i += 1; }
    else throw new Error(`caractère illisible : ${c}`);
  }
  return out;
}

/**
 * Texte → arbre (grammaire : entiers et décimaux, x, y, + − × ( ), ², ^2, ^3, coefficient implicite « 3x » ; 24 caractères au plus). Lève une erreur sinon.
 * `options.letters` : la liste des lettres acceptées (défaut `['x', 'y']`, les appelants de 3AM sont inchangés ; 2AM : `LETTERS_2AM`).
 */
export function parseExpression(text, options = {}) {
  const raw = String(text);
  if (raw.replace(/\s+/g, '').length > MAX_EXPR_LENGTH) throw new Error('expression trop longue');
  const toks = tokenize(normalize(raw), options.letters ?? DEFAULT_LETTERS);
  let p = 0;
  const peek = () => toks[p];
  const eat = (k) => { if (toks[p]?.k !== k) throw new Error(`« ${k} » attendu`); p += 1; return toks[p - 1]; };
  const startsFactor = (t) => t && (t.k === 'var' || t.k === '(');

  function expr() {
    let a = term();
    while (peek() && (peek().k === '+' || peek().k === '-')) {
      const op = toks[p].k; p += 1;
      const b = term();
      a = { t: op === '+' ? 'add' : 'sub', a, b };
    }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t?.k === '*') { p += 1; a = { t: 'mul', a, b: power(), implicit: false }; }
      else if (startsFactor(t)) a = { t: 'mul', a, b: power(), implicit: true };
      else return a;
    }
  }
  function unary() {
    if (peek()?.k === '-') {
      p += 1;
      if (peek()?.k === 'num' && toks[p + 1]?.k !== '^') { const n = toks[p].s; p += 1; return { t: 'num', v: neg(parseRat(n)) }; }
      return { t: 'neg', a: unary() };
    }
    return power();
  }
  function power() {
    const a = atom();
    if (peek()?.k === '^') {
      p += 1;
      const e = eat('num').s;
      if (!/^[23]$/.test(e)) throw new Error('exposant 2 ou 3 seulement');
      return { t: 'pow', a, n: Number(e) };
    }
    return a;
  }
  function atom() {
    const t = peek();
    if (!t) throw new Error('expression incomplète');
    if (t.k === 'num') { p += 1; return { t: 'num', v: parseRat(t.s) }; }
    if (t.k === 'var') { p += 1; return { t: 'var', name: t.s }; }
    if (t.k === '(') { p += 1; const e = expr(); eat(')'); return { t: 'group', a: e }; }
    throw new Error('expression illisible');
  }
  if (!toks.length) throw new Error('expression vide');
  const tree = unwrap(expr());
  if (p < toks.length) throw new Error('expression illisible');
  return number(tree);
}

/** Les parenthèses n'existent pas dans l'arbre : la structure les porte. */
function unwrap(n) {
  if (n.t === 'group') return unwrap(n.a);
  if (n.t === 'num' || n.t === 'var') return n;
  if (n.t === 'neg' || n.t === 'pow') return { ...n, a: unwrap(n.a) };
  return { ...n, a: unwrap(n.a), b: unwrap(n.b) };
}

/** Numérote les lettres (de gauche à droite) et les opérations (ordre de calcul). */
function number(root) {
  let slot = 0; let op = 0;
  const walk = (n) => {
    if (n.t === 'num') return n;
    if (n.t === 'var') return { ...n, i: slot++ };
    if (n.t === 'neg' || n.t === 'pow') { const a = walk(n.a); return { ...n, a, id: op++ }; }
    const a = walk(n.a); const b = walk(n.b);
    return { ...n, a, b, id: op++ };
  };
  return walk(root);
}

/* ═════════════ Lecture de l'arbre ═════════════ */

export const letters = (tree) => {
  const set = [];
  const walk = (n) => { if (n.t === 'var') { if (!set.includes(n.name)) set.push(n.name); } else { if (n.a) walk(n.a); if (n.b) walk(n.b); } };
  walk(tree);
  return set.sort();
};

const valueOfEnv = (e) => (e && typeof e === 'object' && 'v' in e ? e.v : e);
const fmtOfEnv = (e, v) => (e && typeof e === 'object' && 'fmt' in e && e.fmt ? e.fmt : (v.d === 1n ? 'int' : 'frac'));

/** Valeur exacte de l'arbre. `env` : { x: rationnel | { v, fmt } }. Une lettre sans valeur lève une erreur. */
export function evaluate(tree, env = {}) {
  switch (tree.t) {
    case 'num': return tree.v;
    case 'var': { const e = env[tree.name]; if (e == null) throw new Error(`lettre sans valeur : ${tree.name}`); return valueOfEnv(e); }
    case 'neg': return neg(evaluate(tree.a, env));
    case 'add': return add(evaluate(tree.a, env), evaluate(tree.b, env));
    case 'sub': return sub(evaluate(tree.a, env), evaluate(tree.b, env));
    case 'mul': return mul(evaluate(tree.a, env), evaluate(tree.b, env));
    case 'pow': return pow(evaluate(tree.a, env), tree.n);
    default: throw new Error('nœud inconnu');
  }
}

/** Les opérations dans l'ordre du calcul (de bas en haut) : [{ id, op, args, value, n }] — les « stations » du labo. */
export function trace(tree, env = {}) {
  const out = [];
  const walk = (n) => {
    if (n.t === 'num' || n.t === 'var') return evaluate(n, env);
    if (n.t === 'neg') { const a = walk(n.a); const v = neg(a); out.push({ id: n.id, op: 'neg', args: [a], value: v, node: n }); return v; }
    if (n.t === 'pow') { const a = walk(n.a); const v = pow(a, n.n); out.push({ id: n.id, op: 'pow', n: n.n, args: [a], value: v, node: n }); return v; }
    const a = walk(n.a); const b = walk(n.b);
    const f = n.t === 'add' ? add : n.t === 'sub' ? sub : mul;
    const v = f(a, b);
    out.push({ id: n.id, op: n.t, implicit: !!n.implicit, args: [a, b], value: v, node: n });
    return v;
  };
  walk(tree);
  return out;
}

/** Une case est-elle précédée d'une écriture où le « × » est masqué (coefficient implicite) ? */
function startsWithSlot(n) {
  if (n.t === 'var') return n.i;
  if (n.t === 'pow') return n.a.t === 'var' ? n.a.i : null;
  if (n.t === 'mul') return startsWithSlot(n.a);
  return null;
}
function endsWithBracket(n) { return n.t === 'add' || n.t === 'sub' || n.t === 'neg'; }

/** Les cases (une par lettre écrite) : [{ i, name, needsTimes, underPow }]. `needsTimes` : un « × » doit ou peut être écrit avant la case. */
export function slots(tree) {
  const out = [];
  const walk = (n, ctx) => {
    if (n.t === 'num') return;
    if (n.t === 'var') { out[n.i] = { i: n.i, name: n.name, needsTimes: !!ctx.times, underPow: !!ctx.pow }; return; }
    if (n.t === 'neg') { walk(n.a, {}); return; }
    if (n.t === 'pow') { walk(n.a, { pow: true, times: ctx.times }); return; }
    if (n.t === 'mul') {
      walk(n.a, { times: ctx.times });
      const first = startsWithSlot(n.b);
      walk(n.b, { times: n.implicit && first != null && !endsWithBracket(n.b) });
      return;
    }
    walk(n.a, { }); walk(n.b, { });
  };
  walk(tree, {});
  return out;
}

/** Faut-il des parenthèses autour de la valeur de cette case ? Convention du labo : une valeur négative, ou une fraction sous une puissance. */
export function needsBrackets(tree, slotIndex, value) {
  const v = valueOfEnv(value);
  const s = slots(tree)[slotIndex];
  if (!s) return false;
  return sign(v) < 0 || (s.underPow && v.d !== 1n);
}

/* ═════════════ Écriture de l'expression ═════════════ */

const prec = (n) => ({ add: 1, sub: 1, neg: 2, mul: 3, pow: 4, num: 5, var: 5 }[n.t]);

/** LaTeX de l'expression (sans le nombre : les lettres restent des lettres). */
export function treeTex(tree) {
  const num = (v) => (v.d === 1n ? String(v.n) : `\\frac{${v.n}}{${v.d}}`);
  const wrap = (n, cond) => (cond ? `(${go(n)})` : go(n));
  const go = (n) => {
    switch (n.t) {
      case 'num': return num(n.v);
      case 'var': return n.name;
      case 'neg': return `-${wrap(n.a, prec(n.a) < 3 && n.a.t !== 'neg')}`;
      case 'add': return `${go(n.a)}+${wrap(n.b, false)}`;
      case 'sub': return `${go(n.a)}-${wrap(n.b, n.b.t === 'add' || n.b.t === 'sub')}`;
      case 'mul': {
        const left = wrap(n.a, prec(n.a) < 3 || (n.a.t === 'num' && sign(n.a.v) < 0 && !n.implicit));
        const right = wrap(n.b, prec(n.b) < 3 || (n.b.t === 'num' && sign(n.b.v) < 0));
        const rightIsLiteral = n.b.t === 'num';
        return n.implicit && !rightIsLiteral ? `${left}${right}` : `${left}\\times ${right}`;
      }
      case 'pow': return `${wrap(n.a, n.a.t !== 'var' && !(n.a.t === 'num' && sign(n.a.v) >= 0 && n.a.v.d === 1n))}^{${n.n}}`;
      default: return '';
    }
  };
  return go(tree);
}

/** Texte brut (pour les cartes d'expression et les lecteurs d'écran) : « 4x + 7 ». */
export function treeText(tree) {
  const num = (v) => (v.d === 1n ? String(v.n).replace('-', '−') : `${String(v.n).replace('-', '−')}/${v.d}`);
  const sup = { 2: '²', 3: '³' };
  const wrap = (n, cond) => (cond ? `(${go(n)})` : go(n));
  const go = (n) => {
    switch (n.t) {
      case 'num': return num(n.v);
      case 'var': return n.name;
      case 'neg': return `−${wrap(n.a, prec(n.a) < 3 && n.a.t !== 'neg')}`;
      case 'add': return `${go(n.a)} + ${go(n.b)}`;
      case 'sub': return `${go(n.a)} − ${wrap(n.b, n.b.t === 'add' || n.b.t === 'sub')}`;
      case 'mul': {
        const left = wrap(n.a, prec(n.a) < 3);
        const right = wrap(n.b, prec(n.b) < 3 || (n.b.t === 'num' && sign(n.b.v) < 0));
        return n.implicit && n.b.t !== 'num' ? `${left}${right}` : `${left} × ${right}`;
      }
      case 'pow': return `${wrap(n.a, n.a.t !== 'var' && !(n.a.t === 'num' && sign(n.a.v) >= 0 && n.a.v.d === 1n))}${sup[n.n]}`;
      default: return '';
    }
  };
  return go(tree);
}

export const decimalText = (v) => {
  // Une valeur décimale (dénominateur 2^a 5^b) s'écrit « 1.5 » dans la ligne (la virgule est mise à l'affichage) ; sinon null.
  const abs = v.n < 0n ? -v.n : v.n;
  for (let m = 1; m <= 12; m += 1) {
    const scale = 10n ** BigInt(m);
    if ((scale * abs) % v.d === 0n) {
      const str = String((abs * scale) / v.d).padStart(m + 1, '0');
      return `${str.slice(0, -m)}.${str.slice(-m)}`;
    }
  }
  return null;
};

/** Les jetons de la VALEUR d'une lettre (signe compris) : « 3 », « − 2 », « − 1 / 2 », « − 1.5 ». */
function valueTokens(e, slot) {
  const v = valueOfEnv(e);
  const fmt = fmtOfEnv(e, v);
  const a = v.n < 0n ? -v.n : v.n;
  const t = [];
  if (v.n < 0n) t.push({ k: 'op', s: '-', slot });
  if (v.d === 1n) t.push({ k: 'num', s: String(a), slot });
  else if (fmt === 'dec' && decimalText(v)) t.push({ k: 'num', s: decimalText(rat(a, v.d)), slot });
  else { t.push({ k: 'num', s: String(a), slot }, { k: 'op', s: '/', slot }, { k: 'num', s: String(v.d), slot }); }
  return t;
}

/**
 * La ligne écrite : l'arbre dont chaque lettre est remplacée par SA case. `choices[i] = { brackets, times }`. Une lettre sans valeur
 * donne un jeton `hole`. Les parenthèses de l'expression elle-même (celles de la structure) sont fixes.
 */
export function writeLine(tree, env = {}, choices = []) {
  const sl = slots(tree);
  const T = (k, s, extra) => ({ k, ...(s != null ? { s } : {}), ...extra });
  const go = (n) => {
    switch (n.t) {
      case 'num': {
        const a = n.v.n < 0n ? -n.v.n : n.v.n;
        const body = n.v.d === 1n ? [T('num', String(a))] : [T('num', String(a)), T('op', '/'), T('num', String(n.v.d))];
        return n.v.n < 0n ? [T('('), T('op', '-'), ...body, T(')')] : body;
      }
      case 'var': {
        const c = choices[n.i] ?? {};
        const e = env[n.name];
        const out = [];
        if (sl[n.i]?.needsTimes && c.times) out.push({ k: 'op', s: '*', slot: n.i, gap: true });
        const inner = e == null ? [{ k: 'hole', slot: n.i }] : valueTokens(e, n.i);
        if (c.brackets) return [...out, { k: '(', slot: n.i }, ...inner, { k: ')', slot: n.i }];
        return [...out, ...inner];
      }
      case 'neg': {
        const inner = go(n.a);
        return n.a.t === 'add' || n.a.t === 'sub' ? [T('op', '-'), T('('), ...inner, T(')')] : [T('op', '-'), ...inner];
      }
      case 'add': return [...go(n.a), T('op', '+'), ...go(n.b)];
      case 'sub': return [...go(n.a), T('op', '-'), ...(n.b.t === 'add' || n.b.t === 'sub' ? [T('('), ...go(n.b), T(')')] : go(n.b))];
      case 'mul': {
        const l = n.a.t === 'add' || n.a.t === 'sub' || n.a.t === 'neg' ? [T('('), ...go(n.a), T(')')] : go(n.a);
        const rParen = n.b.t === 'add' || n.b.t === 'sub' || n.b.t === 'neg';
        const r = rParen ? [T('('), ...go(n.b), T(')')] : go(n.b);
        if (n.implicit) return [...l, ...r];
        return [...l, T('op', '*'), ...r];
      }
      case 'pow': {
        const base = n.a.t === 'var' || n.a.t === 'num' ? go(n.a) : [T('('), ...go(n.a), T(')')];
        return [...base, T('pow', null, { n: n.n })];
      }
      default: return [];
    }
  };
  return go(tree);
}

/** Texte lisible d'une suite de jetons (la virgule décimale est mise à l'affichage) — « 4 × (−2) + 7 ». */
export function tokensText(tokens) {
  const parts = [];
  let prev = null;
  for (const t of tokens) {
    if (t.k === 'num') parts.push(t.s.replace('.', ','));
    else if (t.k === 'op') {
      const binary = prev && (prev.k === 'num' || prev.k === ')' || prev.k === 'pow');
      parts.push(t.s === '*' ? ' × ' : t.s === '/' ? '/' : binary ? ` ${t.s === '-' ? '−' : t.s} ` : (t.s === '-' ? '−' : t.s));
    }
    else if (t.k === '(') parts.push('(');
    else if (t.k === ')') parts.push(')');
    else if (t.k === 'pow') parts.push(t.n === 2 ? '²' : '³');
    else if (t.k === 'hole') parts.push('□');
    prev = t;
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/* ═════════════ La lecture LITTÉRALE d'une ligne ═════════════ */

/**
 * Lit la ligne comme le ferait un lecteur strict : des nombres juxtaposés se fondent en un seul (« 4 » « 3 » → 43), une puissance lie
 * avant un moins de tête (−2² = −(2²)), un signe juste après un opérateur est illisible, une parenthèse collée à un nombre se lit comme
 * un produit. → { ok: true, value } | { ok: false, reason: 'syntax', at }.
 */
export function readLine(tokens) {
  // 1. fusion des nombres adjacents
  const toks = [];
  for (const t of tokens) {
    const last = toks[toks.length - 1];
    if (t.k === 'num' && last?.k === 'num') toks[toks.length - 1] = { k: 'num', s: last.s + t.s, at: last.at };
    else toks.push({ ...t, at: toks.length });
  }
  let p = 0;
  const fail = (at) => { const e = new Error('syntax'); e.at = at; throw e; };
  const peek = () => toks[p];
  function parseSum() {
    let a = parseTerm(true);
    while (peek() && peek().k === 'op' && (peek().s === '+' || peek().s === '-')) {
      const op = peek().s; p += 1;
      if (!peek() || peek().k === 'op') fail(p);
      const b = parseTerm(false);
      a = op === '+' ? add(a, b) : sub(a, b);
    }
    return a;
  }
  function parseTerm(lead) {
    let a = parseUnary(lead);
    for (;;) {
      const t = peek();
      if (t && t.k === 'op' && (t.s === '*' || t.s === '/')) {
        p += 1;
        if (!peek() || peek().k === 'op') fail(p);
        const b = parsePower();
        if (t.s === '/') { if (b.n === 0n) fail(p); a = div(a, b); } else a = mul(a, b);
      } else if (t && t.k === '(') {
        a = mul(a, parsePower());
      } else return a;
    }
  }
  function parseUnary(lead) {
    if (peek() && peek().k === 'op' && peek().s === '-') {
      if (!lead) fail(p);
      p += 1;
      if (peek() && peek().k === 'op') fail(p);
      return neg(parsePower());
    }
    return parsePower();
  }
  function parsePower() {
    let a = parseAtom();
    while (peek() && peek().k === 'pow') { a = pow(a, peek().n); p += 1; }
    return a;
  }
  function parseAtom() {
    const t = peek();
    if (!t) fail(p);
    if (t.k === 'num') { p += 1; try { return parseRat(t.s); } catch { return fail(p); } }
    if (t.k === '(') {
      p += 1;
      const inner = parseGroup();
      if (!peek() || peek().k !== ')') fail(p);
      p += 1;
      return inner;
    }
    return fail(p);
  }
  function parseGroup() {
    // à l'intérieur d'une parenthèse, un moins de tête est permis
    let a = parseTerm(true);
    while (peek() && peek().k === 'op' && (peek().s === '+' || peek().s === '-')) {
      const op = peek().s; p += 1;
      if (!peek() || peek().k === 'op') fail(p);
      const b = parseTerm(false);
      a = op === '+' ? add(a, b) : sub(a, b);
    }
    return a;
  }
  try {
    const v = parseSum();
    if (p < toks.length) fail(p);
    return { ok: true, value: v };
  } catch (e) {
    if (e.message === 'syntax') return { ok: false, reason: 'syntax', at: e.at ?? 0 };
    return { ok: false, reason: 'syntax', at: 0 };
  }
}

/* ═════════════ Le jugement d'une ligne ═════════════ */

/**
 * Le défaut d'une case : 'unbracketed' (une valeur négative, ou une fraction sous une puissance, sans parenthèses) ou 'fused' (le « × »
 * manquant devant une valeur positive sans parenthèses : les chiffres se fondent). null si la case est écrite sans défaut.
 */
function slotDefect(tree, env, choices, i) {
  const s = slots(tree)[i];
  const e = env[s.name];
  if (e == null) return null;
  const c = choices[i] ?? {};
  if (c.brackets) return null;
  const v = valueOfEnv(e);
  if (sign(v) < 0 || (s.underPow && v.d !== 1n)) return 'unbracketed';
  if (s.needsTimes && !c.times) return 'fused';
  return null;
}

function slotsOfNode(node) {
  const out = [];
  const walk = (n) => { if (n.t === 'var') out.push(n.i); else { if (n.a) walk(n.a); if (n.b) walk(n.b); } };
  walk(node);
  return out;
}

/**
 * Compare la valeur du MOUVEMENT (l'arbre) et celle de la LIGNE (lue littéralement). →
 * { ok, runValue, lineValue, reason: null|'fused'|'unbracketed'|'syntax', station, slot, stationInfo }
 * `station` : l'`id` de la première opération (dans l'ordre du calcul) où la lecture de la ligne se sépare du mouvement ; `slot` : la
 * première case défectueuse de cette station.
 */
export function judgeLine(tree, env = {}, choices = []) {
  const runValue = evaluate(tree, env);
  const tokens = writeLine(tree, env, choices);
  const rd = readLine(tokens);
  if (rd.ok && eq(rd.value, runValue)) return { ok: true, runValue, lineValue: rd.value, reason: null, station: null, slot: null, tokens, stationInfo: null };
  const steps = trace(tree, env);
  let station = null; let stationInfo = null;
  for (const st of steps) {
    const sub1 = readLine(writeLine(st.node, env, choices));
    if (!sub1.ok || !eq(sub1.value, st.value)) { station = st.id; stationInfo = { ...st, lineValue: sub1.ok ? sub1.value : null }; break; }
  }
  const scope = stationInfo ? slotsOfNode(stationInfo.node) : slots(tree).map((s) => s.i);
  let slot = null; let reason = null;
  for (const i of scope) { const d = slotDefect(tree, env, choices, i); if (d) { slot = i; reason = d; break; } }
  if (!rd.ok && reason !== 'fused') reason = 'syntax';
  if (!reason) reason = 'unbracketed';
  return { ok: false, runValue, lineValue: rd.ok ? rd.value : null, reason, station, slot, tokens, stationInfo };
}

/* ═════════════ Outils pour la طريقة (deux expressions) ═════════════ */

/** Le polynôme en `letter` (défaut x) de l'arbre, en termes { c, p } entiers, ou null (autre lettre, coefficient non entier, degré > 6). */
export function toTerms(tree, letter = 'x') {
  const ps = (d) => d;
  const addP = (a, b, k = 1) => { const r = { ...a }; for (const [p, c] of Object.entries(b)) r[p] = add(r[p] ?? ZERO, k === 1 ? c : neg(c)); return r; };
  const mulP = (a, b) => { const r = {}; for (const [p, c] of Object.entries(a)) for (const [q, e] of Object.entries(b)) { const k = Number(p) + Number(q); r[k] = add(r[k] ?? ZERO, mul(c, e)); } return r; };
  let ok = true;
  const go = (n) => {
    switch (n.t) {
      case 'num': return ps({ 0: n.v });
      case 'var': if (n.name !== letter) { ok = false; return {}; } return { 1: rat(1) };
      case 'neg': return addP({}, go(n.a), -1);
      case 'add': return addP(go(n.a), go(n.b));
      case 'sub': return addP(go(n.a), go(n.b), -1);
      case 'mul': return mulP(go(n.a), go(n.b));
      case 'pow': { let r = { 0: rat(1) }; const b = go(n.a); for (let i = 0; i < n.n; i += 1) r = mulP(r, b); return r; }
      default: ok = false; return {};
    }
  };
  const poly = go(tree);
  if (!ok) return null;
  const terms = [];
  for (const [p, c] of Object.entries(poly)) {
    if (c.n === 0n) continue;
    if (c.d !== 1n) return null;
    terms.push({ c: Number(c.n), p: Number(p) });
  }
  if (terms.some((t) => t.p > 6)) return null;
  return terms.sort((a, b) => b.p - a.p);
}

/** Deux arbres sont-ils égaux comme polynômes en `letter` (défaut x ; la preuve par développement) ? null si l'un n'est pas un polynôme entier en cette lettre. */
export function samePolynomial(a, b, letter = 'x') {
  const ta = toTerms(a, letter); const tb = toTerms(b, letter);
  if (!ta || !tb) return null;
  return ta.length === tb.length && ta.every((t, i) => t.c === tb[i].c && t.p === tb[i].p);
}

/** Le premier candidat (liste de rationnels) où les deux expressions (en `letter`, défaut x) diffèrent, sinon null — le CONTRE-EXEMPLE. */
export function witness(a, b, candidates, letter = 'x') {
  for (const c of candidates) {
    const env = { [letter]: c };
    if (!eq(evaluate(a, env), evaluate(b, env))) return c;
  }
  return null;
}

/** Les valeurs de deux expressions à une valeur de x : { left, right, equal }. */
export function pairAt(a, b, x) {
  const env = { x };
  const left = evaluate(a, env); const right = evaluate(b, env);
  return { left, right, equal: eq(left, right) };
}

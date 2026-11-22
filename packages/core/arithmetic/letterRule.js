/**
 * LA RÈGLE LITTÉRALE SOUS LE « قرص الحروف » (1AM, unité 6 « الحساب الحرفي », درس « تطبيق قاعدة حرفية », 2026-10-30) — arithmétique RATIONNELLE exacte (entiers), jamais de flottant.
 *
 * Une RÈGLE est une expression écrite avec des nombres, des lettres (a–z, une lettre = un nombre), `+`, `-` (ou `−`), `*` (ou `×`) et des parenthèses : « 5*n+20 », « 2*(a+b) », « a*b ».
 * La convention d'écriture est lue ET rendue : « 2x » se lit « 2 × x » (jamais l'entier 2 suivi de x), « ab » se lit « a × b », « 3(x+2) » se lit « 3 × (x + 2) » ;
 * en SUBSTITUANT, le signe × est toujours rendu explicite : 2x pour x = 3 donne « 2 × 3 » = 6, jamais « 23 ».
 *
 * `substitute` remplace CHAQUE occurrence d'une lettre par sa valeur (la « valeur tombe dans toutes les fentes de la lettre ») ; `steps` rend les états successifs du calcul
 * (parenthèses d'abord, puis les produits, puis les sommes et différences de gauche à droite) jusqu'au nombre.
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/letterRule.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

/** Un rationnel irréductible `{ n, d }` (d > 0). */
export function Q(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('rationnel invalide');
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return Object.freeze({ n: (s * n) / g, d: (s * d) / g });
}
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
export const eq = (x, y) => x.n === y.n && x.d === y.d;

/** « 12 », « 2,5 », « 2.5 » (et les chiffres arabes) → rationnel ; `null` si illisible. */
export function parseNumber(raw) {
  const t = String(raw ?? '').replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace(/\{,\}/g, ',').replace(/٫/g, ',').replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
  const m = /^(-?)(\d{1,6})(?:[.,](\d{1,3}))?$/.exec(t);
  if (!m) return null;
  const frac = m[3] ?? '';
  return Q((m[1] ? -1 : 1) * Number(m[2] + frac), 10 ** frac.length);
}

/** Le décimal exact écrit à la virgule, le signe moins typographique « − » ; `null` si le quotient ne s'arrête pas. */
export function text(x) {
  let d = x.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d !== 1) return `${x.n}/${x.d}`;
  let k = 0;
  while ((10 ** k) % x.d !== 0) k += 1;
  const neg = x.n < 0;
  const N = Math.abs(x.n) * ((10 ** k) / x.d);
  const body = k === 0 ? String(N) : `${String(N).padStart(k + 1, '0').slice(0, -k)},${String(N).padStart(k + 1, '0').slice(-k)}`;
  return `${neg ? '−' : ''}${body}`;
}

/* ── Lecture d'une règle : jetons, puis arbre ── */

const bad = (m) => { throw new Error(`règle illisible : ${m}`); };

/** Les jetons d'une règle `{ k: 'num' | 'var' | 'op' | 'lp' | 'rp', v }`, la multiplication implicite (2x, ab, 3(x+2)) rendue EXPLICITE par un jeton `op ×`. */
export function tokenize(src) {
  const s = String(src ?? '').replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[×x·]/g, (c) => (c === 'x' ? 'x' : '*'));
  if (!s) bad('vide');
  if (s.length > 40) bad('trop longue');
  const raw = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/[0-9]/.test(c)) { let j = i; while (j < s.length && /[0-9,.]/.test(s[j])) j += 1; raw.push({ k: 'num', v: s.slice(i, j).replace('.', ',') }); i = j; }
    else if (/[a-z]/.test(c)) { raw.push({ k: 'var', v: c }); i += 1; }
    else if (c === '+' || c === '-' || c === '*') { raw.push({ k: 'op', v: c === '*' ? '×' : c === '-' ? '−' : '+' }); i += 1; }
    else if (c === '(') { raw.push({ k: 'lp', v: '(' }); i += 1; }
    else if (c === ')') { raw.push({ k: 'rp', v: ')' }); i += 1; }
    else bad(`caractère ${c}`);
  }
  const out = [];
  raw.forEach((t, i) => {
    const prev = out[out.length - 1];
    const leftEnds = prev && (prev.k === 'num' || prev.k === 'var' || prev.k === 'rp');
    const rightStarts = t.k === 'var' || t.k === 'lp' || (t.k === 'num' && prev && (prev.k === 'var' || prev.k === 'rp'));
    if (leftEnds && rightStarts) out.push({ k: 'op', v: '×', implicit: true });
    out.push(t);
    if (i === raw.length - 1 && !t) bad('fin');
  });
  return out;
}

/** L'arbre : `{ t: 'num', v }`, `{ t: 'var', v }`, `{ t: 'bin', op, a, b }`, `{ t: 'par', e }` (la parenthèse est conservée pour le rendu). */
export function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  function atom() {
    const t = toks[p];
    if (!t) bad('fin inattendue');
    if (t.k === 'num') { p += 1; const q = parseNumber(t.v); if (!q) bad(`nombre ${t.v}`); return { t: 'num', v: t.v, q }; }
    if (t.k === 'var') { p += 1; return { t: 'var', v: t.v }; }
    if (t.k === 'lp') { p += 1; const e = sum(); if (peek()?.k !== 'rp') bad('parenthèse non fermée'); p += 1; return { t: 'par', e }; }
    return bad(`jeton ${t.v}`);
  }
  function prod() {
    let a = atom();
    while (peek()?.k === 'op' && peek().v === '×') { const op = toks[p]; p += 1; a = { t: 'bin', op: '×', a, b: atom(), implicit: !!op.implicit }; }
    return a;
  }
  function sum() {
    let a = prod();
    while (peek()?.k === 'op' && (peek().v === '+' || peek().v === '−')) { const op = toks[p].v; p += 1; a = { t: 'bin', op, a, b: prod() }; }
    return a;
  }
  const tree = sum();
  if (p !== toks.length) bad('reste');
  return tree;
}

/** Les lettres d'une règle, dans l'ordre d'apparition, sans doublon. */
export function lettersOf(tree, out = []) {
  if (tree.t === 'var') { if (!out.includes(tree.v)) out.push(tree.v); }
  else if (tree.t === 'bin') { lettersOf(tree.a, out); lettersOf(tree.b, out); }
  else if (tree.t === 'par') lettersOf(tree.e, out);
  return out;
}
/** Combien de fentes une lettre occupe dans la règle (« n » apparaît deux fois dans 5 × n + 20 − n). */
export function slotCount(tree, letter) {
  if (tree.t === 'var') return tree.v === letter ? 1 : 0;
  if (tree.t === 'bin') return slotCount(tree.a, letter) + slotCount(tree.b, letter);
  if (tree.t === 'par') return slotCount(tree.e, letter);
  return 0;
}

const asQ = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : parseNumber(v));

/** La valeur exacte de la règle quand chaque lettre prend sa valeur dans `env`. */
export function evaluate(tree, env) {
  switch (tree.t) {
    case 'num': return tree.q;
    case 'var': { const v = env[tree.v]; const q = v === undefined ? null : asQ(v); if (!q) bad(`la lettre ${tree.v} n'a pas de valeur`); return q; }
    case 'par': return evaluate(tree.e, env);
    case 'bin': {
      const a = evaluate(tree.a, env);
      const b = evaluate(tree.b, env);
      return tree.op === '+' ? add(a, b) : tree.op === '−' ? sub(a, b) : mul(a, b);
    }
    default: return bad('nœud');
  }
}

/* ── Rendu : la règle imprimée, la règle substituée, les étapes du calcul ── */

/** La règle imprimée avec les lettres (signe × toujours explicite) : une liste plate de jetons `{ k, v }`. */
export function printed(tree, out = []) {
  if (tree.t === 'num') out.push({ k: 'num', v: tree.v });
  else if (tree.t === 'var') out.push({ k: 'var', v: tree.v });
  else if (tree.t === 'par') { out.push({ k: 'lp', v: '(' }); printed(tree.e, out); out.push({ k: 'rp', v: ')' }); }
  else { printed(tree.a, out); out.push({ k: 'op', v: tree.op }); printed(tree.b, out); }
  return out;
}
/** La même règle où CHAQUE lettre est remplacée par sa valeur (`{ k: 'val', name, v }` : la valeur et la lettre qu'elle remplace). */
export function substitute(tree, env) {
  return printed(tree).map((t) => (t.k === 'var' ? { k: 'val', name: t.v, v: text(evaluate({ t: 'var', v: t.v }, env)) } : t));
}

const isNumTok = (t) => t && (t.k === 'num' || t.k === 'val');
const toQ = (t) => parseNumber(t.v.replace('−', '-'));
const numTok = (q) => ({ k: 'num', v: text(q) });

/** Un pas de calcul sur une liste plate de jetons numériques : la première parenthèse sans parenthèse dedans d'abord, puis le premier produit, puis la première somme ou différence ; `null` si fini. */
function reduceOnce(list) {
  let lo = -1; let hi = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].k === 'lp') lo = i;
    if (list[i].k === 'rp') { hi = i; break; }
  }
  if (lo >= 0 && hi > lo) {
    const inner = list.slice(lo + 1, hi);
    if (inner.length === 1 && isNumTok(inner[0])) return [...list.slice(0, lo), inner[0], ...list.slice(hi + 1)];
    const r = reduceFlat(inner);
    if (r.length === 1 && isNumTok(r[0])) return [...list.slice(0, lo), r[0], ...list.slice(hi + 1)];
    return [...list.slice(0, lo + 1), ...r, ...list.slice(hi)];
  }
  return reduceFlat(list);
}
function reduceFlat(list) {
  let i = list.findIndex((t) => t.k === 'op' && t.v === '×');
  if (i < 0) i = list.findIndex((t) => t.k === 'op');
  if (i < 0) return null;
  const a = toQ(list[i - 1]); const b = toQ(list[i + 1]);
  const v = list[i].v === '×' ? mul(a, b) : list[i].v === '+' ? add(a, b) : sub(a, b);
  return [...list.slice(0, i - 1), numTok(v), ...list.slice(i + 2)];
}

/** Les états successifs du calcul : `[substituée, …, nombre]` (chaque état est une liste de jetons ; le dernier n'a qu'un nombre). */
export function steps(tree, env) {
  const first = substitute(tree, env);
  const out = [first];
  let cur = first;
  for (let guard = 0; guard < 40; guard += 1) {
    const nxt = reduceOnce(cur);
    if (!nxt) break;
    out.push(nxt);
    cur = nxt;
  }
  return out;
}

/** Compare deux membres pour les valeurs `env` : `{ l, r, eq }`. */
export function compare(left, right, env) {
  const l = evaluate(left, env);
  const r = evaluate(right, env);
  return { l, r, eq: eq(l, r) };
}


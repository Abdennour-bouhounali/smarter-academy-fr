/**
 * Les ÉQUATIONS et les EXPRESSIONS littérales de 2AM (unité 4 « مفهوم معادلة », 2026-10-29) — arithmétique EXACTE (rationnels BigInt
 * de `powers.js`), importée PAR CHEMIN (`@smarter-academy/core/arithmetic/equation2.js`), jamais par le barrel du cœur
 * (BUNDLE_BOUNDARIES §4). Construite sur `substitution.js` (arbre, évaluation) : elle n'ajoute que ce que les leçons 2AM demandent.
 *
 * Elle grandit leçon par leçon :
 *   E1 `ibara-harfiya-intaj`        valueTable · firstMismatch · sameCount · simplified · showTimes · polyOf
 *   E2 `hall-mushkil-muadala`       solveForm · checkForm · undoChain · formOf
 *   E3 `ikhtibar-musawat-mutabayina` parseRelation · testAt · whichHold · identityVerdict · relText
 *
 * Les valeurs de cette leçon sont toutes ≥ 0 (ordre de génération, plan README, question 10) ; le code lui-même est exact pour les relatifs.
 */
import { rat, parseRat, add, sub, mul, div, neg, eq, sign, ratText } from './powers.js';
import {
  parseExpression, evaluate, writeLine, tokensText, slots, decimalText, samePolynomial, witness, LETTERS_2AM,
} from './substitution.js';

/** Un nombre (entier JS, texte « 1,5 », rationnel) → rationnel. */
const asRat = (v) => (v && typeof v === 'object' && 'n' in v ? rat(v.n, v.d) : typeof v === 'number' ? rat(v) : parseRat(v));

const parse = (text) => parseExpression(text, { letters: LETTERS_2AM });

/** Le format d'une valeur dans la ligne : entier, décimal (« 1,5 ») ou fraction. */
const envOf = (letter, v, extra = {}) => {
  const all = { ...extra, [letter]: v };
  return Object.fromEntries(Object.entries(all).map(([k, val]) => {
    const r = asRat(val);
    return [k, { v: r, fmt: r.d === 1n ? 'int' : decimalText(r) ? 'dec' : 'frac' }];
  }));
};

/**
 * Le TABLEAU DE VALEURS d'une expression en `letter` : une rangée par valeur, `{ v, value, line, text }` — `line` est la ligne du manuel
 * « 5 × 40 + 1 » (chaque × caché écrit), `text` « 5 × 40 + 1 = 201 ». `env` donne la valeur des AUTRES lettres (deux lettres : « 3x + 4y + 1 »).
 */
export function valueTable(text, letter, values, env = {}) {
  const tree = parse(text);
  const sl = slots(tree);
  const choices = sl.map(() => ({ times: true }));
  return values.map((raw) => {
    const e = envOf(letter, raw, env);
    const value = evaluate(tree, Object.fromEntries(Object.entries(e).map(([k, o]) => [k, o.v])));
    const line = tokensText(writeLine(tree, e, choices));
    return { v: asRat(raw), value, line, text: `${line} = ${ratText(value).replace('/', '/')}` };
  });
}

/** Les expressions `a` et `b` (textes), évaluées à chaque valeur : la première valeur où elles DIFFÈRENT, ou null (le contre-exemple). */
export function firstMismatch(textA, textB, letter, values) {
  const a = parse(textA); const b = parse(textB);
  const hit = witness(a, b, values.map(asRat), letter);
  return hit == null ? null : hit;
}

/** Deux écritures donnent-elles le MÊME polynôme en `letter` (le même décompte pour tout n) ? null si l'une n'est pas un polynôme entier. */
export function sameCount(textA, textB, letter = 'n') {
  return samePolynomial(parse(textA), parse(textB), letter);
}

/* ── La forme simplifiée ─────────────────────────────────────────────────────────────────────── */

/** Polynôme multivarié : { 'a2b1': { c: rat, e: { a: 2, b: 1 } } } ; la clé est vide pour le terme constant. */
function polyOf(tree) {
  const key = (e) => Object.keys(e).sort().filter((k) => e[k] > 0).map((k) => `${k}${e[k]}`).join('');
  const addP = (a, b, k = 1) => {
    const r = { ...a };
    for (const [m, t] of Object.entries(b)) {
      const c = k === 1 ? t.c : neg(t.c);
      r[m] = { c: add(r[m]?.c ?? rat(0), c), e: t.e };
    }
    return r;
  };
  const mulP = (a, b) => {
    const r = {};
    for (const x of Object.values(a)) for (const y of Object.values(b)) {
      const e = { ...x.e };
      for (const [l, n] of Object.entries(y.e)) e[l] = (e[l] ?? 0) + n;
      const m = key(e);
      r[m] = { c: add(r[m]?.c ?? rat(0), mul(x.c, y.c)), e };
    }
    return r;
  };
  const go = (n) => {
    switch (n.t) {
      case 'num': return { '': { c: n.v, e: {} } };
      case 'var': return { [`${n.name}1`]: { c: rat(1), e: { [n.name]: 1 } } };
      case 'neg': return addP({}, go(n.a), -1);
      case 'add': return addP(go(n.a), go(n.b));
      case 'sub': return addP(go(n.a), go(n.b), -1);
      case 'mul': return mulP(go(n.a), go(n.b));
      case 'pow': { let r = { '': { c: rat(1), e: {} } }; const b = go(n.a); for (let i = 0; i < n.n; i += 1) r = mulP(r, b); return r; }
      default: throw new Error('nœud inconnu');
    }
  };
  const poly = go(tree);
  for (const m of Object.keys(poly)) if (poly[m].c.n === 0n) delete poly[m];
  return poly;
}

const SUP = { 2: '²', 3: '³' };
const monoText = (e) => Object.keys(e).sort().filter((l) => e[l] > 0).map((l) => (e[l] === 1 ? l : e[l] <= 3 ? `${l}${SUP[e[l]]}` : `${l}^${e[l]}`)).join('');
const coefText = (c) => { const a = c.n < 0n ? -c.n : c.n; return c.d === 1n ? String(a) : (decimalText({ n: a, d: c.d }) ?? `${a}/${c.d}`).replace('.', ','); };

/**
 * L'écriture SIMPLIFIÉE (× omis, 1·a = a, 0·a = 0, a², a³, k·a + m·a = (k + m)·a) : « 3 × a × b » → « 3ab », « 2a + 5a − 3a » → « 4a »,
 * « c + c × c + c » → « c² + 2c ». Termes par degré décroissant puis par lettres, le terme constant en dernier. Le polynôme nul s'écrit « 0 ».
 */
export function simplified(text) {
  const poly = polyOf(parse(text));
  const terms = Object.values(poly).sort((x, y) => {
    const dx = Object.values(x.e).reduce((s, n) => s + n, 0); const dy = Object.values(y.e).reduce((s, n) => s + n, 0);
    return dy - dx || monoText(x.e).localeCompare(monoText(y.e));
  });
  if (!terms.length) return '0';
  return terms.map((t, i) => {
    const m = monoText(t.e);
    const one = t.c.n === 1n && t.c.d === 1n;
    const body = m ? `${one ? '' : coefText(t.c)}${m}` : coefText(t.c);
    const neg1 = sign(t.c) < 0;
    return i === 0 ? `${neg1 ? '−' : ''}${body}` : ` ${neg1 ? '−' : '+'} ${body}`;
  }).join('');
}

/** Le × CACHÉ réécrit (exercice « أعد كتابة كلّ من العبارات بإضافة إشارات العمليات غير الظاهرة ») : « 2x² + 12 » → « 2 × x × x + 12 ». */
export function showTimes(text) {
  const tree = parse(text);
  const num = (v) => coefText(v);
  const wrap = (n, cond) => (cond ? `(${go(n)})` : go(n));
  const go = (n) => {
    switch (n.t) {
      case 'num': return `${sign(n.v) < 0 ? '−' : ''}${num(n.v)}`;
      case 'var': return n.name;
      case 'neg': return `−${wrap(n.a, n.a.t === 'add' || n.a.t === 'sub')}`;
      case 'add': return `${go(n.a)} + ${go(n.b)}`;
      case 'sub': return `${go(n.a)} − ${wrap(n.b, n.b.t === 'add' || n.b.t === 'sub')}`;
      case 'mul': return `${wrap(n.a, n.a.t === 'add' || n.a.t === 'sub')} × ${wrap(n.b, n.b.t === 'add' || n.b.t === 'sub')}`;
      case 'pow': return n.a.t === 'var' || n.a.t === 'num' ? Array.from({ length: n.n }, () => go(n.a)).join(' × ') : `(${go(n.a)})${SUP[n.n]}`;
      default: return '';
    }
  };
  return go(tree);
}

/* ── E2 : les équations à une opération et à deux opérations (hall-mushkil-muadala) ───────────── */

/** Un rationnel écrit à l'algérienne : « 1,5 », « 2/3 » (jamais de point). */
const num = (r) => { if (r.d === 1n) return String(r.n); const t = decimalText(r); return t != null ? t.replace('.', ',') : ratText(r); };

/**
 * Résout une équation à UNE opération par l'opération inverse. `form` : 'times' (a × x = b → x = b ÷ a), 'over' (x ÷ a = b → x = a × b),
 * 'under' (a ÷ x = b → x = a ÷ b), 'plus' (a + x = b → x = b − a), 'minus' (a − x = b → x = a − b). Refuse a = 0 (sauf 'plus' / 'minus'),
 * b = 0 pour 'under', et un x < 0 (sauf `allowNegative`). → { x, inverse, line } où `line` est la ligne du calcul « x = 18 ÷ 12 = 1,5 ».
 */
export function solveForm({ form, a, b }, { allowNegative = false } = {}) {
  const A = asRat(a); const B = asRat(b);
  const zeroA = A.n === 0n;
  let x; let inverse; let expr;
  switch (form) {
    case 'times': if (zeroA) throw new Error('a = 0'); x = div(B, A); inverse = '÷'; expr = `${num(B)} ÷ ${num(A)}`; break;
    case 'over': if (zeroA) throw new Error('a = 0'); x = mul(A, B); inverse = '×'; expr = `${num(A)} × ${num(B)}`; break;
    case 'under': if (zeroA || B.n === 0n) throw new Error('a ou b = 0'); x = div(A, B); inverse = '÷'; expr = `${num(A)} ÷ ${num(B)}`; break;
    case 'plus': x = sub(B, A); inverse = '−'; expr = `${num(B)} − ${num(A)}`; break;
    case 'minus': x = sub(A, B); inverse = '−'; expr = `${num(A)} − ${num(B)}`; break;
    default: throw new Error(`forme inconnue : ${form}`);
  }
  if (!allowNegative && sign(x) < 0) throw new Error('x < 0');
  return { x, inverse, line: `x = ${expr} = ${num(x)}` };
}

/** Vérifie la valeur `x` dans l'équation { form, a, b } en faisant l'UNE opération : → { value, holds, line } (« 12 ÷ 3 = 4 »). */
export function checkForm({ form, a, b }, x) {
  const A = asRat(a); const B = asRat(b); const X = asRat(x);
  let value; let line;
  switch (form) {
    case 'times': value = mul(A, X); line = `${num(A)} × ${num(X)} = ${num(value)}`; break;
    case 'over': if (A.n === 0n) throw new Error('a = 0'); value = div(X, A); line = `${num(X)} ÷ ${num(A)} = ${num(value)}`; break;
    case 'under': if (X.n === 0n) return { value: null, holds: false, line: '÷ 0' }; value = div(A, X); line = `${num(A)} ÷ ${num(X)} = ${num(value)}`; break;
    case 'plus': value = add(A, X); line = `${num(A)} + ${num(X)} = ${num(value)}`; break;
    case 'minus': value = sub(A, X); line = `${num(A)} − ${num(X)} = ${num(value)}`; break;
    default: throw new Error(`forme inconnue : ${form}`);
  }
  return { value, holds: eq(value, B), line };
}

/**
 * Les deux étapes d'une équation à deux opérations, en défaisant la DERNIÈRE opération d'abord.
 * order 'times-first' : k·x + c = d (dernière opération : + c) → d − c = k·x puis ÷ k ; order 'plus-first' : (x + c) ÷ k = d (dernière : ÷ k) → ×k puis − c.
 * → { steps: [{ undo, to, line }, { … }], x, last } ; `last` = l'opération défaite en premier. Refuse un intermédiaire ou x < 0.
 */
export function undoChain({ k, c, d, order }) {
  const K = asRat(k); const C = asRat(c); const Dv = asRat(d);
  if (K.n === 0n) throw new Error('k = 0');
  let mid; let x; let steps; let last;
  if (order === 'times-first') {
    mid = sub(Dv, C); x = div(mid, K); last = `+ ${num(C)}`;
    steps = [{ undo: `− ${num(C)}`, to: mid, line: `${num(K)}x = ${num(Dv)} − ${num(C)} = ${num(mid)}` }, { undo: `÷ ${num(K)}`, to: x, line: `x = ${num(mid)} ÷ ${num(K)} = ${num(x)}` }];
  } else if (order === 'plus-first') {
    mid = mul(Dv, K); x = sub(mid, C); last = `÷ ${num(K)}`;
    steps = [{ undo: `× ${num(K)}`, to: mid, line: `x + ${num(C)} = ${num(Dv)} × ${num(K)} = ${num(mid)}` }, { undo: `− ${num(C)}`, to: x, line: `x = ${num(mid)} − ${num(C)} = ${num(x)}` }];
  } else throw new Error(`ordre inconnu : ${order}`);
  if (sign(mid) < 0 || sign(x) < 0) throw new Error('valeur négative');
  return { steps, x, mid, last };
}

const norm = (t) => String(t).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, '').replace(/[,،]/g, '.').replace(/[×·*]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').toLowerCase();
const NUM = '(\\d+(?:\\.\\d+)?)';
/**
 * Lit une équation à une opération écrite par l'élève : « 2,5x = 10 », « 2.5*x=10 », « x/0,4 = 15 », « x ÷ 0,4 = 15 », « 56/x = 7 », « 7 + x = 12 », « 9 - x = 4 »
 * → { form, a, b } (nombres en texte), ou null. Les formes 'times' acceptent aussi « x*a = b ».
 */
export function formOf(text) {
  const t = norm(text);
  const m = (re) => re.exec(t);
  let r;
  if ((r = m(new RegExp(`^${NUM}\\*?x=${NUM}$`)))) return { form: 'times', a: r[1], b: r[2] };
  if ((r = m(new RegExp(`^x\\*${NUM}=${NUM}$`)))) return { form: 'times', a: r[1], b: r[2] };
  if ((r = m(new RegExp(`^x/${NUM}=${NUM}$`)))) return { form: 'over', a: r[1], b: r[2] };
  if ((r = m(new RegExp(`^${NUM}/x=${NUM}$`)))) return { form: 'under', a: r[1], b: r[2] };
  if ((r = m(new RegExp(`^${NUM}\\+x=${NUM}$`))) || (r = m(new RegExp(`^x\\+${NUM}=${NUM}$`)))) return { form: 'plus', a: r[1], b: r[2] };
  if ((r = m(new RegExp(`^${NUM}-x=${NUM}$`)))) return { form: 'minus', a: r[1], b: r[2] };
  return null;
}

/* ═════════════ E3 — tester une égalité / une inégalité par substitution (`ikhtibar-musawat-mutabayina`, 2026-10-29) ═════════════ */

const REL_TOKENS = [['<=', '≤'], ['>=', '≥'], ['≤', '≤'], ['≥', '≥'], ['=', '='], ['<', '<'], ['>', '>']];
const REL_SIGN = { '=': '=', '<': '<', '>': '>', '≤': '≤', '≥': '≥' };
/** Le signe d'une relation, écrit comme dans le cahier (« ≤ » reste « ≤ »). */
const relText = (rel) => REL_SIGN[rel];

/**
 * Lit « 4000 + 50x < 5000 » (ou =, >, ≤, ≥, aussi « <= » et « >= ») → { left, rel, right, leftText, rightText } : les deux membres sont des arbres de `parseExpression`
 * (lettres de `LETTERS_2AM`). Exactement UN signe ; sinon lève une erreur.
 */
export function parseRelation(text) {
  const raw = String(text);
  let hit = null;
  for (let i = 0; i < raw.length && !hit; i += 1) {
    for (const [tok, rel] of REL_TOKENS) {
      if (raw.startsWith(tok, i)) { hit = { at: i, len: tok.length, rel }; break; }
    }
  }
  if (!hit) throw new Error('aucun signe de comparaison');
  const leftText = raw.slice(0, hit.at).trim(); const rightText = raw.slice(hit.at + hit.len).trim();
  if (!leftText || !rightText || /[<>=≤≥]/.test(rightText)) throw new Error('relation illisible');
  return { left: parse(leftText), rel: hit.rel, right: parse(rightText), leftText, rightText };
}

const holdsRel = (rel, a, b) => {
  const c = sub(a, b); const sg = sign(c);
  if (rel === '=') return sg === 0;
  if (rel === '<') return sg < 0;
  if (rel === '>') return sg > 0;
  if (rel === '≤') return sg <= 0;
  return sg >= 0;
};

/** « 4000 + 50 × 15 » (chaque × caché écrit) pour un membre ; un membre sans lettre s'écrit seul. */
const memberLine = (tree, env) => {
  const sl = slots(tree);
  return tokensText(writeLine(tree, env, sl.map(() => ({ times: true, brackets: false }))));
};

/**
 * L'ESSAI d'une relation en un point : `env` = { x: 15, y: '2,5' } (entiers, textes « 1,5 » ou rationnels). Rend
 * `{ leftValue, rightValue, holds, lines: { left, right, leftEq, rightEq, cmp } }` — `leftEq` « 4000 + 50 × 15 = 4750 », `cmp` « 4750 < 5000 » : la ligne du tableau « النتيجة ».
 */
export function testAt(relation, env = {}) {
  const rel = typeof relation === 'string' ? parseRelation(relation) : relation;
  const e = Object.fromEntries(Object.entries(env).map(([k, v]) => {
    const r = asRat(v);
    return [k, { v: r, fmt: r.d === 1n ? 'int' : decimalText(r) ? 'dec' : 'frac' }];
  }));
  const plain = Object.fromEntries(Object.entries(e).map(([k, o]) => [k, o.v]));
  const leftValue = evaluate(rel.left, plain); const rightValue = evaluate(rel.right, plain);
  const lv = ratText(leftValue); const rv = ratText(rightValue);
  const left = memberLine(rel.left, e); const right = memberLine(rel.right, e);
  return {
    leftValue, rightValue, holds: holdsRel(rel.rel, leftValue, rightValue),
    lines: { left, right, leftEq: `${left} = ${lv}`, rightEq: `${right} = ${rv}`, cmp: `${lv} ${relText(rel.rel)} ${rv}` },
  };
}

/** Parmi `values` (valeurs de `letter`), celles qui rendent la relation vraie, dans l'ordre donné (rationnels). `env` : les AUTRES lettres. */
export function whichHold(relation, letter, values, env = {}) {
  const rel = typeof relation === 'string' ? parseRelation(relation) : relation;
  return values.map(asRat).filter((v) => testAt(rel, { ...env, [letter]: v }).holds);
}

/**
 * Deux expressions sont-elles égales POUR TOUTE valeur de `letter` ? `'always'` (même polynôme) ; `{ counterexample }` (la première valeur de
 * `candidates` où elles diffèrent) ; `{ counterexample: null }` si elles diffèrent mais qu'aucun candidat ne le montre.
 */
export function identityVerdict(textA, textB, candidates = [0, 1, 2, 3, 4, 5, 10], letter = 'x') {
  const a = parse(textA); const b = parse(textB);
  const same = samePolynomial(a, b, letter);
  if (same === true) return 'always';
  const hit = witness(a, b, candidates.map(asRat), letter);
  return { counterexample: hit };
}


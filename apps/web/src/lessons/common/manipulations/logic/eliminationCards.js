import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';

/**
 * La logique PURE de `elimination-cards` (unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
 * leçon « حل جملة معادلتين جبريا ») — aucune vue, aucun React. Toute l'arithmétique passe
 * par packages/core/arithmetic/linearSystem.js (isolate, substitute, scale, addEqs,
 * eliminated, pairHolds) : 3x − 2y = 4,2 reste exact, (2,6 ; 1,8) = (13/5 ; 9/5).
 *
 * LE MONDE. Deux CARTES-ÉQUATIONS (1) et (2), chacune une rangée de tuiles x, y et sa valeur.
 * L'élève doit faire DISPARAÎTRE une inconnue, par l'un des deux gestes du manuel :
 *
 *   التعويض  ISOLER une inconnue d'une carte (la tirer dans le tiroir : y = 7 − 2x), puis
 *            PORTER l'expression sur les tuiles de cette inconnue dans l'AUTRE carte : chaque
 *            tuile y devient le paquet (7 − 2x) — la carte n'a plus qu'une inconnue.
 *            Porter l'expression sur la carte d'où elle vient est REFUSÉ, en montrant ce que
 *            cela donnerait : 2x + (7 − 2x) = 7, « أي 7 = 7 » — vrai, et ne dit rien.
 *   الجمع    MULTIPLIER une carte par k (étirement ; les DEUX membres, par construction — le
 *            multiplicateur tient la carte entière), puis POSER une carte sur l'autre : les
 *            tuiles opposées s'annulent par paires. Refusé, avec la somme écrite, quand rien
 *            ne s'annule (« بقي المجهولان ») ; ×0 refusé (il efface l'équation).
 *
 * Puis l'équation à UNE inconnue se résout ligne par ligne (l'idée de l'unité 4, pas son
 * laboratoire), et la valeur trouvée se PORTE sur une carte de départ pour obtenir l'autre :
 * le laboratoire ne finit qu'avec la ثنائية (x ; y) — jamais avec x seul.
 *
 * MÉMOIRE. `methodsDone` garde la ثنائية obtenue par chaque méthode à travers « بالطريقة
 * الأخرى » (qui remet les cartes) : la découverte demande les DEUX méthodes, comme le
 * نشاط 2 demande les deux élèves — le contraste « deux chemins, la même ثنائية ».
 */

const { frac, mul, div, neg, eq, cmp, isZero, isInteger, fracLatex, fracText, fracDecimal, toNumber } = Lin;

export const VARS = Object.freeze(['x', 'y']);
export const CARDS = Object.freeze([1, 2]);
export const SCALE_MIN = -6;
export const SCALE_MAX = 6;
export const other = (v) => (v === 'x' ? 'y' : 'x');
const coefOf = (e, v) => (v === 'x' ? e.a : e.b);

/** « 2x+y=7|3x-2y=4,2 » → la jumla exacte (linearSystem.system). */
export function parseSystem(src) {
  const parts = String(src).split('|');
  if (parts.length !== 2) throw new Error(`elimination-cards : « ${src} » n'est pas une jumla « (1)|(2) »`);
  const sys = LS.system(parts[0], parts[1]);
  if (LS.classify(sys).kind !== 'unique') throw new Error(`elimination-cards : « ${src} » n'a pas une solution unique`);
  return sys;
}

/** Le manuel écrit les nombres décimaux en décimaux (2,6 ; 1,8) quand la jumla en contient. */
export const decimalMode = (src) => /\d[.,]\d/.test(String(src));

/* ── Écrire (mise en forme seulement : les nombres viennent de linearSystem) ───────────── */

/** Un nombre en LaTeX : décimal à virgule « 2{,}6 » si la jumla est décimale et l'écriture finie. */
export function numTex(f, decimal = false) {
  if (decimal && !isInteger(f)) {
    const d = fracDecimal(f, 3);
    if (d) return d.replace(',', '{,}');
  }
  return fracLatex(f);
}
/** Le même nombre en texte (ARIA, tests) : « 2,6 », « -1/2 ». */
export function numText(f, decimal = false) {
  if (decimal && !isInteger(f)) { const d = fracDecimal(f, 3); if (d) return d; }
  return fracText(f);
}
/** Un nombre entre parenthèses s'il est négatif (dans un produit « 2 × (−3) »). */
const paren = (f, decimal) => (cmp(f, 0) < 0 ? `(${numTex(f, decimal)})` : numTex(f, decimal));

/** « 2x », « - y », « + 4,2x » : un terme signé (vide si le coefficient est nul). */
function termTex(coef, name, first, decimal) {
  if (isZero(coef)) return '';
  const negative = cmp(coef, 0) < 0;
  const abs = negative ? neg(coef) : coef;
  const body = eq(abs, 1) ? name : `${numTex(abs, decimal)}${name}`;
  if (first) return negative ? `-${body}` : body;
  return negative ? ` - ${body}` : ` + ${body}`;
}

/** Le premier membre a·x + b·y (« 0 » s'il est vide). */
export function leftTex(e, decimal = false) {
  const t1 = termTex(e.a, 'x', true, decimal);
  const t2 = termTex(e.b, 'y', t1 === '', decimal);
  return `${t1}${t2}` || '0';
}
/** Une équation « 2x + y = 7 ». */
export const eqTex = (e, decimal = false) => `${leftTex(e, decimal)} = ${numTex(e.c, decimal)}`;

/**
 * L'expression isolée v = k·u + m à la façon du manuel : « x - 2 » (k > 0), « 7 - 2x » (k < 0),
 * « 3{,}5 - 0{,}5y »… (u = l'autre inconnue).
 */
export function exprTex({ k, m }, u, decimal = false) {
  const kAbs = cmp(k, 0) < 0 ? neg(k) : k;
  const kTerm = isZero(k) ? '' : `${eq(kAbs, 1) ? '' : numTex(kAbs, decimal)}${u}`;
  if (isZero(k)) return numTex(m, decimal);
  if (cmp(k, 0) > 0) {
    if (isZero(m)) return kTerm;
    return `${kTerm} ${cmp(m, 0) < 0 ? '-' : '+'} ${numTex(cmp(m, 0) < 0 ? neg(m) : m, decimal)}`;
  }
  if (isZero(m)) return `-${kTerm}`;
  return `${numTex(m, decimal)} - ${kTerm}`;
}

/**
 * Le membre où l'inconnue `v` est REMPLACÉE par le paquet (expr) : « 3x - 2(7 - 2x) »,
 * « 3x + (x - 2) », « (y + 2) + y ». Rien n'est développé : c'est la ligne du manuel.
 */
function substitutedLeftTex(e, v, expr, decimal = false) {
  const own = coefOf(e, v);
  const oth = coefOf(e, other(v));
  const bundle = `(${exprTex(expr, other(v), decimal)})`;
  const ownAbs = cmp(own, 0) < 0 ? neg(own) : own;
  const ownBody = `${eq(ownAbs, 1) ? '' : numTex(ownAbs, decimal)}${bundle}`;
  const othTerm = (first) => termTex(oth, other(v), first, decimal);
  if (v === 'y') {
    const t1 = othTerm(true);
    if (!t1) return cmp(own, 0) < 0 ? `-${ownBody}` : ownBody;
    return `${t1} ${cmp(own, 0) < 0 ? '-' : '+'} ${ownBody}`;
  }
  const t1 = cmp(own, 0) < 0 ? `-${ownBody}` : ownBody;
  return `${t1}${othTerm(false)}`;
}

/** « 2 \times 2{,}6 + y » : la valeur portée dans une carte de départ (le manuel : 4x + 2 × 3 = 9). */
function valueInTex(e, v, value, decimal = false) {
  const own = coefOf(e, v);
  const oth = coefOf(e, other(v));
  const negative = cmp(own, 0) < 0;
  const ownAbs = negative ? neg(own) : own;
  const magnitude = eq(ownAbs, 1) ? paren(value, decimal) : `${numTex(ownAbs, decimal)} \\times ${paren(value, decimal)}`;
  if (v === 'x') {
    const lead = !negative && eq(ownAbs, 1) ? numTex(value, decimal) : `${negative ? '-' : ''}${magnitude}`;
    return `${lead}${termTex(oth, 'y', false, decimal)}`;
  }
  const first = termTex(oth, 'x', true, decimal);
  if (!first) return `${negative ? '-' : ''}${magnitude}`;
  return `${first} ${negative ? '-' : '+'} ${magnitude}`;
}

/* ── L'état ─────────────────────────────────────────────────────────────────────────────── */

/** Un laboratoire neuf ; `memory` = ce qui survit à « بالطريقة الأخرى ». */
export function init(src, memory = null) {
  const sys = parseSystem(src);
  return {
    src,
    sys,
    decimal: decimalMode(src),
    scale: { 1: 1, 2: 1 },
    expr: null, // { from, v, k, m, fractional }
    method: '', // '' | 'sub' | 'add'
    stage: 'cards', // 'cards' | 'one' | 'back' | 'done'
    one: null, // { u, a, c, lines (à révéler), shown }
    found: null, // { v, value }
    result: null, // { x, y, via, checks }
    lines: [],
    methodsDone: memory?.methodsDone ?? { sub: null, add: null },
    attempts: memory?.attempts ?? [],
    refusals: memory?.refusals ?? 0,
  };
}

/** La carte n telle qu'elle est posée (avec son multiplicateur). */
export const card = (lab, n) => (lab.scale[n] === 1 ? lab.sys[n - 1] : LS.scale(lab.sys[n - 1], lab.scale[n]));
const cardTex = (lab, n) => eqTex(card(lab, n), lab.decimal);

/* ── Multiplier une carte (× k, les deux membres) ────────────────────────────────────────── */

export function canScale(lab, n, k) {
  if (lab.stage !== 'cards') return 'notNow';
  if (!Number.isInteger(k) || k < SCALE_MIN || k > SCALE_MAX) return 'scaleRange';
  if (k === 0) return 'zero';
  return CARDS.includes(n) ? true : '';
}
export function setScale(lab, n, k) {
  if (canScale(lab, n, k) !== true) return lab;
  return { ...lab, scale: { ...lab.scale, [n]: k } };
}

/* ── التعويض : isoler, puis porter l'expression ────────────────────────────────────────── */

export function canIsolate(lab, n, v) {
  if (lab.stage !== 'cards') return 'notNow';
  if (!CARDS.includes(n) || !VARS.includes(v)) return '';
  if (isZero(coefOf(card(lab, n), v))) return 'noUnknownHere';
  return true;
}
/** Tirer v de la carte n : v = k·u + m (linearSystem.isolate). */
export function isolateFrom(lab, n, v) {
  if (canIsolate(lab, n, v) !== true) return lab;
  const { k, m } = LS.isolate(card(lab, n), v);
  const expr = { from: n, v, k, m, fractional: !isInteger(k) || !isInteger(m) };
  return { ...lab, expr };
}
export const exprLine = (lab) => (lab.expr ? `${lab.expr.v} = ${exprTex(lab.expr, other(lab.expr.v), lab.decimal)}` : null);

export function canSubstitute(lab, n, v) {
  if (lab.stage !== 'cards' || !lab.expr) return 'notNow';
  if (!CARDS.includes(n)) return '';
  if (v && v !== lab.expr.v) return 'wrongUnknown';
  if (n === lab.expr.from) return 'sameCard';
  if (isZero(coefOf(card(lab, n), lab.expr.v))) return 'noUnknownHere';
  return true;
}

/** Ce que donnerait l'expression portée sur SA propre carte : « 2x + (7 - 2x) = 7 », « 7 = 7 ». */
export function sameCardDetails(lab) {
  const { expr } = lab;
  const e = card(lab, expr.from);
  const own = coefOf(e, expr.v);
  const after = LS.substitute(e, expr.v, expr);
  const constLeft = mul(own, expr.m);
  return {
    line: `${substitutedLeftTex(e, expr.v, expr, lab.decimal)} = ${numTex(e.c, lab.decimal)}`,
    identity: `${numTex(constLeft, lab.decimal)} = ${numTex(e.c, lab.decimal)}`,
    vanished: isZero(after.a) && isZero(after.c),
  };
}

/** Porter l'expression sur la carte n : la carte n'a plus qu'une inconnue u (linearSystem.substitute). */
export function substituteInto(lab, n) {
  if (canSubstitute(lab, n, lab.expr?.v) !== true) return lab;
  const { expr, decimal } = lab;
  const e = card(lab, n);
  const u = other(expr.v);
  const { a, c } = LS.substitute(e, expr.v, expr);
  const own = coefOf(e, expr.v);
  const constLeft = mul(own, expr.m);
  const lines = [];
  // Ce qui est écrit au moment du geste : l'isolement puis la carte réécrite.
  lines.push({ key: 'isolate', n: expr.from, tex: exprLine(lab) });
  lines.push({ key: 'substitute', n, v: expr.v, tex: `${substitutedLeftTex(e, expr.v, expr, decimal)} = ${numTex(e.c, decimal)}` });
  // Ce qui reste à révéler (« السطر التالي ») : simplifier, isoler u, la valeur.
  const pending = [];
  const uTerm = termTex(a, u, true, decimal) || '0';
  if (!isZero(constLeft)) pending.push({ key: 'simplify', tex: `${uTerm}${cmp(constLeft, 0) < 0 ? ' - ' : ' + '}${numTex(cmp(constLeft, 0) < 0 ? neg(constLeft) : constLeft, decimal)} = ${numTex(e.c, decimal)}` });
  pending.push({ key: 'hence', tex: `${uTerm} = ${numTex(c, decimal)}` });
  return withOne({ ...lab, method: 'sub', stage: 'one', lines: [...lab.lines, ...lines] }, u, a, c, pending);
}

/* ── الجمع : poser une carte sur l'autre ─────────────────────────────────────────────────── */

/** La somme des deux cartes posées, et l'inconnue qui disparaît. */
export function stackSum(lab) {
  const sum = LS.addEqs(card(lab, 1), card(lab, 2));
  return { sum, gone: LS.eliminated(sum) };
}
export function canStack(lab, n, m) {
  if (lab.stage !== 'cards') return 'notNow';
  if (!CARDS.includes(n) || !CARDS.includes(m)) return '';
  if (n === m) return '';
  const { gone } = stackSum(lab);
  if (gone === null) return 'noCancel';
  if (gone === 'both') return 'both';
  return true;
}
/**
 * Pourquoi rien ne s'annule : la somme écrite, et, pour chaque inconnue, si ses deux
 * coefficients sont ÉGAUX (il faut alors un multiplicateur négatif) — MISC-JAM-LA-TAAKUS.
 */
export function noCancelDetails(lab) {
  const { sum } = stackSum(lab);
  const e1 = card(lab, 1); const e2 = card(lab, 2);
  const equalVar = VARS.find((v) => eq(coefOf(e1, v), coefOf(e2, v))) ?? null;
  return { sum: eqTex(sum, lab.decimal), equalVar };
}
/** Les paires de tuiles qui s'annulent : leur nombre (|coefficient| s'il est entier) pour le dessin. */
export function cancelledPairs(lab) {
  const { gone } = stackSum(lab);
  if (gone !== 'x' && gone !== 'y') return null;
  const c = coefOf(card(lab, 1), gone);
  const abs = cmp(c, 0) < 0 ? neg(c) : c;
  return { v: gone, count: isInteger(abs) ? abs.n : null, coef: abs };
}
export function stack(lab, n, m) {
  if (canStack(lab, n, m) !== true) return lab;
  const { decimal } = lab;
  const { sum, gone } = stackSum(lab);
  const u = other(gone);
  const lines = [];
  for (const k of CARDS) {
    if (lab.scale[k] !== 1) lines.push({ key: 'scale', n: k, k: lab.scale[k], tex: `${eqTex(lab.sys[k - 1], decimal)} \\;\\xrightarrow{\\times ${lab.scale[k] < 0 ? `(${lab.scale[k]})` : lab.scale[k]}}\\; ${cardTex(lab, k)}` });
  }
  const e1 = card(lab, 1); const e2 = card(lab, 2);
  lines.push({ key: 'sum', tex: `(${leftTex(e1, decimal)}) + (${leftTex(e2, decimal)}) = ${numTex(e1.c, decimal)} + ${paren(e2.c, decimal)}` });
  lines.push({ key: 'hence', tex: eqTex(sum, decimal) });
  const a = coefOf(sum, u);
  const pairs = cancelledPairs(lab);
  return { ...withOne({ ...lab, method: 'add', stage: 'one', lines: [...lab.lines, ...lines] }, u, a, sum.c, []), pairs };
}

/* ── Résoudre l'équation à une inconnue, ligne par ligne ─────────────────────────────────── */

function withOne(lab, u, a, c, pending) {
  if (isZero(a)) {
    // Une jumla à solution unique ne peut pas arriver ici (classify l'a vérifié à l'entrée).
    throw new Error('elimination-cards : l’équation à une inconnue n’a pas de coefficient');
  }
  const value = div(c, a);
  const valueLine = { key: 'value', tex: `${u} = ${numTex(value, lab.decimal)}` };
  return { ...lab, one: { u, a, c, value, pending: [...pending, valueLine] } };
}

/** Révéler la ligne suivante ; la dernière (u = …) ouvre le retour sur une carte. */
export function solveStep(lab) {
  if (lab.stage !== 'one' || !lab.one?.pending.length) return lab;
  const [next, ...rest] = lab.one.pending;
  const done = rest.length === 0;
  return {
    ...lab,
    lines: [...lab.lines, next],
    one: { ...lab.one, pending: rest },
    stage: done ? 'back' : 'one',
    found: done ? { v: lab.one.u, value: lab.one.value } : null,
  };
}

/* ── Porter la valeur trouvée sur une carte de départ → la ثنائية ───────────────────────── */

export function canBack(lab, n) {
  if (lab.stage !== 'back' || !lab.found) return 'notNow';
  if (!CARDS.includes(n)) return '';
  if (isZero(coefOf(lab.sys[n - 1], other(lab.found.v)))) return 'noOther';
  return true;
}
export function backSubstitute(lab, n) {
  if (canBack(lab, n) !== true) return lab;
  const { decimal, found } = lab;
  const e = lab.sys[n - 1];
  const w = other(found.v);
  // e avec v remplacé par la constante trouvée : une équation en w (linearSystem.substitute, k = 0).
  const { a, c } = LS.substitute(e, found.v, { k: frac(0), m: found.value });
  const wValue = div(c, a);
  const x = found.v === 'x' ? found.value : wValue;
  const y = found.v === 'y' ? found.value : wValue;
  const checks = LS.pairHolds(lab.sys, x, y);
  const lines = [
    { key: 'back', n, v: found.v, tex: `${valueInTex(e, found.v, found.value, decimal)} = ${numTex(e.c, decimal)}` },
    { key: 'value', tex: `${w} = ${numTex(wValue, decimal)}` },
    { key: 'pair', tex: pairTex(x, y, decimal) },
  ];
  const pair = { x: fracText(x), y: fracText(y) };
  return {
    ...lab,
    stage: 'done',
    lines: [...lab.lines, ...lines],
    result: { x, y, via: n, checks },
    methodsDone: { ...lab.methodsDone, [lab.method]: pair },
    attempts: [...lab.attempts, { method: lab.method, pair, lines: lab.lines.length + lines.length, fractional: !!lab.expr?.fractional, scales: { ...lab.scale } }],
  };
}

/** « (2{,}6 ; 1{,}8) », « \left(-\dfrac{1}{2} ; -\dfrac{5}{2}\right) ». */
export function pairTex(x, y, decimal = false) {
  const fx = numTex(x, decimal); const fy = numTex(y, decimal);
  return fx.includes('dfrac') || fy.includes('dfrac') ? `\\left(${fx} ; ${fy}\\right)` : `(${fx} ; ${fy})`;
}
/** La vérification dans les deux équations : « 2 × 2,6 + 1,8 = 7 ». */
export function checkLines(lab) {
  if (!lab.result) return [];
  const { x, y } = lab.result;
  return lab.sys.map((e, i) => {
    const xs = eq(e.a, 1) ? paren(x, lab.decimal) : eq(e.a, -1) ? `-${paren(x, lab.decimal)}` : isZero(e.a) ? '' : `${numTex(e.a, lab.decimal)} \\times ${paren(x, lab.decimal)}`;
    const bAbs = cmp(e.b, 0) < 0 ? neg(e.b) : e.b;
    const ys = isZero(e.b) ? '' : `${eq(bAbs, 1) ? '' : `${numTex(bAbs, lab.decimal)} \\times `}${paren(y, lab.decimal)}`;
    const left = xs && ys ? `${xs} ${cmp(e.b, 0) < 0 ? '-' : '+'} ${ys}` : xs || (cmp(e.b, 0) < 0 ? `-${ys}` : ys);
    return { n: i + 1, tex: `${left} = ${numTex(LS.leftAt(e, x, y), lab.decimal)}`, ok: lab.result.checks[i] };
  });
}

/* ── Recommencer par l'autre méthode, découvrir ──────────────────────────────────────────── */

/** « حلّ بالطريقة الأخرى » : des cartes neuves, la mémoire des méthodes gardée. */
export const restart = (lab) => init(lab.src, lab);

export const refuse = (lab, reason) => ({ ...lab, refusals: lab.refusals + 1, lastRefusal: reason });

/** Les deux méthodes ont donné la MÊME ثنائية : le contraste qui ouvre la découverte. */
export function discoveryReady(lab) {
  const { sub, add } = lab.methodsDone;
  return !!sub && !!add && sub.x === add.x && sub.y === add.y;
}

/** La méthode encore à faire, pour le bouton « بالطريقة الأخرى ». */
export const missingMethod = (lab) => (!lab.methodsDone.sub ? 'sub' : !lab.methodsDone.add ? 'add' : null);

/** Résumé pour la leçon (`onTrial`) : ce que l'élève a écrit, sans rien d'autre. */
export function summary(lab) {
  return {
    method: lab.method,
    stage: lab.stage,
    lines: lab.lines.map((l) => l.tex),
    pair: lab.result ? { x: fracText(lab.result.x), y: fracText(lab.result.y) } : null,
    pairTex: lab.result ? pairTex(lab.result.x, lab.result.y, lab.decimal) : null,
    methodsDone: lab.methodsDone,
    attempts: lab.attempts,
    refusals: lab.refusals,
    system: lab.src,
  };
}

/** Les tuiles d'un terme : |coef| tuiles si c'est un entier ≤ 8, sinon une tuile « × coef ». */
export function tilesOf(coef) {
  if (isZero(coef)) return { count: 0, negative: false, label: null };
  const negative = cmp(coef, 0) < 0;
  const abs = negative ? neg(coef) : coef;
  if (isInteger(abs) && abs.n <= 8) return { count: abs.n, negative, label: null };
  return { count: 1, negative, label: abs };
}

/** La jumla en LaTeX (\\begin{cases} … \\end{cases}), nombres du manuel. */
export const systemTex = (lab) => `\\begin{cases} ${eqTex(lab.sys[0], lab.decimal)} \\\\ ${eqTex(lab.sys[1], lab.decimal)} \\end{cases}`;
/** « 13/5 » → la fraction (pour réécrire une ثنائية mémorisée). */
export const parseNum = (s) => Lin.parseNumber(s);

export { toNumber };

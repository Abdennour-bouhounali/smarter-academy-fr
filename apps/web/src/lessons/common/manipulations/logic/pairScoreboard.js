import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';

/**
 * pair-scoreboard — LE TABLEAU DES DEUX CONDITIONS (unité 5 « جمل معادلتين », leçon 1
 * « مفهوم جملة معادلتين من الدرجة الأولى بمجهولين »).
 *
 * La jumla s'écrit comme le manuel, « eq1|eq2 » : « x+y=32|2(x-5)=y-3 » (نشاط 1),
 * « x+y=10|3x+y=22 » (la carte de saison, plateforme), « x+y=37|20x+10y=610 » (تحدّ).
 * L'élève fixe LUI-MÊME les deux nombres de la ثنائية (x ; y) — deux grandeurs entières
 * étirées (une par inconnue). Deux JAUGES lisent chacune son équation sur cette ثنائية,
 * au mot près de la forme du manuel (« 2(13 - 5) = 16 » et « 19 - 3 = 16 »).
 *
 * Toute la vérité vient de packages/core/arithmetic/linearSystem.js :
 *   - une jauge est allumée ⇔ `LS.holdsAt(e, x, y)` ;
 *   - les deux membres LUS sont les formes de `LS.parseLinear2` évaluées en fractions exactes
 *     (`linear.js`) — la même lecture que `eq2` ; aucune règle n'est recalculée ici.
 * Ce module ne fait que l'INTERACTION : les essais, le refus, la mémoire, la découverte,
 * et l'écriture des substitutions (affichage).
 *
 * Un ESSAI est une ثنائية VALIDÉE (relâchement d'une poignée, pause clavier, ou « اقلب ») —
 * pas une valeur que le doigt traverse. « هذه الثنائية حل للجملة » est une RÉPONSE, jugée :
 *   - les deux jauges allumées : acceptée (`solved`) ;
 *   - une seule : refusée, « تحقّق المعادلة (1) فقط » (MISC-JUMLA-MUADALA-WAHIDA) ;
 *   - aucune : refusée.
 * La découverte (contraste, MANIPULATION_DNA §3.6) demande une ثنائية acceptée ET un essai
 * qui n'allume qu'UNE jauge : « في آن واحد » se lit sur les propres essais de l'élève.
 */

const VARS = ['x', 'y'];

/* ── Lecture de la jumla ─────────────────────────────────────────────────────────────── */

/** « x+y=32|2(x-5)=y-3 » → les deux équations écrites, leurs membres, la jumla exacte. */
function parseSystem(system, vars = VARS) {
  const src = String(system).split('|').map((s) => s.trim());
  if (src.length !== 2) throw new Error(`pair-scoreboard: une jumla a deux équations (« ${system} »)`);
  const sys = LS.system(src[0], src[1], vars);
  const sides = src.map((s) => {
    const parts = s.split('=');
    if (parts.length !== 2) throw new Error(`pair-scoreboard: « ${s} » n'est pas une équation`);
    return parts.map((p) => p.trim());
  });
  const forms = sides.map(([l, r]) => [LS.parseLinear2(l, vars), LS.parseLinear2(r, vars)]);
  return { src, sys, sides, forms, vars };
}

/** La valeur exacte d'une forme { u, v, k } en (x ; y). */
const formAt = (f, x, y) => Lin.add(Lin.add(Lin.mul(f.u, x), Lin.mul(f.v, y)), f.k);
const isConstForm = (f) => Lin.isZero(f.u) && Lin.isZero(f.v);
const isInt = (p) => Lin.isInteger(p);
const num = (p) => Lin.toNumber(p);

/**
 * Le MONDE dessiné, lu sur la structure de la jumla (jamais deviné sur ses nombres) :
 *   count   (1) est « x + y = N » et (2) « p·x + q·y = V » (p, q, V > 0 entiers) : N cases
 *           (matchs d'une saison, pièces d'une cagnotte) et une barre de valeur (points, DA) ;
 *   after   (1) est « x + y = N » et (2) « m(x − a) = y − b » : N bureaux, puis le panneau
 *           « après » qui grise a hommes et b femmes et compare y − b à m fois x − a ;
 *   none    toute autre jumla : les deux jauges seules.
 */
function shapeOf(P) {
  const [e1, e2] = P.sys;
  const one = (p) => Lin.eq(p, 1);
  const countEq1 = one(e1.a) && one(e1.b) && isInt(e1.c) && num(e1.c) > 0;
  if (!countEq1) return { kind: 'none' };
  const N = num(e1.c);
  const [L2, R2] = P.forms[1];
  // m(x − a) = y − b : x seul à gauche, y seul (coefficient 1) à droite.
  if (Lin.isZero(L2.v) && !Lin.isZero(L2.u) && Lin.isZero(R2.u) && one(R2.v)) {
    const m = L2.u;
    const a = Lin.div(Lin.neg(L2.k), m);
    const b = Lin.neg(R2.k);
    if (isInt(m) && isInt(a) && isInt(b) && num(m) > 0 && num(a) >= 0 && num(b) >= 0) {
      return { kind: 'after', N, m: num(m), a: num(a), b: num(b) };
    }
  }
  if ([e2.a, e2.b, e2.c].every((p) => isInt(p) && num(p) > 0)) {
    return { kind: 'count', N, p: num(e2.a), q: num(e2.b), V: num(e2.c) };
  }
  return { kind: 'none' };
}

/** Le monde affiché : le thème demandé s'il convient à la structure, sinon le dessin neutre. */
function worldOf(theme, shape) {
  if (shape.kind === 'after') return 'staff';
  if (shape.kind === 'count') return theme === 'coins' ? 'coins' : 'football';
  return 'abstract';
}

/** Les bornes de chaque poignée : celles de l'histoire (on ne part pas à la retraite à 4 hommes). */
function rangesFor(shape, override) {
  if (override) return { x: { ...override.x }, y: { ...override.y } };
  if (shape.kind === 'after') return { x: { min: shape.a, max: shape.N }, y: { min: shape.b, max: shape.N } };
  if (shape.kind === 'count') {
    const top = shape.N + Math.max(2, Math.ceil(shape.N / 10));
    return { x: { min: 0, max: top }, y: { min: 0, max: top } };
  }
  return { x: { min: -6, max: 10 }, y: { min: -6, max: 10 } };
}

export function init({ system, theme, ranges, vars = VARS }) {
  const P = parseSystem(system, vars);
  const shape = shapeOf(P);
  return {
    system,
    ...P,
    shape,
    world: worldOf(theme, shape),
    range: rangesFor(shape, ranges),
    kind: LS.classify(P.sys).kind,
    x: null,
    y: null,
    trials: [], // { x, y, ok: [b1, b2], swapped }
    claims: 0,
    refusedClaims: 0,
    solved: null, // { x, y } accepté
    last: null,
  };
}

/* ── Les jauges ─────────────────────────────────────────────────────────────────────── */

/** Les deux jauges en (x ; y) : allumée ⇔ LS.holdsAt ; les deux membres lus exactement. */
export function gauges(s, x, y) {
  if (x == null || y == null) return [null, null];
  return s.sys.map((e, i) => {
    const [Lf, Rf] = s.forms[i];
    const left = formAt(Lf, x, y);
    const right = formAt(Rf, x, y);
    return { i: i + 1, ok: LS.holdsAt(e, x, y), left, right, leftConst: isConstForm(Lf), rightConst: isConstForm(Rf) };
  });
}
export const okPair = (s, x, y) => gauges(s, x, y).map((g) => (g ? g.ok : false));

/**
 * La ثنائية MONTRÉE à l'ouverture (jamais un essai, jamais écrite dans `trials`) : elle ne doit
 * JAMAIS être la solution — ni, si possible, vérifier une équation (sinon une jauge s'allume « pour
 * rien »). On balaie les bornes depuis (min ; min) : la première qui n'allume aucune jauge, sinon la
 * première qui n'est pas la solution, sinon (min ; min).
 */
export function defaultPair(s) {
  const { x: rx, y: ry } = s.range;
  let notSolution = null;
  for (let x = rx.min; x <= rx.max; x += 1) {
    for (let y = ry.min; y <= ry.max; y += 1) {
      const ok = okPair(s, x, y);
      if (!ok[0] && !ok[1]) return { x, y };
      if (!notSolution && !(ok[0] && ok[1])) notSolution = { x, y };
    }
  }
  return notSolution ?? { x: rx.min, y: ry.min };
}

/* ── Les gestes ─────────────────────────────────────────────────────────────────────── */

const inRange = (r, v) => Number.isInteger(v) && v >= r.min && v <= r.max;

/** Ajoute (x ; y) aux essais s'il est nouveau ; le dernier essai est toujours en tête de `last`. */
function record(s, x, y, swapped = false) {
  const ok = okPair(s, x, y);
  const known = s.trials.find((t) => t.x === x && t.y === y);
  const trials = known ? s.trials : [...s.trials, { x, y, ok, swapped }];
  return { ...s, trials, last: { kind: 'trial', x, y, ok, swapped, fresh: !known } };
}

/** Valide une valeur d'une poignée ('x' ou 'y'). Un essai n'existe que si les deux sont posées. */
export function set(s, which, v) {
  const r = s.range[which];
  if (!inRange(r, v)) return s;
  const next = { ...s, [which]: v };
  if (next.x == null || next.y == null) return { ...next, last: null };
  return record(next, next.x, next.y);
}

/**
 * « اقلب الثنائية » : (x ; y) devient (y ; x) — un essai à part entière, qui montre que l'ordre
 * compte (MISC-JUMLA-TARTIB). Refusé (sans rien changer) quand la ثنائية renversée sort des bornes.
 */
export function swap(s) {
  if (s.x == null || s.y == null) return { ...s, last: { kind: 'noPair' } };
  if (s.x === s.y) return { ...s, last: { kind: 'sameSwap' } };
  if (!inRange(s.range.x, s.y) || !inRange(s.range.y, s.x)) return { ...s, last: { kind: 'swapOut', x: s.y, y: s.x } };
  return record({ ...s, x: s.y, y: s.x }, s.y, s.x, true);
}

/** « هذه الثنائية حل للجملة » — la réponse, jugée par les deux jauges. */
export function claim(s) {
  if (s.x == null || s.y == null) return { ...s, last: { kind: 'noPair' } };
  const base = s.trials.some((t) => t.x === s.x && t.y === s.y) ? s : record(s, s.x, s.y);
  const ok = okPair(base, s.x, s.y);
  const claims = s.claims + 1;
  if (ok[0] && ok[1]) {
    return { ...base, claims, solved: base.solved ?? { x: s.x, y: s.y }, last: { kind: 'accepted', x: s.x, y: s.y, ok } };
  }
  return { ...base, claims, refusedClaims: s.refusedClaims + 1, last: { kind: ok[0] || ok[1] ? 'onlyOne' : 'none', x: s.x, y: s.y, ok } };
}

/* ── La découverte ──────────────────────────────────────────────────────────────────── */

/** Un essai qui n'allume qu'UNE jauge (le contraste). */
export const halfTrial = (s, which) => s.trials.find((t) => (which == null ? t.ok[0] !== t.ok[1] : t.ok[which - 1] && !t.ok[2 - which]));
/** Un essai renversé refusé (l'ordre compte). */
export const swappedRefused = (s) => s.trials.find((t) => t.swapped && !(t.ok[0] && t.ok[1]));

/** Une ثنائية acceptée ET un essai à une seule jauge : « في آن واحد » est visible. */
export const discoveryReady = (s) => s.solved != null && halfTrial(s) != null;

/* ── Le dessin du monde (géométrie pure, testée) ────────────────────────────────────── */

/**
 * Les N cases de l'équation (1) : x objets du premier genre puis y du second ; au-delà de N,
 * les objets restent HORS du cadre (`overflow`), en deçà, des cases vides (`empty`).
 */
export function slots(N, x, y) {
  const X = x ?? 0;
  const Y = y ?? 0;
  const cells = [];
  for (let i = 0; i < X; i += 1) cells.push('x');
  for (let i = 0; i < Y; i += 1) cells.push('y');
  const inside = cells.slice(0, N);
  const overflow = cells.slice(N);
  return { inside, empty: Math.max(0, N - cells.length), overflow, total: cells.length };
}

/** La barre de valeur de l'équation (2) d'un monde « count » : p par x, q par y, cible V. */
export function valueBar(shape, x, y) {
  const have = shape.p * (x ?? 0) + shape.q * (y ?? 0);
  const top = Math.max(shape.V, have, 1);
  return { have, target: shape.V, top, xPart: shape.p * (x ?? 0), yPart: shape.q * (y ?? 0) };
}

/** Le panneau « après » d'un monde « after » : restants, et les deux quantités comparées. */
export function afterPanel(shape, x, y) {
  const menLeft = (x ?? shape.a) - shape.a;
  const womenLeft = (y ?? shape.b) - shape.b;
  return { menLeft, womenLeft, twiceMen: shape.m * menLeft, equal: shape.m * menLeft === womenLeft, top: Math.max(shape.m * menLeft, womenLeft, 1) };
}

/**
 * La GRILLE du monde : un CARRÉ (règle du propriétaire, 2026-10-01 — « organise les hommes et les
 * femmes en carré, pas en rectangle vertical »), taillé pour tenir D'UN SEUL REGARD avec ses poignées
 * et ses jauges (la manipulation entière tient dans l'écran, sans défilement). `count` objets (le
 * cadre de l'équation (1) et ce qui le déborde) : cols = ⌈√count⌉, rows = ⌈count / cols⌉ (donc
 * |rows − cols| ≤ 1), et la case carrée est la plus grande qui tient dans `width` × `maxHeight` —
 * les objets rétrécissent au lieu de pousser les poignées hors de l'écran. Jamais une taille fixe.
 */
export function sceneGrid({ count, width, maxHeight, gap = 4, minCell = 10, maxCell = 52 }) {
  const n = Math.max(1, count);
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const byW = (width - (cols - 1) * gap) / cols;
  const byH = (maxHeight - (rows - 1) * gap) / rows;
  const cell = Math.max(minCell, Math.floor(Math.min(byW, byH, maxCell)));
  return { cols, rows, cell, width: cols * cell + (cols - 1) * gap, height: rows * cell + (rows - 1) * gap };
}

/* ── L'écriture (affichage seulement) ───────────────────────────────────────────────── */

/** Les jetons d'un membre écrit : nombres, inconnues, opérateurs, parenthèses. */
function tokens(src, vars) {
  const s = String(src).replace(/[−–]/g, '-').replace(/\s+/g, '');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.,]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j += 1;
      out.push({ t: 'num', v: s.slice(i, j) });
      i = j;
    } else if (vars.includes(ch)) { out.push({ t: 'var', v: ch }); i += 1; } else { out.push({ t: ch }); i += 1; }
  }
  return out;
}

const numTex = (raw) => raw.replace(/[.,]/g, '{,}');

/**
 * Un membre écrit en LaTeX, tel quel (`vals` absent : « 2(x - 5) ») ou avec les valeurs
 * substituées (« 2(13 - 5) », « 3 \times 6 + 4 », « 20 \times 24 + 10 \times 13 »).
 */
function sideTex(src, vars = VARS, vals = null) {
  const tk = tokens(src, vars);
  let out = '';
  tk.forEach((tok, idx) => {
    const prev = tk[idx - 1];
    const next = tk[idx + 1];
    if (tok.skip) return;
    // un quotient de deux nombres écrits (« 1/3 ») se lit comme le manuel : \dfrac{1}{3}
    if (tok.t === 'num' && next?.t === '/' && tk[idx + 2]?.t === 'num') {
      out += `\\dfrac{${numTex(tok.v)}}{${numTex(tk[idx + 2].v)}}`;
      next.skip = true; tk[idx + 2].skip = true;
      return;
    }
    if (tok.t === 'num') out += numTex(tok.v);
    else if (tok.t === 'var') {
      if (!vals) { out += tok.v; return; }
      const v = vals[vars.indexOf(tok.v)];
      const tex = Lin.fracLatex(v);
      const negative = Lin.cmp(v, 0) < 0;
      if (prev && (prev.t === 'num' || prev.t === ')')) out += ' \\times ';
      out += negative && tk.length > 1 ? `(${tex})` : tex;
    } else if (tok.t === '+' || tok.t === '-') {
      const unary = !prev || prev.t === '(' || ['+', '-', '*', '/'].includes(prev.t);
      out += unary ? tok.t : ` ${tok.t} `;
    } else if (tok.t === '*') out += ' \\times ';
    else if (tok.t === '/') out += ' / ';
    else out += tok.t;
  });
  return out;
}

/** L'équation i (0 ou 1) écrite comme le manuel : « 2(x - 5) = y - 3 ». */
export const eqWrittenTex = (s, i) => `${sideTex(s.sides[i][0], s.vars)} = ${sideTex(s.sides[i][1], s.vars)}`;
/** La jumla écrite comme le manuel. */
export const systemWrittenTex = (s) => `\\begin{cases} ${eqWrittenTex(s, 0)} \\\\ ${eqWrittenTex(s, 1)} \\end{cases}`;
/** La jumla réduite (« 2x - y = 7 ») — `eqLatex` de linearSystem. */
export const systemReducedTex = (s) => LS.systemLatex(s.sys, s.vars);
export const eqReducedTex = (s, i) => LS.eqLatex(s.sys[i], s.vars);

/**
 * La LECTURE d'une jauge au mot près du manuel :
 *   membre constant à droite : « 13 + 19 = 32 » (allumée) ou « 24 + 5 = 29 \neq 32 » ;
 *   inconnues des deux côtés : deux lignes « 2(13 - 5) = 16 » et « 19 - 3 = 16 », puis
 *   « 16 = 16 » ou « 38 \neq 5 ».
 */
export function readingTex(s, i, x, y) {
  const g = gauges(s, x, y)[i];
  if (!g) return null;
  const [Ls, Rs] = s.sides[i];
  const vals = [Lin.frac(x), Lin.frac(y)];
  const lSub = sideTex(Ls, s.vars, vals);
  const rSub = sideTex(Rs, s.vars, vals);
  const lv = Lin.fracLatex(g.left);
  const rv = Lin.fracLatex(g.right);
  const rel = g.ok ? '=' : '\\neq';
  if (g.rightConst) {
    // « 13 + 19 = 32 » ; « 24 + 5 = 29 \neq 32 »
    if (g.ok || lSub === lv) return { lines: [`${lSub} ${rel} ${rv}`], ok: g.ok };
    return { lines: [`${lSub} = ${lv} \\neq ${rv}`], ok: g.ok };
  }
  if (g.leftConst) {
    if (g.ok || rSub === rv) return { lines: [`${lv} ${rel} ${rSub}`], ok: g.ok };
    return { lines: [`${lv} \\neq ${rv} = ${rSub}`], ok: g.ok };
  }
  const line = (sub, v) => (sub === v ? v : `${sub} = ${v}`);
  return { lines: [line(lSub, lv), line(rSub, rv), `${lv} ${rel} ${rv}`], ok: g.ok };
}

/** La ثنائية en LaTeX et en texte (manuel : « (13 ; 19) »). */
export const pairTex = (x, y) => LS.pairLatex(x, y);
export const pairText = (x, y) => LS.pairText(x, y);

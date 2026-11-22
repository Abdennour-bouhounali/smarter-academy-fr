import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { parseValue, parsePoints, niceStep, numText, numTex } from './originLine';

/**
 * slope-stairs — L'ESCALIER DES ACCROISSEMENTS (unité 7 « الدالة التآلفية », leçon 3 « تعيين دالة
 * تآلفية انطلاقًا من عددين وصورتيهما », نشاط 4 « تناسب التغيّرات » et le تحدّ °C → °F).
 *
 * Toute la vérité vient de packages/core/arithmetic/affine.js (sur les fractions EXACTES de
 * linear.js) : une image est `AF.imageOf`, le quotient des accroissements `AF.rateOfChange`, la
 * fonction retrouvée de deux couples `AF.fromTwoPoints`, b `AF.interceptFrom`. Aucun flottant ne
 * décide rien : les flottants ne servent qu'au DESSIN. Les deux marqueurs x₁ et x₂ sont TOUJOURS des
 * nœuds d'une graduation exacte (`snap`).
 *
 * Deux modes (props de la leçon) :
 *   rule    f est connue (« 200x+2000 ») ; `marks` (« 0|1|4|6|10|12|15 ») dessine l'escalier du manuel
 *           (marches fantômes « … » entre marques consécutives) que l'élève COMPLÈTE en posant ses
 *           marqueurs sur deux marques consécutives ; toute autre paire est aussi une marche (essai).
 *   points  deux couples donnés (« 10:50|30:86 »), f INCONNUE : un marqueur hors de ces deux nombres
 *           est refusé (« صورته مجهولة ») tant que la marche entre les deux couples n'est pas construite ;
 *           elle donne a, la droite se trace, et tout nombre devient lisible — descendre à x = 0 donne b.
 *
 * RÉSISTANCE : x₁ = x₂ est refusé (la marche s'écrase, 0 ÷ 0 : القسمة على 0 مستحيلة).
 * INVARIANT : le quotient (f(x₁) − f(x₂)) ÷ (x₁ − x₂) — le même pour toutes les marches (= a).
 * Un ESSAI est une position VALIDÉE (relâchement, pause du clavier, bouton) — pas un passage du doigt.
 */

const { frac, sub, mul, div, eq, cmp, isZero, toNumber } = Lin;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseValue(v));

export const THEMES = Object.freeze(['stadium', 'thermo']);

/* ── lecture des props ─────────────────────────────────────────────────── */

/** « 0|1|4|6 » → fractions triées, sans doublon. */
function parseMarks(raw) {
  if (!raw) return [];
  const xs = String(raw).split('|').filter((s) => s !== '').map((s) => parseValue(s));
  const out = [];
  for (const x of [...xs].sort((p, q) => cmp(p, q))) if (!out.some((y) => eq(y, x))) out.push(x);
  return out;
}

/** p multiple entier du pas s ? */
const onGrid = (p, s) => F(div(p, s)).d === 1;

/** Le pas des marqueurs : 1 jusqu'à 20 unités (les matchs du manuel), sinon un pas « rond » qui garde chaque nombre donné. */
function snapFor(span, values = []) {
  if (span <= 20 && values.every((v) => F(v).d === 1)) return frac(1);
  let s = niceStep(span, 10);
  // un nombre donné (marque, couple, 0) doit être un nœud : sinon on raffine
  for (let k = 0; k < 6 && !values.every((v) => onGrid(v, s)); k++) s = div(s, 2);
  if (!values.every((v) => onGrid(v, s))) s = frac(1, 100);
  return s;
}

export const indexOf = (x, s) => Math.round(toNumber(x) / toNumber(s));
export const valueAt = (i, s) => mul(F(s), frac(i));

/** La fenêtre (nombres JS pour le dessin) : contient 0, les marques, les couples, et la droite. */
function windowFor({ mode, f, marks, given }, props = {}) {
  const xs = mode === 'rule' ? marks.map(toNumber) : given.map((p) => toNumber(p.x));
  const X = Math.max(1, ...xs.map(Math.abs));
  let xMax;
  if (mode === 'rule') xMax = marks.length ? (X >= 10 ? X : X + 2) : 10;
  else {
    const st = toNumber(niceStep(X * 1.3, 8));
    xMax = Math.ceil((X * 1.3) / st) * st;
  }
  let xMin = Math.min(0, ...xs.map((x) => Math.floor(x)));
  const pick = (k, d) => (props[k] != null && props[k] !== '' ? toNumber(parseValue(props[k])) : d);
  xMin = Math.min(0, pick('xMin', xMin));
  xMax = Math.max(xMin + 1, pick('xMax', xMax));
  const ys = [0, toNumber(AF.imageOf(f, xMin)), toNumber(AF.imageOf(f, xMax)), ...(given ?? []).map((p) => toNumber(p.y))];
  const lo = Math.min(...ys); const hi = Math.max(...ys);
  const ySt = toNumber(niceStep(Math.max(1, hi - lo), 12));
  let yMin = lo < 0 ? Math.floor((lo - ySt * 0.1) / ySt) * ySt : 0;
  let yMax = Math.ceil((hi + ySt * 0.1) / ySt) * ySt;
  yMin = Math.min(0, pick('yMin', yMin));
  yMax = Math.max(yMin + 1, pick('yMax', yMax));
  return { xMin, xMax, yMin, yMax };
}

/* ── l'état ─────────────────────────────────────────────────────────────── */

/**
 * @param props { rule, marks, points, shown, xMin, xMax, yMin, yMax } (chaînes du contrat)
 *   shown : nombre de marches de tête DÉJÀ écrites (le manuel imprime 200, puis 3 et 600)
 */
export function init(props = {}) {
  const pts = parsePoints(props.points);
  const mode = props.rule ? 'rule' : 'points';
  let f = null; let hidden; let given = [];
  if (mode === 'rule') {
    f = AF.affine(String(props.rule));
    hidden = f;
  } else {
    if (pts.length !== 2) throw new Error('slope-stairs : il faut « rule » ou exactement deux « points »');
    if (eq(pts[0].x, pts[1].x)) throw new Error('slope-stairs : deux couples de même abscisse');
    given = [...pts].sort((p, q) => cmp(p.x, q.x));
    hidden = AF.fromTwoPoints(given[0].x, given[0].y, given[1].x, given[1].y);
  }
  const marks = mode === 'rule' ? parseMarks(props.marks) : [];
  const shown = Math.max(0, Math.min(Math.max(0, marks.length - 1), Number(props.shown ?? 0) || 0));
  const ghosts = marks.slice(1).map((to, i) => {
    const from = marks[i];
    return { from, to, dx: sub(to, from), df: sub(AF.imageOf(hidden, to), AF.imageOf(hidden, from)), printed: i < shown };
  });
  const win = windowFor({ mode, f: hidden, marks, given }, props);
  const anchors = [0, ...marks, ...given.map((p) => p.x)];
  const snap = snapFor(win.xMax - win.xMin, anchors);
  const range = { min: Math.ceil(win.xMin / toNumber(snap) - 1e-9) + 0, max: Math.floor(win.xMax / toNumber(snap) + 1e-9) };
  // départ : deux nœuds qui ne sont ni des marques ni des couples (rien n'est offert)
  const taken = (i) => anchors.some((v) => eq(F(v), valueAt(i, snap)));
  const near = (t) => {
    let i = Math.round(range.min + (range.max - range.min) * t);
    for (let d = 0; d < 6 && taken(i); d++) i = Math.min(range.max, i + 1);
    return i;
  };
  let m1 = near(0.62); let m2 = near(0.3);
  if (m1 === m2) m2 = Math.max(range.min, m1 - 1);
  return {
    mode, f, hidden, given, marks, ghosts, win, snap, range,
    m: [m1, m2], trials: [], last: null, found: mode === 'rule', bRead: null,
    filled: ghosts.map(() => false),
  };
}

/* ── les règles ─────────────────────────────────────────────────────────── */

/** Le nombre x a-t-il une image CONNUE ? (rule : toujours ; points : les deux couples, puis tout dès que a est trouvé). */
export const known = (s, x) => s.found || s.given.some((p) => eq(p.x, F(x)));

/** L'image de x si elle est connue, sinon null. */
export function imageAt(s, x) {
  x = F(x);
  if (s.found) return AF.imageOf(s.f ?? s.hidden, x);
  const g = s.given.find((p) => eq(p.x, x));
  return g ? g.y : null;
}

/** true | 'same' (x₁ = x₂ : 0 ÷ 0) | 'unknown' (image inconnue). */
export function canStair(s, x1, x2) {
  if (eq(F(x1), F(x2))) return 'same';
  if (!known(s, x1) || !known(s, x2)) return 'unknown';
  return true;
}

/** La marche (x₁ ; x₂) : accroissements et quotient EXACTS, ou null. */
export function stairOf(s, x1, x2) {
  if (canStair(s, x1, x2) !== true) return null;
  x1 = F(x1); x2 = F(x2);
  const y1 = imageAt(s, x1); const y2 = imageAt(s, x2);
  const dx = sub(x1, x2); const df = sub(y1, y2);
  return { x1, x2, y1, y2, dx, df, q: div(df, dx) };
}

/** La marche telle qu'on la DESSINE, de gauche à droite : { lo, hi, run > 0, rise } (exacts). */
export function stairDraw(st) {
  const swap = cmp(st.x1, st.x2) > 0;
  const lo = swap ? { x: st.x2, y: st.y2 } : { x: st.x1, y: st.y1 };
  const hi = swap ? { x: st.x1, y: st.y1 } : { x: st.x2, y: st.y2 };
  return { lo, hi, run: sub(hi.x, lo.x), rise: sub(hi.y, lo.y) };
}

/** Le numéro de la marche fantôme du manuel que (x₁ ; x₂) recouvre, ou −1. */
function ghostIndex(s, x1, x2) {
  const lo = cmp(x1, x2) < 0 ? F(x1) : F(x2);
  const hi = cmp(x1, x2) < 0 ? F(x2) : F(x1);
  return s.ghosts.findIndex((g) => eq(g.from, lo) && eq(g.to, hi));
}

const samePair = (t, x1, x2) => t && eq(t.x1, x1) && eq(t.x2, x2);

/** Déplacer un marqueur (0 = x₁, 1 = x₂) sur le nœud i — sans essai (le doigt passe). */
export function move(s, which, i) {
  const c = Math.max(s.range.min, Math.min(s.range.max, Math.round(i)));
  if (s.m[which] === c) return s;
  const m = [...s.m]; m[which] = c;
  return { ...s, m };
}

/**
 * VALIDER la position courante des deux marqueurs : un ESSAI.
 *   — refusé ('same' / 'unknown') : la raison et les nombres ;
 *   — accepté : la marche, son quotient ; en mode points la première marche TROUVE f ;
 *     une marche du manuel se remplit ; un marqueur en 0 (f connue) lit b.
 */
export function commit(s) {
  const x1 = valueAt(s.m[0], s.snap);
  const x2 = valueAt(s.m[1], s.snap);
  const ok = canStair(s, x1, x2);
  const prev = s.trials[s.trials.length - 1];
  if (ok !== true) {
    const t = { kind: ok, x1, x2 };
    const dup = prev && prev.kind === ok && samePair(prev, x1, x2);
    return { ...s, trials: dup ? s.trials : [...s.trials, t], last: { ...t } };
  }
  let next = s;
  let first = false;
  if (!s.found) {
    const st0 = stairOf(s, x1, x2);
    next = { ...s, found: true, f: AF.fromTwoPoints(st0.x1, st0.y1, st0.x2, st0.y2) };
    first = true;
  }
  const st = stairOf(next, x1, x2);
  const g = ghostIndex(next, x1, x2);
  const filled = g >= 0 && !next.ghosts[g].printed ? next.filled.map((v, i) => (i === g ? true : v)) : next.filled;
  let bRead = next.bRead;
  let readB = false;
  const zeroEnd = isZero(x1) ? x2 : isZero(x2) ? x1 : null;
  if (zeroEnd != null) {
    const via = zeroEnd;
    const yVia = imageAt(next, via);
    const a = st.q;
    bRead = { via, yVia, a, b: AF.interceptFrom(a, via, yVia) };
    readB = true;
  }
  const t = { kind: 'stair', ...st, ghost: g };
  const dup = prev && prev.kind === 'stair' && samePair(prev, x1, x2);
  return {
    ...next, filled, bRead,
    trials: dup ? next.trials : [...next.trials, t],
    last: { ...t, first, readB, newGhost: g >= 0 && !next.filled[g] && !next.ghosts[g].printed },
  };
}

/**
 * « جرّب كل الإمكانيات » : x₂ restant où il est, chaque nœud x₁ ≠ x₂ de la graduation dont la marche (x₁ ; x₂)
 * n'a pas été validée. Seulement quand f est connue (`found`) : avant, un marqueur au hasard est refusé.
 */
export function untriedFirstMarkers(s) {
  if (!s.found) return [];
  const x2 = valueAt(s.m[1], s.snap);
  const out = [];
  for (let i = s.range.min; i <= s.range.max; i += 1) {
    if (i === s.m[1]) continue;
    const x1 = valueAt(i, s.snap);
    if (!s.trials.some((t) => t.kind === 'stair' && eq(t.x1, x1) && eq(t.x2, x2))) out.push(i);
  }
  return out;
}

/** Les marches acceptées, une par paire (x₁ ; x₂). */
export const stairs = (s) => s.trials.filter((t) => t.kind === 'stair');

/** L'escalier du manuel : { done, total } (les marches imprimées ne comptent pas). */
export function fillProgress(s) {
  const open = s.ghosts.map((g, i) => (g.printed ? null : s.filled[i])).filter((v) => v !== null);
  return { done: open.filter(Boolean).length, total: open.length };
}

/**
 * La découverte s'ouvre sur le CONTRASTE :
 *   rule   trois marches au moins, de DEUX largeurs différentes au moins (sinon le quotient
 *          identique ne prouve rien) ;
 *   points la marche entre les deux couples (a) ET b lu en x = 0.
 */
export function discoveryReady(s) {
  if (s.mode === 'points') return s.found && s.bRead != null;
  const st = stairs(s);
  const pairs = new Set(st.map((t) => `${numText(t.x1)}|${numText(t.x2)}`));
  const widths = new Set(st.map((t) => numText(absF(t.dx))));
  return pairs.size >= 3 && widths.size >= 2;
}

/** Deux marches de largeurs différentes de l'élève (pour réfuter « le quotient grandit avec la marche »). */
export function contrastPair(s) {
  const st = stairs(s);
  for (const a of st) for (const b of st) if (cmp(absF(a.dx), absF(b.dx)) < 0) return [a, b];
  return st.length >= 2 ? [st[0], st[1]] : null;
}

/** Une marche « à l'envers » (x₁ < x₂) de l'élève, s'il en a fait une. */
export const reversedStair = (s) => stairs(s).find((t) => cmp(t.x1, t.x2) < 0) ?? null;

/** La fonction trouvée / donnée (a, b) — null tant qu'elle est inconnue. */
export const fnOf = (s) => (s.found ? s.f : null);

/* ── écritures (affichage) ──────────────────────────────────────────────── */

const absF = (p) => (cmp(p, 0) < 0 ? sub(0, p) : F(p));
const par = (p) => (cmp(p, 0) < 0 ? `(${numTex(p)})` : numTex(p));

/** « f(x) = 200x + 2000 », « f(x) = 1{,}8x + 32 », « f(x) = -x + 5 ». */
export function ruleTex(f, name = 'f(x)') {
  const parts = [];
  if (!isZero(f.a)) parts.push(`${eq(f.a, 1) ? '' : eq(f.a, -1) ? '-' : numTex(f.a)}x`);
  if (!isZero(f.b) || !parts.length) {
    const t = numTex(f.b);
    parts.push(!parts.length ? t : cmp(f.b, 0) < 0 ? `- ${t.replace(/^-/, '')}` : `+ ${t}`);
  }
  return `${name} = ${parts.join(' ')}`;
}

/** La même écriture en texte simple (ARIA, data-*). */
export function ruleText(f) {
  return ruleTex(f).replace(/\{,\}/g, ',');
}

/** « \dfrac{f(4) - f(1)}{4 - 1} = \dfrac{2800 - 2200}{4 - 1} = \dfrac{600}{3} = 200 ». */
export function quotientTex(t) {
  return `\\dfrac{f(${numTex(t.x1)}) - f(${numTex(t.x2)})}{${numTex(t.x1)} - ${par(t.x2)}}`
    + ` = \\dfrac{${numTex(t.y1)} - ${par(t.y2)}}{${numTex(t.x1)} - ${par(t.x2)}}`
    + ` = \\dfrac{${numTex(t.df)}}{${numTex(t.dx)}} = ${numTex(t.q)}`;
}

/** Le quotient du manuel, forme compacte (seconde ligne) : « \dfrac{f(4) - f(1)}{4 - 1} = \dfrac{600}{3} = 200 ». */
export const quotientShortTex = (t) => `\\dfrac{f(${numTex(t.x1)}) - f(${numTex(t.x2)})}{${numTex(t.x1)} - ${par(t.x2)}} = \\dfrac{${numTex(t.df)}}{${numTex(t.dx)}} = ${numTex(t.q)}`;

/** Téléphone étroit : les images DANS la fraction, « \dfrac{2800 - 2200}{4 - 1} = 200 ». */
export const quotientMiniTex = (t) => `\\dfrac{${numTex(t.y1)} - ${par(t.y2)}}{${numTex(t.x1)} - ${par(t.x2)}} = ${numTex(t.q)}`;

/** La forme courte (liste des essais) : « \dfrac{600}{3} = 200 ». */
export const shortTex = (t) => `\\dfrac{${numTex(t.df)}}{${numTex(t.dx)}} = ${numTex(t.q)}`;

/** « b = f(0) = f(10) - 1{,}8 \times 10 = 50 - 18 = 32 ». */
export function bTex(r) {
  const prod = mul(r.a, r.via);
  return `b = f(0) = f(${numTex(r.via)}) - ${par(r.a)} \\times ${par(r.via)} = ${numTex(r.yVia)} - ${par(prod)} = ${numTex(r.b)}`;
}

export { numText, numTex };
export const toNum = (p) => toNumber(F(p));
export const absOf = absF;
/** Pour la vue (distracteur « b = y ÷ x ») : quotient et égalité EXACTS. */
export const divide = (p, q) => div(F(p), F(q));
export const same = (p, q) => eq(F(p), F(q));

/* ── les ÉTAPES du labo (questions pendant le labo, lot 5) ───────────────── */

/**
 * rule   : 'stair' (une première marche validée) puis 'contrast' (trois marches, deux largeurs : le quotient ne bouge pas) ;
 * points : 'find' (la marche entre les deux couples : a) puis 'b' (un marqueur en 0 : b).
 */
export const stepsOf = (s) => (s.mode === 'points' ? ['find', 'b'] : ['stair', 'contrast']);

/** L'objectif de l'étape est-il atteint ? */
export function stepReached(s, step) {
  if (step === 'stair') return stairs(s).length >= 1;
  if (step === 'contrast') return discoveryReady(s);
  if (step === 'find') return !!s.found;
  if (step === 'b') return s.bRead != null;
  return false;
}

/**
 * « أعِد التجربة » : la MÊME étape repart. `fresh` est l'état de départ du niveau.
 *   stair / find : tout repart ; contrast : on garde la première marche ; b : on oublie la lecture de b (et les essais en 0).
 */
export function restartStep(s, step, fresh) {
  if (step === 'contrast') {
    const first = stairs(s)[0];
    return { ...fresh, trials: first ? [first] : [], m: s.m };
  }
  if (step === 'b') {
    const zero = (t) => isZero(t.x1) || isZero(t.x2);
    return { ...s, bRead: null, last: null, trials: s.trials.filter((t) => !zero(t)) };
  }
  return fresh;
}

/** Produit et somme EXACTS (pour construire les options des questions). */
export const times = (p, q) => mul(F(p), F(q));
export const plus = (p, q) => Lin.add(F(p), F(q));

/**
 * angle-compass — la logique PURE de la construction d'un angle dont on connaît un rapport (unité 10
 * « حساب المثلثات في المثلث القائم », درس « العلاقات بين النسب المثلثية والإنشاءات الهندسية », طرائق p. 121 :
 * « إنشاء هندسي لزاوية حادة علمت القيمة المضبوطة لإحدى نسبها المثلثية », نشاط 5 p. 117, دوري الآن 2).
 * Aucun React ici, aucune arithmétique propre : les longueurs et les rapports sont des « surds » EXACTS de
 * `trigonometry` (packages/core) — 3, √21, 2√3 —, les angles en degrés viennent de ses fonctions de
 * calculatrice. Les coordonnées de dessin (flottants) se calculent dans le composant et ne décident de rien.
 *
 * LA SCÈNE (monde `kite`, la plage) : un angle droit en O posé à l'équerre ; le côté `h` (le sable,
 * horizontal) et le côté `v` (la verticale sous le cerf-volant). L'unité de longueur est la graduation
 * de la règle (le « cm » du manuel) : une longueur reportée est un ENTIER de 1 à MAX_LEG.
 *
 *   1. `placeSquare`        l'équerre dans le coin : l'angle droit existe (rien ne se mesure avant) ;
 *   2. `setLeg(leg, n)`     reporter n unités sur un côté — le premier côté reporté est la BASE ;
 *   3a. le COMPAS (sin, cos) : `setOpening(r)` ouvre le compas piqué au point de la base (le fil du
 *      cerf-volant = l'hypoténuse), `setSwing(θ)` fait tourner la mine depuis la direction du sommet O
 *      vers l'autre côté : l'arc coupe l'autre côté quand r·cos θ = a, à la distance EXACTE √(r² − a²).
 *      Si r ≤ a l'arc n'atteint jamais l'autre côté (RÉSISTANCE : l'hypoténuse est le plus grand côté —
 *      `short`, ou `touch` si r = a : il effleure O, l'angle serait droit et le rapport 1) ;
 *   3b. la RÈGLE (tan) : `setLeg` sur l'autre côté aussi, puis `join` trace l'hypoténuse ;
 *   4. `pick(vertex)`       l'élève désigne la zone de l'angle x : au point du sable (`h`, l'enfant qui tient
 *      le fil) ou au point de la verticale (`v`, le cerf-volant). C'est un ESSAI, jugé exactement :
 *      le rapport demandé, lu sur les côtés relativement à CE sommet, égale-t-il la valeur cible ?
 *
 * Les verdicts d'un essai (`trial.kind`) — les mots de la mathématique, jamais « bravo / faux » :
 *   ok        le rapport est exact (`trial.scale` : 1 pour 2 et 5, 2 pour 4 et 10 — le même angle) ;
 *   vertex    le triangle est juste mais x est à l'AUTRE sommet (son sinus est le cosinus de x…) ;
 *   legs      sin/cos construit avec les deux nombres sur les deux côtés de l'angle droit : c'est un
 *             TANGENTE (MISC-MUTH-INSHA-WATAR) — 2 et 5 donnent tan = 2/5 ≈ 21,8°, pas sin = 2/5 ≈ 23,6° ;
 *   hypTan    tan construit au compas : un des nombres est devenu l'hypoténuse ;
 *   other     un autre triangle : la lecture dit ce qu'il est.
 * Dans TOUS les cas la lecture montre cos² x + sin² x = 1 sur l'angle choisi : l'INVARIANT (même un
 * triangle refusé le vérifie — c'est une propriété du triangle rectangle, pas de la cible).
 *
 * LA DÉCOUVERTE (`discoveryReady`) : toutes les cibles atteintes ET un contraste — un essai refusé, ou
 * deux réussites d'échelles différentes pour une même cible (le même angle avec 2 et 5 puis 4 et 10).
 */
import * as T from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

export const MAX_LEG = 10;
export const MAX_OPEN = 12;
export const LEGS = Object.freeze(['h', 'v']);
const other = (leg) => (leg === 'h' ? 'v' : 'h');

/** « 3/5 », « 0,6 », 7/3 → la cible exacte et ses trois rapports (fromRatio : relations p. 120). */
export function targetOf({ ratio, value }) {
  const rel = T.fromRatio(ratio, value);
  if (!rel.possible) throw new Error(`cible impossible ${ratio} = ${value}`);
  return Object.freeze({ ratio, value: String(value), exact: rel[ratio], rel, deg: T.angleDeg(ratio, T.surdNumber(rel[ratio])) });
}

/** La fraction n/d « la plus simple » d'une cible rationnelle (2/5 → [2, 5]) ; null pour une racine. */
export function targetPair(target) {
  const x = target.exact;
  if (x.r !== 1) return null;
  return [Math.abs(x.q.n), x.q.d];
}

export function init({ targets = [{ ratio: 'sin', value: '3/5' }] } = {}) {
  const list = targets.map(targetOf);
  return {
    targets: list,
    idx: 0,
    solved: list.map(() => false),
    ...blank(),
    trials: [],
    last: null,
  };
}

function blank() {
  return { square: false, legs: { h: null, v: null }, base: null, mode: null, opening: null, swing: 90, closed: false, vertex: null };
}

/** Une nouvelle construction pour la MÊME cible (les essais restent). */
export function fresh(s) {
  return { ...s, ...blank(), last: { kind: 'fresh' } };
}

/** « أعِد التجربة » (questions pendant le labo) : la MÊME cible reprend au départ et n'est plus « atteinte » (les essais restent). */
export function retryTarget(s) {
  return { ...s, ...blank(), solved: s.solved.map((v, i) => (i === s.idx ? false : v)), last: { kind: 'fresh' } };
}

/** L'essai réussi de la cible `idx` (le dernier), ou null. */
export function okTrialOf(s, idx = s.idx) {
  return [...s.trials].reverse().find((t) => t.ok && t.idx === idx) ?? null;
}

/** Le côté de l'angle droit que le COMPAS a coupé (le côté non reporté) ; null si le triangle est fait à la règle. */
export function cutLeg(trial) {
  if (trial.mode !== 'compass') return null;
  return trial.legs.h != null ? 'v' : 'h';
}

/** La cible suivante — seulement quand la cible courante est atteinte (le geste de l'élève, §7quater). */
export function canNext(s) { return s.solved[s.idx] === true && s.idx < s.targets.length - 1; }
export function next(s) {
  if (!canNext(s)) return s;
  return { ...s, idx: s.idx + 1, ...blank(), last: { kind: 'nextTarget', idx: s.idx + 1 } };
}

export const currentTarget = (s) => s.targets[s.idx];

/* ── 1. l'équerre ─────────────────────────────────────────────────────────── */

export function placeSquare(s) {
  if (s.square) return s;
  return { ...s, square: true, last: { kind: 'square' } };
}

/* ── 2. reporter une longueur sur un côté ───────────────────────────────────── */

/** true, ou la raison du refus. */
export function canSetLeg(s, leg) {
  if (!s.square) return 'noSquare';
  if (s.closed) return 'closed';
  if (s.mode === 'compass' && leg !== s.base) return 'compassMode';
  return true;
}

export function setLeg(s, leg, n) {
  const ok = canSetLeg(s, leg);
  if (ok !== true) return { ...s, last: { kind: ok } };
  const v = Math.max(0, Math.min(MAX_LEG, Math.round(n)));
  const legs = { ...s.legs, [leg]: v === 0 ? null : v };
  let { base, mode } = s;
  if (legs[leg] != null && base == null) base = leg;
  if (legs[leg] == null && base === leg) base = legs[other(leg)] != null ? other(leg) : null;
  if (base != null && legs[other(base)] != null) mode = 'ruler';
  else if (mode === 'ruler') mode = null;
  let { opening } = s;
  if (base == null) { mode = null; opening = null; }
  // le compas suit le point qu'il pique : un report déplacé efface l'arc commencé
  const swing = mode === 'compass' ? 90 : s.swing;
  return { ...s, legs, base, mode, opening, swing, last: legs[leg] == null ? { kind: 'legCleared', leg } : { kind: 'leg', leg, n: v } };
}

/* ── 3a. le compas : l'ouverture (le fil), puis l'arc ─────────────────────── */

export function canOpen(s) {
  if (!s.square) return 'noSquare';
  if (s.closed) return 'closed';
  if (s.base == null) return 'noBase';
  if (s.mode === 'ruler') return 'rulerMode';
  return true;
}

export function setOpening(s, r) {
  const ok = canOpen(s);
  if (ok !== true) return { ...s, last: { kind: ok } };
  const v = Math.max(1, Math.min(MAX_OPEN, Math.round(r)));
  return { ...s, opening: v, mode: 'compass', swing: 90, last: { kind: 'opening', r: v } };
}

/** L'angle (degrés, depuis la direction de O) où l'arc coupe l'autre côté — la mine descend de 90° vers 0° ; null si r ≤ a. */
export function cutAngle(s) {
  if (s.mode !== 'compass' || s.opening == null || s.base == null) return null;
  const a = s.legs[s.base];
  if (s.opening <= a) return null;
  return (Math.acos(a / s.opening) * 180) / Math.PI;
}

/**
 * Abaisser la mine : θ part de 90° (le fil tendu parallèlement à l'autre côté, la mine dans le ciel) et
 * DESCEND vers 0° (le fil pointé vers O). L'arc coupe l'autre côté exactement quand r·cos θ = a, donc à
 * θ* = acos(a / r) ; si r ≤ a la mine arrive à 0° sur le côté de la base, au-dessus de O : jamais sur l'autre.
 */
export function setSwing(s, deg) {
  if (s.closed) return { ...s, last: { kind: 'closed' } };
  if (s.mode !== 'compass' || s.opening == null) return { ...s, last: { kind: 'noOpening' } };
  const d = Math.max(0, Math.min(90, deg));
  const star = cutAngle(s);
  if (star != null && d <= star + 1e-9) {
    return { ...s, swing: star, closed: true, last: { kind: 'cut', third: thirdSide(s) } };
  }
  const a = s.legs[s.base];
  if (star == null && d <= 0) {
    return { ...s, swing: 0, last: { kind: s.opening === a ? 'touch' : 'short', a, r: s.opening } };
  }
  return { ...s, swing: d, last: s.last?.kind === 'swing' ? s.last : { kind: 'swing' } };
}
/** Le geste au toucher : un seul passage de la mine jusqu'en bas. */
export const sweep = (s) => setSwing(s, 0);

/** √(r² − a²), la longueur EXACTE découpée par l'arc sur l'autre côté. */
export function thirdSide(s) {
  const a = s.legs[s.base];
  return T.pythagoras({ a, hypotenuse: s.opening });
}

/* ── 3b. la règle : deux côtés reportés, l'hypoténuse tracée ───────────────── */

export function join(s) {
  if (s.closed) return { ...s, last: { kind: 'closed' } };
  if (s.mode !== 'ruler' || s.legs.h == null || s.legs.v == null) return { ...s, last: { kind: 'needBoth' } };
  return { ...s, closed: true, last: { kind: 'joined' } };
}

/* ── le triangle construit ─────────────────────────────────────────────────── */

/** Les trois longueurs EXACTES (surds) : le sable h, la verticale v, l'hypoténuse c. Null tant qu'il n'est pas fermé. */
export function lengths(s) {
  if (!s.closed) return null;
  if (s.mode === 'compass') {
    const third = thirdSide(s);
    const L = { [s.base]: T.surd(s.legs[s.base]), [other(s.base)]: third };
    return { h: L.h, v: L.v, c: T.surd(s.opening) };
  }
  return { h: T.surd(s.legs.h), v: T.surd(s.legs.v), c: T.pythagoras({ a: s.legs.h, b: s.legs.v }) };
}

/** Les côtés relativement au sommet choisi : au point du sable (h) l'opposé est la verticale. */
export function sidesAt(L, vertex) {
  return vertex === 'h'
    ? { opposite: L.v, adjacent: L.h, hypotenuse: L.c }
    : { opposite: L.h, adjacent: L.v, hypotenuse: L.c };
}

/** Les trois rapports exacts de l'angle au sommet `vertex`, et son angle en degrés. */
export function ratiosAt(L, vertex) {
  const sd = sidesAt(L, vertex);
  const out = {};
  for (const k of T.RATIOS) out[k] = T.ratioExact(k, sd);
  out.deg = T.atanDeg(T.surdNumber(out.tan));
  return out;
}

/* ── 4. désigner l'angle x : l'essai ───────────────────────────────────────── */

export function canPick(s) { return s.closed ? true : 'notClosed'; }

export function pick(s, vertex) {
  if (!s.closed) return { ...s, last: { kind: 'notClosed' } };
  if (!LEGS.includes(vertex)) return s;
  const tg = currentTarget(s);
  const L = lengths(s);
  const here = ratiosAt(L, vertex);
  const there = ratiosAt(L, other(vertex));
  const ok = T.surdEq(here[tg.ratio], tg.exact);
  let kind = 'ok';
  if (!ok) {
    const isTan = (r) => T.surdEq(r.tan, tg.exact);
    const isSinCos = (r) => T.surdEq(r.sin, tg.exact) || T.surdEq(r.cos, tg.exact);
    if (T.surdEq(there[tg.ratio], tg.exact)) kind = 'vertex';
    else if (tg.ratio !== 'tan' && s.mode === 'ruler' && (isTan(here) || isTan(there))) kind = 'legs';
    else if (tg.ratio === 'tan' && s.mode === 'compass' && (isSinCos(here) || isSinCos(there))) kind = 'hypTan';
    else kind = 'other';
  }
  const pair = targetPair(tg);
  const scale = ok && pair ? scaleOf(s, vertex, tg, pair) : null;
  const trial = Object.freeze({
    kind, ok, idx: s.idx, ratio: tg.ratio, value: tg.value, vertex, mode: s.mode,
    lengths: L, ratios: here, deg: here.deg, targetDeg: tg.deg, scale,
    legs: { h: s.legs.h, v: s.legs.v }, opening: s.opening,
  });
  const solved = ok ? s.solved.map((v, i) => (i === s.idx ? true : v)) : s.solved;
  // le même sommet sur le même triangle n'est pas un nouvel essai
  const prev = s.trials[s.trials.length - 1];
  const dup = prev && s.vertex === vertex && prev.vertex === vertex && prev.idx === s.idx && T.surdEq(prev.lengths.c, L.c)
    && T.surdEq(prev.lengths.h, L.h);
  return {
    ...s, vertex, solved,
    trials: dup ? s.trials : [...s.trials, trial],
    last: { kind: 'trial', trial },
  };
}

/** Le facteur d'échelle d'une réussite rationnelle : 4 et 10 pour 2/5 → 2. */
function scaleOf(s, vertex, tg, [, d]) {
  const L = lengths(s);
  const sd = sidesAt(L, vertex);
  const { den } = T.RATIO_SIDES[tg.ratio];
  const D = T.surdNumber(sd[den]);
  return Math.round((D / d) * 1000) / 1000;
}

/* ── la découverte, les preuves pour la leçon ──────────────────────────────── */

export function discoveryReady(s) {
  if (!s.solved.every(Boolean)) return false;
  if (s.trials.some((t) => !t.ok)) return true;
  return s.targets.some((_, i) => new Set(s.trials.filter((t) => t.ok && t.idx === i).map((t) => t.scale)).size >= 2);
}

/** Les essais en données simples (pour `onTrial` et la liste « [data-activity-evidence] » d'une leçon). */
export function evidenceOf(trial) {
  const r = trial.ratios;
  return {
    kind: trial.kind, ok: trial.ok, ratio: trial.ratio, value: trial.value, vertex: trial.vertex, mode: trial.mode,
    h: T.surdText(trial.lengths.h), v: T.surdText(trial.lengths.v), c: T.surdText(trial.lengths.c),
    cos: T.surdText(r.cos), sin: T.surdText(r.sin), tan: T.surdText(r.tan),
    cosTex: tex(r.cos), sinTex: tex(r.sin), tanTex: tex(r.tan),
    cos2: LIN.fracText(T.square(r.cos)), sin2: LIN.fracText(T.square(r.sin)),
    deg: T.roundTo(trial.deg, 1), protractor: T.roundTo(trial.deg, 0), targetDeg: T.roundTo(trial.targetDeg, 1),
    scale: trial.scale,
  };
}

/** LaTeX d'un surd à la façon du manuel : une FRACTION pour un rationnel (4/5, pas 0,8), sinon √. */
export function tex(x) {
  return x.r === 1 ? LIN.fracLatex(x.q) : T.surdLatex(x);
}

/** cos² + sin² de l'angle choisi : les deux carrés (fractions exactes) et leur somme — toujours 1. */
export function squaresOf(r) {
  const c2 = T.square(r.cos);
  const s2 = T.square(r.sin);
  return { c2, s2, sum: LIN.add(c2, s2), one: LIN.eq(LIN.add(c2, s2), LIN.frac(1)) };
}

/** L'étape de la construction (pour le DOM et les consignes). */
export function stepOf(s) {
  if (!s.square) return 'square';
  if (s.closed) return s.vertex == null ? 'pick' : 'judged';
  if (s.base == null) return 'carry';
  if (s.mode === 'compass') return 'swing';
  if (s.mode === 'ruler') return 'join';
  return 'tool';
}

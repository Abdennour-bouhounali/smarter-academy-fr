/**
 * bridge-path — LA LOGIQUE PURE du plus court passage (unité 11 « الأشعة والانسحاب », « أدمج تعلّماتي », وضعية
 * « ممر الراجلين » p. 136). Aucune arithmétique ici : chaque longueur, chaque point et chaque verdict vient de
 * packages/core/arithmetic/vectors.js (`crossingAt`, `shortestCrossing`, `relation`, `collinear`, `vec`) sur les
 * fractions exactes de linear.js ; ce module dit seulement ce que la main a le droit de faire et ce que l'écran montre.
 *
 * LE MONDE (unités = côtés de carreaux, y vers le HAUT) :
 *   la bande          entre le bord bas y = 0 et le bord haut y = w (la route, la gorge du Rhummel)
 *   A                 au-dessus du bord haut (le quartier) ; B au-dessous du bord bas (l'école)
 *   le passage [MN]   PERPENDICULAIRE aux bords : M(x ; w), N(x ; 0) — x est LA VARIABLE de la main (pas `step`)
 *   NM = (0 ; w)      le vecteur du passage : le même pour toute place x (l'invariant)
 *   B′                l'image de B par le انسحاب de vecteur NM — posée PAR L'ÉLÈVE (un nœud du quadrillage), jugée par
 *                     `relation(BB′, NM)` : même منحى, même اتجاه, même طول, sinon refus nommant ce qui diffère
 *
 * Trois temps dans UNE scène (le second s'ouvre par un bouton de l'élève, rien ne bascule seul) :
 *   1. explore   déplacer le passage ; chaque place validée est un ESSAI (longueur AM + MN + NB lue) ;
 *   2. translate après deux places différentes, l'élève ouvre la translation et pose B′ ;
 *   3. straight  B′ accepté : MB′BN متوازي أضلاع (NB = MB′), la ficelle [AB′] est tendue ; l'élève ramène le passage
 *                jusqu'à ce que A, M, B′ soient alignés (`collinear`) — la ligne brisée AMB′ devient droite.
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

const { frac, add, sub, mul, div, isInteger, toNumber } = LIN;
const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : LIN.parseNumber(String(v)));
const STEPS = [frac(1, 2), frac(1, 4), frac(1, 5), frac(1, 10)];

/** Le pas du passage : ½ carreau, plus fin seulement si la place optimale l'exige (elle est TOUJOURS sur la réglette). */
function stepFor(xLo, xStar) {
  for (const s of STEPS) if (isInteger(div(sub(xStar, xLo), s))) return s;
  throw new Error('bridgePath: la place optimale tombe hors de toute graduation');
}

/** L'état initial : le passage loin de la place optimale, aucune translation. */
export function init({ width = 2, A = [-3, 5], B = [4, -3] } = {}) {
  const w = F(width);
  const pA = V.point(A[0], A[1]);
  const pB = V.point(B[0], B[1]);
  const best = V.shortestCrossing({ A: pA, B: pB, width: w });
  const lo = Math.floor(Math.min(toNumber(pA.x), toNumber(pB.x), toNumber(best.x))) - 1;
  const hi = Math.ceil(Math.max(toNumber(pA.x), toNumber(pB.x), toNumber(best.x))) + 1;
  const xLo = frac(lo);
  const step = stepFor(xLo, best.x);
  const iMax = toNumber(div(frac(hi - lo), step));
  const iStar = toNumber(div(sub(best.x, xLo), step));
  const one = toNumber(div(frac(1), step));
  const i0 = iStar === one ? one + 1 : one;
  return Object.freeze({
    w, A: pA, B: pB, best, xLo, xHi: frac(hi), step, iMin: 0, iMax, iStar,
    i: i0, i0, stage: 'explore', pin: pB, bp: null,
    trials: Object.freeze([]), pinTrials: Object.freeze([]), solved: false, last: null,
  });
}

/** L'abscisse (exacte) du passage à la graduation i. */
export const xAt = (s, i) => add(s.xLo, mul(s.step, i));

/** Les morceaux du trajet à la place i : M, N, AM, NB (surds), MN, et les nombres pour l'affichage. */
export function partsAt(s, i) {
  const c = V.crossingAt({ A: s.A, B: s.B, width: s.w }, xAt(s, i));
  const am = TR.surdNumber(c.AM); const nb = TR.surdNumber(c.NB); const mn = toNumber(c.MN);
  const mbp = s.bp ? TR.surdNumber(V.distance(c.M, s.bp)) : null;
  return Object.freeze({ ...c, am, nb, mn, total: am + mn + nb, mbp });
}

/** A, M et B′ (le VRAI B′) sont-ils alignés pour la place i ? Décidé exactement par `collinear`. */
export const aligned = (s, i = s.i) => V.collinear(s.A, partsAt(s, i).M, s.best.Bp);
const clampI = (s, i) => Math.min(s.iMax, Math.max(s.iMin, Math.round(i)));

/** Valider la place i (relâchement, touche après une pause, bouton) : un ESSAI. */
export function cross(s, i0) {
  const i = clampI(s, i0);
  const p = partsAt(s, i);
  const optimal = aligned(s, i);
  const trial = Object.freeze({ i, x: xAt(s, i), total: p.total, optimal, stage: s.stage });
  const prev = s.trials.at(-1);
  const trials = prev && prev.i === i && prev.stage === s.stage ? s.trials : Object.freeze([...s.trials, trial]);
  const solved = s.solved || (s.stage === 'straight' && optimal);
  const kind = s.stage === 'straight' ? (optimal ? 'straight' : 'bent') : 'cross';
  return Object.freeze({ ...s, i, trials, solved, last: Object.freeze({ kind, trial }) });
}

/**
 * « جرّب كل الإمكانيات » : les places du passage pas encore essayées au temps courant (explore ou straight) — toute la
 * graduation de la réglette, chacune validée par `cross`. Au temps `translate` (poser B′) : aucune, c'est un choix.
 */
export function untriedPlaces(s) {
  if (s.stage === 'translate') return [];
  const done = new Set(s.trials.filter((t) => t.stage === s.stage).map((t) => t.i));
  return Array.from({ length: s.iMax - s.iMin + 1 }, (_, j) => s.iMin + j).filter((i) => !done.has(i));
}

/** Le départ du passage n'est jamais la place optimale (ni à la graduation de la réglette, ni alignée A, M, B′). */
export const defaultIsSolution = (s) => s.i === s.iStar || aligned(s, s.i);

/** Deux places différentes essayées : l'élève peut ouvrir la translation. */
export const canTranslate = (s) => s.stage === 'explore' && new Set(s.trials.map((t) => t.i)).size >= 2;

/** Le geste de l'élève qui ouvre le temps 2 (jamais automatique). */
export function openTranslate(s) {
  if (!canTranslate(s)) return s;
  return Object.freeze({ ...s, stage: 'translate', pin: s.B, last: Object.freeze({ kind: 'openTranslate' }) });
}

/** Les ÉTAPES (les trois temps de la scène) atteintes : `explore` (deux places essayées) · `translate` (B′ posé) · `straight` (A, M, B′ alignés). */
export const STEP_KINDS = Object.freeze(['explore', 'translate', 'straight']);
export function reachedKinds(s) {
  return STEP_KINDS.filter((kd) => (kd === 'explore' ? s.stage !== 'explore' || canTranslate(s) : kd === 'translate' ? !!s.bp : s.solved));
}
/** « أعِد التجربة » : remet CETTE étape au départ (les étapes d'avant restent faites, celles d'après s'effacent). */
export function restartStep(s, kd) {
  if (kd === 'explore') return Object.freeze({ ...s, stage: 'explore', i: s.i0, pin: s.B, bp: null, trials: Object.freeze([]), pinTrials: Object.freeze([]), solved: false, last: null });
  if (kd === 'translate') return Object.freeze({ ...s, stage: 'translate', i: s.i0, pin: s.B, bp: null, trials: Object.freeze(s.trials.filter((t) => t.stage === 'explore')), solved: false, last: null });
  return Object.freeze({ ...s, stage: 'straight', i: s.i0, solved: false, trials: Object.freeze(s.trials.filter((t) => t.stage !== 'straight')), last: null });
}

/** Le cadre de la scène (en carreaux) : les nœuds où l'épingle B′ peut tomber. */
export function frame(s) {
  // En bas, la place de l'erreur MN (B descendu de la largeur) reste un nœud du cadre : le refus doit pouvoir se voir.
  return {
    xMin: toNumber(s.xLo) - 0.5, xMax: toNumber(s.xHi) + 0.5,
    yMin: toNumber(s.B.y) - toNumber(s.w) - 0.6, yMax: toNumber(s.A.y) + 1,
  };
}
/** Le nœud entier le plus proche, borné au cadre. */
function snapNode(s, x, y) {
  const f = frame(s);
  return { x: Math.min(Math.floor(f.xMax), Math.max(Math.ceil(f.xMin), Math.round(x))), y: Math.min(Math.floor(f.yMax), Math.max(Math.ceil(f.yMin), Math.round(y))) };
}

/**
 * Ce que dit `relation(BB′, NM)` d'une épingle posée en P : 'equal' (accepté), 'zero' (P = B, rien n'est posé),
 * 'direction' (pas le même منحى), 'sense' (même منحى et même طول, اتجاه contraire : c'est MN), 'senseLength'
 * (même منحى, ni le اتجاه ni le طول), 'length' (même منحى et même اتجاه, pas le même طول).
 */
export function pinKind(s, P) {
  const u = V.vec(s.B, P);
  if (V.isZeroVec(u)) return 'zero';
  const r = V.relation(u, s.best.nm);
  if (r.equal) return 'equal';
  if (!r.direction) return 'direction';
  if (r.sense === false) return r.length ? 'sense' : 'senseLength';
  return 'length';
}

/** Déplacer l'épingle (glisser, flèches) — rien n'est jugé. */
export function movePin(s, node) {
  if (s.stage !== 'translate') return s;
  const n = snapNode(s, node.x, node.y);
  return Object.freeze({ ...s, pin: V.point(n.x, n.y) });
}

/** Poser l'épingle en P (relâchement, Entrée, toucher un nœud) : jugée ; refusée, elle revient sur B. */
export function placePin(s, node) {
  if (s.stage !== 'translate') return s;
  const n = snapNode(s, node.x, node.y);
  const P = V.point(n.x, n.y);
  const kind = pinKind(s, P);
  if (kind === 'zero') return Object.freeze({ ...s, pin: s.B, last: null });
  const t = Object.freeze({ P, kind, len: TR.surdNumber(V.distance(s.B, P)) });
  const pinTrials = Object.freeze([...s.pinTrials, t]);
  if (kind === 'equal') {
    return Object.freeze({ ...s, pin: P, bp: P, stage: 'straight', pinTrials, last: Object.freeze({ kind: 'pin', pin: t }) });
  }
  return Object.freeze({ ...s, pin: s.B, pinTrials, last: Object.freeze({ kind: 'pin', pin: t }) });
}

/**
 * La découverte s'ouvre sur la place ALIGNÉE trouvée au temps 3 ET le contraste : au moins un essai d'une autre place
 * (la longueur plus grande, vue).
 */
export const discoveryReady = (s) => s.solved && s.trials.some((t) => !t.optimal);

/** Les longueurs à toutes les places (le graphique après la découverte). */
export const allTotals = (s) => Array.from({ length: s.iMax + 1 }, (_, i) => ({ i, total: partsAt(s, i).total }));

/** La place où [AB] coupe le bord haut (la ligne droite « interdite » : le passage doit être perpendiculaire). */
export function abCrossing(s) {
  const t = div(sub(s.A.y, s.w), sub(s.A.y, s.B.y));
  const x = add(s.A.x, mul(t, sub(s.B.x, s.A.x)));
  const c = V.crossingAt({ A: s.A, B: s.B, width: s.w }, x);
  return { x, total: TR.surdNumber(c.AM) + toNumber(c.MN) + TR.surdNumber(c.NB) };
}

/** La longueur minimale : AB′ + MN (surd + rationnel), en LaTeX et en nombre. */
export function minimum(s) {
  const surd = s.best.ABp;
  return { latex: `${TR.surdLatex(surd)} + ${numTex(s.w)}`, number: TR.surdNumber(surd) + toNumber(s.w), abp: TR.surdNumber(surd), abpLatex: TR.surdLatex(surd) };
}

/** La preuve envoyée à la leçon (`onTrial`) : le dernier geste, en nombres lisibles (d = place du passage sur la réglette, depuis son début). */
export function evidenceOf(s) {
  const l = s.last;
  if (!l) return null;
  if (l.kind === 'cross' || l.kind === 'bent' || l.kind === 'straight') {
    return { stage: l.kind === 'cross' ? 'cross' : 'straight', d: numText(sub(l.trial.x, s.xLo)), total: dec(l.trial.total), optimal: l.trial.optimal };
  }
  if (l.kind === 'pin') return { stage: 'pin', kind: l.pin.kind };
  return null;
}

/** Écritures : un nombre affiché à 2 décimales avec la virgule ; une fraction exacte en texte ou en LaTeX. */
export function dec(n, digits = 2) {
  const v = Math.round((n + Math.sign(n) * 1e-12) * 10 ** digits) / 10 ** digits;
  return String(Number(v.toFixed(digits))).replace('.', ',').replace('-', '−');
}
export function numText(p) {
  const q = F(p);
  if (q.d === 1) return String(q.n).replace('-', '−');
  const v = q.n / q.d;
  return Number.isInteger(v * 100) ? String(v).replace('.', ',').replace('-', '−') : `${q.n}/${q.d}`.replace('-', '−');
}
export function numTex(p) {
  const q = F(p);
  if (q.d === 1) return String(q.n);
  const v = q.n / q.d;
  return Number.isInteger(v * 100) ? String(v).replace('.', '{,}') : `\\dfrac{${q.n}}{${q.d}}`;
}

/**
 * La géométrie de la scène, en pixels, y vers le bas (pure, testée) : la même échelle k pour x et y (le quadrillage est
 * fait de CARRÉS), le tout dans la largeur ET la hauteur données.
 */
export function layout(s, { width, height, pad = 10 }) {
  const f = frame(s);
  const spanX = f.xMax - f.xMin; const spanY = f.yMax - f.yMin;
  const k = Math.max(8, Math.min((width - 2 * pad) / spanX, (height - 2 * pad) / spanY));
  const W = Math.round(spanX * k + 2 * pad); const H = Math.round(spanY * k + 2 * pad);
  const X = (x) => pad + (toNumber(F(x)) - f.xMin) * k;
  const Y = (y) => pad + (f.yMax - toNumber(F(y))) * k;
  const fromPx = (px, py) => ({ x: f.xMin + (px - pad) / k, y: f.yMax - (py - pad) / k });
  return { k, width: W, height: H, X, Y, fromPx, frame: f };
}

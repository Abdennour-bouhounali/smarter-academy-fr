/**
 * shadow-stick — LA LOGIQUE PURE du bâton et de l'ombre (unité 9 « خاصية طالس », le تحدّ p. 103, synthèse
 * « أدمج تعلّماتي »). Aucune arithmétique ici : chaque longueur vient de packages/core/arithmetic/thales.js
 * (`heightFromShadow`, `fourthProportional`) et de linear.js (fractions exactes) ; ce module dit seulement ce
 * que la main a le droit de faire et ce que l'écran doit montrer.
 *
 * LE MONDE (abscisses au sol, en mètres, depuis le pied A de la minaret) :
 *   A        le pied de la minaret, M son sommet (hauteur h, INCONNUE de l'élève, jamais écrite avant la mesure)
 *   O        l'extrémité de l'ombre de la minaret, à `tip` de A (11,6 m) — le soleil est FIXE
 *   B        le pied du bâton (hauteur `stick`, 1 m), à d de A : c'est LA VARIABLE de la première main
 *   E        le sommet du bâton ; l'ombre du bâton va de B à d + ℓ, où ℓ = tip − stickAt (le soleil est le même :
 *            l'ombre d'un bâton de 1 m a toujours la même longueur ℓ = 1,6 m, où qu'on le plante)
 *   P        la perche télescopique (seconde main) : plantée à `dist` de O entre B et A, son sommet TOUCHE le
 *            rayon (O, M) — sa hauteur est `stick × dist ÷ ℓ` (Thalès de sommet O), jamais un réglage libre
 *
 * Les deux gestes, dans UNE scène :
 *   1. planter le bâton (i = d ÷ pas) : l'extrémité de son ombre tombe AVANT, APRÈS ou SUR celle de la minaret ;
 *      seul « sur » fait de O un sommet commun (un seul rayon passe par E et M) — la méthode du تحدّ ;
 *   2. tant que les extrémités coïncident, déplacer la perche de B vers A (j = dist ÷ pas de perche) : sa
 *      hauteur suit le rayon ; au pied de la minaret, la perche EST la minaret — h se lit, k = OA ÷ OB.
 */
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';

const { frac, parseNumber, add, sub, mul, div, cmp, eq, isInteger, toNumber } = LIN;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/** Le pas des positions du bâton : 0,2 m quand le manuel s'y écrit, sinon 0,1 m. */
function stickStep(stickAt, tip) {
  const fifth = frac(1, 5);
  return isInteger(div(stickAt, fifth)) && isInteger(div(tip, fifth)) ? fifth : frac(1, 10);
}

/** Le pas de la perche : ℓ ÷ m, le plus petit m ≥ 4 qui met le pied de la minaret sur la graduation. */
function poleDivisions(shadow, tip) {
  for (let m = 4; m <= 16; m += 1) if (isInteger(div(mul(tip, m), shadow))) return m;
  throw new Error('shadowStick: pas de graduation de perche qui atteigne le pied de la minaret');
}

/** L'état initial : bâton planté à 1 m de la minaret (jamais sur la bonne place), pas de perche. */
export function init({ stick = 1, stickAt = 10, tip = 11.6 } = {}) {
  const S = F(stick); const D = F(stickAt); const T = F(tip);
  if (cmp(D, frac(0)) <= 0 || cmp(D, T) >= 0) throw new Error('shadowStick: 0 < stickAt < tip');
  const h = TH.heightFromShadow({ stick: S, stickAt: D, tip: T });
  const shadow = sub(T, D);
  const step = stickStep(D, T);
  const iMin = Math.max(1, Math.ceil(toNumber(div(frac(1), step))));
  const iMax = toNumber(div(T, step));
  const iStar = toNumber(div(D, step));
  const m = poleDivisions(shadow, T);
  const poleStep = div(shadow, m);
  const jA = toNumber(div(T, poleStep));
  return Object.freeze({
    stick: S, stickAt: D, tip: T, h, shadow, step, iMin, iMax, iStar,
    poleStep, jMin: m, jA,
    i: iStar === iMin ? iMin + 1 : iMin, j: null,
    trials: Object.freeze([]), poleTrials: Object.freeze([]), last: null,
  });
}

/** La position du bâton (m depuis A) pour l'indice i. */
export const stickAtIndex = (s, i) => mul(s.step, i);
/** L'extrémité de l'ombre du bâton planté en i (m depuis A). */
export const stickTipAt = (s, i) => add(stickAtIndex(s, i), s.shadow);
/** Les deux extrémités d'ombre coïncident-elles (O sommet commun) ? */
export const meets = (s, i = s.i) => eq(stickTipAt(s, i), s.tip);
/** L'écart (signé) entre l'extrémité de l'ombre du bâton et celle de la minaret. */
export const tipGap = (s, i = s.i) => sub(stickTipAt(s, i), s.tip);

/** La perche à la graduation j : distance à O, position depuis A, hauteur (son sommet sur le rayon). */
export function poleAt(s, j) {
  const dist = mul(s.poleStep, j);
  return Object.freeze({
    j, dist, x: sub(s.tip, dist),
    height: TH.fourthProportional(s.shadow, dist, s.stick),
    k: div(dist, s.shadow),
    atMinaret: j === s.jA,
  });
}

const clampI = (s, i) => Math.min(s.iMax, Math.max(s.iMin, Math.round(i)));
const clampJ = (s, j) => Math.min(s.jA, Math.max(s.jMin, Math.round(j)));

/** Planter le bâton en i (relâchement, touche, bouton) : un ESSAI, jugé contre l'ombre de la minaret. */
export function placeStick(s, i0) {
  const i = clampI(s, i0);
  const gap = tipGap(s, i);
  const c = cmp(gap, frac(0));
  const kind = c < 0 ? 'before' : c > 0 ? 'after' : 'meet';
  const trial = Object.freeze({ i, d: stickAtIndex(s, i), tipAt: stickTipAt(s, i), kind });
  const prev = s.trials.at(-1);
  const trials = prev && prev.i === i ? s.trials : Object.freeze([...s.trials, trial]);
  // Le bâton quitte la bonne place : O n'est plus un sommet commun, la perche disparaît.
  const j = kind === 'meet' ? s.j : null;
  return Object.freeze({ ...s, i, j, trials, last: Object.freeze({ kind: 'stick', trial }) });
}

/** Planter la perche en j — seulement tant que les deux ombres finissent en O. */
export function placePole(s, j0) {
  if (!meets(s)) return Object.freeze({ ...s, last: Object.freeze({ kind: 'poleFirst' }) });
  const j = clampJ(s, j0);
  const pole = poleAt(s, j);
  const prev = s.poleTrials.at(-1);
  const poleTrials = prev && prev.j === j ? s.poleTrials : Object.freeze([...s.poleTrials, pole]);
  return Object.freeze({ ...s, j, poleTrials, last: Object.freeze({ kind: 'pole', pole }) });
}

export const poleIndex = (s) => (s.j == null ? s.jMin : s.j);

/**
 * La découverte s'ouvre sur le CONTRASTE et la MESURE : au moins une extrémité d'ombre ratée, la bonne
 * place trouvée, puis la perche arrêtée en chemin ET au pied de la minaret (deux lignes du même tableau).
 */
export function discoveryReady(s) {
  return s.trials.some((t) => t.kind === 'meet')
    && s.trials.some((t) => t.kind !== 'meet')
    && s.poleTrials.some((p) => p.atMinaret)
    && s.poleTrials.some((p) => !p.atMinaret);
}

/** La preuve envoyée à la leçon (`onTrial`) : le dernier geste, en nombres lisibles. */
export function evidenceOf(s) {
  const l = s.last;
  if (!l) return null;
  if (l.kind === 'stick') {
    return { stage: 'stick', d: dec(l.trial.d), tipAt: dec(l.trial.tipAt), kind: l.trial.kind };
  }
  if (l.kind === 'pole') {
    return { stage: 'pole', dist: dec(l.pole.dist), height: dec(l.pole.height), k: dec(l.pole.k), atMinaret: l.pole.atMinaret };
  }
  return null;
}

/** Écritures : « 7,25 », « 11,6 » ; LaTeX « 7{,}25 ». */
export const dec = (p) => TH.thalesText(p, 3);
export const tex = (p) => TH.thalesLatex(p, 3);

/**
 * La géométrie de la scène, en pixels, y vers le bas (pure, testée) : la minaret à gauche, le soleil en haut à
 * gauche, l'ombre vers la droite. L'échelle tient la largeur ET la hauteur données.
 */
export function layout(s, { width, height, pad = 18, top = 26, bottom = 30 }) {
  const span = toNumber(s.tip) + toNumber(s.shadow) + 1.2; // de −0,6 m (la minaret a une largeur) à après O
  const tall = toNumber(s.h) * 1.18;
  const k = Math.max(4, Math.min((width - 2 * pad) / span, (height - top - bottom) / tall));
  const x0 = pad + 0.6 * k;
  const yGround = top + tall * k;
  const X = (m) => x0 + toNumber(F(m)) * k;
  const Y = (m) => yGround - toNumber(F(m)) * k;
  return { k, x0, yGround, X, Y, width: Math.max(width, x0 + (span - 0.6) * k + pad), height: yGround + bottom };
}

/* ── « جرّب كل الإمكانيات » : la liste des places à essayer, dans l'ordre ───────────────────── */

/**
 * Les gestes qu'il reste à jouer pour avoir essayé TOUTES les places du bâton puis TOUTES celles de la perche.
 * Les places du bâton montent de la plus proche à la plus lointaine ; la bonne place (iStar) est jouée EN DERNIER
 * pour que le bâton s'y retrouve (sinon la perche disparaît) ; ensuite, les crans de la perche. Chaque geste est
 * exactement celui de la main (`placeStick` / `placePole`). Pure : la liste se recalcule depuis l'état.
 */
export function tryAllPlan(s) {
  const tried = new Set(s.trials.map((t) => t.i));
  const plan = [];
  let atStar = s.i === s.iStar && tried.has(s.iStar);
  for (let i = s.iMin; i <= s.iMax; i += 1) {
    if (i !== s.iStar && !tried.has(i)) { plan.push({ kind: 'stick', v: i }); atStar = false; }
  }
  if (!atStar) plan.push({ kind: 'stick', v: s.iStar });
  const poled = new Set(s.poleTrials.map((p) => p.j));
  for (let j = s.jMin; j <= s.jA; j += 1) if (!poled.has(j)) plan.push({ kind: 'pole', v: j });
  return plan;
}
/** Joue UN geste de la liste. Revenir sur la bonne place déjà essayée ne réécrit pas d'essai (pas de doublon). */
export function tryAllApply(s, action) {
  if (action.kind === 'pole') return placePole(s, action.v);
  if (action.v === s.iStar && s.trials.some((t) => t.i === s.iStar)) {
    return Object.freeze({ ...s, i: s.iStar, last: Object.freeze({ kind: 'stick', trial: s.trials.find((t) => t.i === s.iStar) }) });
  }
  return placeStick(s, action.v);
}

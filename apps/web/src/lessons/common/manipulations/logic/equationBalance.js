import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

/**
 * La logique PURE de `equation-balance` (unité 4, leçon « حل معادلة من الدرجة الأولى
 * بمجهول واحد ») — aucune vue, aucun React. Toute l'arithmétique est exacte
 * (packages/core/arithmetic/linear.js) : le contenu d'un sac peut valoir 9/2 ou −1/7.
 *
 * LE MONDE. Une balance à deux plateaux. Sur chaque plateau :
 *   a  le nombre NET de sacs fermés (a > 0 : des sacs, chacun contient x ; a < 0 :
 *      des « sacs-ballons » gonflés à l'hélium, chacun vaut −x) — entier ;
 *   u  la charge NETTE en unités (u > 0 : des ballons de football, +1 chacun ;
 *      u < 0 : des baudruches, −1 chacune, elles TIRENT le plateau vers le haut) —
 *      une fraction exacte (elle ne devient fractionnaire qu'après un partage).
 * Un ballon et une baudruche sur le même plateau s'annulent (paire nulle) : on ne
 * stocke donc que la charge nette, et la vue montre la paire qui disparaît (`zero`).
 *
 * LE GESTE. Chaque geste est un EFFET sur UN plateau : '+1' (poser un ballon, ou ôter
 * une baudruche), '-1' (ôter un ballon, ou poser une baudruche), '+x' (poser un sac, ou
 * ôter un sac-ballon), '-x' (ôter un sac, ou poser un sac-ballon). Ôter un ballon et
 * poser une baudruche sont LA MÊME opération mathématique (−1) : c'est l'effet qui
 * compte, pas l'objet.
 *
 * LA RÉSISTANCE. Le fléau penche selon le VRAI contenu (caché) des sacs : la solution
 * de l'équation de départ. Un effet sur un seul plateau le fait pencher ; tant qu'il
 * penche (`pending`), seuls deux gestes sont acceptés — le même effet (sur l'un ou
 * l'autre plateau) ou son inverse sur un plateau qui l'a reçu (on se reprend). Tout
 * autre geste est refusé : « الميزان مائل ». Quand les deux plateaux ont reçu le même
 * effet le même nombre de fois, le fléau revient à l'horizontale et une ÉQUATION
 * ÉQUIVALENTE s'écrit (« أي … »).
 *
 * LE PARTAGE. « قسّم كل كفّة إلى k مجموعات متساوية » : refusé si les sacs d'un plateau ne
 * se partagent pas en k parts égales, ou si un plateau qui porte des sacs a des unités
 * qu'il faudrait couper ; un plateau sans sac peut être coupé (4 ballons et demi).
 * Garder une seule part de chaque côté, c'est diviser les deux membres par k.
 */

const { frac, add, sub, div, eq, cmp, isZero, isInteger, toNumber, linear, lin, linLatex, linAt, solveEquation, fracLatex, fracText } = Lin;

export const MAX_BAGS = 12;
export const MAX_UNITS = 40;
export const EFFECTS = Object.freeze(['+1', '-1', '+x', '-x']);
const INVERSE = { '+1': '-1', '-1': '+1', '+x': '-x', '-x': '+x' };
export const inverse = (e) => INVERSE[e];
export const SIDES = Object.freeze(['L', 'R']);
export const other = (s) => (s === 'L' ? 'R' : 'L');

/** Les gestes (objet + sens) et l'effet de chacun. */
export const GESTURES = Object.freeze({
  'add:ball': '+1', 'add:balloon': '-1', 'add:bag': '+x', 'add:anti': '-x',
  'remove:ball': '-1', 'remove:balloon': '+1', 'remove:bag': '-x', 'remove:anti': '+x',
});

/** Lit « ax+b=cx+d » (coefficients entiers, petits). Lève une erreur de CONTENU sinon. */
export function parseEquation(src) {
  const parts = String(src).split('=');
  if (parts.length !== 2) throw new Error(`equation-balance : « ${src} » n'est pas une équation`);
  const [L, R] = parts.map((p) => linear(p));
  for (const P of [L, R]) {
    if (!isInteger(P.a) || !isInteger(P.b)) throw new Error(`equation-balance : coefficients entiers attendus (« ${src} »)`);
    if (Math.abs(P.a.n) > MAX_BAGS || Math.abs(P.b.n) > MAX_UNITS) throw new Error(`equation-balance : « ${src} » dépasse la balance`);
  }
  const sol = solveEquation(L, R);
  if (sol.kind !== 'unique') throw new Error(`equation-balance : « ${src} » n'a pas de solution unique`);
  return { L, R, x: sol.x };
}

const pan = (P) => Object.freeze({ a: P.a.n, u: frac(P.b.n, P.b.d) });
const panLin = (p) => lin(p.a, p.u);

export function init(src) {
  const { L, R, x } = parseEquation(src);
  const pans = { L: pan(L), R: pan(R) };
  return {
    src: String(src), x, start: pans, pans,
    pending: null, tippedSeen: false, refusals: 0, verified: false, zero: null,
    history: [{ kind: 'start', after: pans }],
  };
}

/** Le poids d'un plateau, avec le vrai contenu x des sacs (caché à l'élève). */
export const weight = (lab, side) => linAt(panLin(lab.pans[side]), lab.x);
/** −1 : le plateau gauche monte (plus léger) ; 1 : il descend ; 0 : horizontal. */
export const tilt = (lab) => cmp(weight(lab, 'L'), weight(lab, 'R'));
export const isBalanced = (lab) => tilt(lab) === 0;

/** Peut-on faire ce GESTE sur ce plateau ? true, ou la clé de la raison. */
export function canGesture(lab, side, gesture) {
  const effect = GESTURES[gesture];
  if (!effect || !SIDES.includes(side)) return '';
  const p = lab.pans[side];
  const [verb, kind] = gesture.split(':');
  if (verb === 'remove') {
    if (kind === 'ball' && cmp(p.u, 1) < 0) return 'noneHere';
    if (kind === 'balloon' && cmp(p.u, -1) > 0) return 'noneHere';
    if (kind === 'bag' && p.a < 1) return 'noneHere';
    if (kind === 'anti' && p.a > -1) return 'noneHere';
  } else {
    if ((kind === 'bag' || kind === 'anti') && Math.abs(p.a + (kind === 'bag' ? 1 : -1)) > MAX_BAGS) return 'full';
    if ((kind === 'ball' || kind === 'balloon') && Math.abs(toNumber(p.u) + (kind === 'ball' ? 1 : -1)) > MAX_UNITS) return 'full';
  }
  return canEffect(lab, side, effect);
}

/** La règle de la balance qui penche : même effet, ou on se reprend. */
export function canEffect(lab, side, effect) {
  const pd = lab.pending;
  if (!pd) return true;
  if (effect === pd.effect) return true;
  if (effect === INVERSE[pd.effect] && pd[side] > 0) return true;
  return 'tipped';
}

/** Les nombres de la raison « الميزان مائل » : ce qui a été fait, où, combien de fois. */
export function tippedDetails(lab) {
  const pd = lab.pending;
  if (!pd) return null;
  const ahead = pd.L > pd.R ? 'L' : 'R';
  return { effect: pd.effect, side: ahead, missing: other(ahead), n: Math.abs(pd.L - pd.R) };
}

function applyEffect(p, effect) {
  if (effect === '+1') return { a: p.a, u: add(p.u, 1) };
  if (effect === '-1') return { a: p.a, u: sub(p.u, 1) };
  if (effect === '+x') return { a: p.a + 1, u: p.u };
  return { a: p.a - 1, u: p.u };
}

/** Le geste accepté (l'appelant a vérifié `canGesture`). */
export function gesture(lab, side, g) {
  const v = canGesture(lab, side, g);
  if (v !== true) return { ...lab, refusals: lab.refusals + (v === 'tipped' ? 1 : 0) };
  const effect = GESTURES[g];
  const before = lab.pans;
  const p0 = before[side];
  const p1 = applyEffect(p0, effect);
  // Paire nulle : poser un ballon où il y a des baudruches (ou l'inverse), un sac
  // où il y a des sacs-ballons (ou l'inverse).
  const [verb, kind] = g.split(':');
  let zero = null;
  if (verb === 'add') {
    if (kind === 'ball' && cmp(p0.u, 0) < 0) zero = { side, kind: 'unit' };
    if (kind === 'balloon' && cmp(p0.u, 0) > 0) zero = { side, kind: 'unit' };
    if (kind === 'bag' && p0.a < 0) zero = { side, kind: 'bag' };
    if (kind === 'anti' && p0.a > 0) zero = { side, kind: 'bag' };
  }
  const pans = { ...before, [side]: Object.freeze(p1) };

  let pending = lab.pending ? { ...lab.pending } : { effect, L: 0, R: 0, first: side, from: before };
  if (effect === pending.effect) pending[side] += 1;
  else pending[side] -= 1;

  let history = lab.history;
  let tippedSeen = lab.tippedSeen;
  const next = { ...lab, pans, zero };
  if (pending.L === pending.R) {
    if (pending.L > 0) {
      history = [...history, { kind: 'both', effect: pending.effect, n: pending.L, before: pending.from, after: pans }];
    }
    pending = null;
  } else if (!isZero(sub(linAt(panLin(pans.L), lab.x), linAt(panLin(pans.R), lab.x)))) {
    tippedSeen = true;
  }
  return { ...next, pending, history, tippedSeen };
}

/** Peut-on partager chaque plateau en k groupes égaux ? true, ou { reason, … }. */
export function canDivide(lab, k) {
  if (!Number.isInteger(k) || k < 2) return { reason: '' };
  if (lab.pending) return { reason: 'tipped' };
  const { L, R } = lab.pans;
  if (L.a === 0 && R.a === 0) return { reason: 'noBags' };
  for (const side of SIDES) {
    const p = lab.pans[side];
    if (p.a % k !== 0) {
      const n = Math.abs(p.a);
      return { reason: 'bagsUneven', side, n, k, q: Math.floor(n / k), r: n % k };
    }
  }
  for (const side of SIDES) {
    const p = lab.pans[side];
    if (p.a !== 0 && !isZero(p.u) && !(isInteger(p.u) && p.u.n % k === 0)) {
      return { reason: 'cutMixed', side, n: Math.abs(toNumber(p.u)), k };
    }
  }
  return true;
}

/** Ce que contient UNE part de chaque plateau (aperçu du partage, et refus). */
export function groupsOf(lab, k) {
  const out = {};
  for (const side of SIDES) {
    const p = lab.pans[side];
    const bagsLeft = ((Math.abs(p.a) % k) + k) % k;
    out[side] = {
      a: Math.trunc(p.a / k), u: div(p.u, k),
      leftoverBags: bagsLeft, bagKind: p.a < 0 ? 'anti' : 'bag',
    };
  }
  return out;
}

export function divide(lab, k) {
  if (canDivide(lab, k) !== true) return lab;
  const before = lab.pans;
  const pans = {
    L: Object.freeze({ a: before.L.a / k, u: div(before.L.u, k) }),
    R: Object.freeze({ a: before.R.a / k, u: div(before.R.u, k) }),
  };
  return { ...lab, pans, zero: null, history: [...lab.history, { kind: 'divide', k, before, after: pans }] };
}

/** Un sac SEUL dans un plateau, des unités seules dans l'autre : on lit x. */
export function solvedSide(lab) {
  for (const side of SIDES) {
    const p = lab.pans[side]; const o = lab.pans[other(side)];
    if (p.a === 1 && isZero(p.u) && o.a === 0 && !lab.pending) return side;
  }
  return null;
}
export const isSolved = (lab) => solvedSide(lab) !== null;
/** La valeur lue (le contenu d'un sac). */
export const readValue = (lab) => { const s = solvedSide(lab); return s ? lab.pans[other(s)].u : null; };

/**
 * La vérification par SUBSTITUTION : on ouvre les sacs de l'équation de DÉPART et
 * on les remplace par la valeur trouvée ; les deux plateaux pèsent la même chose.
 */
export function substitution(lab) {
  const v = readValue(lab);
  if (v == null) return null;
  const L = panLin(lab.start.L); const R = panLin(lab.start.R);
  return { x: v, left: linAt(L, v), right: linAt(R, v), equal: eq(linAt(L, v), linAt(R, v)) };
}
export const verify = (lab) => (isSolved(lab) ? { ...lab, verified: true } : lab);

/** Le contraste exigé : un fléau qui a penché, un sac lu, et la valeur vérifiée. */
export const discoveryReady = (lab) => lab.tippedSeen && isSolved(lab) && lab.verified;

// ── Écritures (LaTeX) ─────────────────────────────────────────────────────

export const panTex = (p) => linLatex(panLin(p));
export const equationTex = (pans) => `${panTex(pans.L)} = ${panTex(pans.R)}`;
const signedTerm = (effect, n) => {
  const m = effect.endsWith('x') ? (n === 1 ? 'x' : `${n}x`) : String(n);
  return `${effect.startsWith('+') ? '+' : '-'} ${m}`;
};
/** La ligne d'opération d'une étape : « 9x + 1 - 1 = -26 - 1 », « \dfrac{9x}{9} = \dfrac{-27}{9} ». */
export function stepTex(step) {
  if (step.kind === 'both') {
    const t = signedTerm(step.effect, step.n);
    return `${panTex(step.before.L)} ${t} = ${panTex(step.before.R)} ${t}`;
  }
  if (step.kind === 'divide') {
    return `\\dfrac{${panTex(step.before.L)}}{${step.k}} = \\dfrac{${panTex(step.before.R)}}{${step.k}}`;
  }
  return equationTex(step.after);
}
/** L'équation équivalente obtenue (« أي … »). */
export const resultTex = (step) => equationTex(step.after);
/** La clé de l'opération, pour sa phrase arabe. */
export const stepKey = (step) => (step.kind === 'divide' ? 'opDivide'
  : { '+1': 'opAddUnits', '-1': 'opSubUnits', '+x': 'opAddX', '-x': 'opSubX' }[step.effect]);

/** Les étapes résolues (sans le départ), pour `onTrial` et la liste de preuves. */
export const steps = (lab) => lab.history.slice(1).map((s) => ({
  kind: s.kind, op: stepTex(s), result: resultTex(s), key: stepKey(s), n: s.n ?? s.k,
  term: s.kind === 'divide' ? String(s.k) : s.effect.endsWith('x') ? (s.n === 1 ? 'x' : `${s.n}x`) : String(s.n),
}));

// ── Dessin : nombres d'objets à dessiner ─────────────────────────────────

/** Ce qu'il y a à DESSINER sur un plateau : sacs, sacs-ballons, ballons entiers, baudruches entières, une part. */
export function drawCounts(p) {
  const u = p.u;
  const mag = Math.floor(Math.abs(u.n) / u.d);
  const whole = u.n < 0 ? -mag : mag;
  const part = sub(u, whole); // même signe que u, |part| < 1
  return {
    bags: Math.max(0, p.a), antis: Math.max(0, -p.a),
    balls: Math.max(0, whole), balloons: Math.max(0, -whole),
    part: isZero(part) ? null : { n: Math.abs(part.n), d: part.d, negative: part.n < 0 },
  };
}

/** Un membre de DÉPART avec x remplacé par v : « 9 \times (-3) + 1 ». */
export function substitutedTex(p, v) {
  const val = fracLatex(v);
  const head = p.a === 0 ? '' : p.a === 1 ? `(${val})` : p.a === -1 ? `-(${val})` : `${p.a} \\times (${val})`;
  if (isZero(p.u)) return head || '0';
  const c = fracLatex(p.u);
  if (!head) return c;
  return p.u.n < 0 ? `${head} - ${c.replace(/^-/, '')}` : `${head} + ${c}`;
}

export { fracLatex, fracText, toNumber };

import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { differenceSteps, euclidSteps, differenceStepCount } = divisibility;

/* ── الفروق المتتابعة ─────────────────────────────────────────────────────── */

/**
 * pgcd-differences — la machine à soustraire. L'élève porte le PETIT nombre
 * sur le GRAND ; la différence apparaît et remplace le grand. Chaque geste
 * ajoute un maillon à la chaîne ; la chaîne s'arrête au fruit nul, et le
 * dernier fruit non nul est ce que l'élève porte dans la case PGCD.
 */
export function initDifferences({ a, b }) {
  const { steps, gcd } = differenceSteps(a, b);
  return { a, b, steps, gcd, done: 0, pgcdPlaced: false };
}

/** Le couple courant (big, small) — ce que l'élève a sous les yeux. */
export function currentPair(state) {
  const s = state.steps[state.done];
  if (s) return { big: s.big, small: s.small };
  const last = state.steps[state.steps.length - 1];
  return last ? { big: last.small, small: last.diff } : { big: state.a, small: state.b };
}

/** Porter `source` sur `target` : seul « le petit sur le grand » soustrait. */
export function canSubtract(state, source, target) {
  if (isDifferencesFinished(state)) return 'finished';
  if (source === 'small' && target === 'big') return true;
  if (source === 'big' && target === 'small') return 'bigOnSmall';
  return 'invalid';
}

export function subtract(state) {
  if (isDifferencesFinished(state)) return state;
  return { ...state, done: state.done + 1 };
}

export function undoSubtract(state) {
  return state.done > 0 ? { ...state, done: state.done - 1 } : state;
}

export function isDifferencesFinished(state) {
  return state.done >= state.steps.length;
}

/**
 * Compléter la chaîne (« أكمل الفروق », MANIPULATION_CONTRACT §6bis) : les
 * soustractions restantes, par `subtract` — le geste de l'élève. La case
 * PGCD n'est PAS remplie : reconnaître le dernier fruit non nul reste à lui.
 */
export function completeDifferences(state) {
  let s = state;
  while (!isDifferencesFinished(s)) s = subtract(s);
  return s;
}

export function remainingDifferences(state) {
  return Math.max(0, state.steps.length - state.done);
}

/** La dernière différence non nulle — le seul objet accepté dans la case PGCD. */
export function lastNonZeroDiff(state) {
  const nz = state.steps.filter((s) => s.diff !== 0);
  return nz.length ? nz[nz.length - 1].diff : state.steps[0]?.big ?? null;
}

/**
 * La case PGCD REFUSE AVEC DES MATHÉMATIQUES, pas avec la règle à découvrir :
 * « 56 لا يقسم 252 », jamais « ce n'est pas le dernier fruit non nul » (qui
 * énonçait la découverte avant la conjecture — audit 2026-09-29). Parmi les
 * fruits de la chaîne, seul le PGCD divise les deux rubans.
 */
export function canPlaceDifferencePgcd(state, value) {
  if (!isDifferencesFinished(state)) return 'notFinished';
  if (state.a % value !== 0) return 'notDividesA';
  if (state.b % value !== 0) return 'notDividesB';
  if (value !== state.gcd) return 'notGreatest';
  return true;
}

/* ── خوارزمية إقليدس ─────────────────────────────────────────────────────── */

/**
 * euclidean-algorithm — la chaîne de divisions. Pour chaque division, le
 * QUOTIENT est le nombre de copies du diviseur que l'élève a posées dans le
 * dividende ; le RESTE est ce qui dépasse. Quand une copie de plus ne tient
 * plus, l'égalité a = b × q + r se remplit d'elle-même, et le reste devient
 * le diviseur suivant (l'élève le porte à la ligne d'après).
 */
export function initEuclid({ a, b }) {
  const { steps, gcd } = euclidSteps(a, b);
  return { a, b, steps, gcd, index: 0, copies: 0, confirmed: 0, pgcdPlaced: false, overflowSeen: false };
}

export function currentDivision(state) {
  return state.steps[state.index] ?? null;
}

/** Une copie de plus tient-elle dans le dividende ? */
export function canAddCopy(state) {
  const s = currentDivision(state);
  if (!s) return 'finished';
  if ((state.copies + 1) * s.b > s.a) return 'overflow';
  return true;
}

export function addCopy(state) {
  return canAddCopy(state) === true ? { ...state, copies: state.copies + 1 } : state;
}

export function removeCopy(state) {
  return state.copies > 0 ? { ...state, copies: state.copies - 1, overflowSeen: false } : state;
}

/**
 * ESSAYER une copie de plus — le geste de l'élève. Si elle tient, elle se
 * pose ; sinon la mathématique RÉSISTE : rien ne se pose, et `overflowSeen`
 * retient que l'élève a vu qu'une copie de plus ne tient pas. C'est ce qui
 * fait de q un quotient trouvé, pas annoncé : jusqu'au 2026-09-30 la scène
 * affichait « توقّف » et grisait « + » d'elle-même.
 */
export function tryCopy(state) {
  if (canAddCopy(state) === true) return addCopy(state);
  return currentDivision(state) ? { ...state, overflowSeen: true } : state;
}

/** Le quotient est atteint quand aucune copie de plus ne tient. */
export function quotientReached(state) {
  const s = currentDivision(state);
  return !!s && state.copies === s.q;
}

export function remainderOf(state) {
  const s = currentDivision(state);
  return s ? s.a - state.copies * s.b : null;
}

/** Porter le reste à la ligne suivante : il devient le diviseur. */
export function canCarryRemainder(state, value) {
  const s = currentDivision(state);
  if (!s) return 'finished';
  if (!quotientReached(state)) return 'quotientNotReached';
  if (!state.overflowSeen) return 'tryOneMore';
  if (value !== s.r) return 'notRemainder';
  return true;
}

export function carryRemainder(state) {
  const s = currentDivision(state);
  if (!s || !quotientReached(state) || !state.overflowSeen) return state;
  return { ...state, index: state.index + 1, copies: 0, confirmed: state.confirmed + 1, overflowSeen: false };
}

export function isEuclidFinished(state) {
  return state.index >= state.steps.length;
}

/** Comme la case des différences : un refus PAR LA DIVISIBILITÉ, jamais par la règle. */
export function canPlaceEuclidPgcd(state, value) {
  if (!isEuclidFinished(state)) return 'notFinished';
  if (state.a % value !== 0) return 'notDividesA';
  if (state.b % value !== 0) return 'notDividesB';
  if (value !== state.gcd) return 'notGreatest';
  return true;
}

/** Le geste canonique (mode classe) : remplir la division en cours, puis porter le reste. */
export function euclidAutoStep(state) {
  if (isEuclidFinished(state)) return state;
  if (!quotientReached(state)) return { ...state, copies: currentDivision(state).q };
  if (!state.overflowSeen) return { ...state, overflowSeen: true };
  return carryRemainder(state);
}

/**
 * UN geste de l'élève, dans l'ordre où il le ferait : poser une copie de
 * plus tant qu'elle tient, puis porter le reste à la ligne suivante. C'est
 * le pas de « أكمل القسمات » (§6bis) — plus fin que `euclidAutoStep`, qui
 * remplit une division d'un coup pour le mode classe : l'élève voit les
 * copies se poser une à une, comme il les posait.
 */
export function euclidGestureStep(state) {
  if (isEuclidFinished(state)) return state;
  if (!quotientReached(state) || !state.overflowSeen) return tryCopy(state);
  return carryRemainder(state);
}

/** Compléter la chaîne des divisions. La case PGCD reste au geste de l'élève. */
export function completeEuclid(state) {
  let s = state;
  while (!isEuclidFinished(s)) s = euclidGestureStep(s);
  return s;
}

/** Combien de gestes (copies + reports) restent avant la fin de la chaîne. */
export function remainingEuclidGestures(state) {
  let n = 0;
  for (let i = state.index; i < state.steps.length; i += 1) {
    const copies = i === state.index ? state.steps[i].q - state.copies : state.steps[i].q;
    // + 1 essai de la copie de trop (sauf s'il est déjà fait), + 1 report.
    const tried = i === state.index && state.overflowSeen ? 0 : 1;
    n += copies + tried + 1;
  }
  return n;
}

export function comparison(a, b) {
  return { differences: differenceStepCount(a, b), divisions: euclidSteps(a, b).steps.length };
}

/* ── LabCoach (2026-11-09 : les deux labos de rubans n'avaient pas de guide) ─────────────────────────────────────────── */

/**
 * Le guide des DIFFÉRENCES : porter le petit ruban sur le grand tant que la chaîne n'est pas finie (`cut`, puis `again`), puis la case PGCD
 * (`pgcd`). Il montre le geste, jamais le résultat (aucun nombre n'est désigné). `null` quand rien n'est à guider.
 */
export function differencesCoachOf(state) {
  if (!isDifferencesFinished(state)) return { id: state.done === 0 ? 'cut' : 'again', target: '[data-drag-source="num:small"]', gesture: 'drag' };
  if (!state.pgcdPlaced) return { id: 'pgcd', target: '[data-drop-zone="pgcd"]', gesture: 'drag' };
  return null;
}

/**
 * Le guide d'EUCLIDE : poser des copies (`copy`), essayer la copie de trop une fois le quotient atteint (`more`), porter le reste à la ligne
 * suivante (`carry`), puis la case PGCD (`pgcd`). `null` quand rien n'est à guider.
 */
export function euclidCoachOf(state) {
  if (isEuclidFinished(state)) return state.pgcdPlaced ? null : { id: 'pgcd', target: '[data-drop-zone="pgcd"]', gesture: 'drag' };
  if (quotientReached(state) && state.overflowSeen) return { id: 'carry', target: '[data-drop-zone="carry"]', gesture: 'drag' };
  if (quotientReached(state)) return { id: 'more', target: '[data-drag-source="copy"]', gesture: 'drag' };
  return { id: 'copy', target: '[data-drag-source="copy"]', gesture: 'drag' };
}

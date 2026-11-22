import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { commonDivisors, reduceByCommonDivisor, isIrreducible, reduceFraction } = divisibility;

/**
 * fraction-reduction — deux chemins pour le même kasr.
 *
 * CHEMIN أ (pas à pas) : l'élève porte un NOMBRE DE PARTS sur la recette —
 * n'importe lequel de 2 à 12 : un nombre qui ne divise qu'un terme est
 * REFUSÉ AVEC LA RAISON (l'erreur classique, possible et expliquée). Puis
 * c'est LUI qui décide de s'arrêter (« لا يمكن الاختزال أكثر ») ; l'affirmation
 * est jugée. Jusqu'au 2026-09-30 : seuls les diviseurs communs étaient
 * proposés (l'erreur était impossible, le second pas forcé) et la scène
 * annonçait d'elle-même « غير قابل للاختزال ».
 * CHEMIN ب (en une fois) : il porte le PGCD ; une seule division.
 * Puis la question : « أي الطريقين أوفر؟ » — l'utilité du PGCD, découverte.
 */
export function init({ n, d }) {
  const red = reduceFraction(n, d);
  return { n, d, pathA: [], pathB: null, claimed: false, gcd: red.gcd, final: { n: red.n, d: red.d }, euclid: red.euclid };
}

/** Les nombres de parts proposés : 2 … 12 (bornés par la fraction), PAS seulement les bons. */
export function railA(state) {
  const { n, d } = currentA(state);
  const top = Math.max(2, Math.min(12, Math.max(n, d)));
  return Array.from({ length: top - 1 }, (_, i) => i + 2);
}

/**
 * Le chemin ب : les mêmes nombres, plus TOUS les diviseurs communs de la
 * fraction de départ (le PGCD peut dépasser 12 : 35 pour 595/560). Aucun
 * n'est désigné d'avance — plus de PGCD doré.
 */
export function railB(state) {
  const top = Math.max(2, Math.min(12, Math.max(state.n, state.d)));
  const base = Array.from({ length: top - 1 }, (_, i) => i + 2);
  return [...new Set([...base, ...commonDivisors(state.n, state.d).filter((k) => k > 1)])].sort((x, y) => x - y);
}

/** La fraction courante du chemin أ. */
export function currentA(state) {
  let cur = { n: state.n, d: state.d };
  for (const k of state.pathA) { const next = reduceByCommonDivisor(cur.n, cur.d, k); if (!next) break; cur = { n: next.n, d: next.d }; }
  return cur;
}

/** Les jetons proposés : les diviseurs communs > 1 de la fraction courante. */
export function candidatesA(state) {
  const { n, d } = currentA(state);
  return commonDivisors(n, d).filter((k) => k > 1);
}

export function canReduceA(state, k) {
  const { n, d } = currentA(state);
  if (isIrreducible(n, d)) return 'irreducible';
  if (!Number.isInteger(k) || k <= 1) return 'notGreaterThanOne';
  if (n % k !== 0 && d % k !== 0) return 'dividesNeither';
  if (n % k !== 0) return 'dividesOnlyDenominator';
  if (d % k !== 0) return 'dividesOnlyNumerator';
  return true;
}

export function reduceA(state, k) {
  if (canReduceA(state, k) !== true) return state;
  return { ...state, pathA: [...state.pathA, k], claimed: false };
}

/**
 * « لا يمكن الاختزال أكثر » — l'élève AFFIRME ; la mathématique juge. Vrai si
 * le bout et le fond n'ont plus de diviseur commun > 1 ; sinon refus.
 */
export function canClaimIrreducible(state) {
  const { n, d } = currentA(state);
  return isIrreducible(n, d) ? true : 'stillReducible';
}

export function claimIrreducible(state) {
  return canClaimIrreducible(state) === true ? { ...state, claimed: true } : state;
}

/** Le chemin أ est fini quand l'élève l'a DÉCLARÉ, et à raison. */
export function pathAFinished(state) {
  const { n, d } = currentA(state);
  return state.claimed && isIrreducible(n, d);
}

/** Le chemin ب n'accepte que le PGCD, et seulement après le chemin أ. */
export function canReduceB(state, k) {
  if (!pathAFinished(state)) return 'pathANotFinished';
  if (state.pathB !== null) return 'alreadyDone';
  if (state.n % k !== 0 || state.d % k !== 0) return state.n % k === 0 ? 'dividesOnlyNumerator' : state.d % k === 0 ? 'dividesOnlyDenominator' : 'dividesNeither';
  if (k !== state.gcd) return 'notPgcd';
  return true;
}

/** Ce que donnerait UNE division par k : la conséquence qu'on montre au refus (« 84/48 ÷ 4 = 21/12, encore réductible »). */
export function oneStepWith(state, k) {
  return { n: state.n / k, d: state.d / k };
}

/**
 * La conjecture « أي الطريقين أوفر؟ » se juge sur les pas RÉELS de l'élève :
 * s'il a déjà divisé par le PGCD au chemin أ, les deux chemins font un pas,
 * et « متساويان » est la vraie réponse (avant : « 2 contre 1 » en dur).
 */
export function pathComparison(state) {
  const a = state.pathA.length;
  return { stepsA: a, stepsB: 1, equal: a === 1 };
}

export function reduceB(state, k) {
  if (canReduceB(state, k) !== true) return state;
  return { ...state, pathB: k };
}

export function discoveryReady(state) {
  return state.pathB !== null;
}

/** Les états successifs du chemin أ (pour la trace). */
export function chainA(state) {
  const chain = [{ n: state.n, d: state.d, k: null }];
  let cur = { n: state.n, d: state.d };
  for (const k of state.pathA) { const next = reduceByCommonDivisor(cur.n, cur.d, k); if (!next) break; chain.push(next); cur = next; }
  return chain;
}

/* ── LabCoach (2026-11-09 : le labo n'avait pas de guide) ──────────────────────────────────────────────────────────────── */

/**
 * Le guide de la RÉDUCTION : porter un nombre de la rangée sur la recette (`divide`), continuer ou s'arrêter (`more`, toujours sur la rangée :
 * il ne dit jamais quand s'arrêter), puis la division unique du chemin ب (`pgcd`). `null` quand rien n'est à guider.
 */
export function coachOf(state) {
  if (!pathAFinished(state)) return { id: state.pathA.length === 0 ? 'divide' : 'more', target: '[data-fr-rail]', gesture: 'drag' };
  if (state.pathB === null) return { id: 'pgcd', target: '[data-drop-zone="pgcd"]', gesture: 'drag' };
  return null;
}

import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { divmod } = divisibility;

/**
 * divisor-explorer — l'état de l'exploration « b قاسم لـ a ؟ ».
 *
 * L'élève POSE une taille de rayon `b` : les `a` livres se rangent en `q`
 * rayons pleins et `r` livres restent au sol. Le verdict n'est pas calculé
 * « à part » : il EST le reste. `tried` garde la mémoire des essais (le
 * verdict de chacun) — c'est ce semis de découvertes qui fait apparaître la
 * régularité (reste nul ⇔ diviseur) sans qu'on l'énonce.
 */
export function init({ a, b = null, candidates = [] }) {
  const state = { a, b: null, q: null, r: null, divides: null, tried: {}, candidates };
  return b ? place(state, b) : state;
}

/** Peut-on poser `b` comme taille de rayon ? Une chaîne = refus (raison). */
export function canPlace(state, b) {
  if (!Number.isInteger(b) || b < 1) return 'notNatural';
  if (b > state.a) return 'largerThanA';
  return true;
}

export function place(state, b) {
  if (canPlace(state, b) !== true) return state;
  const { q, r } = divmod(state.a, b);
  return { ...state, b, q, r, divides: r === 0, tried: { ...state.tried, [b]: r === 0 } };
}

/** La relation est visible quand l'élève a vu AU MOINS un reste nul et un reste non nul. */
export function discoveryReady(state) {
  const verdicts = Object.values(state.tried);
  return verdicts.includes(true) && verdicts.includes(false);
}

export function summary(state) {
  const yes = Object.entries(state.tried).filter(([, v]) => v).map(([k]) => Number(k)).sort((x, y) => x - y);
  const no = Object.entries(state.tried).filter(([, v]) => !v).map(([k]) => Number(k)).sort((x, y) => x - y);
  return { yes, no };
}

/** Les tailles proposées : celles de la leçon, sinon 1 … min(a, 24). */
export function railOf({ a, candidates }) {
  return candidates ?? Array.from({ length: Math.min(a, 24) }, (_, i) => i + 1);
}

/**
 * La taille PAR DÉFAUT du rayon (2026-10-09) : la première taille qui NE
 * divise PAS a (jamais une réponse offerte), sinon le début du rail.
 */
export function defaultSize({ a, candidates }) {
  const rail = railOf({ a, candidates });
  return rail.find((c) => a % c !== 0 && c <= a) ?? rail[0];
}

/**
 * L'état d'ouverture : la bibliothèque montre déjà un rangement (taille par
 * défaut), mais ce n'est PAS un essai — `tried` reste vide, rien n'est noté.
 */
export function initWithDefault({ a, b = null, candidates = [] }) {
  const state = init({ a, b, candidates });
  if (state.b !== null) return state;
  const d = defaultSize({ a, candidates: candidates?.length ? candidates : undefined });
  if (canPlace(state, d) !== true) return state;
  const { q, r } = divmod(a, d);
  return { ...state, b: d, q, r, divides: r === 0, preview: true };
}

/** Les tailles du rail pas encore essayées (hors défaut, qui n'est pas un essai). */
export function untried(state, rail) {
  return rail.filter((c) => state.tried[c] === undefined && canPlace(state, c) === true);
}

/* ── Le guide d'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────────────────────── */

/**
 * La prochaine action attendue : porter une taille du rail JAMAIS essayée vers la bibliothèque. Le guide ne choisit pas
 * « la bonne » taille (ce serait donner un diviseur) : il suit l'ordre du rail et saute la taille déjà posée à l'ouverture.
 * `{ id, target, rank, gesture }` | `null` une fois le contraste vu (la découverte prend la suite). `rank` = la taille.
 */
export function coachOf(state, rail) {
  if (discoveryReady(state)) return null;
  const todo = untried(state, rail);
  const next = todo.find((c) => c !== state.b) ?? todo[0];
  if (next === undefined) return null;
  const first = Object.keys(state.tried).length === 0;
  return { id: first ? 'size' : 'again', target: `[data-drag-source="size:${next}"]`, rank: next, gesture: 'drag' };
}

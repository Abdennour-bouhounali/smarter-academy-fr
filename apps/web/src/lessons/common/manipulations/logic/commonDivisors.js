import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { divmod, divisors, commonDivisors, gcdByDefinition } = divisibility;

/**
 * common-divisors — deux temps, deux états.
 *
 * Deux temps, et JAMAIS de bascule silencieuse de l'un à l'autre : au niveau
 * مبتدئ la manipulation reste sur les groupes ; au niveau متقدم le passage aux
 * listes est un geste de l'élève (voir CommonDivisors.jsx).
 *
 * BOUQUETS (activité 4) : l'élève choisit un nombre de bouquets `k` ; les
 * `a` fleurs rouges et les `b` blanches se répartissent ; les restes se
 * voient. Le rail garde la marque de chaque essai :
 *   'common' — tombe juste des deux côtés (k divise a ET b)
 *   'single' — un seul côté
 *   'no'     — aucun
 * La régularité apparaît d'elle-même : les k qui marchent sont exactement
 * les diviseurs communs.
 *
 * LISTES (activité 5, معارف 3–4) : les diviseurs de a et de b comme jetons ;
 * l'élève porte les COMMUNS dans la zone du milieu, puis le plus grand dans
 * la case PGCD — le 6 de « PGCD(42 ; 60) = 6 » vient de son geste.
 */
export function initBouquets({ a, b }) {
  return { a, b, k: null, tried: {} };
}

export function canChoose(state, k) {
  if (!Number.isInteger(k) || k < 1) return 'notNatural';
  if (k > Math.min(state.a, state.b)) return 'tooMany';
  return true;
}

export function choose(state, k) {
  if (canChoose(state, k) !== true) return state;
  const A = divmod(state.a, k); const B = divmod(state.b, k);
  const mark = A.r === 0 && B.r === 0 ? 'common' : A.r === 0 || B.r === 0 ? 'single' : 'no';
  return { ...state, k, qa: A.q, ra: A.r, qb: B.q, rb: B.r, works: mark === 'common', tried: { ...state.tried, [k]: mark } };
}

/**
 * LE GESTE : AJOUTER (ou retirer) UN GROUPE. Depuis le 2026-09-30, l'élève ne
 * porte plus un NOMBRE sur la table (un rail 1…24 où l'on pouvait sauter sur
 * 18 d'un coup) : il pose un groupe de plus, et tous les objets se
 * redistribuent. k monte de 1 en 1, et le motif se construit sous ses yeux —
 * 1 ✓, 2 ✓, 3 ✓, 4 ✗, 5 ✗, 6 ✓… (MANIPULATION_DNA §3.1).
 */
export function addGroup(state) {
  const k = (state.k ?? 0) + 1;
  return canChoose(state, k) === true ? choose(state, k) : state;
}

/** Retirer un groupe ; sous 1, les objets retournent en deux piles. */
export function removeGroup(state) {
  if (state.k === null) return state;
  if (state.k <= 1) return { ...state, k: null, qa: undefined, ra: undefined, qb: undefined, rb: undefined, works: undefined };
  return choose(state, state.k - 1);
}

/**
 * Le temps des groupes est ACCOMPLI quand l'élève a posé le PLUS GRAND
 * nombre de groupes qui tombe juste (6 pour 12 et 18, 18 pour 90 et 54) ET
 * qu'il a vu au moins un nombre PLUS GRAND échouer. « Le plus grand » est une
 * affirmation sur ce qui vient après : sans un essai au-delà, trouver 18
 * n'était qu'une constatation (audit 2026-09-29, « one lucky k »).
 */
export function greatestGroupFound(state) {
  const g = gcdByDefinition(state.a, state.b);
  if (state.tried[g] !== 'common') return false;
  return Object.keys(state.tried).some((k) => Number(k) > g);
}

export function initLists({ a, b }) {
  return { a, b, da: divisors(a), db: divisors(b), common: commonDivisors(a, b), g: gcdByDefinition(a, b), placed: [], pgcd: null, attempts: 0 };
}

/** Un jeton `d` peut-il aller dans la zone des communs ? */
export function canPlaceCommon(state, d) {
  if (state.placed.includes(d)) return 'alreadyPlaced';
  const inA = state.a % d === 0; const inB = state.b % d === 0;
  if (inA && inB) return true;
  return inA ? 'dividesOnlyA' : inB ? 'dividesOnlyB' : 'dividesNeither';
}

export function placeCommon(state, d) {
  const verdict = canPlaceCommon(state, d);
  if (verdict !== true) return { ...state, attempts: state.attempts + 1 };
  return { ...state, placed: [...state.placed, d].sort((x, y) => x - y) };
}

export function allCommonPlaced(state) {
  return state.common.every((d) => state.placed.includes(d));
}

/** La case PGCD n'accepte que le plus grand des communs, une fois tous posés. */
export function canPlacePgcd(state, d) {
  // La VRAIE raison d'abord : un nombre qui n'est pas commun ne devient pas
  // acceptable en complétant le milieu (avant : « أكمل أوّلًا… »).
  if (!state.common.includes(d)) return 'notCommon';
  if (!allCommonPlaced(state)) return 'notAllCommon';
  if (d !== state.g) return 'notGreatest';
  return true;
}

export function placePgcd(state, d) {
  if (canPlacePgcd(state, d) !== true) return { ...state, attempts: state.attempts + 1 };
  return { ...state, pgcd: d };
}

export function listsDiscoveryReady(state) {
  return state.pgcd !== null;
}

/** Les nombres de groupes 1 … min(a, b) pas encore essayés, croissants (« جرّب كل الإمكانيات »). */
export function untriedGroups(state) {
  const top = Math.min(state.a, state.b);
  const out = [];
  for (let k = 1; k <= top; k += 1) if (state.tried[k] === undefined) out.push(k);
  return out;
}

/* ── Le guide d'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────────────────────── */

/**
 * La prochaine action attendue, selon le temps où l'on est.
 *  - GROUPES : tirer un emballage vide sur la table (`add`, la première fois), puis montrer le « + » (`more`) ; au niveau
 *    avancé, une fois « le plus grand » trouvé, le bouton qui mène aux listes (`to-lists`).
 *  - LISTES : le guide NE DÉSIGNE PAS les bons jetons (savoir lesquels divisent les deux nombres EST l'exercice) : il montre
 *    la zone du milieu où un jeton quelconque se pose — un jeton refusé dit pourquoi — (`middle`), puis la case PGCD
 *    (`pgcd`) quand l'élève a posé tous les communs.
 * `null` quand rien n'est à guider.
 *
 * @param {{stage:'bouquets'|'lists', bouquets:object, lists:object, groupsOnly:boolean}} s
 */
export function coachOf({ stage, bouquets, lists, groupsOnly }) {
  if (stage === 'bouquets') {
    if (greatestGroupFound(bouquets)) return groupsOnly ? null : { id: 'to-lists', target: '[data-common-next] button', gesture: 'tap' };
    if (canChoose(bouquets, (bouquets.k ?? 0) + 1) !== true) return null;
    return bouquets.k === null
      ? { id: 'add', target: '[data-group-row]', gesture: 'drag' } // la rangée réserve + boutons : la bulle ne couvre ainsi aucune des deux voies
      : { id: 'more', target: '[data-group-add]', gesture: 'tap' };
  }
  if (lists.pgcd !== null) return null;
  if (allCommonPlaced(lists)) return { id: 'pgcd', target: '[data-drop-zone="pgcd"]', gesture: 'drag' };
  return { id: 'middle', target: '[data-drop-zone="middle"]', gesture: 'drag' };
}

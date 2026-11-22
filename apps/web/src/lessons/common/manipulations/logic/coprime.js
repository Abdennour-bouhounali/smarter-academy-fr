import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';
import { initBouquets, choose, canChoose, addGroup, removeGroup } from './commonDivisors';

const { divisors, commonDivisors, gcdByDefinition } = divisibility;

/* ── L'ÉTAPE DES TROUSSES (niveau débutant) ──────────────────────────────────
 *
 * Avant les listes, l'élève VIT la définition : 17 stylos et 18 cahiers à
 * répartir en trousses identiques — combien de trousses ? Il essaie 2, 3,
 * 4… et rien ne marche, sauf 1. C'est la même répartition que les bouquets
 * de la leçon 4 (logic/commonDivisors), avec un enseignement différent : ici
 * la régularité est qu'AUCUN nombre de groupes > 1 ne marche, et c'est cela
 * qu'« أوليان فيما بينهما » veut dire. Pour 27 et 36, plusieurs marchent —
 * et c'est ce qui réfute مريم. */
export const initGroups = initBouquets;
export const chooseGroups = choose;
export const canChooseGroups = canChoose;
/** Le geste : ajouter / retirer UNE trousse (le même qu'à la leçon 4). */
export const addGroupTo = addGroup;
export const removeGroupFrom = removeGroup;

/** Les nombres de groupes essayés qui ont marché, croissants. */
export function workingCounts(groups) {
  return Object.entries(groups.tried).filter(([, m]) => m === 'common').map(([k]) => Number(k)).sort((x, y) => x - y);
}

/**
 * L'étape a livré son enseignement quand elle est PROUVÉE, pas devinée :
 *   • soit un nombre de groupes > 1 a marché — ils ne sont pas premiers
 *     entre eux, et ce nombre le montre ;
 *   • soit TOUS les nombres de 2 à min(a, b) ont été essayés et aucun n'a
 *     marché — « seul 1 marche » est alors un constat, pas une généralisation.
 * Jusqu'au 2026-09-30 : 1 plus deux essais suffisaient, et la carte affirmait
 * « aucune répartition de plus d'un groupe » après deux échecs.
 */
export function groupsInsightReady(groups) {
  const tried = Object.keys(groups.tried).map(Number);
  if (tried.some((k) => k > 1 && groups.tried[k] === 'common')) return true;
  const top = Math.min(groups.a, groups.b);
  for (let k = 2; k <= top; k += 1) if (!tried.includes(k)) return false;
  return true;
}

/**
 * coprime-explorer — deux nombres, leurs diviseurs en orbite ; l'élève porte
 * dans la zone partagée ceux qui divisent LES DEUX. Quand il n'y reste que 1,
 * les nombres sont premiers entre eux ; sinon le diviseur ≠ 1 qui s'y trouve
 * le réfute (27 et 36 → 3 et 9).
 */
export function init({ a, b }) {
  return { a, b, da: divisors(a), db: divisors(b), common: commonDivisors(a, b), g: gcdByDefinition(a, b), shared: [], tested: [], checked: false };
}

/** L'id d'un jeton : `a:3` (le 3 de la liste de a). */
export const chipId = (side, d) => `${side}:${d}`;
export const parseChip = (id) => { const [side, d] = id.split(':'); return { side, d: Number(d) }; };

export function canShare(state, id) {
  const { d } = parseChip(id);
  if (state.shared.includes(d)) return 'alreadyShared';
  const inA = state.a % d === 0; const inB = state.b % d === 0;
  if (inA && inB) return true;
  return inA ? 'dividesOnlyA' : 'dividesOnlyB';
}

/** Tout jeton essayé au milieu est TESTÉ — accepté ou refusé, il a été confronté à l'autre nombre. */
export function share(state, id) {
  const { d } = parseChip(id);
  const tested = state.tested.includes(d) ? state.tested : [...state.tested, d].sort((x, y) => x - y);
  if (canShare(state, id) !== true) return { ...state, tested, checked: false };
  return { ...state, shared: [...state.shared, d].sort((x, y) => x - y), tested, checked: false };
}

/**
 * Les listes sont CONCLUANTES quand :
 *   • premiers entre eux — chaque diviseur du PLUS PETIT nombre a été
 *     confronté à l'autre (placé ou refusé) : il n'en reste aucun qui pourrait
 *     être commun. Jusqu'au 2026-09-30, poser 1 et appuyer sur « تحقّق »
 *     suffisait, puisque 1 est le seul commun.
 *   • pas premiers entre eux — UN commun > 1 suffit à réfuter : c'est la
 *     méthode du manuel contre مريم (27 et 36 : 3 ou 9), pas une liste
 *     exhaustive.
 */
export function listsConclusive(state) {
  if (state.g !== 1) return state.shared.some((d) => d > 1);
  const small = state.a <= state.b ? state.da : state.db;
  return small.every((d) => state.tested.includes(d));
}

/** Les diviseurs du plus petit nombre pas encore confrontés à l'autre. */
export function untested(state) {
  const small = state.a <= state.b ? state.da : state.db;
  return small.filter((d) => !state.tested.includes(d));
}

function allShared(state) {
  return state.common.every((d) => state.shared.includes(d));
}

/** « تحقّق » : la zone contient-elle exactement les communs ? */
export function check(state) {
  return { ...state, checked: true };
}

export function verdict(state) {
  if (!allShared(state)) return 'missing';
  return state.g === 1 ? 'coprime' : 'notCoprime';
}

export function isCoprime(state) {
  return state.g === 1;
}

/** Les nombres de trousses 1 … min(a, b) pas encore essayés, croissants. */
export function untriedGroups(groups) {
  const top = Math.min(groups.a, groups.b);
  const out = [];
  for (let k = 1; k <= top; k += 1) if (groups.tried[k] === undefined) out.push(k);
  return out;
}

/**
 * LE GUIDE (LabCoach, MANIPULATION_CONTRACT §8quater — ajouté au rollout du 2026-11-09 : ce labo n'en avait pas). Ce qu'il montre MAINTENANT :
 *   trousses — l'emballage à tirer (aucune trousse posée), puis le « + » ; rien quand la preuve est faite ;
 *   listes   — la zone du milieu, puis « تحقّق » quand la preuve est complète ; jamais un jeton (savoir lesquels confronter EST l'exercice).
 */
export function coachOf({ inGroups, groups, lab }) {
  if (inGroups) {
    if (groupsInsightReady(groups)) return null;
    if (canChooseGroups(groups, (groups.k ?? 0) + 1) !== true) return null;
    return groups.k === null
      ? { id: 'add', target: '[data-group-row]', gesture: 'drag' }
      : { id: 'more', target: '[data-group-add]', gesture: 'tap' };
  }
  if (lab.checked && listsConclusive(lab)) return null;
  if (listsConclusive(lab)) return { id: 'check', target: '[data-manipulation-check]', gesture: 'tap' };
  return { id: 'shared', target: '[data-drop-zone="shared"]', gesture: 'drag' };
}

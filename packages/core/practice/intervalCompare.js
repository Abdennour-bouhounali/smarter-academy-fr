/**
 * Intervalles solutions d'une inéquation affine.
 *
 * La forme est celle que `affineUtils.solveIneq` renvoie déjà côté leçon —
 * `{a, b, openA, openB}` où `null` vaut l'infini — pour que le modèle
 * mathématique de la leçon et l'évaluateur des exercices parlent la même
 * langue par construction, et non par convention à retenir.
 *
 * Les bornes se comparent en rationnels exacts : `7,5` et `15/2` sont la même
 * borne, et aucune tolérance flottante ne vient décider à leur place.
 */
import { Rational } from './rational.js';

/** @typedef {{lo: Rational|null, loOpen: boolean, hi: Rational|null, hiOpen: boolean}} Interval */

/**
 * @param {{lo?: *, loOpen?: boolean, hi?: *, hiOpen?: boolean}} raw
 * @returns {Interval|null} null si la notation est malformée (→ syntax_error)
 */
export function parseInterval(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const bound = (v) => (v === null || v === undefined || v === '' ? null : Rational.parse(v));
  const lo = bound(raw.lo);
  const hi = bound(raw.hi);

  // Une borne fournie mais illisible est une erreur de saisie, pas un infini.
  if (raw.lo !== null && raw.lo !== undefined && raw.lo !== '' && lo === null) return null;
  if (raw.hi !== null && raw.hi !== undefined && raw.hi !== '' && hi === null) return null;

  const loOpen = raw.loOpen !== false;
  const hiOpen = raw.hiOpen !== false;

  // ]−∞ et +∞[ : l'infini n'est jamais atteint, donc jamais crocheté vers lui.
  if (lo === null && raw.loOpen === false) return null;
  if (hi === null && raw.hiOpen === false) return null;

  // Intervalle vide ou renversé : mathématiquement faux, mais bien formé —
  // c'est `incorrect`, pas `syntax_error`. On le laisse passer ici.
  return { lo, loOpen, hi, hiOpen };
}

/** Un intervalle bien formé mais qui ne contient rien (borne basse ≥ borne haute). */
export function isEmptyInterval(i) {
  if (!i || i.lo === null || i.hi === null) return false;
  const c = i.lo.compare(i.hi);
  return c > 0 || (c === 0 && (i.loOpen || i.hiOpen));
}

/** Égalité stricte : mêmes bornes ET même ouverture de chaque côté. */
export function intervalEquals(given, expected) {
  if (!given || !expected) return false;
  const sameBound = (a, b) => (a === null && b === null) || (a !== null && b !== null && a.equals(b));
  return (
    sameBound(given.lo, expected.lo) &&
    sameBound(given.hi, expected.hi) &&
    given.loOpen === expected.loOpen &&
    given.hiOpen === expected.hiOpen
  );
}

/** « ]-∞ ; 15/2[ » — forme canonique stable pour l'audit. */
export function intervalToString(i) {
  if (!i) return '';
  const lo = i.lo === null ? ']-∞' : `${i.loOpen ? ']' : '['}${i.lo.toString()}`;
  const hi = i.hi === null ? '+∞[' : `${i.hi.toString()}${i.hiOpen ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}

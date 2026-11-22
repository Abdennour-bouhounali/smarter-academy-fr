/**
 * Le PARTAGE ÉQUITABLE — le modèle mathématique derrière toute situation de
 * « répartir n objets en groupes égaux ».
 *
 * C'est la même mathématique que l'activité 1 du manuel (420 livres en
 * rayons de b) et que l'équipe de football (n joueurs en k équipes) : la
 * division euclidienne, lue de deux façons.
 *
 *   PARTITION   « combien dans chaque groupe ? »  n ÷ k = taille, reste r
 *   QUOTITION   « combien de groupes ? »          n ÷ b = groupes, reste r
 *
 * Les deux lectures sont la MÊME égalité n = k × q + r ; ce qui change est
 * ce que l'élève fixe et ce qu'il découvre. Le manuel fait la quotition
 * (« 28 كتابا في كل رفّ » → combien de rayons) ; la situation des équipes
 * fait la partition (« 3 فرق » → combien par équipe). Les deux mènent au
 * même énoncé : le reste est nul ⇔ le diviseur est un قاسم.
 *
 * CONTRAT : aucune vue ne calcule un quotient, un reste ni un verdict. Elles
 * appellent `groupInto` / `groupBy` et DESSINENT ce qui revient. Le reste
 * n'est pas un nombre affiché à côté : c'est le nombre d'objets qu'il faut
 * dessiner hors des groupes.
 *
 * Aucun texte arabe ici : l'affichage appartient aux leçons.
 */

import { divmod, isDivisor } from './divisibility.js';

const isPositiveNatural = (n) => Number.isInteger(n) && n > 0;

/**
 * PARTITION — répartir `total` en `groups` groupes égaux.
 * Retourne la taille de chaque groupe, le reste, et le verdict.
 *
 *   groupInto(15, 3) → { perGroup: 5, leftOver: 0, exact: true,  … }
 *   groupInto(16, 3) → { perGroup: 5, leftOver: 1, exact: false, … }
 */
export function groupInto(total, groups) {
  if (!Number.isInteger(total) || total < 0 || !isPositiveNatural(groups)) return null;
  const { q, r } = divmod(total, groups);
  return {
    total,
    groups,
    perGroup: q,
    leftOver: r,
    exact: r === 0,
    /** L'égalité que l'élève doit finir par lire : total = groups × perGroup + leftOver. */
    equality: { a: total, b: groups, q, r },
    /** Les tailles réelles de chaque groupe — toutes égales ; le reste reste DEHORS. */
    sizes: Array.from({ length: groups }, () => q),
  };
}

/**
 * QUOTITION — répartir `total` par paquets de `perGroup`.
 * C'est la lecture du manuel : « 28 كتابا في كل رفّ » → 15 rayons, reste 0.
 *
 *   groupBy(420, 28) → { groups: 15, leftOver: 0, exact: true, … }
 *   groupBy(420, 26) → { groups: 16, leftOver: 4, exact: false, … }
 */
export function groupBy(total, perGroup) {
  if (!Number.isInteger(total) || total < 0 || !isPositiveNatural(perGroup)) return null;
  const { q, r } = divmod(total, perGroup);
  return {
    total,
    perGroup,
    groups: q,
    leftOver: r,
    exact: r === 0,
    equality: { a: total, b: perGroup, q, r },
    sizes: Array.from({ length: q }, () => perGroup),
  };
}

/**
 * Les répartitions EXACTES possibles pour `total`, dans une plage de
 * nombres de groupes. Ce sont exactement les diviseurs de `total` dans la
 * plage — et c'est la découverte : « les nombres qui marchent » ne sont pas
 * quelconques, ce sont les قواسم.
 *
 * `max` borne ce qu'une scène peut DESSINER (on ne propose pas 420 équipes).
 */
export function exactGroupings(total, { min = 2, max = total } = {}) {
  if (!isPositiveNatural(total)) return [];
  const out = [];
  for (let k = Math.max(1, min); k <= Math.min(max, total); k += 1) {
    if (isDivisor(k, total)) out.push(k);
  }
  return out;
}

/**
 * Le PROCHAIN effectif qui rend la répartition exacte, à nombre de groupes
 * fixé : combien faut-il ajouter (ou retirer) de joueurs pour qu'aucun ne
 * reste dehors. C'est la question que l'élève se pose de lui-même en voyant
 * le joueur resté sur le banc — le système doit pouvoir y répondre sans que
 * la vue fasse de l'arithmétique.
 *
 *   fixLeftOver(16, 3) → { add: 2, remove: 1 }   (18 ou 15 marchent)
 *   fixLeftOver(15, 3) → { add: 0, remove: 0 }
 */
export function fixLeftOver(total, groups) {
  const g = groupInto(total, groups);
  if (!g) return null;
  if (g.exact) return { add: 0, remove: 0 };
  return { add: groups - g.leftOver, remove: g.leftOver };
}

/**
 * Est-ce que ce nombre de groupes « tombe juste » ? Le verdict EST le reste,
 * jamais un booléen calculé à part.
 */
export function isExactGrouping(total, groups) {
  const g = groupInto(total, groups);
  return g ? g.exact : false;
}

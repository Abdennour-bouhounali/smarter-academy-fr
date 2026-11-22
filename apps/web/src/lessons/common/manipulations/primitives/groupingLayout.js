import * as equalGrouping from '@smarter-academy/core/arithmetic/equalGrouping.js';

const { groupInto } = equalGrouping;

/**
 * LA MISE EN PAGE D'UNE RÉPARTITION EN GROUPES IDENTIQUES — pure, testée.
 *
 * `a` objets d'un premier type et `b` d'un second, répartis en `k` groupes
 * identiques : chaque groupe reçoit `qa` et `qb`, et `ra` / `rb` restent en
 * dehors. C'est la double lecture de la division euclidienne (core,
 * equalGrouping.groupInto) ; ici on décide seulement COMMENT la dessiner :
 *
 *   • combien de groupes sont dessinés (`shown`) et combien résumés
 *     (`hidden`) — 90 bouquets ne tiennent sur aucun écran, 18 oui ;
 *   • la largeur d'un objet, qui suit la CHARGE d'un groupe : plus un groupe
 *     contient d'objets, plus ils sont petits, jamais moins que lisible —
 *     puis qui grandit avec la place disponible (`itemSizeCss`) ;
 *   • combien d'objets par rangée dans un groupe, pour rester lisible à 320 px.
 *
 * Aucun nœud n'est tronqué silencieusement dans un groupe dessiné : le compte
 * que l'élève lit dans « 10 حمراء و 6 بيضاء » est le compte qu'il voit.
 */
export function groupingLayout({ a, b, k, maxGroups = 18 }) {
  if (k === null || k === undefined) {
    return { k: null, qa: null, qb: null, ra: null, rb: null, works: null, shown: 0, hidden: 0, itemWidth: itemWidthFor(a + b), perRow: perRowFor(a + b) };
  }
  const A = groupInto(a, k);
  const B = groupInto(b, k);
  const qa = A ? A.perGroup : 0;
  const qb = B ? B.perGroup : 0;
  const ra = A ? A.leftOver : a;
  const rb = B ? B.leftOver : b;
  const shown = Math.min(k, maxGroups);
  const perGroup = qa + qb;
  // La taille suit la CHARGE DESSINÉE de toute la scène, pas d'un seul cadre :
  // 18 bouquets de 8 fleurs, c'est 144 fleurs à l'écran. Réglée sur un seul
  // cadre (8 → 20 px), chaque cadre prenait toute la largeur d'un téléphone et
  // la table s'étirait sur 1 700 px (2026-09-30). Les cadres, eux, restent
  // identiques entre eux — c'est ce qui compte.
  const drawn = Math.max(perGroup, (shown * perGroup) / 2);
  return {
    k, qa, qb, ra, rb,
    works: ra === 0 && rb === 0,
    shown,
    hidden: k - shown,
    itemWidth: itemWidthFor(drawn),
    perRow: perRowFor(perGroup),
  };
}

/** La largeur d'un objet (px) selon le nombre d'objets à dessiner ensemble. */
export function itemWidthFor(count) {
  if (count > 120) return 10;
  if (count > 60) return 12;
  if (count > 24) return 14;
  if (count > 10) return 16;
  return 20;
}

/**
 * LA TAILLE DESSINÉE D'UN OBJET — lisible du fond de la classe.
 *
 * `itemWidthFor` donne le PLANCHER : la taille qui tient sur un téléphone de
 * 320 px. Mais la même scène occupe 170 px sur un téléphone et 1 500 px sur
 * un projecteur ; un objet de 10 à 20 px y devient une poussière. L'objet
 * grandit donc avec la LARGEUR DE LA SCÈNE (requête de conteneur, `cqi` :
 * `GroupingScene` est le conteneur), linéairement, de ×1 à ×ITEM_SCALE_MAX :
 *
 *   facteur ≈ 0,75 + largeur / 1000 px   (170 px → ×1 · 520 → ×1,27 ·
 *                                          980 → ×1,73 · ≥ 1 250 → ×2)
 *   (GROUP_SCALE : les cadres et le reste)
 *
 * Une seule règle CSS, pas de points de rupture : le téléphone garde la
 * taille d'aujourd'hui, le projecteur double. Le nombre d'objets, lui, ne
 * change jamais — seule leur taille suit l'écran.
 *
 * Les PILES (avant tout choix, `k` nul) partent d'un plancher minuscule
 * (144 fleurs → 10 px) et ont toute la largeur pour elles : elles suivent
 * une pente double et plafonnent à ×3 (PILE_SCALE) — sans quoi 90 fleurs
 * resteraient des points au projecteur, la moitié de la pile vide.
 */
export const ITEM_SCALE_MAX = 2;
export const GROUP_SCALE = Object.freeze({ max: ITEM_SCALE_MAX, per: 1000 });
export const PILE_SCALE = Object.freeze({ max: 3, per: 500 });

export function itemSizeCss(width, { max = ITEM_SCALE_MAX, per = 1000 } = {}) {
  const w = Number(width);
  const fluid = `calc(${round(w * 0.75)}px + ${round((w * 100) / per)}cqi)`;
  return `clamp(${w}px, ${fluid}, ${round(w * max)}px)`;
}

const round = (x) => Math.round(x * 100) / 100;

/** Combien d'objets par rangée dans un cadre — borné pour tenir sur un téléphone. */
export function perRowFor(count) {
  if (count > 60) return 12;
  if (count > 24) return 8;
  if (count > 10) return 6;
  return 5;
}

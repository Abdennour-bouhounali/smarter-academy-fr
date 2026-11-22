import * as equalGrouping from '@smarter-academy/core/arithmetic/equalGrouping.js';
import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';

const { groupBy } = equalGrouping;
const { divisors } = divisibility;

/**
 * divisor-explorer-books — LE RAYON QU'ON ÉTIRE (quotition).
 *
 * L'élève ne choisit pas un nombre dans une liste : il TIRE le serre-livres
 * d'un rayon. La longueur du rayon EST la variable b (livres par rayon) ; tous
 * les rayons de la bibliothèque ont cette longueur — un seul serre-livres les
 * règle tous, c'est l'égalité des parts rendue physique. Les `total` livres se
 * rangent aussitôt en q rayons pleins ; ceux qui ne remplissent pas un rayon
 * de plus restent au sol, dans un rayon FANTÔME qui montre les places vides.
 *
 * Ce fichier ne dessine rien : il dit ce qui est VRAI (arrangement, via core
 * `groupBy`), ce qui a été ESSAYÉ (mémoire des essais), quand la découverte
 * est MÉRITÉE, et OÙ chaque livre se pose (géométrie pure, balayée par les
 * tests). La vue lit ces résultats ; elle ne calcule ni quotient ni reste.
 */

/** Au-delà, un rayon devient un trait : on ne propose pas 420 rayons de 1. */
export const MAX_DRAWN_SHELVES = 42;

/**
 * La plage du serre-livres. Par défaut : assez grand pour que les rayons
 * restent dessinables (≤ MAX_DRAWN_SHELVES), au plus 60 ou `total`.
 */
export function shelfRange(total, { min, max } = {}) {
  const lo = Math.max(1, min ?? Math.max(2, Math.ceil(total / MAX_DRAWN_SHELVES)));
  const hi = Math.min(total, max ?? 60);
  return { min: Math.min(lo, hi), max: hi };
}

export const clampCapacity = (b, { min, max }) => Math.min(max, Math.max(min, Math.round(b)));

/**
 * L'ARRANGEMENT de `total` livres en rayons de `b` — lu, jamais recalculé par
 * la vue. `missing` : combien de livres manquent au rayon fantôme pour qu'il
 * devienne un rayon plein (0 quand rien ne reste au sol).
 */
export function arrange(total, b) {
  const g = groupBy(total, b);
  return {
    capacity: b,
    shelves: g.groups,
    leftOver: g.leftOver,
    exact: g.exact,
    missing: g.leftOver === 0 ? 0 : b - g.leftOver,
  };
}

/** Mémoriser un essai VALIDÉ (relâcher, touche, bouton) — pas un passage du doigt. */
export function commit(tried, total, b) {
  if (b == null || b in tried) return tried;
  const a = arrange(total, b);
  return { ...tried, [b]: { exact: a.exact, leftOver: a.leftOver, shelves: a.shelves } };
}

/**
 * LA DÉCOUVERTE « le sol se vide ⇔ b قاسم ». Méritée quand l'élève a validé
 * AU MOINS trois longueurs, dont une qui vide le sol ET une qui laisse des
 * livres : c'est le contraste qui enseigne, pas une longueur chanceuse.
 */
const MIN_TRIALS = 3;
export function remainderDiscoveryReady(tried) {
  const seen = Object.values(tried);
  return seen.length >= MIN_TRIALS && seen.some((v) => v.exact) && seen.some((v) => !v.exact);
}

/**
 * LA DÉCOUVERTE « le quotient aussi est un قاسم » (143 = 11 × 13 = 13 × 11).
 * Méritée quand l'élève a validé b puis q, deux longueurs qui vident le sol et
 * dont le produit est `total` : 11 rayons de 13 ET 13 rayons de 11.
 */
export function symmetryPair(tried, total) {
  const exact = Object.keys(tried).map(Number).filter((b) => tried[b].exact).sort((x, y) => x - y);
  for (const b of exact) {
    const q = total / b;
    if (q !== b && exact.includes(q)) return [b, q];
  }
  return null;
}

/**
 * Les CONTRE-EXEMPLES des conjectures fausses, tirés de la plage réelle —
 * jamais écrits en dur (le même laboratoire sert 420 et 143).
 *
 *   even   une longueur PAIRE qui laisse des livres (réfute « b pair »)
 *   small  la plus petite longueur qui laisse des livres, et
 *   big    la plus grande qui n'en laisse aucun (réfutent « b petit/grand »)
 *
 * Les marques du manuel passent en premier (26 pour 420) : le contre-exemple
 * est alors un essai que l'élève a sans doute déjà fait.
 */
export function counterExamples(total, range, marks = []) {
  const all = [];
  for (let b = range.min; b <= range.max; b += 1) all.push(b);
  const leaves = (b) => total % b !== 0;
  const pick = (pool) => pool.find((b) => b % 2 === 0 && leaves(b));
  const even = pick(marks) ?? pick(all) ?? null;
  const small = all.find(leaves) ?? null;
  const big = [...all].reverse().find((b) => !leaves(b)) ?? null;
  const at = (b) => (b == null ? null : { b, leftOver: total % b });
  return { even: at(even), small: at(small), big: at(big) };
}

/** Les longueurs de la plage qui vident le sol — pour les tests, jamais montrées avant la règle. */
export function exactCapacities(total, range) {
  return divisors(total).filter((d) => d >= range.min && d <= range.max);
}

/**
 * LA GÉOMÉTRIE DE LA BIBLIOTHÈQUE — un rayon par rectangle, un livre par dos.
 *
 * Tous les rayons pleins sont DESSINÉS, et chaque livre l'est une fois : les
 * 420 livres sont 420 dos. Les rayons se rangent en colonnes selon la place
 * (un rayon court laisse passer plusieurs colonnes), de droite à gauche (RTL :
 * le premier rayon est en haut à droite). Le rayon fantôme vient en dernier,
 * seul sur sa rangée.
 *
 * @param total  nombre de livres
 * @param b      livres par rayon (null : tous les livres sont encore au sol)
 * @param width  largeur disponible (px)
 * @param unit   largeur d'un dos de livre (px)
 * @returns {{ width, height, unit, bookH, shelfW, cols, rows, shelves, ghost, pile }}
 *   shelves  [{ index, x, y, books: [{ id, x }] }]
 *   ghost    { x, y, w, books: [{ id, x }], slots: [x] } | null
 *   pile     { x, y, books: [{ id, x, y }] } | null — avant le premier geste
 */
const SHELF_PAD = 1;       // en unités de dos, de chaque côté du rayon
const COL_GAP = 8;
const ROW_GAP = 8;
export const PLANK = 4;
const BOOK_RATIO = 3.2;    // hauteur d'un dos / sa largeur

export function bookcaseLayout({ total, b, width, unit }) {
  const bookH = Math.round(unit * BOOK_RATIO);
  const rowH = bookH + PLANK + ROW_GAP;
  if (b == null) {
    // Avant le geste : les livres attendent au sol, en piles de la largeur
    // disponible — ils sont TOUS dessinés, comme ensuite.
    const perRow = Math.max(1, Math.floor(width / unit));
    const books = Array.from({ length: total }, (_, id) => {
      const row = Math.floor(id / perRow);
      const col = id % perRow;
      return { id, x: width - (col + 1) * unit, y: row * (bookH * 0.55) };
    });
    const rows = Math.ceil(total / perRow);
    const height = Math.ceil((rows - 1) * bookH * 0.55 + bookH);
    return { width, height, unit, bookH, shelfW: 0, cols: 0, rows, shelves: [], ghost: null, pile: { x: 0, y: 0, books } };
  }
  const a = arrange(total, b);
  const shelfW = (b + 2 * SHELF_PAD) * unit;
  const cols = Math.max(1, Math.floor((width + COL_GAP) / (shelfW + COL_GAP)));
  const rows = Math.ceil(a.shelves / cols);
  const booksOf = (x, from, count) => Array.from({ length: count }, (_, j) => ({
    id: from + j,
    // RTL : le premier livre du rayon est contre le montant de droite.
    x: x + shelfW - (SHELF_PAD + j + 1) * unit,
  }));
  const shelves = Array.from({ length: a.shelves }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = width - (col + 1) * shelfW - col * COL_GAP;
    return { index, x, y: row * rowH, books: booksOf(x, index * b, b) };
  });
  let ghost = null;
  if (a.leftOver > 0) {
    const x = width - shelfW;
    const books = booksOf(x, a.shelves * b, a.leftOver);
    const slots = Array.from({ length: a.missing }, (_, j) => x + shelfW - (SHELF_PAD + a.leftOver + j + 1) * unit);
    ghost = { x, y: rows * rowH + ROW_GAP, w: shelfW, books, slots };
  }
  const height = rows * rowH + (ghost ? ROW_GAP + rowH : 0);
  return { width, height, unit, bookH, shelfW, cols, rows, shelves, ghost, pile: null };
}

/**
 * La LARGEUR d'un dos, déduite de la place : la bibliothèque tient dans la
 * largeur offerte même au plus long rayon de la plage, et un dos ne descend
 * jamais sous 2 px (sinon ce n'est plus un livre, c'est un trait).
 */
export function unitFor(width, max, { ceiling = 7 } = {}) {
  return Math.max(2, Math.min(ceiling, Math.floor((width / (max + 2 * SHELF_PAD)) * 10) / 10));
}

/**
 * La longueur de rayon PAR DÉFAUT : jamais une réponse. Le premier b de la
 * réglette qui NE vide PAS le sol (24 en 2…12 → 5 ; 420 en 10…60 → 11) ; le
 * minimum si tout vide le sol.
 */
export function defaultShelf(total, range) {
  for (let b = range.min; b <= range.max; b += 1) if (total % b !== 0) return b;
  return range.min;
}

/* ── Le guide d'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────────────────────── */

/**
 * La prochaine action attendue du serre-livres : tirer la poignée une première fois (`handle`), puis — le geste est connu —
 * montrer le chemin sans glisser, les boutons « + / − » (`nudge`, `rank` = +1 | −1, le côté qui a de la place). Le guide
 * ne désigne JAMAIS une longueur : il montre le geste. `null` quand la découverte est méritée.
 *
 * @param {{tried:Object, b:number|null, range:{min:number,max:number}, discovery?:'remainder'|'symmetry', total:number}} s
 */
export function coachOf({ tried, b, range, discovery = 'remainder', total }) {
  const ready = discovery === 'symmetry' ? symmetryPair(tried, total) != null : remainderDiscoveryReady(tried);
  if (ready) return null;
  if (Object.keys(tried).length === 0) return { id: 'handle', target: '[data-stretch-handle]', gesture: 'drag' };
  const dir = b != null && b >= range.max ? -1 : 1;
  return { id: 'nudge', target: `[data-shelf-nudge="${dir}"]`, rank: dir, gesture: 'tap' };
}

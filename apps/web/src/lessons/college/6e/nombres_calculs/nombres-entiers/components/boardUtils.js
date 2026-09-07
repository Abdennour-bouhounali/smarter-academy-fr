/**
 * boardUtils — la mathématique de l'atelier de numération, sans aucun pixel.
 *
 * UNE SEULE VÉRITÉ : un plateau est un objet `{ U, D, C, UM }` qui compte les
 * OBJETS réellement posés dans chaque colonne. Le nombre affiché, l'écriture
 * du nombre, la hauteur des piles et la possibilité d'échanger en sont tous
 * DÉRIVÉS — rien n'est stocké deux fois (CLAUDE.md §8).
 *
 * L'invariant que l'élève doit remarquer : échanger dix objets d'une colonne
 * contre un objet de la colonne de gauche NE CHANGE PAS le nombre. Le plateau
 * maigrit, la valeur reste. C'est le cœur de la numération de position, et
 * c'est ici un THÉORÈME testé (`exchangeUp` préserve `boardValue`), pas une
 * phrase du cours.
 */

/** Les quatre sortes d'objets, de la plus grosse à la plus petite. */
export const PIECES = [
  // `article` porte le genre du nom : sans lui, « un unité » ou « une millier »
  // apparaissaient dans les libellés d'accessibilité (et donc dans ce que le
  // lecteur d'écran énonce).
  { key: 'UM', value: 1000, singular: 'millier',  plural: 'milliers',  article: 'un',  upFrom: 'C'  },
  { key: 'C',  value: 100,  singular: 'centaine', plural: 'centaines', article: 'une', upFrom: 'D'  },
  { key: 'D',  value: 10,   singular: 'dizaine',  plural: 'dizaines',  article: 'une', upFrom: 'U'  },
  { key: 'U',  value: 1,    singular: 'unité',    plural: 'unités',    article: 'une', upFrom: null },
];

export const PIECE_BY_KEY = Object.fromEntries(PIECES.map((p) => [p.key, p]));

export const EMPTY_BOARD = { UM: 0, C: 0, D: 0, U: 0 };

/** Le nombre que le plateau représente, quel que soit son rangement. */
export function boardValue(board) {
  return PIECES.reduce((sum, p) => sum + (board[p.key] || 0) * p.value, 0);
}

/** Combien d'objets sont posés en tout — ce que l'échange fait diminuer. */
export function pieceCount(board) {
  return PIECES.reduce((n, p) => n + (board[p.key] || 0), 0);
}

/** Poser un objet dans sa colonne. */
export function place(board, key) {
  if (!PIECE_BY_KEY[key]) return board;
  return { ...board, [key]: (board[key] || 0) + 1 };
}

/** Retirer un objet d'une colonne (jamais en dessous de zéro). */
export function removeOne(board, key) {
  if (!PIECE_BY_KEY[key]) return board;
  return { ...board, [key]: Math.max(0, (board[key] || 0) - 1) };
}

/**
 * La colonne `from` a-t-elle assez d'objets pour un échange vers la gauche ?
 * (dix unités valent une dizaine, dix dizaines une centaine, dix centaines un
 * millier ; au-delà du millier, l'atelier s'arrête.)
 */
export function canExchangeUp(board, from) {
  const target = PIECES.find((p) => p.upFrom === from);
  return Boolean(target) && (board[from] || 0) >= 10;
}

/**
 * L'ÉCHANGE : dix objets de `from` sortent, un objet de la colonne de gauche
 * entre. La valeur du plateau est inchangée — c'est l'invariant du module.
 */
export function exchangeUp(board, from) {
  if (!canExchangeUp(board, from)) return board;
  const target = PIECES.find((p) => p.upFrom === from);
  return { ...board, [from]: board[from] - 10, [target.key]: (board[target.key] || 0) + 1 };
}

/** La colonne `from` peut-elle être cassée en dix objets plus petits ? */
export function canBreakDown(board, from) {
  const piece = PIECE_BY_KEY[from];
  return Boolean(piece?.upFrom) && (board[from] || 0) >= 1;
}

/** CASSER : un objet sort, dix objets plus petits entrent. Valeur inchangée. */
export function breakDown(board, from) {
  if (!canBreakDown(board, from)) return board;
  const to = PIECE_BY_KEY[from].upFrom;
  return { ...board, [from]: board[from] - 1, [to]: (board[to] || 0) + 10 };
}

/** Le rangement le plus court : jamais dix objets dans une même colonne. */
export function isTidy(board) {
  return PIECES.every((p) => (board[p.key] || 0) < 10);
}

/** Le plateau canonique d'un nombre (celui qu'on écrit avec des chiffres). */
export function tidyBoard(n) {
  return {
    UM: Math.floor(n / 1000),
    C: Math.floor((n % 1000) / 100),
    D: Math.floor((n % 100) / 10),
    U: n % 10,
  };
}

/**
 * Toutes les colonnes où un échange est possible, de la plus petite à la plus
 * grande — l'ordre dans lequel un élève les rencontre naturellement.
 */
export function pendingExchanges(board) {
  return [...PIECES].reverse().filter((p) => canExchangeUp(board, p.key)).map((p) => p.key);
}

/**
 * Le plateau rangé au plus court, obtenu en échangeant tant que c'est
 * possible. Sert de garde-fou de test : `boardValue(tidy(b)) === boardValue(b)`.
 */
export function tidyUp(board) {
  let b = { ...board };
  // Chaque échange retire exactement neuf objets du plateau : le nombre
  // d'échanges possibles est donc borné par le nombre d'objets de départ.
  // Le garde-fou en dérive au lieu d'être une constante devinée — avec une
  // constante à 200, un plateau de 2 450 cubes s'arrêtait à mi-chemin.
  let guard = pieceCount(board) + 1;
  let next = pendingExchanges(b);
  while (next.length > 0 && guard > 0) {
    b = exchangeUp(b, next[0]);
    next = pendingExchanges(b);
    guard -= 1;
  }
  return b;
}

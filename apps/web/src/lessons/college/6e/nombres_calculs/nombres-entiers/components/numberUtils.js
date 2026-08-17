import { formatFr, texFr, parseFr, THIN } from '@smarter-academy/core';

// Les primitives de formatage sont mutualisées dans @smarter-academy/core.
// On les réexporte pour que les modules de la leçon gardent un import unique.
export { formatFr, texFr, parseFr, THIN };

/**
 * numberUtils — outils de numération pour la leçon « Nombres entiers » (6e).
 *
 * Périmètre volontairement limité au programme de 6e :
 * lire, écrire, décomposer, recomposer, comparer, ranger, encadrer, repérer.
 * (Pas de relatifs, pas de puissances, pas de divisibilité.)
 */

export const PLACES = [
  { key: 'M',  label: 'Millions',              shortLabel: 'M',   value: 1000000, className: 'millions' },
  { key: 'CM', label: 'Centaines de milliers', shortLabel: 'c',   value: 100000,  className: 'milliers' },
  { key: 'DM', label: 'Dizaines de milliers',  shortLabel: 'd',   value: 10000,   className: 'milliers' },
  { key: 'UM', label: 'Milliers',              shortLabel: 'u',   value: 1000,    className: 'milliers' },
  { key: 'C',  label: 'Centaines',             shortLabel: 'c',   value: 100,     className: 'unites' },
  { key: 'D',  label: 'Dizaines',              shortLabel: 'd',   value: 10,      className: 'unites' },
  { key: 'U',  label: 'Unités',                shortLabel: 'u',   value: 1,       className: 'unites' },
];

export const CLASS_LABELS = {
  millions: 'Millions',
  milliers: 'Milliers',
  unites: 'Unités simples',
};

/** Nom singulier d'une position, pour les phrases d'explication. */
export const PLACE_SINGULAR = {
  M: 'million',
  CM: 'centaine de mille',
  DM: 'dizaine de mille',
  UM: 'millier',
  C: 'centaine',
  D: 'dizaine',
  U: 'unité',
};

/** Plus grande position occupée par n (1, 10, 100, …). */
export function highestPlaceValue(n) {
  let v = 1;
  while (n >= v * 10 && v < 1000000) v *= 10;
  return v;
}

/**
 * Décompose n en cellules du tableau de numération.
 * @param {number} n
 * @param {number} [fromValue] plus grande colonne affichée (par défaut : celle de n)
 * @returns {{key,label,value,digit,contributed}[]}
 */
export function digitCells(n, fromValue) {
  const top = fromValue || highestPlaceValue(n);
  return PLACES.filter((p) => p.value <= top).map((p) => {
    const digit = Math.floor(n / p.value) % 10;
    return { ...p, digit, contributed: digit * p.value };
  });
}

/** Décomposition canonique : 4582 → [4000, 500, 80, 2] (les zéros sont écartés). */
export function decompose(n) {
  return digitCells(n)
    .filter((c) => c.digit !== 0)
    .map((c) => c.contributed);
}

/** Nombre de milliers / centaines… contenus dans n : countOf(12450, 1000) = 12. */
export function countOf(n, unitValue) {
  return Math.floor(n / unitValue);
}

/** Encadrement de n par les multiples de `unit` : 4582, 1000 → [4000, 5000]. */
export function frame(n, unit) {
  const low = Math.floor(n / unit) * unit;
  return [low, low + unit];
}

/* ── Écriture en lettres ─────────────────────────────────────────────── */

const SMALL = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];

const TENS = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante' };

/**
 * @param {number} n  entier de 0 à 99
 * @param {boolean} allowPlural  « quatre-vingts » ne prend son s que si rien ne suit
 *   (d'où « quatre-vingts » mais « quatre-vingt mille »).
 */
function under100(n, allowPlural) {
  if (n < 20) return SMALL[n];
  // 70-79 et 90-99 : on repart de 60 et de 80.
  if ((n >= 70 && n < 80) || n >= 90) {
    const base = n < 80 ? 'soixante' : 'quatre-vingt';
    const rest = n - (n < 80 ? 60 : 80);
    if (n === 71) return 'soixante et onze';
    return `${base}-${SMALL[rest]}`;
  }
  if (n >= 80) {
    const rest = n - 80;
    if (rest === 0) return allowPlural ? 'quatre-vingts' : 'quatre-vingt';
    return `quatre-vingt-${SMALL[rest]}`;
  }
  const tens = Math.floor(n / 10) * 10;
  const rest = n % 10;
  if (rest === 0) return TENS[tens];
  if (rest === 1) return `${TENS[tens]} et un`;
  return `${TENS[tens]}-${SMALL[rest]}`;
}

/**
 * @param {number} n  entier de 0 à 999
 * @param {boolean} allowPlural  « cent » et « vingt » ne se pluralisent que
 *   lorsqu'ils terminent le nombre (« deux cents » mais « deux cent mille »).
 */
function under1000(n, allowPlural) {
  if (n < 100) return under100(n, allowPlural);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let out = hundreds === 1 ? 'cent' : `${SMALL[hundreds]} cent`;
  if (rest === 0 && hundreds > 1 && allowPlural) out += 's';
  if (rest > 0) out += ` ${under100(rest, allowPlural)}`;
  return out;
}

/**
 * Écrit un entier en lettres (orthographe traditionnelle, jusqu'à 999 999 999).
 * spellFr(2436)   → « deux mille quatre cent trente-six »
 * spellFr(7205)   → « sept mille deux cent cinq »
 * spellFr(80)     → « quatre-vingts »
 */
export function spellFr(n) {
  const x = Math.trunc(Math.abs(n));
  if (x === 0) return 'zéro';
  if (x > 999999999) return formatFr(x);

  const millions = Math.floor(x / 1000000);
  const thousands = Math.floor((x % 1000000) / 1000);
  const units = x % 1000;
  const parts = [];

  if (millions > 0) {
    parts.push(`${under1000(millions, true)} million${millions > 1 ? 's' : ''}`);
  }
  if (thousands > 0) {
    // « mille » est invariable et ne s'écrit jamais « un mille ».
    parts.push(thousands === 1 ? 'mille' : `${under1000(thousands, false)} mille`);
  }
  if (units > 0) parts.push(under1000(units, true));

  return parts.join(' ');
}

/** Découpe un entier en classes de 3 chiffres : 2350700 → ['2','350','700']. */
export function groupsOfThree(n) {
  const s = Math.trunc(Math.abs(n)).toString();
  const out = [];
  for (let end = s.length; end > 0; end -= 3) {
    out.unshift(s.slice(Math.max(0, end - 3), end));
  }
  return out;
}

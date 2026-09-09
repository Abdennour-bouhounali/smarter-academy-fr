/**
 * Noyau mathématique de « Proportionnalité » (5e).
 *
 * RÈGLE-OBJETS, PAS LISTES DE VALEURS. Une situation est une FONCTION de
 * l'entrée, jamais un tableau écrit à la main. C'est ce qui garantit que le
 * non-proportionnel se comporte comme tel PARTOUT — à toutes les entrées que
 * l'élève peut atteindre, y compris celles auxquelles l'auteur n'a pas pensé —
 * et que rien de ce que la leçon affirme ne puisse être démenti par le code
 * (INTERACTION_PEDAGOGY §6ter.2).
 *
 * Toutes les fonctions sont pures et testées (propUtils.test.js).
 */
import { parseDec } from '@smarter-academy/core';

/**
 * `parseDec` accepte les décimaux (« 2,5 » comme « 2.5 ») ; `parseFr`, lui, est
 * ENTIER et renverrait NaN sur « 2,5 » — une saisie décimale ne se validerait
 * jamais. Toute NumericQuestion à réponse décimale de cette leçon passe donc
 * `parse={parseDec}`.
 */
export { parseDec };

/** Arrondi « monnaie » : deux décimales, sans bruit binaire (0,1 + 0,2). */
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Format français : virgule décimale, espace fine pour les milliers. */
export function fr(x, maxDecimals = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals });
}

/** Prix en euros, toujours lisible (« 4,50 € » et non « 4,5 € »). */
export function eur(x) {
  if (!Number.isFinite(x)) return '—';
  const twoDec = Math.abs(round2(x) * 100) % 100 !== 0;
  return `${x.toLocaleString('fr-FR', {
    minimumFractionDigits: twoDec ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`;
}

/* ─────────────────────────────────────────────────────────────────────
   Les situations, comme RÈGLES
   ───────────────────────────────────────────────────────────────────── */

/**
 * Une situation proportionnelle : sortie = k × entrée. Rien d'autre.
 * `k` est le coefficient — le nombre que la leçon fait découvrir.
 */
export const proportional = ({ k, ...meta }) => ({
  kind: 'proportional',
  k,
  apply: (x) => round2(k * x),
  ...meta,
});

/**
 * Une situation AFFINE au sens du calcul, jamais nommée ainsi devant l'élève
 * de 5e : sortie = base + k × entrée, avec base ≠ 0. C'est le contre-exemple
 * du niveau — un abonnement, un forfait, un droit d'entrée.
 *
 * Le mot « affine » reste STRICTEMENT interne : il ne doit apparaître ni dans
 * une copie, ni dans un libellé (frontière de niveau, 3e).
 */
export const withBase = ({ base, k, ...meta }) => ({
  kind: 'base',
  base,
  k,
  apply: (x) => round2(base + k * x),
  ...meta,
});

/** Une situation dont la sortie ne dépend pas de l'entrée (un forfait pur). */
export const flat = ({ value, ...meta }) => ({
  kind: 'flat',
  value,
  apply: () => round2(value),
  ...meta,
});

/** Vrai si la règle est proportionnelle — la SEULE source de vérité. */
export const isProportional = (rule) => rule.kind === 'proportional';

/* ─────────────────────────────────────────────────────────────────────
   Ce que l'élève éprouve
   ───────────────────────────────────────────────────────────────────── */

/**
 * Le test du doublement (module 1) : que devient la sortie quand l'entrée
 * double ? Renvoie le rapport sortie(2x) / sortie(x), et non un booléen —
 * l'élève doit VOIR « ×2 » d'un côté et « ×1,6 » de l'autre, pas lire un
 * verdict. Le rapport est indéfini si la sortie de départ est nulle.
 */
export function doublingRatio(rule, x) {
  const before = rule.apply(x);
  if (before === 0) return null;
  return round2(rule.apply(2 * x) / before);
}

/**
 * Le rapport sortie ÷ entrée (module 2) : constant si et seulement si la
 * situation est proportionnelle. Indéfini en 0 — et c'est mathématiquement
 * juste, pas un cas à masquer.
 */
export function ratio(rule, x) {
  if (x === 0) return null;
  return round2(rule.apply(x) / x);
}

/**
 * Les rapports sur toute une plage d'entrées, pour la colonne « ÷ entrée ».
 * `constant` dit si tous les rapports définis coïncident : c'est la propriété
 * que le module 2 fait découvrir, CALCULÉE et jamais affirmée.
 */
export function ratioColumn(rule, inputs) {
  const rows = inputs.map((x) => ({ x, y: rule.apply(x), r: ratio(rule, x) }));
  const defined = rows.map((r) => r.r).filter((r) => r !== null);
  const constant = defined.length > 1 && defined.every((r) => r === defined[0]);
  return { rows, constant, value: constant ? defined[0] : null };
}

/* ─────────────────────────────────────────────────────────────────────
   Le tableau (module 3)
   ───────────────────────────────────────────────────────────────────── */

/**
 * Les trois chemins vers une case vide d'un tableau de proportionnalité.
 * Chacun renvoie la MÊME valeur — c'est le propos du module — mais raconte un
 * calcul différent, et c'est ce récit qu'on montre à l'élève.
 *
 * `known` = { x, y } une colonne complète ; `target` = l'entrée cherchée.
 */
export function pathsToCell({ x, y }, target) {
  const unit = round2(y / x);                    // passage par l'unité
  const factor = round2(target / x);             // facteur d'une colonne à l'autre
  return {
    value: round2(unit * target),
    unite: { unit, steps: [`${fr(y)} ÷ ${fr(x)} = ${fr(unit)}`, `${fr(unit)} × ${fr(target)}`] },
    facteur: { factor, steps: [`${fr(target)} ÷ ${fr(x)} = ${fr(factor)}`, `${fr(y)} × ${fr(factor)}`] },
    coefficient: { k: unit, steps: [`k = ${fr(unit)}`, `${fr(target)} × ${fr(unit)}`] },
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Échelle (module 4)
   ───────────────────────────────────────────────────────────────────── */

/**
 * Une échelle 1/n : 1 cm sur la carte représente n cm en vrai.
 * `toReal` rend des CENTIMÈTRES ; la conversion en mètres ou kilomètres est
 * une lecture, pas un calcul d'échelle — on garde les deux séparés pour que
 * l'élève voie où la division par 100 ou 100 000 intervient.
 */
export const scale = (n) => ({
  n,
  label: `1/${fr(n, 0)}`,
  toReal: (cmOnMap) => round2(cmOnMap * n),
  toMap: (cmReal) => round2(cmReal / n),
});

export const cmToM = (cm) => round2(cm / 100);
export const cmToKm = (cm) => round2(cm / 100000);

/* ─────────────────────────────────────────────────────────────────────
   Pourcentages (module 5)
   ───────────────────────────────────────────────────────────────────── */

/** t % d'une quantité. */
export const percentOf = (t, q) => round2((t / 100) * q);

/**
 * Le coefficient multiplicateur d'une remise de t % : ×(1 − t/100).
 * C'est le cœur du module 5 — enlever 30 %, c'est multiplier par 0,7, et non
 * par 0,3. Le coefficient est rendu explicitement pour être AFFICHÉ.
 */
export const discountFactor = (t) => round2(1 - t / 100);
export const applyDiscount = (t, q) => round2(discountFactor(t) * q);

/* ─────────────────────────────────────────────────────────────────────
   Vitesse (module 7)
   ───────────────────────────────────────────────────────────────────── */

/** Vitesse moyenne en km/h — le coefficient, avec son unité. */
export const speed = (km, h) => (h === 0 ? null : round2(km / h));
/** La distance parcourue : le coefficient appliqué au temps. */
export const distance = (kmh, h) => round2(kmh * h);

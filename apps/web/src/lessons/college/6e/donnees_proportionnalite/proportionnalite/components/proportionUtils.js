/**
 * Proportionnalité — 6e · modèle mathématique unique.
 *
 * ÉTAT CANONIQUE : une situation est une paire de grandeurs liées par une
 * RÈGLE, et c'est la règle — pas la liste de valeurs — qui est la source de
 * vérité :
 *
 *   Rule =
 *     | { kind: 'proportional', k }               y = k · x
 *     | { kind: 'affine', k, b }                  y = k · x + b   (b ≠ 0)
 *     | { kind: 'custom', fn, label }             cas non linéaires (âge, paliers…)
 *
 * Toutes les représentations de la leçon (le tableau, les paquets d'objets,
 * la valeur unitaire, les prédictions de l'élève) sont calculées à partir de
 * cette règle par `applyRule`. Il est donc IMPOSSIBLE qu'une situation
 * « non proportionnelle » se comporte proportionnellement dans un coin de
 * l'écran : la contradiction que la leçon fait découvrir est produite par
 * les mathématiques, pas écrite à la main dans un module.
 *
 * PÉRIMÈTRE 6e (teachingScope) — décisions figées :
 *  · le mot « coefficient » est employé comme « nombre par lequel on
 *    multiplie », jamais comme un objet formel à manipuler ;
 *  · PAS de produit en croix, PAS de représentation graphique de la
 *    proportionnalité (tous deux explicitement exclus du programme) ;
 *  · les procédures visées sont : passage par l'unité, multiplication /
 *    division, linéarité additive (a + b) et multiplicative (double, triple,
 *    moitié) ;
 *  · les valeurs sont choisies pour que chaque réponse attendue soit un
 *    entier ou un décimal simple — `isNiceAnswer` le vérifie.
 */
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/* ── Règles ────────────────────────────────────────────────────────── */

export const proportionalRule = (k) => ({ kind: 'proportional', k });
export const affineRule = (k, b) => ({ kind: 'affine', k, b });
export const customRule = (fn, label) => ({ kind: 'custom', fn, label });

/** Applique la règle : x → y. C'est LE point de passage unique. */
export function applyRule(rule, x) {
  switch (rule.kind) {
    case 'proportional':
      return roundTo(rule.k * x);
    case 'affine':
      return roundTo(rule.k * x + rule.b);
    case 'custom':
      return roundTo(rule.fn(x));
    default:
      throw new Error(`applyRule: règle inconnue « ${rule.kind} »`);
  }
}

/** Une situation est-elle proportionnelle ? (dérivé de la règle, jamais déclaré) */
export const isProportional = (rule) => rule.kind === 'proportional';

/**
 * Le coefficient d'une situation proportionnelle : ce par quoi on multiplie
 * la première grandeur pour obtenir la seconde.
 */
export function coefficient(rule) {
  return isProportional(rule) ? rule.k : null;
}

/* ── Le test de proportionnalité ───────────────────────────────────── */

/**
 * Rapport y/x pour une valeur — c'est ce que l'élève compare d'une colonne
 * à l'autre pour TESTER une situation. Renvoie null en 0 (indéfini).
 */
export function ratioAt(rule, x) {
  if (x === 0) return null;
  return roundTo(applyRule(rule, x) / x, 6);
}

/**
 * Les rapports y/x sont-ils tous égaux ? C'est la définition opératoire
 * utilisée par la leçon : « on multiplie toujours par le même nombre ».
 */
export function ratiosAllEqual(rule, xs) {
  const rs = xs.map((x) => ratioAt(rule, x)).filter((r) => r !== null);
  if (rs.length < 2) return true;
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/**
 * Le test de linéarité additive : f(a) + f(b) vaut-il f(a + b) ?
 * Vrai exactement pour les situations proportionnelles — c'est la propriété
 * que l'élève éprouve au module « prédire ».
 */
export function additivityHolds(rule, a, b) {
  return Math.abs(applyRule(rule, a) + applyRule(rule, b) - applyRule(rule, a + b)) < 1e-9;
}

/**
 * Le test du double : doubler x double-t-il y ?
 * La contradiction rendue visible pour les situations affines.
 */
export function doublingHolds(rule, x) {
  return Math.abs(applyRule(rule, 2 * x) - 2 * applyRule(rule, x)) < 1e-9;
}

/** Écart entre ce que donnerait la proportionnalité et la réalité de la règle. */
export function proportionalityGap(rule, x) {
  const r0 = ratioAt(rule, 1);
  if (r0 === null) return 0;
  return roundTo(applyRule(rule, x) - r0 * x);
}

/* ── Stratégies de résolution (rendues visibles, jamais imposées) ──── */

/**
 * Les chemins de résolution disponibles pour passer de (xKnown, yKnown) à
 * xTarget. La leçon AFFICHE ces stratégies pour que l'élève choisisse — le
 * module ne force jamais une méthode.
 *
 * Renvoie une liste de { id, label, steps[], result }, chaque `steps` étant
 * une suite de lignes de calcul prêtes à l'affichage.
 */
export function strategiesFor(xKnown, yKnown, xTarget) {
  const unit = roundTo(yKnown / xKnown);
  const out = [];

  // 1. Passage par l'unité — toujours disponible.
  out.push({
    id: 'unite',
    label: "Passage par l'unité",
    steps: [
      `${formatDec(xKnown)} → ${formatDec(yKnown)}`,
      `1 → ${formatDec(yKnown)} ÷ ${formatDec(xKnown)} = ${formatDec(unit)}`,
      `${formatDec(xTarget)} → ${formatDec(unit)} × ${formatDec(xTarget)} = ${formatDec(roundTo(unit * xTarget))}`,
    ],
    result: roundTo(unit * xTarget),
  });

  // 2. Multiplication directe, si xTarget est un multiple entier de xKnown.
  const factor = roundTo(xTarget / xKnown);
  if (Number.isInteger(factor) && factor > 1) {
    out.push({
      id: 'multiplier',
      label: `Multiplier par ${factor}`,
      steps: [
        `${formatDec(xKnown)} → ${formatDec(yKnown)}`,
        `×${factor} des deux côtés`,
        `${formatDec(xTarget)} → ${formatDec(yKnown)} × ${factor} = ${formatDec(roundTo(yKnown * factor))}`,
      ],
      result: roundTo(yKnown * factor),
    });
  }

  // 3. Division, si xKnown est un multiple entier de xTarget.
  const divisor = roundTo(xKnown / xTarget);
  if (Number.isInteger(divisor) && divisor > 1) {
    out.push({
      id: 'diviser',
      label: `Diviser par ${divisor}`,
      steps: [
        `${formatDec(xKnown)} → ${formatDec(yKnown)}`,
        `÷${divisor} des deux côtés`,
        `${formatDec(xTarget)} → ${formatDec(yKnown)} ÷ ${divisor} = ${formatDec(roundTo(yKnown / divisor))}`,
      ],
      result: roundTo(yKnown / divisor),
    });
  }

  // 4. Décomposition additive : xTarget = xKnown + reste, si le reste est
  //    lui-même un multiple simple de xKnown (linéarité additive).
  const rest = roundTo(xTarget - xKnown);
  if (rest > 0 && Number.isInteger(roundTo(rest / xKnown))) {
    out.push({
      id: 'addition',
      label: 'Additionner des quantités connues',
      steps: [
        `${formatDec(xTarget)} = ${formatDec(xKnown)} + ${formatDec(rest)}`,
        `${formatDec(xKnown)} → ${formatDec(yKnown)} et ${formatDec(rest)} → ${formatDec(roundTo(unit * rest))}`,
        `${formatDec(xTarget)} → ${formatDec(yKnown)} + ${formatDec(roundTo(unit * rest))} = ${formatDec(roundTo(unit * xTarget))}`,
      ],
      result: roundTo(unit * xTarget),
    });
  }

  return out;
}

/** Toutes les stratégies doivent donner le MÊME résultat — garde-fou. */
export function strategiesAgree(xKnown, yKnown, xTarget) {
  const rs = strategiesFor(xKnown, yKnown, xTarget).map((s) => s.result);
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/** Une réponse est-elle « propre » pour la 6e (entier ou décimal court) ? */
export function isNiceAnswer(n) {
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
}

/* ── Tableaux de proportionnalité ──────────────────────────────────── */

/** Construit les lignes d'un tableau à partir d'une règle et d'abscisses. */
export function buildRows(rule, xs) {
  return xs.map((x) => ({ x, y: applyRule(rule, x) }));
}

/**
 * Un tableau de valeurs (indépendant de toute règle) est-il proportionnel ?
 * Utilisé pour tester les situations que l'élève RENCONTRE sous forme de
 * données brutes, sans règle connue.
 */
export function rowsAreProportional(rows) {
  const rs = rows.filter((r) => r.x !== 0).map((r) => roundTo(r.y / r.x, 6));
  if (rs.length < 2) return true;
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/** Le coefficient d'un tableau proportionnel (null s'il ne l'est pas). */
export function rowsCoefficient(rows) {
  if (!rowsAreProportional(rows)) return null;
  const first = rows.find((r) => r.x !== 0);
  return first ? roundTo(first.y / first.x, 6) : null;
}

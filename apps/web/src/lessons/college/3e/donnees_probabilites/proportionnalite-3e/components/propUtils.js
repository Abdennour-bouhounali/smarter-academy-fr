/**
 * propUtils — la mathématique de la proportionnalité (3e), sans aucun pixel.
 *
 * ÉTAT CANONIQUE : une situation est une paire de grandeurs liées par une
 * RÈGLE, et c'est la règle — jamais une liste de valeurs — qui est la source
 * de vérité :
 *
 *   Rule =
 *     | { kind: 'proportional', k }        y = k · x
 *     | { kind: 'affine', k, b }           y = k · x + b   (b ≠ 0 : part fixe)
 *     | { kind: 'constant', c }            y = c            (ne dépend pas de x)
 *     | { kind: 'custom', fn, label }      autres dépendances
 *
 * Tableaux, tuiles, rapports, prédictions et corrections sont tous calculés
 * par `applyRule` : une situation « non proportionnelle » ne peut donc jamais
 * se comporter proportionnellement dans un coin de l'écran.
 *
 * LES MÉTHODES SONT DES CHEMINS, PAS DES RÈGLES : `strategiesFor` renvoie les
 * chemins disponibles (unité, facteur entre colonnes, coefficient, produit
 * en croix) et `strategiesAgree` garantit qu'ils donnent tous le même nombre.
 *
 * NE PAS ARRONDIR LA MATHÉMATIQUE : `applyRule` et les rapports renvoient des
 * valeurs à 9 décimales (les artefacts de flottants seulement), l'affichage
 * arrondit avec `formatDec`.
 *
 * Adapté (copié, non importé — playbook §14 ADAPT) de
 * 6e/donnees_proportionnalite/proportionnalite/components/proportionUtils.js,
 * puis étendu pour la 3e : coefficient vertical, produit en croix,
 * pourcentages, agrandissement (k, k², k³), Thalès, sciences, cohérence.
 */
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

const r9 = (v) => roundTo(v, 9);

/* ── Règles ────────────────────────────────────────────────────────── */

export const proportionalRule = (k) => ({ kind: 'proportional', k });
export const affineRule = (k, b) => ({ kind: 'affine', k, b });
export const constantRule = (c) => ({ kind: 'constant', c });
export const customRule = (fn, label) => ({ kind: 'custom', fn, label });

/** Applique la règle : x → y. C'est LE point de passage unique. */
export function applyRule(rule, x) {
  switch (rule.kind) {
    case 'proportional': return r9(rule.k * x);
    case 'affine': return r9(rule.k * x + rule.b);
    case 'constant': return rule.c;
    case 'custom': return r9(rule.fn(x));
    default: throw new Error(`applyRule: règle inconnue « ${rule.kind} »`);
  }
}

export const isProportional = (rule) => rule.kind === 'proportional';

/** Le coefficient d'une situation proportionnelle ; null sinon. */
export const coefficient = (rule) => (isProportional(rule) ? rule.k : null);

/** Rapport y/x pour une valeur ; null en 0 (indéfini). */
export function ratioAt(rule, x) {
  if (x === 0) return null;
  return r9(applyRule(rule, x) / x);
}

/** Les rapports y/x sont-ils tous égaux ? La définition opératoire de la leçon. */
export function ratiosAllEqual(rule, xs) {
  const rs = xs.map((x) => ratioAt(rule, x)).filter((r) => r !== null);
  if (rs.length < 2) return true;
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/** Doubler x double-t-il y ? */
export const doublingHolds = (rule, x) => Math.abs(applyRule(rule, 2 * x) - 2 * applyRule(rule, x)) < 1e-9;

/** f(a) + f(b) vaut-il f(a + b) ? Vrai exactement pour les proportionnelles. */
export const additivityHolds = (rule, a, b) => Math.abs(applyRule(rule, a) + applyRule(rule, b) - applyRule(rule, a + b)) < 1e-9;

/** Construit les lignes d'un tableau à partir d'une règle et d'abscisses. */
export const buildRows = (rule, xs) => xs.map((x) => ({ x, y: applyRule(rule, x) }));

/** Un tableau brut est-il proportionnel ? (rapports y/x tous égaux) */
export function rowsAreProportional(rows) {
  const rs = rows.filter((r) => r.x !== 0 && r.y !== null).map((r) => r9(r.y / r.x));
  if (rs.length < 2) return true;
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/** Le coefficient d'un tableau proportionnel (null s'il ne l'est pas). */
export function rowsCoefficient(rows) {
  if (!rowsAreProportional(rows)) return null;
  const first = rows.find((r) => r.x !== 0 && r.y !== null);
  return first ? r9(first.y / first.x) : null;
}

/* ── Les chemins vers la case vide ─────────────────────────────────── */

/** La quatrième proportionnelle : a → b, c → ? */
export const fourthProportional = (a, b, c) => r9((b * c) / a);

/**
 * Les chemins disponibles pour passer de (xKnown → yKnown) à xTarget.
 * Chaque chemin : { id, label, steps[], result }. La leçon AFFICHE les chemins
 * pour que l'élève choisisse — elle n'en impose jamais un.
 */
export function strategiesFor(xKnown, yKnown, xTarget, { xUnit = '', yUnit = '' } = {}) {
  const unit = r9(yKnown / xKnown);
  const result = r9(unit * xTarget);
  const out = [];
  const fx = (v) => `${formatDec(v)}${xUnit ? ` ${xUnit}` : ''}`;
  const fy = (v) => `${formatDec(v)}${yUnit ? ` ${yUnit}` : ''}`;

  // 1. Passage par l'unité — toujours disponible.
  out.push({
    id: 'unite',
    label: 'Passer par l’unité',
    steps: [
      `${fx(xKnown)} → ${fy(yKnown)}`,
      `${fx(1)} → ${formatDec(yKnown)} ÷ ${formatDec(xKnown)} = ${fy(unit)}`,
      `${fx(xTarget)} → ${formatDec(unit)} × ${formatDec(xTarget)} = ${fy(result)}`,
    ],
    result,
  });

  // 2. Facteur entre colonnes, si l'on passe de xKnown à xTarget par un facteur « lisible ».
  const factor = r9(xTarget / xKnown);
  const nice = Number.isInteger(factor) || Number.isInteger(r9(factor * 2)) || Number.isInteger(r9(factor * 4));
  if (nice && factor !== 1) {
    out.push({
      id: 'facteur',
      label: `Multiplier la colonne par ${formatDec(factor)}`,
      steps: [
        `${fx(xKnown)} → ${fy(yKnown)}`,
        `${formatDec(xKnown)} × ${formatDec(factor)} = ${formatDec(xTarget)} : même facteur sur l’autre ligne`,
        `${fx(xTarget)} → ${formatDec(yKnown)} × ${formatDec(factor)} = ${fy(result)}`,
      ],
      result: r9(yKnown * factor),
    });
  }

  // 3. Coefficient (lecture verticale) — toujours disponible.
  out.push({
    id: 'coefficient',
    label: 'Utiliser le coefficient',
    steps: [
      `k = ${formatDec(yKnown)} ÷ ${formatDec(xKnown)} = ${formatDec(unit)}`,
      `chaque ${xUnit || 'valeur'} est multipliée par ${formatDec(unit)}`,
      `${fx(xTarget)} → ${formatDec(xTarget)} × ${formatDec(unit)} = ${fy(result)}`,
    ],
    result,
  });

  // 4. Produit en croix — toujours disponible.
  out.push({
    id: 'croix',
    label: 'Produit en croix',
    steps: [
      `${formatDec(xKnown)} → ${formatDec(yKnown)} et ${formatDec(xTarget)} → ?`,
      `? × ${formatDec(xKnown)} = ${formatDec(yKnown)} × ${formatDec(xTarget)} = ${formatDec(r9(yKnown * xTarget))}`,
      `? = ${formatDec(r9(yKnown * xTarget))} ÷ ${formatDec(xKnown)} = ${fy(fourthProportional(xKnown, yKnown, xTarget))}`,
    ],
    result: fourthProportional(xKnown, yKnown, xTarget),
  });

  return out;
}

/** Toutes les stratégies doivent donner le MÊME résultat — garde-fou. */
export function strategiesAgree(xKnown, yKnown, xTarget) {
  const rs = strategiesFor(xKnown, yKnown, xTarget).map((s) => s.result);
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-9);
}

/* ── Pourcentages ──────────────────────────────────────────────────── */

/** +20 % → 1,2 ; −25 % → 0,75. */
export const percentMultiplier = (rate) => r9(1 + rate / 100);

/** Applique une évolution de `rate` % à une valeur. */
export const applyPercent = (value, rate) => r9(value * percentMultiplier(rate));

/** Enchaîne plusieurs évolutions ; renvoie chaque étape. */
export function chainPercents(value, rates) {
  const steps = [value];
  let v = value;
  for (const r of rates) { v = applyPercent(v, r); steps.push(v); }
  return { steps, multiplier: r9(rates.reduce((m, r) => m * percentMultiplier(r), 1)), result: v };
}

/** t % d'une valeur. */
export const percentOf = (value, t) => r9((value * t) / 100);

/** Le taux d'évolution global d'un multiplicateur : 0,96 → −4 %. */
export const rateOfMultiplier = (m) => r9((m - 1) * 100);

/* ── Agrandissement / réduction ────────────────────────────────────── */

/** Les facteurs d'un agrandissement de rapport k : longueurs, aires, volumes. */
export const scaleFactors = (k) => ({ length: r9(k), area: r9(k * k), volume: r9(k * k * k) });

/** Un pavé { w, h, d } (d facultatif) agrandi de rapport k, avec ses mesures. */
export function scaleFigure(base, k) {
  const w = r9(base.w * k);
  const h = r9(base.h * k);
  const out = { w, h, perimeter: r9(2 * (w + h)), area: r9(w * h) };
  if (base.d !== undefined) { out.d = r9(base.d * k); out.volume = r9(w * h * out.d); }
  return out;
}

/** Les mesures d'une figure de base { w, h, d? }. */
export const measures = (base) => scaleFigure(base, 1);

/** Un triangle agrandi de rapport k : toutes les longueurs × k (Thalès). */
export const scaleSides = (sides, k) => sides.map((s) => r9(s * k));

/** Le rapport d'agrandissement lu sur un couple de longueurs ; null si a = 0. */
export const ratioOfLengths = (small, big) => (small === 0 ? null : r9(big / small));

/* ── Sciences ──────────────────────────────────────────────────────── */

export const distance = (v, t) => r9(v * t);
export const speed = (d, t) => (t === 0 ? null : r9(d / t));
export const duration = (d, v) => (v === 0 ? null : r9(d / v));
export const mass = (density, volume) => r9(density * volume);
/** Distance réelle (en cm) d'une longueur sur une carte à l'échelle 1/scale. */
export const realDistanceCm = (mapCm, scale) => r9(mapCm * scale);
export const cmToKm = (cm) => r9(cm / 100000);

/* ── Cohérence ─────────────────────────────────────────────────────── */

/**
 * Un résultat est-il plausible ? Vrai s'il est dans un rapport ≤ `factor`
 * avec la valeur attendue (ordre de grandeur), faux sinon.
 */
export function magnitudeOk(value, expected, factor = 3) {
  if (expected === 0) return Math.abs(value) < 1e-9;
  const q = value / expected;
  return q > 0 && q <= factor && q >= 1 / factor;
}

/** Une réduction (t < 0) doit faire baisser, une hausse monter. */
export const directionOk = (before, after, rate) => (rate < 0 ? after < before : rate > 0 ? after > before : after === before);

/** Une réponse est-elle « propre » pour l'affichage (au plus 2 décimales) ? */
export const isNiceAnswer = (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

/** Accord en nombre d'une étiquette plurielle (« personnes » → « personne »). */
const SINGULARS = { personnes: 'personne', œufs: 'œuf', crêpes: 'crêpe', litres: 'litre', heures: 'heure', films: 'film', cahiers: 'cahier', ans: 'an' };
export function agree(n, label) {
  if (Math.abs(n) >= 2) return label;
  return SINGULARS[label] ?? (label.endsWith('s') ? label.slice(0, -1) : label);
}

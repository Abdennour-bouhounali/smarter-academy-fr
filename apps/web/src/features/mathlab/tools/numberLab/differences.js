/**
 * PGCD بالفوارق المتتالية — la méthode des différences successives, logique
 * pure, sans React.
 *
 *     PGCD(48 ; 18) :  48 − 18 = 30
 *                      30 − 18 = 12
 *                      18 − 12 = 6
 *                      12 − 6  = 6
 *                       6 − 6  = 0   →  PGCD(48 ; 18) = 6
 *
 * La trace vient de `@smarter-academy/core` (`differenceSteps`) — la MÊME que
 * celle des leçons de 4AM (manuel p. 13 : on continue jusqu'au fruit nul, le
 * PGCD est la dernière différence non nulle). Ce module n'écrit pas un
 * deuxième algorithme : il ajoute ce dont le laboratoire a besoin autour.
 *
 *   - LA BORNE. 1000 et 1 demandent 1000 soustractions. On en montre au plus
 *     `DISPLAY_CAP` ; le nombre TOTAL de pas, lui, est connu sans les faire :
 *     c'est la somme des quotients d'Euclide (chaque division `a = b × q + r`
 *     remplace exactement `q` soustractions de `b`). L'écran peut donc dire
 *     « 999 خطوة، نعرض منها 200 » sans geler, et proposer Euclide.
 *   - LA COMPARAISON avec Euclide (nombre de pas des deux méthodes).
 *   - LA GÉOMÉTRIE des deux rubans à l'échelle (le petit coupé du grand).
 *   - LA VALIDATION des deux nombres, avec une raison lisible.
 */

import { differenceSteps, euclidSteps } from '@smarter-academy/core/arithmetic/divisibility.js';

/** Au-delà, on ne DESSINE plus les pas (on les compte, et on le dit). */
export const DISPLAY_CAP = 200;
/** La borne des deux nombres : ce sont des nombres de collège, pas des clés RSA. */
const DIFF_MAX_VALUE = 1_000_000;

/**
 * Lire un nombre tapé par l'élève pour la méthode des différences.
 *
 * @returns {{ value: number } | { error: 'empty'|'notNumber'|'notInteger'|'notPositive'|'tooLarge' }}
 */
export function readPositiveInteger(raw, { max = DIFF_MAX_VALUE } = {}) {
  const text = typeof raw === 'number' ? String(raw) : String(raw ?? '').trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s  ]/g, '');
  if (!text) return { error: 'empty' };
  if (!/^[-+]?\d+([.,]\d+)?$/.test(text)) return { error: 'notNumber' };
  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value)) return { error: 'notNumber' };
  if (!Number.isInteger(value)) return { error: 'notInteger' };
  if (value <= 0) return { error: 'notPositive' };
  if (value > max) return { error: 'tooLarge' };

  return { value };
}

/**
 * Le NOMBRE TOTAL de soustractions, sans les faire : Σ q des divisions
 * d'Euclide. (48 ; 18) : 48 = 18 × 2 + 12, 18 = 12 × 1 + 6, 12 = 6 × 2 + 0 →
 * 2 + 1 + 2 = 5 soustractions.
 */
export function differenceCount(a, b) {
  const { steps } = euclidSteps(a, b);

  return steps.reduce((sum, step) => sum + step.q, 0);
}

/**
 * Le déroulé à AFFICHER.
 *
 * @returns {null | {
 *   a: number, b: number,
 *   steps: Array<{ index: number, big: number, small: number, diff: number,
 *                  next: [number, number] }>,
 *   total: number, truncated: boolean, gcd: number | null, divisions: number
 * }}
 *   `gcd` n'est donné QUE si la trace affichée va jusqu'au fruit nul :
 *   une trace coupée ne désigne pas le PGCD (défaut corrigé dans le core).
 */
export function differencesRun(a, b, { cap = DISPLAY_CAP } = {}) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) return null;
  const total = differenceCount(a, b);
  const run = differenceSteps(a, b, { maxSteps: cap });
  const steps = run.steps.map((step, index) => ({
    index,
    big: step.big,
    small: step.small,
    diff: step.diff,
    // Le couple SUIVANT, rangé (grand ; petit) — ce que la ligne suivante soustrait.
    next: [Math.max(step.small, step.diff), Math.min(step.small, step.diff)],
  }));

  return {
    a,
    b,
    steps,
    total,
    truncated: !run.complete,
    gcd: run.complete ? run.gcd : null,
    divisions: euclidSteps(a, b).steps.length,
  };
}

/** Les deux méthodes, comptées : « بالفوارق: 8 · بالقسمات: 3 ». */
export function compareMethods(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) return null;
  const euclid = euclidSteps(a, b);

  return {
    differences: differenceCount(a, b),
    divisions: euclid.steps.length,
    euclidSteps: euclid.steps,
    gcd: euclid.gcd,
  };
}

/**
 * Les deux RUBANS d'un pas, à l'échelle du plus grand nombre de départ.
 *
 * Le grand ruban mesure `big`, le petit `small` ; on COUPE `small` du grand :
 * la pièce enlevée est `[0, small]` et ce qui reste, `[small, big]`, mesure
 * `diff`. Tout est en fraction de la largeur (0 → 1) : le composant multiplie.
 *
 * Un ruban trop fin pour être vu est signalé (`thin`) — l'écran l'épaissit à
 * une largeur minimale ET le dit, plutôt que de dessiner un trait invisible.
 */
export function ribbonGeometry(step, scaleMax, { minVisible = 0.004 } = {}) {
  if (!step || !(scaleMax > 0)) return null;
  const big = step.big / scaleMax;
  const small = step.small / scaleMax;
  const diff = step.diff / scaleMax;

  return {
    big,
    small,
    cut: { from: 0, to: small },
    rest: { from: small, to: small + diff },
    thin: small < minVisible || (diff > 0 && diff < minVisible),
  };
}

/**
 * Un texte d'annonce pour lecteur d'écran — des nombres, pas de phrase : le
 * composant l'enveloppe dans la phrase i18n.
 */
export function stepEquation(step) {
  return `${step.big} − ${step.small} = ${step.diff}`;
}

/* ── Exemples ─────────────────────────────────────────────────────────── */

/** Les exemples par niveau — ceux du manuel de 4AM en priorité. */
export const DIFFERENCE_EXAMPLES = Object.freeze([
  { id: 'd-48-18', level: 'beginner', a: 48, b: 18 },
  { id: 'd-20-12', level: 'beginner', a: 20, b: 12 },
  { id: 'd-84-36', level: 'beginner', a: 84, b: 36 },
  { id: 'd-117-91', level: 'intermediate', a: 117, b: 91 },
  { id: 'd-252-140', level: 'intermediate', a: 252, b: 140 },
  { id: 'd-378-315', level: 'intermediate', a: 378, b: 315 },
  { id: 'd-765-135', level: 'advanced', a: 765, b: 135 },
  { id: 'd-943-861', level: 'advanced', a: 943, b: 861 },
  { id: 'd-1000-1', level: 'advanced', a: 1000, b: 1 },
]);

/**
 * Un exemple ALÉATOIRE qui a quelque chose à montrer : un PGCD > 1 et un
 * déroulé de 4 à 14 soustractions (assez pour voir l'algorithme, trop peu
 * pour s'ennuyer). `random` est injectable pour les tests.
 */
export function randomDifferencePair(random = Math.random) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const g = 2 + Math.floor(random() * 11);
    const m = 2 + Math.floor(random() * 14);
    const n = 1 + Math.floor(random() * 13);
    const a = g * Math.max(m, n);
    const b = g * Math.min(m, n);
    if (a === b) continue;
    const count = differenceCount(a, b);
    if (count >= 4 && count <= 14) return { a, b };
  }

  return { a: 48, b: 18 };
}

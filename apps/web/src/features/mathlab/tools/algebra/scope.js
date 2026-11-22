import { ALGEBRA_SECTIONS } from './algebraState.js';
import { FUNCTION_FAMILIES } from './functions.js';
import { FACTOR_EXAMPLES, FUNCTION_EXAMPLES, SIMPLIFY_EXAMPLES } from './examples.js';

/**
 * L'atelier d'algèbre dans les deux scopes (labScope.js, MATH_LAB.md §2.1).
 *
 * Le découpage hérité du programme algérien de 4AM (calcul littéral, 3.1–3.9) couvre les six sections —
 * équations, inéquations, systèmes 2×2, développement, factorisation,
 * fonctions — mais pas tout ce qu'elles savent faire :
 *
 *   factorisation  facteur commun et identités remarquables SEULEMENT
 *                  (3.2) ; « somme et produit », la méthode « ac » et le discriminant
 *                  (Δ) sont du lycée ;
 *   fonctions      linéaires et affines (3.7, 3.8) ; pas de second degré ;
 *   simplification pas de fraction rationnelle (x² − 1)/(x − 1).
 *
 * Au lycée : tout.
 */
export const ALGEBRA_SCOPES = Object.freeze(['moyen', 'secondaire']);

/** Les étapes du moteur qui dépassent le collège (factor.js). */
const BEYOND_MOYEN_STEPS = new Set(['sumProduct', 'acPairs', 'acSplit']);
/** Les issues qui ne se lisent qu'avec le discriminant ou « somme et produit ». */
const BEYOND_MOYEN_STATUSES = new Set(['noPair', 'irreducibleReal', 'irreducibleRational']);

export const ALGEBRA_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.algebra.descriptionMoyen',
    factor: Object.freeze({
      methods: 'moyen',
      discriminant: false,
      examples: Object.freeze(['fa-common', 'fa-diff', 'fa-square', 'fa-combo']),
      rules: Object.freeze(['commonFactorRule', 'diffSquares', 'perfectSquareSum', 'perfectSquareDiff']),
      placeholder: '4x^2 - 9',
    }),
    functions: Object.freeze({
      families: Object.freeze(['linear', 'affine']),
      examples: Object.freeze(['fn-linear', 'fn-affine', 'fn-decreasing']),
    }),
    simplify: Object.freeze({
      examples: Object.freeze(['si-like', 'si-dist', 'si-letters', 'si-two', 'si-double', 'si-square', 'si-diff']),
    }),
  }),
  secondaire: null,
});

const pickExamples = (all, ids) => (ids ? all.filter((example) => ids.includes(example.id)) : all);

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function algebraFeatures(capabilities) {
  const factor = capabilities?.factor ?? null;
  const functions = capabilities?.functions ?? null;

  return {
    sections: capabilities?.sections ?? ALGEBRA_SECTIONS,
    factor: {
      methods: factor?.methods ?? 'all',
      discriminant: factor?.discriminant !== false,
      examples: pickExamples(FACTOR_EXAMPLES, factor?.examples),
      rules: factor?.rules ?? ['commonFactorRule', 'diffSquares', 'perfectSquareSum', 'perfectSquareDiff', 'sumProductRule'],
      placeholder: factor?.placeholder ?? 'x^2 + 5x + 6',
    },
    functions: {
      families: functions?.families ?? FUNCTION_FAMILIES,
      examples: pickExamples(FUNCTION_EXAMPLES, functions?.examples),
    },
    simplify: {
      examples: pickExamples(SIMPLIFY_EXAMPLES, capabilities?.simplify?.examples),
    },
  };
}

/**
 * Cette factorisation dépasse-t-elle les méthodes du collège ? Vrai quand le
 * moteur a dû chercher « deux nombres de somme b et de produit c », scinder
 * le terme du milieu, ou conclure par le discriminant.
 */
export function isBeyondMoyenFactorization(result) {
  if (!result?.ok) return false;
  if (BEYOND_MOYEN_STATUSES.has(result.status)) return true;

  return (result.steps ?? []).some((step) => BEYOND_MOYEN_STEPS.has(step.kind));
}

/**
 * Un état ramené à ce que le scope montre : une section absente rouvre sur
 * « Équations », une famille de fonctions absente (le second degré au
 * collège) revient à l'affine. Le reste est GARDÉ.
 */
export function clampToFeatures(data, features) {
  let next = data;
  if (!features.sections.includes(next.section)) next = { ...next, section: features.sections[0] };
  if (!features.functions.families.includes(next.functions?.family)) {
    next = { ...next, functions: { ...next.functions, family: features.functions.families.includes('affine') ? 'affine' : features.functions.families[0] } };
  }

  return next;
}


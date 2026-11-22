/**
 * LE MODÈLE : une spécification ENREGISTRÉE (`SequenceSpec`, du JSON) devient
 * une suite VIVANTE (une définition, des termes, des lectures).
 *
 * C'est la charnière entre `sequenceState.js` (ce qu'on stocke) et
 * `sequenceMath.js` (ce qu'on calcule). Elle existe pour une raison précise :
 * une définition contient des FONCTIONS (la règle compilée), et une fonction
 * ne se sérialise pas. Le document ne garde donc que le TEXTE de la règle, et
 * ce module la recompile — une fois par changement, jamais par rendu.
 *
 * Tout ce que l'interface affiche sort d'ici, et rien ne se calcule dans le
 * JSX (§46, §48) : un seul `buildModel` mémorisé par le composant, et tous
 * les panneaux lisent son résultat.
 */

import {
  generate, differences, secondDifferences, ratios, partialSums, subsequence,
  observedRange, fixedPoints, analyseTrend, closedForm, cobwebPath, stepFunctionOf,
  isFirstOrder, isRecursive, affineCoefficients, termAt,
} from './sequenceMath.js';
import { compileSequenceExpression } from './sequenceExpression.js';

/**
 * Une spécification → une définition exploitable par `sequenceMath`.
 *
 * @returns {{ ok: true, definition: object } | { ok: false, error: object }}
 *   L'erreur porte `field` ('explicitSource' | 'ruleSource') pour que
 *   l'interface souligne LE champ fautif, et `code` pour la phrase (§32).
 */
export function buildDefinition(spec) {
  if (!spec) return { ok: false, error: { code: 'invalidRule', field: 'ruleSource' } };

  const common = { kind: spec.kind, startIndex: spec.startIndex };

  switch (spec.kind) {
    case 'arithmetic':
      return { ok: true, definition: { ...common, initial: [spec.first], difference: spec.difference } };
    case 'geometric':
      return { ok: true, definition: { ...common, initial: [spec.first], ratio: spec.ratio } };
    case 'affine':
      return { ok: true, definition: { ...common, initial: [spec.first], a: spec.a, b: spec.b } };
    case 'explicit': {
      const compiled = compileSequenceExpression(spec.explicitSource, { explicit: true });
      if (!compiled.ok) return { ok: false, error: { ...compiled.error, field: 'explicitSource' } };

      return { ok: true, definition: { ...common, initial: [], explicit: compiled.evaluate } };
    }
    case 'recurrence': {
      const compiled = compileSequenceExpression(spec.ruleSource, { order: 1 });
      if (!compiled.ok) return { ok: false, error: { ...compiled.error, field: 'ruleSource' } };

      return { ok: true, definition: { ...common, initial: [spec.first], step: compiled.evaluate } };
    }
    case 'secondOrder': {
      // Le second ordre a DEUX écritures : paramétrique (a·u(n+1) + b·u(n),
      // ce qui couvre Fibonacci) ou libre. On prend la paramétrique, parce
      // que c'est elle que §3 nomme et que Fibonacci en est un cas (a = b = 1).
      return {
        ok: true,
        definition: { ...common, initial: [spec.first, spec.second], a: spec.a, b: spec.b },
      };
    }
    default:
      return { ok: false, error: { code: 'invalidRule', field: 'ruleSource' } };
  }
}

/**
 * TOUT ce que l'interface lit, calculé une fois.
 *
 * @param {object} data     l'état du document (sequenceState.js)
 * @returns {object} le modèle : définition, termes, lectures, tendance, erreurs
 */
export function buildModel(data) {
  const built = buildDefinition(data.primary);
  const definition = built.ok ? built.definition : null;
  const error = built.ok ? null : built.error;

  const run = definition ? generate(definition, data.count) : { terms: [], startIndex: data.primary.startIndex, stopped: null };
  const terms = run.terms;

  // Les lectures ne sont calculées que si leur couche est allumée : inutile
  // de sommer cinq cents termes pour un panneau fermé (§48).
  const { layers } = data;
  const deltas = layers.differences || layers.table ? differences(terms) : [];
  const secondDeltas = layers.secondDifferences ? secondDifferences(terms) : [];
  const quotients = layers.ratios || layers.table ? ratios(terms) : [];
  const sums = layers.sums ? partialSums(terms) : [];
  const even = layers.evenOdd ? subsequence(terms, 'even') : [];
  const odd = layers.evenOdd ? subsequence(terms, 'odd') : [];
  const range = layers.bounds ? observedRange(terms) : null;

  const step = definition ? stepFunctionOf(definition) : null;
  const fixed = layers.cobweb || layers.fixedPoints
    ? fixedPoints(definition, cobwebWindow(terms))
    : { points: [], exact: true };
  const cobweb = layers.cobweb ? cobwebPath(definition, terms) : [];

  const trend = definition ? analyseTrend(definition, terms) : null;
  const closed = closedForm(definition);

  // La comparaison (§33)
  const secondary = data.secondary ? buildDefinition(data.secondary) : null;
  const secondaryRun = secondary?.ok ? generate(secondary.definition, data.count) : null;

  const cursorTerm = terms.find((term) => term.n === data.cursor) ?? null;
  const previousTerm = terms.find((term) => term.n === data.cursor - 1) ?? null;

  return {
    definition,
    error,
    terms,
    stopped: run.stopped,
    deltas,
    secondDeltas,
    quotients,
    sums,
    even,
    odd,
    range,
    step,
    fixed,
    cobweb,
    trend,
    closed,
    affine: definition ? affineCoefficients(definition) : null,
    firstOrder: definition ? isFirstOrder(definition.kind) : false,
    recursive: definition ? isRecursive(definition.kind) : false,
    secondaryTerms: secondaryRun?.terms ?? [],
    secondaryError: secondary && !secondary.ok ? secondary.error : null,
    cursorTerm,
    previousTerm,
    lastIndex: data.primary.startIndex + data.count - 1,
  };
}

/**
 * La fenêtre sur laquelle on cherche les points fixes et où l'on trace la
 * toile : celle des termes observés, élargie.
 *
 * Chercher sur [−50, 50] quand la suite vit entre 0 et 1 ne trouverait rien
 * d'utile (400 échantillons sur 100 unités = un pas de 0,25 : on saute
 * par-dessus tout ce qui se passe dans [0, 1]). La fenêtre suit donc les
 * termes — c'est aussi ce que l'élève regarde.
 */
function cobwebWindow(terms) {
  if (!terms.length) return { min: -10, max: 10 };
  const values = terms.map((term) => term.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(high - low, 1);

  return { min: low - span * 0.5, max: high + span * 0.5 };
}

/**
 * Le PLAFOND de cadrage : la valeur au-delà de laquelle un terme est traité
 * comme aberrant et laissé hors du cadre (§19).
 *
 * ── Pourquoi un quantile ne suffit pas ───────────────────────────────────
 * Prendre « le 90ᵉ centile » par `sorted[floor(0.9·n)]` marche sur cinquante
 * termes et échoue sur quatre : avec 1, 2, 4, 10⁹, l'indice tombe sur 10⁹
 * lui-même, le plafond devient 1,6·10⁹, rien n'est écarté et le graphe montre
 * trois points collés à l'axe sous un point perdu en haut — précisément ce
 * que §19 interdit.
 *
 * La MÉDIANE, elle, ne se laisse pas tirer par les valeurs extrêmes quel que
 * soit le nombre de termes. On cadre donc sur un multiple de la médiane des
 * valeurs absolues, en gardant au moins de quoi montrer une croissance
 * franche (le facteur 8 laisse voir 1, 2, 4, 8, 16 sans rien couper).
 */
function framingCap(values) {
  const magnitudes = values.map(Math.abs).sort((left, right) => left - right);
  if (!magnitudes.length) return 1;
  const middle = magnitudes.length >> 1;
  const median = magnitudes.length % 2
    ? magnitudes[middle]
    : (magnitudes[middle - 1] + magnitudes[middle]) / 2;
  const largest = magnitudes[magnitudes.length - 1];
  // Une médiane nulle (une suite qui part de 0) ne doit pas donner un
  // plafond nul : on retombe alors sur le plus grand terme.
  const cap = median > 0 ? median * 8 : largest;

  return Math.max(cap, 1e-9);
}

/**
 * Un terme lointain, pour l'exploration de §12. Séparé de `buildModel` parce
 * qu'il coûte cher (jusqu'à cent mille itérations) et ne doit se recalculer
 * que quand l'élève le demande, pas à chaque rendu.
 */
export function probeTerm(data, index) {
  const built = buildDefinition(data.primary);
  if (!built.ok) return { ok: false, n: index, reason: built.error.code };

  return termAt(built.definition, index);
}

/**
 * La fenêtre du GRAPHE qui montre la suite entière (§19 « sensible automatic
 * scaling », « do not allow the graph to become unusable when one term is
 * very large »).
 *
 * Deux protections, et la seconde est celle qui compte :
 *
 *  1. On cadre sur les valeurs observées, avec une marge, jamais sur zéro
 *     seul (une suite constante à 1000 doit se voir).
 *  2. **On ignore les valeurs aberrantes.** Une suite qui vaut 1, 2, 4, 8…
 *     puis 2^40 ferait, cadrée sur son maximum, quarante termes écrasés sur
 *     l'axe et un point tout en haut : un graphe vrai et illisible. On cadre
 *     donc sur un QUANTILE (le 90ᵉ centile en valeur absolue) et on laisse
 *     les géants sortir du cadre — c'est ce que §19 demande littéralement.
 */
export function fitViewToTerms(terms, startIndex, count) {
  const xMin = startIndex - 0.5;
  const xMax = startIndex + Math.max(count, 2) - 0.5;
  if (!terms.length) return { xMin, xMax, yMin: -5, yMax: 5 };

  const values = terms.map((term) => term.value);
  const cap = framingCap(values);
  const kept = values.filter((value) => Math.abs(value) <= cap);
  const pool = kept.length ? kept : values;
  let low = Math.min(...pool, 0);
  let high = Math.max(...pool, 0);
  if (high - low < 1e-9) { low -= 1; high += 1; }
  const margin = (high - low) * 0.15;

  return { xMin, xMax, yMin: low - margin, yMax: high + margin };
}

/**
 * La fenêtre de la TOILE (§9) : carrée, parce qu'on y lit y = x. Une toile
 * dont les axes n'ont pas la même échelle ne montre plus la diagonale à 45°,
 * et le report « vertical puis horizontal » devient illisible.
 */
export function fitCobwebView(terms, fixedList = [], path = []) {
  const values = terms.map((term) => term.value);
  // Le chemin monte jusqu'à f(u₀), qui peut dépasser tous les termes : partir
  // des seuls termes coupait le premier trait vertical en haut du cadre (vu
  // en QA visuelle sur le préréglage du point fixe). On cadre donc sur ce
  // qu'on DESSINE, chemin compris.
  const pathValues = path.flatMap((point) => [point.x, point.y]);
  const all = [...values, ...fixedList, ...pathValues].filter(Number.isFinite);
  if (!all.length) return { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
  const cap = framingCap(all);
  const kept = all.filter((value) => Math.abs(value) <= cap);
  const pool = kept.length ? kept : all;
  let low = Math.min(...pool);
  let high = Math.max(...pool);
  if (high - low < 1e-9) { low -= 1; high += 1; }
  const margin = (high - low) * 0.2;

  return { xMin: low - margin, xMax: high + margin, yMin: low - margin, yMax: high + margin };
}

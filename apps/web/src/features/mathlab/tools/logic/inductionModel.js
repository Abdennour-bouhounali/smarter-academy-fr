/**
 * LE MODÈLE D'UN EXERCICE DE RÉCURRENCE — plusieurs suites, une proposition.
 *
 * L'ancien escalier (`inductionLab.js`) ne savait qu'une chose : « l'élève
 * écrit uₙ = 2n+1, on compare à une table de valeurs attendues ». Les vrais
 * exercices du BAC algérien n'ont pas cette forme. Ils ressemblent à :
 *
 *     u₀ = −1      uₙ₊₁ = ⅓uₙ + 2      démontrer que  uₙ < 3
 *
 * ou, avec une suite auxiliaire :
 *
 *     u₀ = −⅔   uₙ₊₁ = ¾uₙ − ½   v₀ = 4/3   vₙ₊₁ = ¾vₙ   wₙ = uₙ − vₙ
 *     démontrer que  wₙ = −2
 *
 * Trois choses manquaient donc, et ce module les apporte :
 *
 *   1. une PROPOSITION est `gauche RELATION droite`, pas une formule ;
 *   2. une suite peut être RÉCURRENTE, pas seulement explicite ;
 *   3. il peut y en avoir PLUSIEURS, dont certaines DÉRIVÉES des autres.
 *
 * ── On n'écrit toujours PAS un second analyseur ──────────────────────────
 * `sequenceExpression.js` (donc l'analyseur du grapheur) reste le seul
 * lecteur d'expressions de la plateforme. Ce module ne fait qu'appeler
 * `parseExpression` avec d'AUTRES variables liées — `u`, `v`, `w`, `n` au
 * lieu de `u`, `n` — exactement comme les متتاليات l'appellent avec `n` au
 * lieu de `x`. Toujours aucun `eval`, aucun `new Function` : la saisie de
 * l'élève devient un arbre, jamais du JavaScript exécuté.
 *
 * ── Ce que ce module ne fait pas ─────────────────────────────────────────
 * Il ne DÉMONTRE rien. Il calcule des valeurs et compare. Le passage de
 * P(n) à P(n+1) est traité par `inductionStep.js`, en substitutions
 * STRUCTURÉES et vérifiées numériquement — jamais par un prouveur
 * symbolique qu'on n'a pas.
 */

import { parseExpression } from '../functionGrapher/expressionParser.js';
import { compileExpression } from '../functionGrapher/expressionEvaluator.js';
import { parseNumberInput } from '../sequences/sequenceExpression.js';

/** Les noms de suites qu'un exercice peut définir. Latins, comme au tableau. */
export const SEQUENCE_NAMES = Object.freeze(['u', 'v', 'w', 't']);

/** Les relations d'une proposition (§7). */
export const RELATIONS = Object.freeze(['=', '≠', '<', '>', '≤', '≥']);

/**
 * La tolérance des comparaisons. Une récurrence affine passe par des
 * divisions (⅓, ¾) : `u₃ = 2.9999999999999996 < 3` doit rester vrai, et
 * `w₅ = −2.0000000000000004 = −2` aussi.
 */
const TOLERANCE = 1e-9;

/** Au-delà, un nombre n'est plus exact et une comparaison serait une loterie. */
const OVERFLOW_LIMIT = 1e12;

/** Combien de termes on accepte de dérouler pour atteindre un rang. */
const MAX_ITERATIONS = 2000;

/**
 * Pourquoi un calcul n'a pas abouti. Ce sont des clés i18n : ce module ne
 * formule jamais de phrase, et surtout jamais « NaN » (§17).
 */
export const FAILURES = Object.freeze([
  'undefined',    // NaN : division par zéro, √négatif…
  'overflow',     // la suite explose
  'invalidRule',  // la règle ne se lit pas
  'iterationCap', // le rang demandé est trop loin
  'cycle',        // wₙ = uₙ et uₙ = wₙ : une dépendance circulaire
  'missing',      // la proposition parle d'une suite que l'exercice ne définit pas
]);

/* ── 1. COMPILER ───────────────────────────────────────────────────────── */

/**
 * Ramène les écritures du cahier à des variables simples, pour N noms de
 * suites au lieu du seul `u` de `sequenceExpression.normalizeSource`.
 *
 * `uₙ`, `u_n`, `u(n)` → `u` ;  `uₙ₊₁`, `u_{n+1}`, `u(n+1)` → `U`.
 *
 * ── Pourquoi une MAJUSCULE et pas `u_next` ──────────────────────────────
 * L'analyseur du grapheur ne lit que des variables d'UN SEUL caractère
 * (`variableSet.has(ch)` dans son `tokenize`). C'est sa grammaire, et on ne
 * la modifie pas pour un seul appelant : `sequenceExpression.js` fait déjà
 * exactement cela au second ordre, où `u` est u(n+1) et `v` est u(n). On
 * suit la même convention — le rang suivant de `u` est `U` — et le nom
 * n'est de toute façon jamais montré : l'élève lit « uₙ₊₁ », toujours.
 *
 * L'ordre compte : `u(n+1)` doit être remplacé AVANT `u(n)`, sinon la règle
 * de `u(n)` mangerait son préfixe et laisserait un `+1)` orphelin.
 */
export const nextRankName = (name) => String(name).toUpperCase();

export function normalizeProposition(source, names = SEQUENCE_NAMES) {
  let text = String(source ?? '')
    .replace(/\\left\s*\(/g, '(')
    .replace(/\\right\s*\)/g, ')')
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\cdot|\\times/g, '×')
    .replace(/[−–—]/g, '-')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

  for (const name of names) {
    const n = escapeName(name);
    // Le rang suivant, d'abord.
    const next = nextRankName(name);
    text = text
      .replace(new RegExp(`${n}ₙ₊₁`, 'g'), next)
      .replace(new RegExp(`${n}_\\{?\\s*n\\s*\\+\\s*1\\s*\\}?`, 'g'), next)
      .replace(new RegExp(`${n}\\s*\\(\\s*n\\s*\\+\\s*1\\s*\\)`, 'g'), next);
    // Puis le rang courant.
    text = text
      .replace(new RegExp(`${n}ₙ`, 'g'), name)
      .replace(new RegExp(`${n}_\\{?\\s*n\\s*\\}?`, 'g'), name)
      .replace(new RegExp(`${n}\\s*\\(\\s*n\\s*\\)`, 'g'), name);
  }

  return text.trim();
}

function escapeName(name) {
  return String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compile une expression qui peut parler de plusieurs suites et de `n`.
 *
 * @param {string} source
 * @param {string[]} bound  les variables liées — les suites disponibles + `n`
 * @returns {{ok: true, evaluate: (scope: object) => number, source: string, uses: string[]}
 *          | {ok: false, error: {code: string, position?: number, symbol?: string}}}
 *
 * `evaluate(scope)` ne lève JAMAIS et rend `NaN` hors domaine : c'est déjà
 * le contrat de l'évaluateur du grapheur.
 */
export function compileTerm(source, bound = [...SEQUENCE_NAMES, 'n']) {
  const cleaned = normalizeProposition(source, bound.filter((name) => name !== 'n'));
  if (!cleaned) return { ok: false, error: { code: 'empty', position: 0 } };

  // On lie aussi le rang suivant de chaque suite : la règle d'une hérédité
  // s'y réfère (« uₙ₊₁ = ¾uₙ − ½ »).
  const variables = [...new Set([
    ...bound,
    ...bound.filter((name) => name !== 'n').map(nextRankName),
  ])];

  const parsed = parseExpression(cleaned, { variables });
  if (!parsed.ok) return { ok: false, error: parsed.error };

  let compiled;
  try {
    compiled = compileExpression(parsed.ast);
  } catch {
    return { ok: false, error: { code: 'syntax', position: 0 } };
  }

  return {
    ok: true,
    source: cleaned,
    uses: variables.filter((name) => mentions(cleaned, name)),
    evaluate: (scope) => {
      try {
        const value = compiled(0, scope ?? {});

        return typeof value === 'number' ? value : NaN;
      } catch {
        return NaN;
      }
    },
  };
}

/** Le texte parle-t-il de cette variable ? (mot entier, pas un préfixe) */
function mentions(text, name) {
  return new RegExp(`(^|[^A-Za-z_])${escapeName(name)}($|[^A-Za-z_0-9])`).test(text);
}

/* ── 2. LES SUITES D'UN EXERCICE ───────────────────────────────────────── */

/**
 * @typedef {object} SequenceSpec
 * @property {string} name          'u', 'v', 'w'…
 * @property {'recurrence'|'explicit'|'derived'} kind
 * @property {number} [startIndex]  le rang du premier terme (0 ou 1)
 * @property {number|string} [initial]  u₀ — un nombre ou `-2/3`
 * @property {string} [rule]        `1/3*u + 2` (récurrente) ou `2n+1` (explicite)
 *                                  ou `u - v` (dérivée)
 */

/**
 * Construit le CONTEXTE d'un exercice : toutes ses suites compilées, dans un
 * ordre d'évaluation qui respecte les dépendances.
 *
 * @returns {{ok: true, context: object} | {ok: false, error: {code, name?}}}
 */
export function buildContext(specs) {
  const list = Array.isArray(specs) ? specs : [];
  if (list.length === 0) return { ok: false, error: { code: 'missing' } };

  const names = list.map((spec) => spec.name);
  const bound = [...new Set([...names, 'n'])];
  const compiled = new Map();

  for (const spec of list) {
    const entry = compileSpec(spec, bound);
    if (!entry.ok) return { ok: false, error: { ...entry.error, name: spec.name } };
    compiled.set(spec.name, entry.value);
  }

  // §10 — l'ordre des dérivées. `w = u − v` doit être évalué APRÈS u et v.
  const order = topologicalOrder(compiled);
  if (!order.ok) return { ok: false, error: { code: 'cycle', name: order.name } };

  return {
    ok: true,
    context: {
      names,
      sequences: compiled,
      order: order.value,
      /** Le cache : `${name}:${n}` → un résultat. Vidé avec le contexte. */
      cache: new Map(),
    },
  };
}

function compileSpec(spec, bound) {
  const name = spec?.name;
  if (!name) return { ok: false, error: { code: 'invalidRule' } };

  const startIndex = Number.isFinite(spec.startIndex) ? Math.floor(spec.startIndex) : 0;

  if (spec.kind === 'derived') {
    const rule = compileTerm(spec.rule, bound);
    if (!rule.ok) return { ok: false, error: rule.error };

    return {
      ok: true,
      value: {
        name, kind: 'derived', startIndex, rule,
        // Une dérivée dépend des suites que sa règle NOMME.
        dependsOn: rule.uses.filter((u) => u !== 'n' && u !== name),
      },
    };
  }

  if (spec.kind === 'explicit') {
    const rule = compileTerm(spec.rule, bound);
    if (!rule.ok) return { ok: false, error: rule.error };

    return { ok: true, value: { name, kind: 'explicit', startIndex, rule, dependsOn: [] } };
  }

  // Récurrente : uₙ₊₁ = f(uₙ, n). La règle peut nommer d'autres suites.
  const initial = readNumber(spec.initial);
  if (!Number.isFinite(initial)) return { ok: false, error: { code: 'invalidRule' } };
  const rule = compileTerm(spec.rule, bound);
  if (!rule.ok) return { ok: false, error: rule.error };

  return {
    ok: true,
    value: {
      ok: true, name, kind: 'recurrence', startIndex, initial, rule,
      dependsOn: rule.uses.filter((u) => u !== 'n' && u !== name),
    },
  };
}

/** Un nombre écrit par un élève ou par un exercice : `-2/3`, `1,5`, `4`. */
export function readNumber(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;

  return parseNumberInput(raw);
}

/**
 * L'ordre d'évaluation (§10). Une dérivée passe après ce dont elle dépend ;
 * une dépendance circulaire est REFUSÉE plutôt que de boucler sans fin.
 */
function topologicalOrder(compiled) {
  const order = [];
  const state = new Map(); // name → 'visiting' | 'done'

  function visit(name) {
    if (state.get(name) === 'done') return null;
    if (state.get(name) === 'visiting') return name; // un cycle
    const entry = compiled.get(name);
    if (!entry) return null; // une suite inconnue : traitée à l'évaluation
    state.set(name, 'visiting');
    for (const dependency of entry.dependsOn) {
      const cycle = visit(dependency);
      if (cycle) return cycle;
    }
    state.set(name, 'done');
    order.push(name);

    return null;
  }

  for (const name of compiled.keys()) {
    const cycle = visit(name);
    if (cycle) return { ok: false, name: cycle };
  }

  return { ok: true, value: order };
}

/* ── 3. ÉVALUER ────────────────────────────────────────────────────────── */

/**
 * La valeur d'une suite à un rang, avec les dépendances résolues (§9, §11).
 *
 * @returns {{ok: true, value: number, trace: object[]} | {ok: false, reason: string, name: string, n: number}}
 *
 * `trace` est ce qui permet d'AFFICHER le calcul (§22) : chaque étape porte
 * le rang, la valeur, et d'où elle vient.
 */
export function valueAt(context, name, n, seen = new Set()) {
  if (!context) return fail('invalidRule', name, n);
  const target = Math.floor(n);
  const key = `${name}:${target}`;
  if (context.cache.has(key)) return context.cache.get(key);

  // Une dépendance circulaire que l'ordre topologique n'aurait pas vue.
  if (seen.has(key)) return fail('cycle', name, target);

  const entry = context.sequences.get(name);
  if (!entry) return fail('missing', name, target);
  if (target < entry.startIndex) return fail('invalidRule', name, target);

  const next = new Set(seen).add(key);
  const result = computeValue(context, entry, target, next);
  context.cache.set(key, result);

  return result;
}

function computeValue(context, entry, target, seen) {
  const { name } = entry;

  if (entry.kind === 'derived') {
    // wₙ = uₙ − vₙ : on résout d'abord uₙ et vₙ.
    const scope = { n: target };
    for (const dependency of entry.dependsOn) {
      const resolved = valueAt(context, dependency, target, seen);
      if (!resolved.ok) return resolved;
      scope[dependency] = resolved.value;
    }
    const value = entry.rule.evaluate(scope);
    const checked = guard(value, name, target);
    if (!checked.ok) return checked;

    return {
      ok: true,
      value: checked.value,
      trace: [{ name, n: target, value: checked.value, from: 'derived', parts: { ...scope } }],
    };
  }

  if (entry.kind === 'explicit') {
    const scope = { n: target };
    for (const dependency of entry.dependsOn) {
      const resolved = valueAt(context, dependency, target, seen);
      if (!resolved.ok) return resolved;
      scope[dependency] = resolved.value;
    }
    const checked = guard(entry.rule.evaluate(scope), name, target);
    if (!checked.ok) return checked;

    return { ok: true, value: checked.value, trace: [{ name, n: target, value: checked.value, from: 'explicit' }] };
  }

  // ── Récurrente : on déroule depuis le premier rang, en mémoïsant (§11).
  const steps = target - entry.startIndex;
  if (steps > MAX_ITERATIONS) return fail('iterationCap', name, target);

  const trace = [];
  let current = entry.initial;
  let index = entry.startIndex;
  trace.push({ name, n: index, value: current, from: 'initial' });
  context.cache.set(`${name}:${index}`, { ok: true, value: current, trace: [trace[0]] });

  while (index < target) {
    // Le scope du pas : la suite elle-même au rang courant, `n` au rang
    // courant, et les autres suites dont la règle parle.
    const scope = { [name]: current, n: index };
    for (const dependency of entry.dependsOn) {
      const resolved = valueAt(context, dependency, index, seen);
      if (!resolved.ok) return resolved;
      scope[dependency] = resolved.value;
    }
    const raw = entry.rule.evaluate(scope);
    index += 1;
    const checked = guard(raw, name, index);
    if (!checked.ok) return checked;
    current = checked.value;
    trace.push({ name, n: index, value: current, from: 'step', previous: scope[name] });
    context.cache.set(`${name}:${index}`, { ok: true, value: current, trace: trace.slice() });
  }

  return { ok: true, value: current, trace };
}

/** Jamais `NaN`, jamais `Infinity`, jamais un entier inexact (§17). */
function guard(value, name, n) {
  if (!Number.isFinite(value)) return fail('undefined', name, n);
  if (Math.abs(value) > OVERFLOW_LIMIT) return fail('overflow', name, n);

  return { ok: true, value };
}

function fail(reason, name, n) {
  return { ok: false, reason, name, n };
}

/* ── 4. LA PROPOSITION ─────────────────────────────────────────────────── */

/**
 * @typedef {object} Proposition
 * @property {string} left      `u`, `w`, `u + v`
 * @property {string} relation  une de RELATIONS
 * @property {string} right     `3`, `-2`, `0`
 */

/**
 * Compile une proposition `gauche RELATION droite` (§7, §18).
 *
 * On ne traite PAS la chaîne comme une formule opaque : les deux membres
 * sont compilés séparément, ce qui permet d'afficher la valeur de chacun
 * dans le panneau de résultat.
 */
export function compileProposition(proposition, context) {
  const relation = proposition?.relation;
  if (!RELATIONS.includes(relation)) return { ok: false, error: { code: 'relation' } };

  // §31 — on compile contre TOUS les noms possibles, puis on vérifie que
  // l'exercice les définit. Compiler contre les seuls noms de l'exercice
  // ferait remonter « symbole inconnu » — un message d'analyseur — là où
  // l'élève doit lire « cet exercice ne définit pas vₙ » (§17).
  const bound = [...new Set([...SEQUENCE_NAMES, ...(context?.names ?? []), 'n'])];
  const left = compileTerm(proposition.left, bound);
  if (!left.ok) return { ok: false, error: { ...left.error, side: 'left' } };
  const right = compileTerm(proposition.right, bound);
  if (!right.ok) return { ok: false, error: { ...right.error, side: 'right' } };

  // §31 — une proposition qui parle d'une suite que l'exercice ne définit
  // pas n'est pas évaluable. On le dit AVANT le premier test.
  const used = [...left.uses, ...right.uses].filter((name) => name !== 'n');
  const unknown = used.find((name) => context && !context.sequences.has(name));
  if (unknown) return { ok: false, error: { code: 'missing', symbol: unknown } };

  return { ok: true, left, right, relation, uses: [...new Set(used)] };
}

/** Comparer deux nombres selon la relation, à la tolérance près. */
export function compare(left, relation, right) {
  const epsilon = TOLERANCE * Math.max(1, Math.abs(left), Math.abs(right));
  switch (relation) {
    case '=': return Math.abs(left - right) <= epsilon;
    case '≠': return Math.abs(left - right) > epsilon;
    case '<': return left < right - epsilon;
    case '>': return left > right + epsilon;
    case '≤': return left <= right + epsilon;
    case '≥': return left >= right - epsilon;
    default: return false;
  }
}

/**
 * ÉVALUER P(k) — le cœur de §4, §5, §6.
 *
 * @returns {{ok: true, holds: boolean, left: number, right: number, trace: object[]}
 *          | {ok: false, reason: string, name?: string, n?: number}}
 *
 * Rend toujours de quoi EXPLIQUER : les deux valeurs et la trace du calcul,
 * jamais un simple booléen (§22, §23).
 */
export function evaluateProposition(compiled, context, n) {
  if (!compiled?.ok) return { ok: false, reason: 'invalidRule', n };

  const scope = { n };
  const trace = [];

  for (const name of compiled.uses) {
    const resolved = valueAt(context, name, n);
    if (!resolved.ok) return resolved;
    scope[name] = resolved.value;
    trace.push(...resolved.trace.filter((row) => row.n === n));
  }

  const left = compiled.left.evaluate(scope);
  const right = compiled.right.evaluate(scope);
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return { ok: false, reason: 'undefined', n };
  }

  return {
    ok: true,
    holds: compare(left, compiled.relation, right),
    left,
    right,
    relation: compiled.relation,
    scope,
    trace,
  };
}

/** Vider le cache — après un changement de définition (§24). */
export function clearCache(context) {
  context?.cache?.clear();

  return context;
}

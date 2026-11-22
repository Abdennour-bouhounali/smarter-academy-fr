/**
 * LE MOTEUR DU SLLAM — l'escalier de la récurrence, côté mathématique.
 *
 * L'élève écrit une règle (`uₙ = 2n + 1`), la teste marche par marche, et
 * voit chaque marche verdir ou rougir. Ce module tient tout ce qui est
 * mathématique là-dedans, sans une ligne de React.
 *
 * ── On n'écrit PAS un second analyseur (§6, §7) ──────────────────────────
 * Il en existe un sur la plateforme : celui du grapheur, déjà réutilisé par
 * le مختبر المتتاليات via `sequenceExpression.js`. On l'appelle, exactement
 * comme les متتاليات l'appellent — mêmes variables (`n`), même grammaire,
 * mêmes codes d'erreur, même contrat « ne lève jamais, rend NaN hors
 * domaine », et surtout **aucun `eval`, aucun `new Function`** : la saisie
 * de l'élève devient un arbre, jamais du JavaScript exécuté.
 *
 * La conséquence, et c'est §7 : on ne prétend PAS savoir lire n'importe
 * quelle notation. `SUPPORTED_GRAMMAR` dit ce que le moteur accepte
 * vraiment — il est construit en INTERROGEANT le moteur (`grammarProbe`),
 * pas en recopiant une liste à la main qui dériverait au premier
 * changement du grapheur.
 *
 * ── Tester n'est pas prouver (§20) ───────────────────────────────────────
 * C'est la raison d'être de tout l'écran. `climbVerdict` ne rend jamais
 * « prouvé » : il rend `experimental` quand les marches testées passent, et
 * l'interface enchaîne sur « il reste à démontrer le passage de n à n+1 ».
 * La même honnêteté que `searchVerdict` pour les quantificateurs (§5n.5).
 */

import { compileSequenceExpression } from '../sequences/sequenceExpression.js';

/** Combien de marches un escalier montre au plus. Au-delà, on ne LIT plus rien. */
export const MAX_STEPS = 8;
export const MIN_STEPS = 3;

/**
 * La tolérance d'une comparaison. Les suites du programme sont entières,
 * mais `n(n+1)/2` passe par une division et `2^n` par une puissance : une
 * comparaison stricte sur des flottants refuserait une règle juste.
 */
const TOLERANCE = 1e-9;

/**
 * Compile la règle de l'élève.
 *
 * @returns {{ok: true, evaluate: (n:number)=>number, source: string}
 *          | {ok: false, error: {code: string, position?: number, symbol?: string}}}
 */
export function compileRule(source) {
  return compileSequenceExpression(source, { explicit: true });
}

/**
 * Évalue une règle en n, en refusant tout ce qu'un élève ne doit jamais
 * voir : `NaN`, `Infinity`, `undefined` (§29).
 *
 * @returns {{ok: true, value: number} | {ok: false, reason: 'undefined'|'overflow'}}
 */
export function evaluateAt(rule, n) {
  if (!rule?.ok) return { ok: false, reason: 'undefined' };
  const value = rule.evaluate(n);
  if (!Number.isFinite(value)) return { ok: false, reason: 'undefined' };
  // Au-delà de 2^53 les entiers ne sont plus exacts : une comparaison y
  // deviendrait une loterie. On le dit plutôt que de comparer au hasard.
  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) return { ok: false, reason: 'overflow' };

  return { ok: true, value };
}

/** Deux valeurs sont-elles la même, à la tolérance près ? */
export function sameValue(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (a === b) return true;

  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Le VERDICT d'une marche : ce que la règle donne, ce que la suite attend,
 * et si les deux coïncident. Rend toujours de quoi EXPLIQUER (§18) :
 * l'appelant a la valeur obtenue et la valeur attendue, jamais un simple
 * booléen.
 */
export function testStep(rule, step) {
  const evaluation = evaluateAt(rule, step.n);
  if (!evaluation.ok) {
    return { status: 'incorrect', n: step.n, expected: step.expected, actual: null, reason: evaluation.reason };
  }

  const correct = sameValue(evaluation.value, step.expected);

  return {
    status: correct ? 'correct' : 'incorrect',
    n: step.n,
    expected: step.expected,
    actual: evaluation.value,
    reason: correct ? null : 'mismatch',
  };
}

/**
 * Les marches d'un escalier, à partir d'une suite ATTENDUE.
 *
 * `expectedOf` est la vérité de l'exercice (une fonction, jamais la règle de
 * l'élève) : c'est ce que le laboratoire compare. Les deux ne doivent
 * évidemment pas venir de la même source, sinon tout serait toujours vert.
 */
export function buildSteps(expectedOf, { from = 1, count = 6 } = {}) {
  const total = Math.min(MAX_STEPS, Math.max(MIN_STEPS, Math.floor(count)));
  const steps = [];
  for (let i = 0; i < total; i += 1) {
    const n = from + i;
    steps.push({ n, expected: expectedOf(n), status: 'untested', actual: null, reason: null });
  }

  return steps;
}

/**
 * §20 — ce qu'on a le DROIT de conclure d'une montée.
 *
 *   'idle'         rien n'a encore été testé ;
 *   'climbing'     des marches sont vertes, il en reste à tester ;
 *   'broken'       une marche est rouge — la règle est RÉFUTÉE, et là, un
 *                  seul contre-exemple suffit (§17) ;
 *   'experimental' toutes les marches testées passent. **Pas « prouvé ».**
 *
 * La distinction entre `broken` et `experimental` est la leçon entière :
 * une marche rouge démontre que la règle est fausse ; huit marches vertes ne
 * démontrent rien du tout.
 */
export function climbVerdict(steps) {
  if (steps.some((step) => step.status === 'incorrect')) return 'broken';
  const tested = steps.filter((step) => step.status === 'correct').length;
  if (tested === 0) return 'idle';

  return tested === steps.length ? 'experimental' : 'climbing';
}

/** Le résumé de §23 : combien de vertes, de rouges, de non testées. */
export function climbSummary(steps) {
  const correct = steps.filter((s) => s.status === 'correct').length;
  const incorrect = steps.filter((s) => s.status === 'incorrect').length;

  return {
    correct,
    incorrect,
    untested: steps.length - correct - incorrect,
    total: steps.length,
    ratio: steps.length === 0 ? 0 : correct / steps.length,
  };
}

/** L'indice de la prochaine marche à tester, ou `null` s'il n'en reste pas. */
export function nextUntested(steps, from = 0) {
  for (let i = Math.max(0, from); i < steps.length; i += 1) {
    if (steps[i].status === 'untested') return i;
  }

  return null;
}

/**
 * §15 — la règle a changé : les anciens verdicts ne lui appartiennent pas.
 *
 * Garder une marche verte obtenue avec `2n+1` alors que l'élève écrit
 * maintenant `2n` serait un mensonge visuel — et précisément sur le point
 * que l'écran enseigne. On remet donc tout à `untested`, et l'interface le
 * DIT au lieu de le faire en silence.
 */
export function resetSteps(steps) {
  return steps.map((step) => ({ ...step, status: 'untested', actual: null, reason: null }));
}

/**
 * §7 — LA GRAMMAIRE RÉELLEMENT SUPPORTÉE, mesurée sur le moteur.
 *
 * Chaque entrée est un exemple qu'on COMPILE et qu'on ÉVALUE au chargement
 * du module ; si le grapheur changeait et cessait d'accepter `n(n+1)/2`,
 * l'exemple disparaîtrait de la liste au lieu d'être proposé à un élève qui
 * recevrait ensuite une erreur. Une suggestion affichée est une suggestion
 * qui marche — c'est exactement ce que §9 exige.
 */
function grammarProbe(source) {
  const rule = compileRule(source);
  if (!rule.ok) return false;
  for (const n of [1, 2, 3]) {
    if (!evaluateAt(rule, n).ok) return false;
  }

  return true;
}

const CANDIDATE_EXAMPLES = Object.freeze([
  '2n + 1', 'n + 3', '3n - 2', 'n^2', 'n(n+1)/2', '2^n', '(n+1)^2', 'n^2 + n', '4n', 'n/2',
]);

/** Les exemples que l'interface propose : uniquement ceux qui s'évaluent. */
export const SUPPORTED_EXAMPLES = Object.freeze(CANDIDATE_EXAMPLES.filter(grammarProbe));

/**
 * Ce que la grammaire accepte, par famille. Les `probe` sont vérifiés au
 * chargement comme les exemples : ce tableau ne peut pas mentir.
 */
export const SUPPORTED_GRAMMAR = Object.freeze([
  { id: 'variable', probe: 'n', ok: grammarProbe('n') },
  { id: 'numbers', probe: '7', ok: grammarProbe('7') },
  { id: 'add', probe: 'n + 1', ok: grammarProbe('n + 1') },
  { id: 'subtract', probe: 'n - 1', ok: grammarProbe('n - 1') },
  { id: 'multiply', probe: '2 × n', ok: grammarProbe('2 × n') },
  { id: 'implicit', probe: '2n', ok: grammarProbe('2n') },
  { id: 'divide', probe: 'n / 2', ok: grammarProbe('n / 2') },
  { id: 'power', probe: 'n^2', ok: grammarProbe('n^2') },
  { id: 'parentheses', probe: '(n + 1) × 2', ok: grammarProbe('(n + 1) × 2') },
].filter((entry) => entry.ok));

/** Ce que la grammaire n'accepte PAS, et qu'on nomme plutôt que de le taire. */
export const UNSUPPORTED_NOTES = Object.freeze(['factorial', 'sum', 'recurrence']);

/**
 * §9 — des suggestions nées de la grammaire, pas d'une liste écrite à la main.
 *
 * On propose en priorité ce qui ressemble à ce que l'élève a tenté : s'il a
 * écrit quelque chose avec un carré, on remonte les exemples qui en ont un.
 */
export function suggestionsFor(source, limit = 4) {
  const text = String(source ?? '').toLowerCase();
  const wantsPower = /\^|²|³/.test(text);
  const wantsFraction = text.includes('/');

  const ranked = [...SUPPORTED_EXAMPLES].sort((a, b) => score(b) - score(a));

  function score(example) {
    let value = 0;
    if (wantsPower && /\^|²/.test(example)) value += 2;
    if (wantsFraction && example.includes('/')) value += 2;

    return value;
  }

  return ranked.slice(0, limit);
}

/**
 * Le BUILDER de §8 : une règle construite par boutons plutôt que tapée.
 *
 * Les jetons sont concaténés tels quels et relus par le MÊME compilateur —
 * il n'y a donc pas deux grammaires, et le builder ne peut pas produire une
 * expression que le moteur refuserait sans que l'élève le voie tout de suite.
 */
export const BUILDER_TOKENS = Object.freeze([
  { id: 'n', text: 'n', kind: 'variable' },
  { id: '1', text: '1', kind: 'number' },
  { id: '2', text: '2', kind: 'number' },
  { id: '3', text: '3', kind: 'number' },
  { id: '4', text: '4', kind: 'number' },
  { id: '5', text: '5', kind: 'number' },
  { id: 'plus', text: ' + ', kind: 'operator' },
  { id: 'minus', text: ' - ', kind: 'operator' },
  { id: 'times', text: ' × ', kind: 'operator' },
  { id: 'divide', text: ' / ', kind: 'operator' },
  { id: 'power', text: '^', kind: 'operator' },
  { id: 'open', text: '(', kind: 'group' },
  { id: 'close', text: ')', kind: 'group' },
]);

export function appendToken(source, tokenId) {
  const token = BUILDER_TOKENS.find((item) => item.id === tokenId);
  if (!token) return source;

  return `${source ?? ''}${token.text}`;
}

/** Retire le dernier jeton écrit — pas le dernier caractère (« ‏ + ‏ » fait trois). */
export function dropToken(source) {
  const text = String(source ?? '');
  if (!text) return '';
  for (const token of [...BUILDER_TOKENS].sort((a, b) => b.text.length - a.text.length)) {
    if (text.endsWith(token.text)) return text.slice(0, -token.text.length);
  }

  return text.slice(0, -1);
}

/**
 * L'ENTRAÎNEMENT « prédire → révéler → vérifier » du labo d’analyse
 * (§28 – §31, §43).
 *
 * Le cahier des charges fixe ce que ce module doit être ET ce qu'il ne doit
 * jamais devenir :
 *   §28 « Do not punish wrong predictions »
 *   §31 « Never immediately reveal the answer » — trois indices, gradués
 *   §43 « Wrong answers should not block exploration »
 *
 * D'où quatre décisions qui traversent le fichier :
 *
 * 1. **Une réponse fausse ne ferme rien.** `checkAnswer` rend un verdict,
 *    jamais un verrou. Il n'existe aucun état « bloqué » dans ce module,
 *    donc il ne peut pas en arriver un. Le graphe reste manipulable derrière
 *    la question, et c'est souvent EN le manipulant qu'on trouve.
 * 2. **L'explication est CALCULÉE, pas rédigée.** On ne dit pas « faux » : on
 *    rend la valeur vraie et l'endroit du graphe où elle se lit, et
 *    l'interface l'y montre.
 * 3. **Les indices sont progressifs** (§31) : indice visuel, puis relation
 *    mathématique, puis guidage explicite — jamais la réponse.
 * 4. **Pas de score au-delà du nécessaire** : résolues et vues, rien d'autre.
 *
 * ── Le générateur ────────────────────────────────────────────────────────
 * On réutilise `makeRng` (mulberry32) de `lessons/common/stats/randomUtils.js`
 * comme les suites et les coniques, plutôt que d'écrire un générateur de plus.
 */

import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';
import { compileSource } from '../functionGrapher/expressionEvaluator.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { compileExpression } from '../functionGrapher/expressionEvaluator.js';
import { differentiate } from './symbolicDerivative.js';
import { printExpression } from './expressionPrinter.js';
import {
  averageRate, findRoots, definiteIntegral, riemannSum, twoSidedLimit,
} from './analysisMath.js';
import { MAX_RIEMANN_N } from './analysisState.js';

const KEY = 'tools.analysis.practice';

/** Les familles de défis de §30, dans son ordre. */
export const CHALLENGE_KINDS = Object.freeze([
  'averageRate',       // (f(b) − f(a))/(b − a) = ?           — programme du collège
  'horizontalTangent', // où la tangente est-elle horizontale ?
  'slopeSign',         // f′ > 0 ou f′ < 0 sur cet intervalle ?
  'readLimit',         // lim x→a f(x) ≈ ?
  'derivativeValue',   // f′(a) = ?
  'monotonic',         // sur quel intervalle f décroît-elle ?
  'riemannClose',      // combien de rectangles à gauche pour passer sous le seuil ?
  'rootCount',         // combien de solutions à f(x) = 0 ?
]);

/**
 * Un trinôme (x − r₁)(x − r₂) développé et ÉCRIT proprement.
 *
 * Écrire « x^2-4x+0 » ou « x^2+-3x » est une faute de forme qui devient une
 * faute de fond quand l'élève recopie l'énoncé : un terme nul ne s'écrit pas,
 * un coefficient 1 ne s'écrit pas. La QA a vu « x^2-4x+0 » sortir du
 * générateur.
 */
function quadraticFromRoots(root1, root2, leading = 1) {
  const sum = root1 + root2;
  const product = root1 * root2;
  // k(x − r₁)(x − r₂) = k·x² − k(r₁+r₂)·x + k·r₁r₂, avec k = ±1.
  const k = leading < 0 ? -1 : 1;
  const linear = -k * sum;
  const constant = k * product;
  let source = k < 0 ? '-x^2' : 'x^2';
  if (linear !== 0) source += `${linear > 0 ? '+' : '-'}${Math.abs(linear) === 1 ? '' : Math.abs(linear)}x`;
  if (constant !== 0) source += `${constant > 0 ? '+' : '-'}${Math.abs(constant)}`;

  return { source, sum, product, vertex: sum / 2, leading: k };
}

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];
const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const nonZero = (rng, max) => {
  const value = randomInt(rng, -max, max);

  return value === 0 ? max : value;
};

/** Une source → sa fonction et sa dérivée symbolique, ou null. */
function build(source) {
  const compiled = compileSource(source);
  if (!compiled.ok) return null;
  const parsed = parseExpression(source);
  const derivative = parsed.ok ? differentiate(parsed.ast) : null;

  return {
    source,
    fn: compiled.fn,
    derivative: derivative ? compileExpression(derivative) : null,
    derivativeSource: derivative ? printExpression(derivative) : null,
  };
}

/**
 * Fabrique un défi.
 *
 * Tous les défis ont la MÊME forme quelle que soit la famille : l'interface
 * n'a donc qu'un rendu et qu'une vérification à écrire.
 *
 * @param {number} seed
 * @param {{kinds?: string[], difficulty?: 'easy'|'normal'|'hard', level?: 'programme'|'all'}} [options]
 */
export function generateChallenge(seed, options = {}) {
  const rng = makeRng(Number.isFinite(seed) ? Math.floor(seed) : Date.now());
  // §37 : au niveau « programme », on ne pose que ce qui relève du collège —
  // le taux d'accroissement moyen sur une fonction affine.
  const pool = options.level === 'programme'
    ? ['averageRate']
    : (Array.isArray(options.kinds) && options.kinds.length
      ? options.kinds.filter((kind) => CHALLENGE_KINDS.includes(kind))
      : CHALLENGE_KINDS);
  const kind = pick(rng, pool.length ? pool : CHALLENGE_KINDS);
  const difficulty = ['easy', 'normal', 'hard'].includes(options.difficulty) ? options.difficulty : 'normal';

  switch (kind) {
    case 'averageRate': return averageRateChallenge(rng, difficulty);
    case 'horizontalTangent': return horizontalTangentChallenge(rng, difficulty);
    case 'slopeSign': return slopeSignChallenge(rng, difficulty);
    case 'readLimit': return readLimitChallenge(rng, difficulty);
    case 'derivativeValue': return derivativeValueChallenge(rng, difficulty);
    case 'monotonic': return monotonicChallenge(rng, difficulty);
    case 'riemannClose': return riemannChallenge(rng, difficulty);
    default: return rootCountChallenge(rng, difficulty);
  }
}

/**
 * §30 (programme du collège) : le taux d'accroissement moyen entre deux points.
 * Sur une fonction AFFINE, c'est le coefficient directeur — et il ne dépend
 * pas des points choisis, ce que l'élève découvre en changeant a et b.
 */
function averageRateChallenge(rng, difficulty) {
  const slope = nonZero(rng, difficulty === 'easy' ? 5 : 9);
  const intercept = randomInt(rng, -6, 6);
  const a = randomInt(rng, -4, 1);
  const b = a + randomInt(rng, 1, 4);
  const source = `${slope === 1 ? '' : slope === -1 ? '-' : slope}x${intercept === 0 ? '' : `${intercept > 0 ? '+' : '-'}${Math.abs(intercept)}`}`;
  const model = build(source);
  const rate = averageRate(model.fn, a, b);

  return {
    kind: 'averageRate',
    source,
    answerType: 'number',
    promptKey: `${KEY}.q.averageRate`,
    promptParams: { a, b },
    expected: rate.slope,
    tolerance: 1e-6,
    focus: { lab: 'secant', point: a, secondPoint: b },
    hintKeys: [`${KEY}.h.rateIsSlope`, `${KEY}.h.rateFormula`, `${KEY}.h.rateAffine`],
    explainKey: `${KEY}.e.averageRate`,
    explainParams: {
      a, b,
      fa: formatNumberForPrompt(rate.fa),
      fb: formatNumberForPrompt(rate.fb),
      slope: formatNumberForPrompt(rate.slope),
    },
  };
}

/** §30 : « Pour quelle valeur de x la tangente est-elle horizontale ? » sur f(x) = x² − 4x + 3. */
function horizontalTangentChallenge(rng, difficulty) {
  const root1 = randomInt(rng, -4, 2);
  const root2 = root1 + randomInt(rng, 2, difficulty === 'hard' ? 6 : 4);
  // (x − r₁)(x − r₂) = x² − (r₁+r₂)x + r₁r₂ : le sommet est en (r₁+r₂)/2.
  const { source, sum } = quadraticFromRoots(root1, root2);
  const model = build(source);

  return {
    kind: 'horizontalTangent',
    source,
    answerType: 'number',
    promptKey: `${KEY}.q.horizontalTangent`,
    promptParams: {},
    expected: sum / 2,
    tolerance: 0.05,
    focus: { lab: 'tangent', point: sum / 2 },
    derivativeSource: model.derivativeSource,
    hintKeys: [`${KEY}.h.tangentFlat`, `${KEY}.h.derivativeZero`, `${KEY}.h.solveDerivative`],
    explainKey: `${KEY}.e.horizontalTangent`,
    explainParams: { x: formatNumberForPrompt(sum / 2), derivative: model.derivativeSource ?? '' },
  };
}

/** §30 : la fonction croît-elle ou décroît-elle ici ? (§17, sans confondre f et f′) */
function slopeSignChallenge(rng) {
  const source = pick(rng, ['x^2-4x+3', 'x^3-3x', 'x^2', '4-x^2', 'x^3']);
  const model = build(source);
  const probe = Number((randomInt(rng, -20, 20) / 10).toFixed(1));
  const slope = model.derivative ? model.derivative(probe) : NaN;
  // Une pente trop proche de zéro rend la question ambiguë : on décale.
  const x = Math.abs(slope) < 0.3 ? probe + 0.9 : probe;
  const value = model.derivative ? model.derivative(x) : NaN;

  return {
    kind: 'slopeSign',
    source,
    answerType: 'choice',
    choices: ['increasing', 'decreasing'],
    promptKey: `${KEY}.q.slopeSign`,
    promptParams: { x: formatNumberForPrompt(x) },
    expected: value > 0 ? 'increasing' : 'decreasing',
    focus: { lab: 'derivative', point: x },
    hintKeys: [`${KEY}.h.lookAtCurve`, `${KEY}.h.signOfDerivative`, `${KEY}.h.tangentDirection`],
    explainKey: `${KEY}.e.slopeSign`,
    explainParams: { x: formatNumberForPrompt(x), value: formatNumberForPrompt(value) },
  };
}

/** §30 : « estimate lim x→2 f(x) using the graph ». */
function readLimitChallenge(rng) {
  const a = randomInt(rng, 1, 3);
  // Une expression à TROU : (x² − a²)/(x − a) se simplifie en x + a.
  const source = `\\frac{x^2-${a * a}}{x-${a}}`;
  const model = build(source);
  const limit = twoSidedLimit(model.fn, a);

  return {
    kind: 'readLimit',
    source,
    answerType: 'number',
    promptKey: `${KEY}.q.readLimit`,
    promptParams: { a },
    expected: 2 * a,
    tolerance: 0.15,
    focus: { lab: 'limit', limitPoint: a },
    hintKeys: [`${KEY}.h.approachBothSides`, `${KEY}.h.factorNumerator`, `${KEY}.h.simplifyThenSubstitute`],
    explainKey: `${KEY}.e.readLimit`,
    explainParams: { a, value: formatNumberForPrompt(2 * a), agree: limit.agree },
  };
}

/** §30 : f′(a) = ? — sur une fonction dont la dérivée est simple. */
function derivativeValueChallenge(rng, difficulty) {
  const coefficient = randomInt(rng, 1, difficulty === 'easy' ? 3 : 5);
  const power = difficulty === 'easy' ? 2 : pick(rng, [2, 2, 3]);
  const source = `${coefficient === 1 ? '' : coefficient}x^${power}`;
  const model = build(source);
  const x = randomInt(rng, 1, 4);

  return {
    kind: 'derivativeValue',
    source,
    answerType: 'number',
    promptKey: `${KEY}.q.derivativeValue`,
    promptParams: { x },
    expected: model.derivative(x),
    tolerance: 1e-6,
    focus: { lab: 'derivative', point: x },
    derivativeSource: model.derivativeSource,
    hintKeys: [`${KEY}.h.powerRule`, `${KEY}.h.writeDerivative`, `${KEY}.h.substituteX`],
    explainKey: `${KEY}.e.derivativeValue`,
    explainParams: {
      x, derivative: model.derivativeSource ?? '',
      value: formatNumberForPrompt(model.derivative(x)),
    },
  };
}

/**
 * §30 : « Find the interval where the function is decreasing. »
 *
 * Le SIGNE du coefficient de x² est tiré au hasard. Il valait toujours +1,
 * donc la bonne réponse était TOUJOURS « avant le sommet » : l'audit l'a vu
 * sur 2 400 défis, et un élève pouvait répondre sans regarder la courbe.
 * Pour k(x − r₁)(x − r₂), f′(x) = k(2x − r₁ − r₂) : négative avant le
 * sommet si k > 0, APRÈS le sommet si k < 0.
 */
function monotonicChallenge(rng) {
  const root1 = randomInt(rng, -3, 0);
  const root2 = root1 + randomInt(rng, 2, 4);
  const leading = rng() < 0.5 ? -1 : 1;
  const { source, vertex } = quadraticFromRoots(root1, root2, leading);
  const opensUp = leading > 0;

  return {
    kind: 'monotonic',
    source,
    answerType: 'choice',
    choices: ['beforeVertex', 'afterVertex'],
    promptKey: `${KEY}.q.monotonic`,
    promptParams: {},
    expected: opensUp ? 'beforeVertex' : 'afterVertex',
    focus: { lab: 'study', point: vertex },
    hintKeys: [`${KEY}.h.parabolaShape`, `${KEY}.h.vertexSplits`, `${KEY}.h.derivativeNegative`],
    explainKey: opensUp ? `${KEY}.e.monotonic` : `${KEY}.e.monotonicDown`,
    explainParams: { vertex: formatNumberForPrompt(vertex) },
  };
}

/**
 * §30 : « Adjust n until the Riemann approximation is sufficiently close. »
 *
 * Trois choses sont FIXÉES par l'énoncé, et le juge s'y tient :
 *   · les rectangles sont à GAUCHE (la question le dit, et « Montre-moi sur
 *     le graphique » règle le laboratoire en mode gauche) — l'énoncé ne le disait
 *     pas, et un élève en mode milieu lisait d'autres sommes ;
 *   · le seuil est celui qu'on AFFICHE (arrondi au millième) : on ne juge
 *     pas à 0,09428 une question qui dit 0,094 ;
 *   · n est libre (le curseur va de 1 en 1) : `expected` est le VRAI plus
 *     petit n, cherché de 1 en 1. Il était cherché parmi 2, 5, 10, 20, 50,
 *     100, et `n ≥ expected` refusait alors 12 à 19 pour √x sur [0 ; 1],
 *     où 12 suffit déjà.
 */
function riemannChallenge(rng) {
  const source = pick(rng, ['x^2', 'x^3', '\\sqrt{x}']);
  const model = build(source);
  const b = randomInt(rng, 1, 3);
  const exact = definiteIntegral(model.fn, 0, b);
  const threshold = Number((0.05 * Math.max(1, Math.abs(exact.value))).toFixed(3));
  const challengeShape = { source, riemann: { a: 0, b, mode: 'left' }, exactValue: exact.value, threshold };
  let answer = null;
  for (let n = 1; n <= MAX_RIEMANN_N && answer === null; n += 1) {
    if (riemannIsClose(challengeShape, n)) answer = n;
  }

  return {
    kind: 'riemannClose',
    source,
    answerType: 'threshold',
    promptKey: `${KEY}.q.riemannClose`,
    promptParams: { b, threshold: formatNumberForPrompt(threshold) },
    expected: answer,
    tolerance: 0,
    exactValue: exact.ok ? exact.value : null,
    threshold,
    riemann: challengeShape.riemann,
    bounds: { a: 0, b },
    focus: { lab: 'integral', bounds: { a: 0, b }, riemann: { mode: 'left', n: 1 } },
    hintKeys: [`${KEY}.h.narrowerRectangles`, `${KEY}.h.compareToExact`, `${KEY}.h.increaseUntilClose`],
    explainKey: `${KEY}.e.riemannClose`,
    explainParams: { n: answer, value: formatNumberForPrompt(exact.value ?? 0) },
  };
}

/** §30 : combien de solutions à f(x) = 0 ? (§27 : la lecture graphique d'abord) */
function rootCountChallenge(rng) {
  const source = pick(rng, ['x^2-4x+3', 'x^2+1', 'x^3-3x', 'x^2', '4-x^2']);
  const model = build(source);
  const roots = findRoots(model.fn, -8, 8);

  return {
    kind: 'rootCount',
    source,
    answerType: 'number',
    promptKey: `${KEY}.q.rootCount`,
    promptParams: {},
    expected: roots.length,
    tolerance: 0,
    focus: { lab: 'study' },
    hintKeys: [`${KEY}.h.rootsAreCrossings`, `${KEY}.h.countCrossings`, `${KEY}.h.touchCountsOnce`],
    explainKey: `${KEY}.e.rootCount`,
    explainParams: {
      count: roots.length,
      xs: roots.map((root) => formatNumberForPrompt(root.x)).join(' ; '),
    },
  };
}

/**
 * Le nombre tel qu'il doit APPARAÎTRE dans une question en français : virgule
 * décimale et vrai signe moins, comme partout ailleurs. On ne peut pas
 * appeler analysisFormat ici sans créer un cycle (practice ← format ←
 * grapheur) : la règle est courte, on la tient sur place.
 */
function formatNumberForPrompt(value) {
  if (!Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(3));

  return String(Math.abs(rounded) < 1e-12 ? 0 : rounded).replace('.', ',').replace('-', '−');
}

/**
 * n rectangles À GAUCHE approchent-ils ∫₀ᵇ f à moins du seuil ?
 *
 * La somme est celle du laboratoire (`riemannSum`), celle que l'élève voit.
 * `riemannSum` plafonne à 2 000 rectangles ; au-delà, on se sert de la borne
 * des fonctions MONOTONES — |S_n − I| ≤ |f(b) − f(a)|·(b − a)/n — et toutes
 * les fonctions de ce défi (x², x³, √x sur [0 ; b]) le sont.
 */
function riemannIsClose(challenge, n) {
  if (!Number.isInteger(n) || n < 1) return false;
  const { a, b, mode } = challenge.riemann ?? {};
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(challenge.exactValue)) return false;
  const compiled = compileSource(challenge.source);
  if (!compiled.ok) return false;
  if (n > 2000) {
    const bound = Math.abs(compiled.fn(b) - compiled.fn(a)) * Math.abs(b - a) / n;

    return bound < challenge.threshold;
  }
  const { sum } = riemannSum(compiled.fn, a, b, n, mode ?? 'left');

  return Math.abs(sum - challenge.exactValue) < challenge.threshold;
}

/**
 * Le VERDICT sur une réponse. Jamais un verrou (§43) : il dit juste,
 * et l'interface montre POURQUOI.
 *
 * @param {object} challenge
 * @param {string|number} answer
 * @returns {{correct: boolean, parsed: number|string|null, reason?: string}}
 */
export function checkAnswer(challenge, answer) {
  if (!challenge) return { correct: false, parsed: null, reason: 'empty' };

  if (challenge.answerType === 'choice') {
    const value = String(answer ?? '').trim();
    if (!value) return { correct: false, parsed: null, reason: 'empty' };

    return { correct: value === challenge.expected, parsed: value };
  }

  // « Écris une réponse d'abord » et « je n'ai pas compris » ne se disent pas
  // de la même façon : un champ vide n'est pas une erreur de l'élève.
  if (String(answer ?? '').trim() === '') return { correct: false, parsed: null, reason: 'empty' };

  const parsed = parseStudentNumber(answer);
  if (parsed === null) return { correct: false, parsed: null, reason: 'unparsed' };

  if (challenge.answerType === 'threshold') {
    /**
     * §30 : « adjust n until close enough » — TOUT n qui rapproche assez est
     * juste, pas seulement le minimal (§43). Et on le VÉRIFIE pour ce n-là :
     * « n ≥ minimal » supposait l'erreur décroissante en n, ce qu'aucun
     * théorème ne garantit pour une somme à gauche.
     */
    return { correct: riemannIsClose(challenge, parsed), parsed };
  }

  const tolerance = challenge.tolerance ?? 1e-6;

  return { correct: Math.abs(parsed - challenge.expected) <= tolerance, parsed };
}

/**
 * La saisie d'un élève → un nombre.
 *
 * Elle accepte la virgule décimale (« 2,5 »), le vrai signe moins (« −3 »),
 * les espaces, et une fraction simple (« 1/2 ») — ce qu'un élève
 * écrit vraiment. Rend null si ce n'est pas un nombre, JAMAIS NaN (qui se
 * comparerait silencieusement faux).
 */
function latinDigits(text) {
  return text
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0))
    .replace(/\u066B/g, '.');
}

export function parseStudentNumber(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  /**
   * Les chiffres ARABES-INDIENS (U+0660–U+0669, et leur variante persane
   * U+06F0–U+06F9) et la virgule décimale arabe (U+066B) sont ceux d'un
   * clavier arabe de téléphone : la lecture les accepte toujours (2,5 écrit
   * ainsi reste 2,5, pas une saisie incomprise).
   */
  const text = latinDigits(raw)
    .replace(/\u2212/g, '-')
    .replace(/\s+/g, '')
    .replace(',', '.');

  // Le cas courant, ecrit a la main : « 2,5 », « -3 ».
  if (/^-?\d*\.?\d+$/.test(text)) {
    const value = Number(text);

    return Number.isFinite(value) ? value : null;
  }

  /**
   * La notation SCIENTIFIQUE d'une calculatrice : « 1e3 » est 1000.
   * Confiée à l'analyseur du grapheur, elle se lisait 1 × e × 3 ≈ 8,15 —
   * un nombre juste en apparence et faux de trois ordres de grandeur. Un
   * exposant entier est exigé : « 2e » (2 × e) reste un produit.
   */
  if (/^-?\d*\.?\d+e[+-]?\d+$/i.test(text)) {
    const value = Number(text);

    return Number.isFinite(value) ? value : null;
  }

  // « 1/2 », tape au clavier systeme.
  const fraction = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(text);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    const value = Number(fraction[1]) / denominator;

    return Number.isFinite(value) ? value : null;
  }

  /**
   * Ce que MathLive produit : `\frac{1}{2}`, `\sqrt{4}`, `-\frac{3}{4}`, `\pi`.
   *
   * On ne l'analyse PAS a la main — on confie la chaine a l'analyseur du
   * grapheur, qui connait deja ce sous-ensemble, refuse ce qu'il ne comprend
   * pas, et n'execute jamais la saisie de l'eleve. Ecrire un second lecteur
   * de LaTeX ici aurait ete un doublon, et un doublon qui diverge.
   *
   * La reponse doit rester un NOMBRE : une expression qui depend encore de x
   * (« 2x ») n'est pas une reponse a « combien vaut f'(2) ? », donc on
   * l'evalue sans variable et on refuse ce qui n'est pas fini.
   */
  let compiled;
  try {
    compiled = compileSource(latinDigits(raw));
  } catch {
    return null;
  }
  if (!compiled.ok) return null;
  const value = compiled.fn(NaN);

  return Number.isFinite(value) ? value : null;
}


/**
 * Les EXPÉRIENCES guidées de §29 : un geste à faire, une chose à observer.
 *
 * Une expérience n'est pas un texte à lire : c'est un état de départ + une
 * question. L'interface pose l'état, affiche la question, et laisse l'élève
 * manipuler. C'est le « Each experiment should produce an observable
 * phenomenon » de §29.
 */
export const EXPERIMENTS = Object.freeze([
  {
    id: 'secantToTangent',
    lab: 'secant',
    source: 'x^2',
    setup: { point: 1, secondPoint: 3 },
    /** Le geste que l'interface propose d'animer : B glisse vers A. */
    action: 'approach',
    questionKey: `${KEY}.experiments.secantToTangent.question`,
    observationKey: `${KEY}.experiments.secantToTangent.observation`,
  },
  {
    id: 'slopeAtExtremum',
    lab: 'derivative',
    source: 'x^2-4x+3',
    setup: { point: 0 },
    action: 'sweep',
    questionKey: `${KEY}.experiments.slopeAtExtremum.question`,
    observationKey: `${KEY}.experiments.slopeAtExtremum.observation`,
  },
  {
    id: 'riemannRefine',
    lab: 'integral',
    source: 'x^2',
    setup: { bounds: { a: 0, b: 2 }, riemann: { n: 2, mode: 'left' } },
    action: 'refine',
    questionKey: `${KEY}.experiments.riemannRefine.question`,
    observationKey: `${KEY}.experiments.riemannRefine.observation`,
  },
  {
    id: 'parameterA',
    lab: 'transform',
    source: 'ax^2+bx+c',
    setup: { parameters: { a: 1, b: 0, c: 0 } },
    action: 'slide',
    questionKey: `${KEY}.experiments.parameterA.question`,
    observationKey: `${KEY}.experiments.parameterA.observation`,
  },
  {
    id: 'oneSidedLimits',
    lab: 'limit',
    source: '\\frac{1}{x}',
    setup: { limitPoint: 0 },
    action: 'approach',
    questionKey: `${KEY}.experiments.oneSidedLimits.question`,
    observationKey: `${KEY}.experiments.oneSidedLimits.observation`,
  },
  {
    id: 'constantShift',
    lab: 'integral',
    source: 'x^2',
    setup: { constant: 0 },
    action: 'slide',
    questionKey: `${KEY}.experiments.constantShift.question`,
    observationKey: `${KEY}.experiments.constantShift.observation`,
  },
]);

/**
 * Les questions de PRÉDICTION de §28 : posées AVANT de révéler, jamais après.
 *
 * Elles portent sur un phénomène que l'élève est en train de provoquer — ce
 * qui les distingue d'un QCM. Chacune nomme le laboratoire où elle a un sens.
 *
 * Chaque prédiction porte SA fonction et SON décor (`setup`, et `after` pour
 * le geste révélé), comme une expérience. Leur réponse était écrite en dur
 * (« la limite diffère », « l'aire grandit ») et jugeait la fonction que
 * l'élève avait tapée : pour 4 − x², l'aire de 0 à 3 est PLUS PETITE que de
 * 0 à 2, et la prédiction « Elle augmente » était pourtant annoncée juste. Désormais
 * la question se pose sur une scène connue, et la réponse est CALCULÉE sur
 * cette scène (`predictionOutcome`), jamais recopiée.
 */
const PREDICTION_SCENES = [
  {
    id: 'tangentSlopeAtVertex',
    lab: 'tangent',
    source: 'x^2-4x+3',
    choices: ['positive', 'zero', 'negative'],
    setup: { lab: 'tangent', point: 0 },
    after: { lab: 'tangent', point: 2 },
  },
  {
    id: 'derivativeSignWhenIncreasing',
    lab: 'derivative',
    source: 'x^2-4x+3',
    choices: ['positive', 'zero', 'negative'],
    setup: { lab: 'derivative', point: 3.5 },
  },
  {
    id: 'areaWhenBoundMoves',
    lab: 'integral',
    source: 'x^2',
    choices: ['larger', 'same', 'smaller'],
    setup: { lab: 'integral', bounds: { a: 0, b: 2 } },
    after: { lab: 'integral', bounds: { a: 0, b: 3 } },
  },
  {
    id: 'riemannWhenNGrows',
    lab: 'integral',
    source: 'x^2',
    choices: ['better', 'same', 'worse'],
    setup: { lab: 'integral', bounds: { a: 0, b: 2 }, riemann: { n: 4, mode: 'left' } },
    after: { lab: 'integral', bounds: { a: 0, b: 2 }, riemann: { n: 16, mode: 'left' } },
  },
  {
    id: 'limitFromBothSides',
    lab: 'limit',
    source: '\\frac{|x|}{x}',
    choices: ['equal', 'different'],
    setup: { lab: 'limit', limitPoint: 0 },
  },
];

const signWord = (value) => (Math.abs(value) < 1e-9 ? 'zero' : value > 0 ? 'positive' : 'negative');

/**
 * Ce qui SE PASSE sur la scène d'une prédiction, mesuré par le moteur du
 * laboratoire — la même lecture que l'élève fera en révélant.
 */
function predictionOutcome(prediction) {
  const model = build(prediction.source);
  if (!model) return null;
  const { fn, derivative } = model;
  const setup = prediction.setup ?? {};
  const after = prediction.after ?? setup;

  switch (prediction.id) {
    case 'tangentSlopeAtVertex':
    case 'derivativeSignWhenIncreasing':
      return derivative ? signWord(derivative(after.point)) : null;
    case 'areaWhenBoundMoves': {
      const before = definiteIntegral(fn, setup.bounds.a, setup.bounds.b);
      const moved = definiteIntegral(fn, after.bounds.a, after.bounds.b);
      if (!before.ok || !moved.ok) return null;
      const change = moved.value - before.value;

      return Math.abs(change) < 1e-9 ? 'same' : change > 0 ? 'larger' : 'smaller';
    }
    case 'riemannWhenNGrows': {
      const exact = definiteIntegral(fn, setup.bounds.a, setup.bounds.b);
      if (!exact.ok) return null;
      const error = (riemann) => Math.abs(
        riemannSum(fn, setup.bounds.a, setup.bounds.b, riemann.n, riemann.mode).sum - exact.value,
      );
      const change = error(after.riemann) - error(setup.riemann);

      return Math.abs(change) < 1e-9 ? 'same' : change < 0 ? 'better' : 'worse';
    }
    case 'limitFromBothSides':
      return twoSidedLimit(fn, setup.limitPoint).agree ? 'equal' : 'different';
    default:
      return null;
  }
}

export const PREDICTIONS = Object.freeze(PREDICTION_SCENES.map((scene) => Object.freeze({
  ...scene,
  expected: predictionOutcome(scene),
})));


/**
 * L'ENTRAÎNEMENT « prédire → révéler → vérifier » (§27) du مختبر المتتاليات.
 *
 * §27 fixe ce que ce module doit être ET ce qu'il ne doit pas devenir :
 *   « The student can always retry · Wrong answers must not block exploration »
 * et §28 : « Do not immediately reveal the answer », §29 : « Do not simply
 * say Incorrect — show the mathematical reasoning. »
 *
 * D'où quatre décisions qui traversent le fichier :
 *
 * 1. **Une réponse fausse ne ferme rien.** `checkAnswer` rend un verdict,
 *    jamais un verrou. Il n'y a aucun état « bloqué » dans ce module, donc il
 *    ne peut pas en arriver un. La suite reste manipulable derrière la
 *    question.
 * 2. **L'explication est CALCULÉE, pas rédigée.** §29 demande de montrer les
 *    termes réels : `explainTerms` rend la vraie suite jusqu'au terme
 *    demandé, et l'interface l'affiche. On n'écrit pas « tu t'es trompé », on
 *    montre 2, 5, 8, 11, 14.
 * 3. **Les indices sont progressifs** (§28) : une liste ordonnée de clés, du
 *    plus général au plus précis, jamais la réponse.
 * 4. **Pas de score au-delà du nécessaire** : on compte les résolues et les
 *    vues, rien d'autre — ni série, ni médaille.
 *
 * ── Le générateur ────────────────────────────────────────────────────────
 * On réutilise `makeRng` (mulberry32) de `lessons/common/stats/randomUtils.js`
 * plutôt que d'en écrire un troisième. Il est déjà mélangé, déjà testé, et
 * déjà celui du laboratoire de probabilités. `trigonometry/practice.js` a
 * dû, lui, réparer un Lehmer brut dont les petites graines rendaient toutes
 * un premier tirage quasi nul ; ce piège est documenté là-bas, et la façon
 * de ne pas y retomber est de ne pas réécrire de générateur.
 */

import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';
import { generate, termAt } from './sequenceMath.js';
import { buildDefinition } from './sequenceModel.js';
import { formatTerm, termName } from './sequenceFormat.js';

const KEY = 'tools.sequences.practice';

/** Les familles de questions de §27, dans son ordre. */
export const CHALLENGE_KINDS = Object.freeze([
  'arithmeticTerm',   // u₀ = 4, r = 3 → u₅ = ?
  'geometricTerm',    // u₀ = 2, q = 0,5 → u₄ = ?
  'recurrenceTerm',   // u₀ = 3, uₙ₊₁ = 2uₙ − 1 → u₁ puis u₂
  'behaviour',        // croît, décroît, oscille, se stabilise ?
  'limitValue',       // vers quelle valeur les termes semblent-ils aller ?
  'findRule',         // 2, 5, 8, 11 → quelle est la raison ?
]);

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];
const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

/** Un entier non nul dans [−max, max] — pour une raison ou une différence. */
function nonZero(rng, max) {
  const value = randomInt(rng, -max, max);

  return value === 0 ? max : value;
}

/**
 * Fabrique un défi.
 *
 * @param {number} seed
 * @param {{ kinds?: string[], difficulty?: 'easy'|'normal'|'hard' }} [options]
 * @returns {object} un défi de forme UNIQUE, quelle que soit la famille —
 *   ce qui permet à l'interface de n'avoir qu'un rendu et qu'une vérification.
 */
export function generateChallenge(seed, options = {}) {
  const rng = makeRng(Number.isFinite(seed) ? Math.floor(seed) : Date.now());
  const allowed = Array.isArray(options.kinds) && options.kinds.length
    ? options.kinds.filter((kind) => CHALLENGE_KINDS.includes(kind))
    : CHALLENGE_KINDS;
  const kind = pick(rng, allowed.length ? allowed : CHALLENGE_KINDS);
  const difficulty = ['easy', 'normal', 'hard'].includes(options.difficulty) ? options.difficulty : 'normal';

  switch (kind) {
    case 'arithmeticTerm': return arithmeticTermChallenge(rng, difficulty);
    case 'geometricTerm': return geometricTermChallenge(rng, difficulty);
    case 'recurrenceTerm': return recurrenceTermChallenge(rng, difficulty);
    case 'behaviour': return behaviourChallenge(rng, difficulty);
    case 'limitValue': return limitChallenge(rng, difficulty);
    default: return findRuleChallenge(rng, difficulty);
  }
}

/**
 * Le SOCLE d'un défi : la spécification de la suite dont il parle, plus la
 * cible. `spec` permet à l'interface de POSER cette suite dans l'espace de
 * travail au moment de la révélation — c'est le « reveal the sequence
 * visually » de §27, et c'est ce qui distingue cet entraînement d'un QCM.
 */
function baseChallenge(spec, extra) {
  return { spec, ...extra };
}

/** §27 « Arithmetic » : u₀ = 4, r = 3, u₅ = ? */
function arithmeticTermChallenge(rng, difficulty) {
  const first = randomInt(rng, difficulty === 'easy' ? 0 : -8, 12);
  const difference = difficulty === 'easy' ? randomInt(rng, 2, 6) : nonZero(rng, 9);
  const target = randomInt(rng, difficulty === 'hard' ? 6 : 3, difficulty === 'hard' ? 12 : 6);
  const spec = { kind: 'arithmetic', startIndex: 0, first, difference };

  return baseChallenge(spec, {
    kind: 'arithmeticTerm',
    answerType: 'number',
    promptKey: `${KEY}.q.arithmeticTerm`,
    promptParams: { first: formatTerm(first), difference: formatTerm(difference), target, name: termName(target) },
    expected: first + target * difference,
    targetIndex: target,
    hintKeys: [`${KEY}.h.constantDifference`, `${KEY}.h.addRepeatedly`, `${KEY}.h.arithmeticFormula`],
    explainKey: `${KEY}.e.arithmeticTerm`,
    explainParams: { target, name: termName(target), difference: formatTerm(difference) },
  });
}

/** §27 « Geometric » : u₀ = 2, q = 0,5, u₄ = ? */
function geometricTermChallenge(rng, difficulty) {
  // Des raisons PROPRES (§30 : « avoid ugly floating-point exercises ») :
  // entières, ou des moitiés — jamais 0,37.
  const ratios = difficulty === 'easy' ? [2, 3, 10] : [2, 3, -2, 0.5, -1, 1.5];
  const ratio = pick(rng, ratios);
  const first = randomInt(rng, 1, 6) * (ratio === 0.5 ? 8 : 1);   // 0,5 sur un multiple de 8 reste entier
  const target = randomInt(rng, 2, difficulty === 'hard' ? 6 : 4);
  const spec = { kind: 'geometric', startIndex: 0, first, ratio };

  return baseChallenge(spec, {
    kind: 'geometricTerm',
    answerType: 'number',
    promptKey: `${KEY}.q.geometricTerm`,
    promptParams: { first: formatTerm(first), ratio: formatTerm(ratio), target, name: termName(target) },
    expected: first * ratio ** target,
    targetIndex: target,
    hintKeys: [`${KEY}.h.constantRatio`, `${KEY}.h.multiplyRepeatedly`, `${KEY}.h.geometricFormula`],
    explainKey: `${KEY}.e.geometricTerm`,
    explainParams: { target, name: termName(target), ratio: formatTerm(ratio) },
  });
}

/** §27 « Recurrence » : u₀ = 3, uₙ₊₁ = 2uₙ − 1, u₁ puis u₂. */
function recurrenceTermChallenge(rng, difficulty) {
  const a = pick(rng, difficulty === 'easy' ? [2, 3] : [2, 3, -1, -2]);
  const b = nonZero(rng, difficulty === 'easy' ? 3 : 6);
  const first = randomInt(rng, 1, 6);
  // On demande u₁ ou u₂ : au-delà, l'itération de tête devient un calcul de
  // patience et non de compréhension (§27 demande « u₁, then u₂ »).
  const target = randomInt(rng, 1, difficulty === 'hard' ? 3 : 2);
  const spec = { kind: 'affine', startIndex: 0, first, a, b };

  return baseChallenge(spec, {
    kind: 'recurrenceTerm',
    answerType: 'number',
    promptKey: `${KEY}.q.recurrenceTerm`,
    promptParams: {
      first: formatTerm(first),
      rule: `${formatTerm(a)} uₙ ${b < 0 ? '−' : '+'} ${formatTerm(Math.abs(b))}`,
      target, name: termName(target),
    },
    expected: affineIterate(first, a, b, target),
    targetIndex: target,
    hintKeys: [`${KEY}.h.applyRuleOnce`, `${KEY}.h.replacePrevious`, `${KEY}.h.oneStepAtATime`],
    explainKey: `${KEY}.e.recurrenceTerm`,
    explainParams: { target, name: termName(target) },
  });
}

function affineIterate(first, a, b, steps) {
  let value = first;
  for (let i = 0; i < steps; i += 1) value = a * value + b;

  return value;
}

/** Les étiquettes de comportement, dans l'ordre des boutons (`tools.sequences.trend.*`). */
export const BEHAVIOUR_CHOICES = Object.freeze(['increasing', 'decreasing', 'alternating', 'approaching', 'diverging']);

/**
 * TOUTES les étiquettes VRAIES d'une suite arithmétique ou géométrique —
 * calculées sur la forme fermée, pas lues sur quelques termes.
 *
 * Les cinq étiquettes ne s'excluent PAS : une suite arithmétique de raison 4
 * est متزايدة ET تتباعد ; une géométrique de raison 0,5 et de premier terme
 * positif est متناقصة ET تقترب من قيمة. Le défi n'en désignait qu'une, et
 * l'élève qui choisissait l'autre — tout aussi vraie — recevait « faux ».
 * C'est une fausseté enseignée, pas une sévérité.
 *
 * Le sens de chaque étiquette (mathlab.json) :
 *   increasing  متزايدة           uₙ₊₁ − uₙ > 0 pour tout n
 *   decreasing  متناقصة           uₙ₊₁ − uₙ < 0 pour tout n
 *   alternating متناوبة الإشارة   uₙ · uₙ₊₁ < 0 pour tout n
 *   approaching تقترب من قيمة     la suite converge (limite finie)
 *   diverging   تتباعد            la suite ne converge pas — au sens du
 *                                 programme : « متباعدة » = non convergente,
 *                                 d'où (−1)ⁿ, qui oscille sans limite, en fait partie.
 *
 * @returns {string[]|null} `null` si la famille n'est pas couverte.
 */
export function trueBehaviours(spec) {
  if (!spec) return null;
  const first = Number(spec.first);
  if (!Number.isFinite(first)) return null;

  let increasing; let decreasing; let alternating; let converges;
  if (spec.kind === 'arithmetic') {
    // uₙ = u₀ + n·r : l'écart vaut r, le signe finit toujours par se fixer.
    const r = Number(spec.difference);
    if (!Number.isFinite(r)) return null;
    increasing = r > 0;
    decreasing = r < 0;
    alternating = false;
    converges = r === 0;
  } else if (spec.kind === 'geometric') {
    // uₙ = u₀·qⁿ : l'écart vaut u₀·qⁿ·(q − 1), le produit de deux termes
    // consécutifs u₀²·q²ⁿ⁺¹ a le signe de q.
    const q = Number(spec.ratio);
    if (!Number.isFinite(q)) return null;
    const nonNull = first !== 0 && q !== 0;
    increasing = nonNull && q > 0 && first * (q - 1) > 0;
    decreasing = nonNull && q > 0 && first * (q - 1) < 0;
    alternating = nonNull && q < 0;
    converges = first === 0 || (q > -1 && q <= 1);
  } else {
    return null;
  }

  const truth = {
    increasing, decreasing, alternating, approaching: converges, diverging: !converges,
  };

  return BEHAVIOUR_CHOICES.filter((label) => truth[label]);
}

/** §27 « Behavior » : d'après le graphe, croît / décroît / oscille / se stabilise ? */
function behaviourChallenge(rng, difficulty) {
  const cases = [
    { spec: { kind: 'arithmetic', startIndex: 0, first: randomInt(rng, 1, 5), difference: randomInt(rng, 2, 5) }, expected: 'increasing' },
    { spec: { kind: 'arithmetic', startIndex: 0, first: randomInt(rng, 10, 20), difference: -randomInt(rng, 2, 5) }, expected: 'decreasing' },
    { spec: { kind: 'geometric', startIndex: 0, first: randomInt(rng, 2, 5), ratio: -1 }, expected: 'alternating' },
    { spec: { kind: 'geometric', startIndex: 0, first: randomInt(rng, 4, 16), ratio: 0.5 }, expected: 'approaching' },
    { spec: { kind: 'geometric', startIndex: 0, first: randomInt(rng, 1, 3), ratio: 2 }, expected: 'diverging' },
  ];
  const chosen = pick(rng, difficulty === 'easy' ? cases.slice(0, 4) : cases);
  // `expected` reste l'étiquette PRINCIPALE, celle que la révélation montre ;
  // `accepted` porte toutes celles qui sont vraies de cette suite.
  const accepted = trueBehaviours(chosen.spec) ?? [chosen.expected];

  return baseChallenge(chosen.spec, {
    kind: 'behaviour',
    answerType: 'choice',
    promptKey: `${KEY}.q.behaviour`,
    promptParams: {},
    choices: [...BEHAVIOUR_CHOICES],
    expected: chosen.expected,
    accepted: accepted.includes(chosen.expected) ? accepted : [chosen.expected, ...accepted],
    // La question porte sur le GRAPHE : l'interface doit le montrer avant de
    // demander. `showFirst` le dit — c'est « given a graph, ask… » de §27.
    showFirst: true,
    hintKeys: [`${KEY}.h.compareConsecutive`, `${KEY}.h.lookAtSigns`],
    explainKey: `${KEY}.e.behaviour`,
    explainParams: {},
  });
}

/** §27 « Convergence » : vers quelle valeur les termes semblent-ils aller ? */
function limitChallenge(rng, difficulty) {
  // Une affine avec |a| < 1 : la limite est b/(1−a), et on la choisit ENTIÈRE
  // pour que la question ait une réponse propre (§30).
  const a = pick(rng, difficulty === 'hard' ? [0.5, 0.25, -0.5, 0.8] : [0.5, 0.25]);
  const limit = randomInt(rng, 1, 10);
  const b = Number((limit * (1 - a)).toFixed(6));
  const first = limit + randomInt(rng, 3, 12) * (rng() > 0.5 ? 1 : -1);
  const spec = { kind: 'affine', startIndex: 0, first, a, b };

  return baseChallenge(spec, {
    kind: 'limitValue',
    answerType: 'number',
    promptKey: `${KEY}.q.limitValue`,
    promptParams: { first: formatTerm(first), rule: `${formatTerm(a)} uₙ + ${formatTerm(b)}` },
    expected: limit,
    // Une limite se LIT sur les termes : on tolère largement, parce qu'un
    // élève qui répond « 4 » quand les termes valent 3,998 a tout compris.
    tolerance: 0.35,
    targetIndex: 20,
    showFirst: true,
    hintKeys: [`${KEY}.h.computeMoreTerms`, `${KEY}.h.termsSettle`, `${KEY}.h.fixedPointEquation`],
    explainKey: `${KEY}.e.limitValue`,
    explainParams: { limit: formatTerm(limit) },
  });
}

/** §27/§41 « find the rule » : 2, 5, 8, 11 → quelle est la raison ? */
function findRuleChallenge(rng, difficulty) {
  const geometric = difficulty !== 'easy' && rng() > 0.5;
  const first = randomInt(rng, 1, 6);
  if (geometric) {
    const ratio = pick(rng, [2, 3, -2]);
    const spec = { kind: 'geometric', startIndex: 0, first, ratio };
    const shown = generate({ kind: 'geometric', startIndex: 0, initial: [first], ratio }, 4)
      .terms.map((term) => formatTerm(term.value)).join(' · ');

    return baseChallenge(spec, {
      kind: 'findRule',
      answerType: 'number',
      promptKey: `${KEY}.q.findRatio`,
      promptParams: { terms: shown },
      expected: ratio,
      hintKeys: [`${KEY}.h.divideConsecutive`, `${KEY}.h.constantRatio`],
      explainKey: `${KEY}.e.findRatio`,
      explainParams: { ratio: formatTerm(ratio), terms: shown },
    });
  }
  const difference = nonZero(rng, difficulty === 'easy' ? 5 : 9);
  const spec = { kind: 'arithmetic', startIndex: 0, first, difference };
  const shown = generate({ kind: 'arithmetic', startIndex: 0, initial: [first], difference }, 4)
    .terms.map((term) => formatTerm(term.value)).join(' · ');

  return baseChallenge(spec, {
    kind: 'findRule',
    answerType: 'number',
    promptKey: `${KEY}.q.findDifference`,
    promptParams: { terms: shown },
    expected: difference,
    hintKeys: [`${KEY}.h.subtractConsecutive`, `${KEY}.h.constantDifference`],
    explainKey: `${KEY}.e.findDifference`,
    explainParams: { difference: formatTerm(difference), terms: shown },
  });
}

/**
 * La lecture d'une réponse (§27).
 *
 * Un élève écrit `17`, `−2,5`, `1/2`, `٣`, `0.5`. Toutes ces écritures disent
 * la même chose et sont acceptées ; la comparaison est NUMÉRIQUE. Refuser
 * « 0,5 » quand on attend « 1/2 » n'enseignerait rien sur les متتاليات —
 * seulement sur le parseur.
 *
 * Aucun `eval` : on lit quatre formes au motif, rien de plus.
 */
export function parseAnswer(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : NaN;
  if (typeof text !== 'string') return NaN;

  const source = text
    .trim()
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[−–—]/g, '-')
    .replace(/،/g, ',')
    .replace(/\s| /g, '')
    .replace(',', '.');
  if (!source) return NaN;

  const fraction = source.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);

    return denominator === 0 ? NaN : Number(fraction[1]) / denominator;
  }

  return /^-?\d+(?:\.\d+)?$/.test(source) ? Number(source) : NaN;
}

/**
 * Le verdict. TROIS valeurs, pas deux : juste, faux, ou ILLISIBLE.
 *
 * Une saisie qu'on n'a pas su lire n'est pas une erreur de mathématiques —
 * répondre « faux » à un élève qui a tapé « quatre » lui apprendrait une
 * chose fausse sur sa réponse. `readable: false` fait dire à l'interface
 * « je n'ai pas compris ce nombre », ce qui est la vérité.
 *
 * @returns {{correct: boolean, readable: boolean}}
 */
export function checkAnswer(challenge, answer) {
  if (!challenge) return { correct: false, readable: false };

  switch (challenge.answerType) {
    case 'number': {
      const value = parseAnswer(answer);
      if (!Number.isFinite(value)) return { correct: false, readable: false };
      const expected = challenge.expected;
      const tolerance = challenge.tolerance ?? relativeTolerance(expected);

      return { correct: Math.abs(value - expected) <= tolerance, readable: true };
    }
    case 'choice': {
      // Plusieurs étiquettes peuvent être VRAIES à la fois (voir
      // `trueBehaviours`) : `accepted` les porte toutes.
      const accepted = Array.isArray(challenge.accepted) && challenge.accepted.length
        ? challenge.accepted
        : [challenge.expected];

      return {
        correct: accepted.includes(answer),
        readable: typeof answer === 'string' && answer.length > 0,
      };
    }
    default:
      return { correct: false, readable: false };
  }
}

/**
 * La tolérance par défaut, RELATIVE à la grandeur attendue.
 *
 * Une tolérance absolue de 1e−3 est juste pour u₅ = 17 et absurde pour
 * u₁₂ = 1 048 576 : à cette échelle, un élève qui a fait le calcul juste
 * peut arrondir. On tolère donc un millionième de la valeur, avec un plancher
 * qui garde la sévérité sur les petits nombres.
 */
export function relativeTolerance(expected) {
  if (!Number.isFinite(expected)) return 1e-3;

  return Math.max(1e-6, Math.abs(expected) * 1e-6);
}

/**
 * L'EXPLICATION de §29 : les vrais termes, calculés, jusqu'à celui demandé.
 *
 * §29 est explicite — ne pas dire « Incorrect » mais montrer le raisonnement,
 * « use the actual sequence state to explain ». Ce module rend donc la
 * matière de l'explication (les termes) et non une phrase : l'interface
 * l'affiche en arabe, et la mathématique reste ici.
 *
 * @returns {{ terms: Array<{n, value}>, expected: number|string, truncated: boolean } | null}
 */
export function explainTerms(challenge, maxTerms = 8) {
  if (!challenge?.spec) return null;
  const built = buildDefinition({
    // `buildDefinition` attend une spécification complète : on complète les
    // champs absents avec ceux d'un défi (qui n'en pose que l'utile).
    kind: 'arithmetic', startIndex: 0, first: 0, second: 0, difference: 0,
    ratio: 0, a: 0, b: 0, explicitSource: '0', ruleSource: '0',
    ...challenge.spec,
  });
  if (!built.ok) return null;

  const upTo = Number.isFinite(challenge.targetIndex) ? challenge.targetIndex : maxTerms - 1;
  const count = Math.min(maxTerms, upTo + 1);
  const run = generate(built.definition, count);
  const truncated = upTo + 1 > count;

  // Si le terme demandé est au-delà de ce qu'on affiche (une limite à n = 20),
  // on l'ajoute seul : l'élève voit le début, puis le terme lointain.
  const terms = [...run.terms];
  if (truncated) {
    const far = termAt(built.definition, upTo);
    if (far.ok) terms.push({ n: far.n, value: far.value, far: true });
  }

  return { terms, expected: challenge.expected, truncated };
}

/** Les familles pertinentes pour la suite AFFICHÉE — on ne demande pas une limite sur une suite qui explose. */
export function kindsForSpec(spec) {
  if (!spec) return CHALLENGE_KINDS;
  switch (spec.kind) {
    case 'arithmetic': return ['arithmeticTerm', 'findRule', 'behaviour'];
    case 'geometric': return ['geometricTerm', 'findRule', 'behaviour'];
    case 'affine': return ['recurrenceTerm', 'limitValue', 'behaviour'];
    default: return CHALLENGE_KINDS;
  }
}

/**
 * Ce que l'interface doit POSER dans l'espace pour révéler (§27).
 *
 * Révéler, ce n'est pas afficher un nombre : c'est montrer la suite dont on
 * parlait. L'appelant applique cette spécification au document, allume la
 * bonne lecture, et l'élève VOIT pourquoi.
 */
export function revealTarget(challenge) {
  if (!challenge?.spec) return null;
  const count = Number.isFinite(challenge.targetIndex)
    ? Math.min(20, Math.max(6, challenge.targetIndex + 2))
    : 10;

  return {
    spec: challenge.spec,
    count,
    cursor: Number.isFinite(challenge.targetIndex) ? Math.min(challenge.targetIndex, count - 1) : 0,
    // La lecture qui EXPLIQUE la famille : les différences pour une
    // arithmétique, les rapports pour une géométrique.
    layer: challenge.spec.kind === 'geometric' ? 'ratios' : 'differences',
  };
}

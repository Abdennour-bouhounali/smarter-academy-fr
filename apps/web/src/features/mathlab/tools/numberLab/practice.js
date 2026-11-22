/**
 * L'ENTRAÎNEMENT « prédire → révéler → vérifier » (§48 à §53) — pur, testable.
 *
 * Les règles que §48-§53 posent, et qui traversent tout le fichier :
 *
 * 1. **Une réponse fausse ne ferme rien.** `checkAnswer` rend un verdict,
 *    jamais un verrou : il n'y a pas d'état « bloqué » dans ce module, donc
 *    il ne peut pas en arriver un. L'élève réessaie, révèle, ou part explorer.
 * 2. **L'erreur s'EXPLIQUE par le dessin (§53).** Un défi ne porte pas un
 *    message d'erreur mais un `reveal` : les valeurs à montrer sur la droite
 *    graduée, et la question à poser (« Lequel est le plus à droite ? »). Le module
 *    dit QUOI montrer ; l'écran le montre.
 * 3. **Les indices dévoilent la MÉTHODE, pas la réponse (§52).** `hintKeys`
 *    est une suite : comparer sur la droite → convertir → la valeur. Le
 *    dernier indice seulement approche du résultat.
 * 4. **La difficulté est CONCEPTUELLE, pas plus de chiffres (§51).** Le
 *    niveau 1 compare deux entiers ; le niveau 3 compare une fraction et un
 *    pourcentage ; le niveau 5 demande un raisonnement en plusieurs pas.
 *    `LEVEL_KINDS` le dit explicitement.
 * 5. **Pas de score au-delà du nécessaire (§56).** On compte les résolues et
 *    les tentatives. Ni série, ni médaille, ni son.
 */

import {
  makeFrac, fracToNumber, compareFrac, fracToText,
  parseNumberInput, equivalents,
} from './fraction.js';
import {
  gcd, lcm, divisors, factorPairs, isPrime, primeFactorization, primesUpTo,
  divisibilityBy, roundingDetail, roundTo,
} from './numberTheory.js';
import { percentageOf, percentageChange } from './proportion.js';

/**
 * Un tirage reproductible : la même graine rend la même suite.
 *
 * La graine est BROUILLÉE avant le premier tirage, pour la raison que le
 * Le labo de trigonométrie a documentée (`trigonometry/practice.js`) : un Lehmer nu
 * rend un premier tirage quasi nul sur les petites graines, et toutes les
 * questions tomberaient dans la même famille.
 */
function makeRandom(seed) {
  let state = Number.isFinite(seed) ? Math.floor(seed) : Date.now();
  state ^= 0x9e3779b9;
  state = Math.imul(state ^ (state >>> 16), 0x85ebca6b);
  state = Math.imul(state ^ (state >>> 13), 0xc2b2ae35);
  state = (state ^ (state >>> 16)) % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;

    return (state - 1) / 2147483646;
  };
}

const pick = (random, list) => list[Math.floor(random() * list.length) % list.length];
const between = (random, min, max) => min + Math.floor(random() * (max - min + 1));

/** Les familles de défis de §50, plus celles que §48 et §49 demandent. */
export const CHALLENGE_KINDS = Object.freeze([
  'compare',        // §48 : laquelle est la plus grande ?
  'placeOnLine',    // §49 : pose 3/4 sur la droite
  'factorPairs',    // §50 : tous les couples de facteurs de 36
  'gcdChallenge',   // §50 : le PGCD
  'lcmChallenge',   // §50 : le premier multiple commun
  'primeChallenge', // §50 : lequel est premier ?
  'equivalent',     // §50 : construis une fraction équivalente
  'percentSlider',  // §50 : règle le curseur à 35 %
  'divisibility',   // §20 : par quoi est-il divisible ?
  'rounding',       // §32 : arrondis au dixième
  'representation', // §46 : la même valeur, autrement
  'multiStep',      // §51 niveau 5 : plusieurs pas
]);

/**
 * §51 — la difficulté monte en COMPLEXITÉ, pas en taille de nombres.
 *
 * Niveau 1 : des entiers simples, une seule idée.
 * Niveau 2 : fractions et décimaux.
 * Niveau 3 : représentations mélangées — c'est là que §46 devient un défi.
 * Niveau 4 : un raisonnement en deux temps.
 * Niveau 5 : problèmes de recherche (tous les couples, un multiple commun).
 */
export const LEVEL_KINDS = Object.freeze({
  1: ['compare', 'divisibility', 'primeChallenge', 'placeOnLine'],
  2: ['compare', 'placeOnLine', 'equivalent', 'rounding', 'percentSlider'],
  3: ['representation', 'compare', 'percentSlider', 'equivalent', 'rounding'],
  4: ['gcdChallenge', 'lcmChallenge', 'factorPairs', 'representation'],
  5: ['multiStep', 'factorPairs', 'gcdChallenge', 'lcmChallenge'],
});

const KEY = 'tools.numberLab.practice';

/**
 * Fabrique un défi pour ce niveau. `kinds` restreint les familles — un mode
 * ne pose que les questions qui ont un sens là où l'élève se trouve.
 */
export function generateChallenge(seed, level = 1, kinds = null) {
  const random = makeRandom(seed);
  const pool = (kinds ?? LEVEL_KINDS[clampLevel(level)] ?? LEVEL_KINDS[1])
    .filter((k) => CHALLENGE_KINDS.includes(k));
  const kind = pick(random, pool.length ? pool : CHALLENGE_KINDS);
  const builder = BUILDERS[kind] ?? BUILDERS.compare;

  return builder(random, clampLevel(level));
}

const clampLevel = (level) => Math.min(5, Math.max(1, Number.isInteger(level) ? level : 1));

/* ── §48 : comparer — le défi fondateur ────────────────────────────────── */

/**
 * « Laquelle est la plus grande : 5/8 ou 0,6 ? »
 *
 * `reveal.values` porte les deux nombres à POSER sur la droite graduée : la
 * révélation n'est pas un texte, c'est un dessin (§48, §53).
 */
function compareChallenge(random, level) {
  const [a, b] = comparablePair(random, level);
  const order = compareFrac(a, b);

  return {
    kind: 'compare',
    answerType: 'choice',
    promptKey: `${KEY}.q.compare`,
    promptParams: { left: fracToText(a), right: fracToText(b) },
    choices: ['left', 'right', 'equal'],
    choiceLabels: [fracToText(a), fracToText(b), '='],
    expected: order > 0 ? 'left' : (order < 0 ? 'right' : 'equal'),
    hintKeys: [`${KEY}.h.compareOnLine`, `${KEY}.h.sameRepresentation`, `${KEY}.h.compareDecimals`],
    explainKey: `${KEY}.e.compare`,
    explainParams: {
      left: fracToText(a),
      right: fracToText(b),
      leftDecimal: formatShort(fracToNumber(a)),
      rightDecimal: formatShort(fracToNumber(b)),
    },
    // §53 : ce que l'écran doit MONTRER quand l'élève se trompe.
    reveal: { mode: 'line', values: [fracToNumber(a), fracToNumber(b)], fractions: [a, b] },
  };
}

/** Deux nombres comparables, dont la difficulté est la REPRÉSENTATION (§51). */
function comparablePair(random, level) {
  if (level <= 1) {
    // Deux fractions de même dénominateur, ou deux entiers : une seule idée.
    const d = pick(random, [2, 3, 4, 5, 6, 8, 10]);

    return [makeFrac(between(random, 1, d - 1), d), makeFrac(between(random, 1, d - 1), d)];
  }
  if (level === 2) {
    // Dénominateurs différents : il faut un dénominateur commun.
    return [
      makeFrac(between(random, 1, 5), pick(random, [3, 4, 5, 6, 8])),
      makeFrac(between(random, 1, 5), pick(random, [3, 4, 5, 6, 8])),
    ];
  }
  // §51 niveau 3+ : une fraction contre un décimal ou un pourcentage —
  // le même nombre écrit de deux façons, et c'est là que c'est difficile.
  const frac = makeFrac(between(random, 1, 7), pick(random, [8, 5, 4, 3, 20]));
  const decimal = makeFrac(between(random, 1, 19) * 5, 100);

  return random() > 0.5 ? [frac, decimal] : [decimal, frac];
}

/* ── §49 : poser un nombre sur la droite ───────────────────────────────── */

function placeOnLineChallenge(random, level) {
  const d = level <= 1 ? pick(random, [2, 4, 5, 10]) : pick(random, [3, 4, 6, 8, 5, 10]);
  const n = between(random, 1, d * 2 - 1);
  const target = makeFrac(n, d);
  const value = fracToNumber(target);

  return {
    kind: 'placeOnLine',
    answerType: 'drag',
    promptKey: `${KEY}.q.placeOnLine`,
    promptParams: { value: fracToText(target) },
    expected: value,
    // La tolérance est un DEMI-intervalle de graduation : on vise juste,
    // sans exiger le pixel.
    tolerance: 1 / (d * 4),
    target,
    hintKeys: [`${KEY}.h.countIntervals`, `${KEY}.h.denominatorIntervals`, `${KEY}.h.numeratorSteps`],
    explainKey: `${KEY}.e.placeOnLine`,
    explainParams: { value: fracToText(target), d, n },
    reveal: { mode: 'line', values: [value], fractions: [target], denominator: d },
  };
}

/* ── §50 : les puzzles ─────────────────────────────────────────────────── */

function factorPairsChallenge(random) {
  const value = pick(random, [24, 36, 48, 60, 72, 30, 40]);
  const pairs = factorPairs(value);

  return {
    kind: 'factorPairs',
    answerType: 'set',
    promptKey: `${KEY}.q.factorPairs`,
    promptParams: { value },
    value,
    // La réponse est un ENSEMBLE : « 1×24, 2×12, 3×8, 4×6 », dans n'importe quel ordre.
    expected: pairs.map(([a, b]) => `${a}×${b}`),
    expectedCount: pairs.length,
    hintKeys: [`${KEY}.h.startAtOne`, `${KEY}.h.stopAtRoot`, `${KEY}.h.divisibilityRules`],
    explainKey: `${KEY}.e.factorPairs`,
    explainParams: { value, pairs: pairs.map(([a, b]) => `${a}×${b}`).join(' · '), count: pairs.length },
    reveal: { mode: 'factors', value },
  };
}

function gcdChallenge(random, level) {
  const [a, b] = level >= 5
    ? [between(random, 20, 200), between(random, 20, 200)]
    : [pick(random, [12, 18, 24, 36, 84]), pick(random, [8, 16, 30, 36, 48])];

  return {
    kind: 'gcdChallenge',
    answerType: 'number',
    promptKey: `${KEY}.q.gcd`,
    promptParams: { a, b },
    expected: gcd(a, b),
    hintKeys: [`${KEY}.h.listDivisors`, `${KEY}.h.euclidStep`, `${KEY}.h.factorColumns`],
    explainKey: `${KEY}.e.gcd`,
    explainParams: { a, b, gcd: gcd(a, b), divisors: divisors(gcd(a, b)).join(' · ') },
    reveal: { mode: 'gcdLcm', a, b },
  };
}

function lcmChallenge(random, level) {
  const [a, b] = level >= 5
    ? [between(random, 6, 40), between(random, 6, 40)]
    : [pick(random, [4, 6, 8, 3]), pick(random, [6, 9, 10, 5])];

  return {
    kind: 'lcmChallenge',
    answerType: 'number',
    promptKey: `${KEY}.q.lcm`,
    promptParams: { a, b },
    expected: lcm(a, b),
    hintKeys: [`${KEY}.h.listMultiples`, `${KEY}.h.firstCommon`, `${KEY}.h.gcdProduct`],
    explainKey: `${KEY}.e.lcm`,
    explainParams: { a, b, lcm: lcm(a, b), gcd: gcd(a, b) },
    reveal: { mode: 'gcdLcm', a, b },
  };
}

function primeChallenge(random) {
  // Un premier et trois composés proches : la question est de RECONNAÎTRE.
  const primes = primesUpTo(120).filter((p) => p > 20);
  const target = pick(random, primes);
  const decoys = new Set();
  let guard = 0;
  while (decoys.size < 3 && guard < 200) {
    const candidate = target + between(random, -12, 12);
    if (candidate > 20 && candidate < 140 && !isPrime(candidate)) decoys.add(candidate);
    guard += 1;
  }
  const choices = shuffle(random, [target, ...decoys]);

  return {
    kind: 'primeChallenge',
    answerType: 'choice',
    promptKey: `${KEY}.q.prime`,
    choices: choices.map(String),
    choiceLabels: choices.map(String),
    expected: String(target),
    hintKeys: [`${KEY}.h.tryTwoThree`, `${KEY}.h.digitSumRule`, `${KEY}.h.stopAtRoot`],
    explainKey: `${KEY}.e.prime`,
    explainParams: {
      value: target,
      composites: choices
        .filter((c) => c !== target)
        .map((c) => `${c} = ${describeFactor(c)}`)
        .join(' · '),
    },
    reveal: { mode: 'primes', limit: 120, highlight: choices },
  };
}

/** Le plus petit facteur non trivial, pour EXPLIQUER pourquoi un nombre n'est pas premier. */
function describeFactor(n) {
  const factors = primeFactorization(n);
  if (!factors?.length) return String(n);

  return `${factors[0].p} × ${n / factors[0].p}`;
}

function equivalentChallenge(random) {
  const d = pick(random, [2, 3, 4, 5]);
  const n = between(random, 1, d - 1);
  const base = makeFrac(n, d);
  const factor = between(random, 2, 5);
  const target = makeFrac(n * factor, d * factor);

  return {
    kind: 'equivalent',
    answerType: 'fraction',
    promptKey: `${KEY}.q.equivalent`,
    // from/to : l'indice « Par combien faut-il multiplier {{from}} pour obtenir {{to}} ? » lit les mêmes paramètres.
    promptParams: { value: fracToText(base), denominator: target.d, from: base.d, to: target.d },
    expected: target,
    base,
    hintKeys: [`${KEY}.h.sameFactor`, `${KEY}.h.whatFactor`, `${KEY}.h.multiplyBoth`],
    explainKey: `${KEY}.e.equivalent`,
    explainParams: { base: fracToText(base), target: fracToText(target), factor },
    reveal: { mode: 'fractions', left: base, right: target },
  };
}

function percentSliderChallenge(random, level) {
  const percent = level <= 2 ? pick(random, [10, 25, 50, 75]) : pick(random, [15, 35, 40, 60, 80, 5]);
  const quantity = pick(random, [200, 120, 80, 300, 60]);

  return {
    kind: 'percentSlider',
    answerType: 'slider',
    promptKey: `${KEY}.q.percentSlider`,
    promptParams: { percent, quantity },
    expected: percent,
    tolerance: 0.5,
    quantity,
    hintKeys: [`${KEY}.h.percentIsHundredth`, `${KEY}.h.tenPercent`, `${KEY}.h.buildUp`],
    explainKey: `${KEY}.e.percentSlider`,
    explainParams: { percent, quantity, result: formatShort(percentageOf(percent, quantity)?.result ?? 0) },
    reveal: { mode: 'percent', percent, quantity },
  };
}

function divisibilityChallenge(random) {
  const by = pick(random, [3, 4, 9, 6, 8, 11]);
  const divisible = random() > 0.5;
  let value = between(random, 100, 9999);
  // On FABRIQUE le cas demandé plutôt que de tirer au hasard et d'espérer.
  value = divisible ? value - (value % by) : value + (value % by === 0 ? 1 : 0);
  const detail = divisibilityBy(value, by);

  return {
    kind: 'divisibility',
    answerType: 'choice',
    promptKey: `${KEY}.q.divisibility`,
    promptParams: { value, by },
    choices: ['yes', 'no'],
    expected: detail.divisible ? 'yes' : 'no',
    hintKeys: [`${KEY}.h.ruleFor${by === 9 || by === 3 ? 'DigitSum' : 'LastDigits'}`, `${KEY}.h.applyRule`, `${KEY}.h.divideToCheck`],
    explainKey: `${KEY}.e.divisibility`,
    explainParams: {
      value, by,
      evidence: detail.evidenceText ?? String(value),
      quotient: detail.quotient,
      remainder: detail.remainder,
    },
    reveal: { mode: 'divisibility', value },
  };
}

function roundingChallenge(random, level) {
  const power = level <= 2 ? pick(random, [0, -1]) : pick(random, [0, -1, -2, 1]);
  const value = roundTo(between(random, 10, 9999) / 100 + random(), 3);
  const detail = roundingDetail(value, power);

  return {
    kind: 'rounding',
    answerType: 'number',
    // Le rang se DIT (« au dixième »), jamais la puissance brute (-1).
    promptKey: `${KEY}.q.roundingTo.${power}`,
    promptParams: { value: formatShort(value) },
    expected: detail.rounded,
    tolerance: 10 ** power * 1e-6,
    power,
    hintKeys: [`${KEY}.h.findNeighbours`, `${KEY}.h.findMidpoint`, `${KEY}.h.whichSide`],
    explainKey: `${KEY}.e.rounding`,
    explainParams: {
      value: formatShort(value),
      lower: formatShort(detail.lower),
      upper: formatShort(detail.upper),
      midpoint: formatShort(detail.midpoint),
      rounded: formatShort(detail.rounded),
    },
    reveal: { mode: 'rounding', value, power },
  };
}

/** §46 : la même valeur, écrite autrement — le défi qui porte l'identité de l'outil. */
function representationChallenge(random) {
  const frac = pick(random, [
    makeFrac(1, 2), makeFrac(1, 4), makeFrac(3, 4), makeFrac(1, 5),
    makeFrac(2, 5), makeFrac(3, 5), makeFrac(1, 10), makeFrac(7, 10), makeFrac(1, 20),
  ]);
  const asked = pick(random, ['decimal', 'percent']);
  const value = fracToNumber(frac);

  return {
    kind: 'representation',
    answerType: 'number',
    promptKey: `${KEY}.q.representation${asked === 'decimal' ? 'Decimal' : 'Percent'}`,
    promptParams: { value: fracToText(frac) },
    expected: asked === 'decimal' ? value : roundTo(value * 100, 6),
    ...(asked === 'percent' ? { unit: 'percent' } : {}),
    tolerance: asked === 'decimal' ? 1e-6 : 1e-4,
    hintKeys: [`${KEY}.h.divideNumerator`, `${KEY}.h.denominatorHundred`, `${KEY}.h.percentIsHundredth`],
    explainKey: `${KEY}.e.representation`,
    explainParams: {
      frac: fracToText(frac),
      decimal: formatShort(value),
      percent: formatShort(roundTo(value * 100, 6)),
    },
    reveal: { mode: 'line', values: [value], fractions: [frac] },
  };
}

/** §51 niveau 5 : deux pas — une variation, puis une part. */
function multiStepChallenge(random) {
  const quantity = pick(random, [200, 400, 150, 80]);
  const rise = pick(random, [10, 20, 25, 50]);
  const share = pick(random, [25, 50, 10]);
  const afterRise = roundTo(quantity * (1 + rise / 100), 6);
  const expected = roundTo((afterRise * share) / 100, 6);

  return {
    kind: 'multiStep',
    answerType: 'number',
    promptKey: `${KEY}.q.multiStep`,
    promptParams: { quantity, rise, share },
    expected,
    tolerance: 1e-6,
    hintKeys: [`${KEY}.h.oneStepAtATime`, `${KEY}.h.applyRise`, `${KEY}.h.thenShare`],
    explainKey: `${KEY}.e.multiStep`,
    explainParams: {
      quantity, rise, share,
      afterRise: formatShort(afterRise),
      result: formatShort(expected),
      factor: formatShort(percentageChange(quantity, afterRise)?.factor ?? 1),
    },
    reveal: { mode: 'percent', quantity, percent: share },
  };
}

const BUILDERS = Object.freeze({
  compare: compareChallenge,
  placeOnLine: placeOnLineChallenge,
  factorPairs: factorPairsChallenge,
  gcdChallenge,
  lcmChallenge,
  primeChallenge,
  equivalent: equivalentChallenge,
  percentSlider: percentSliderChallenge,
  divisibility: divisibilityChallenge,
  rounding: roundingChallenge,
  representation: representationChallenge,
  multiStep: multiStepChallenge,
});

/* ── La vérification ───────────────────────────────────────────────────── */

/**
 * VÉRIFIER une réponse. Rend un verdict — jamais un verrou (§48).
 *
 * L'élève écrit `1/2`, `0,5`, `50 %` : toutes disent la même chose, et
 * `parseNumberInput` les accepte toutes. Refuser `0,5` quand on attend `1/2`
 * n'enseignerait rien sur les nombres, seulement sur l'analyseur.
 *
 * @returns {{correct: boolean, kind: string, given: unknown, expected: unknown, near?: boolean}}
 */
export function checkAnswer(challenge, answer) {
  if (!challenge) return { correct: false, kind: 'none', given: answer, expected: null };
  const base = { kind: challenge.kind, given: answer, expected: challenge.expected };

  switch (challenge.answerType) {
    case 'choice':
      return { ...base, correct: String(answer) === String(challenge.expected) };

    case 'number': {
      let value = readAnswerNumber(answer);
      if (value === null) return { ...base, correct: false, unreadable: true };
      // « Écris … sous forme de pourcentage » : `75` et `75 %` disent la même chose.
      // `75 %` se lit 0,75 — on le ramène à l'échelle de la réponse attendue.
      if (challenge.unit === 'percent' && typeof answer === 'string' && parseNumberInput(answer)?.source === 'percent') value *= 100;
      const tolerance = challenge.tolerance ?? 1e-9;

      return { ...base, correct: Math.abs(value - challenge.expected) <= tolerance, given: value };
    }

    case 'slider':
    case 'drag': {
      const value = readAnswerNumber(answer);
      if (value === null) return { ...base, correct: false, unreadable: true };
      const tolerance = challenge.tolerance ?? 0.05;
      const distance = Math.abs(value - challenge.expected);

      return {
        ...base,
        given: value,
        correct: distance <= tolerance,
        // « Tout près » mérite d'être dit : l'élève a compris, il a visé court.
        near: distance > tolerance && distance <= tolerance * 3,
      };
    }

    case 'fraction': {
      const parsed = typeof answer === 'string' ? parseNumberInput(answer)?.frac : answer;
      if (!parsed?.d) return { ...base, correct: false, unreadable: true };
      // §50 « build an equivalent fraction » : la VALEUR doit être la bonne…
      const sameValue = compareFrac(parsed, challenge.expected) === 0;
      // …et l'écriture demandée aussi, quand un dénominateur était exigé.
      const sameForm = !challenge.expected?.d || parsed.d === challenge.expected.d;

      return { ...base, given: parsed, correct: sameValue && sameForm, sameValue };
    }

    case 'set': {
      const given = Array.isArray(answer) ? answer.map(normalizePair).filter(Boolean) : [];
      const expected = new Set(challenge.expected);
      const found = new Set(given.filter((g) => expected.has(g)));

      return {
        ...base,
        given,
        correct: found.size === expected.size && given.length === found.size,
        found: found.size,
        missing: expected.size - found.size,
        wrong: given.filter((g) => !expected.has(g)),
      };
    }

    default:
      return { ...base, correct: false };
  }
}

/** `4x6`, `4 × 6`, `6×4` → la forme canonique `4×6`. */
function normalizePair(raw) {
  if (typeof raw !== 'string') return null;
  const match = /^\s*(\d+)\s*[x×*]\s*(\d+)\s*$/i.exec(raw);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);

  return a <= b ? `${a}×${b}` : `${b}×${a}`;
}

/** Lire un nombre écrit de n'importe quelle façon (§46). */
function readAnswerNumber(answer) {
  if (typeof answer === 'number') return Number.isFinite(answer) ? answer : null;
  if (typeof answer !== 'string') return null;
  const parsed = parseNumberInput(answer);

  return parsed ? fracToNumber(parsed.frac) : null;
}

/**
 * §52 — l'indice SUIVANT, jamais la réponse.
 *
 * `used` est le nombre d'indices déjà demandés. Le dernier indice approche du
 * résultat sans le donner ; au-delà, il n'y a plus d'indice et l'élève peut
 * révéler s'il le veut.
 */
export function nextHint(challenge, used = 0) {
  const hints = challenge?.hintKeys ?? [];
  if (used >= hints.length) return null;

  return { key: hints[used], index: used, last: used === hints.length - 1, remaining: hints.length - used - 1 };
}

/**
 * §53 — ce qu'il faut MONTRER après une erreur.
 *
 * Ce n'est jamais « faux » : c'est un mode à ouvrir, des valeurs à poser, et
 * une question à poser à l'élève (« Lequel est le plus à droite ? »). L'écran n'a
 * plus qu'à obéir.
 */
export function explainError(challenge, verdict) {
  if (!challenge || verdict?.correct) return null;

  return {
    reveal: challenge.reveal ?? null,
    askKey: askKeyFor(challenge.kind),
    explainKey: challenge.explainKey,
    explainParams: challenge.explainParams,
    // Une réponse illisible n'est pas une erreur de mathématiques.
    unreadable: Boolean(verdict?.unreadable),
    near: Boolean(verdict?.near),
  };
}

/** La question que la révélation POSE — celle de §53. */
function askKeyFor(kind) {
  switch (kind) {
    case 'compare':
    case 'representation':
      return `${KEY}.ask.whichIsRight`;
    case 'placeOnLine':
      return `${KEY}.ask.countIntervals`;
    case 'factorPairs':
      return `${KEY}.ask.whichPairsMissing`;
    case 'gcdChallenge':
      return `${KEY}.ask.commonDivisors`;
    case 'lcmChallenge':
      return `${KEY}.ask.firstCommonMultiple`;
    case 'primeChallenge':
      return `${KEY}.ask.whichDivides`;
    case 'divisibility':
      return `${KEY}.ask.applyRule`;
    case 'rounding':
      return `${KEY}.ask.whichNeighbour`;
    case 'equivalent':
      return `${KEY}.ask.sameFactor`;
    case 'percentSlider':
      return `${KEY}.ask.howManyHundredths`;
    default:
      return `${KEY}.ask.lookAtScreen`;
  }
}

/** La RÉPONSE, quand l'élève la demande (§52 : « unless requested »). */
export function revealAnswer(challenge) {
  if (!challenge) return null;
  const { expected, kind } = challenge;
  const text = kind === 'equivalent' ? fracToText(expected)
    : (Array.isArray(expected) ? expected.join(' · ') : String(expected));

  return { text, expected, reveal: challenge.reveal ?? null, explainKey: challenge.explainKey, explainParams: challenge.explainParams };
}

/* ── §54 : les expériences guidées, qui ne sont PAS des questions ──────── */

export function runExperiment(name, seed = 1) {
  const random = makeRandom(seed);
  switch (name) {
    case 'digitSum': {
      // §21 : beaucoup de multiples de 3, et leurs sommes de chiffres.
      const rows = Array.from({ length: 8 }, () => {
        const value = between(random, 2, 120) * 3;

        return { value, digitSum: String(value).split('').reduce((a, c) => a + Number(c), 0) };
      });

      return { name, rows, lawKey: `${KEY}.law.digitSum` };
    }
    case 'coprime': {
      // §29 : deux entiers consécutifs sont toujours premiers entre eux.
      const rows = Array.from({ length: 6 }, () => {
        const n = between(random, 5, 90);

        return { a: n, b: n + 1, gcd: gcd(n, n + 1) };
      });

      return { name, rows, lawKey: `${KEY}.law.consecutiveCoprime` };
    }
    case 'gcdLcmProduct': {
      // §31 : PGCD × PPCM = a × b, mesuré sur des cas quelconques.
      const rows = Array.from({ length: 6 }, () => {
        const a = between(random, 4, 60);
        const b = between(random, 4, 60);

        return { a, b, gcd: gcd(a, b), lcm: lcm(a, b), product: gcd(a, b) * lcm(a, b), ab: a * b };
      });

      return { name, rows, lawKey: `${KEY}.law.gcdLcmProduct` };
    }
    default: {
      // §9 : la chaîne des équivalentes.
      const d = pick(random, [2, 3, 4, 5]);
      const base = makeFrac(between(random, 1, d - 1), d);

      return { name: 'equivalentChain', rows: equivalents(base, 6), lawKey: `${KEY}.law.equivalent` };
    }
  }
}

/** Un nombre court pour un libellé — la virgule et le vrai moins (§58). */
function formatShort(value) {
  if (!Number.isFinite(value)) return '—';

  return String(roundTo(value, 4)).replace('.', ',').replace('-', '−');
}

function shuffle(random, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}


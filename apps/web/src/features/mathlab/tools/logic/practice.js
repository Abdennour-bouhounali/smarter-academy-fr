/**
 * L'ENTRAÎNEMENT du مختبر المنطق والبرهان — pur, testable (§37-39).
 *
 * Quatre décisions traversent le fichier, les mêmes que trigonometry et
 * sequences, parce que ce sont celles du cahier des charges :
 *
 * 1. **Rien ne bloque jamais** (§39). `checkAnswer` rend un verdict, pas un
 *    verrou : l'élève réessaie, demande un indice, révèle, ou part explorer
 *    — le laboratoire reste manipulable derrière la question.
 * 2. **Trois issues, pas deux.** `{correct, readable}` : une saisie
 *    illisible n'est PAS une réponse fausse. Dire « خطأ » à qui a mal tapé
 *    lui enseignerait une fausseté sur sa propre pensée.
 * 3. **Les indices sont progressifs et ne donnent jamais la réponse** (§39) :
 *    `hintKeys` va du plus général au plus précis, un cran à la fois.
 * 4. **Aucun énoncé n'est fabriqué ici.** Chaque défi TIRE un préréglage
 *    vérifié (presets.js, presets.test.js) et l'habille en question. §38 dit
 *    « never generate invalid mathematical statements » : la seule façon de
 *    le garantir est de n'en générer aucun.
 *
 * ── Ce qu'une réponse juste veut dire ────────────────────────────────────
 * Un contre-exemple n'est pas « le nombre auquel on pensait » : c'est TOUTE
 * valeur du domaine qui rend le prédicat faux. `checkAnswer` réévalue donc
 * le prédicat sur la valeur donnée (§10, §48) au lieu de comparer à une
 * constante — 2, 4, 6… réfutent tous « n² pair ⇒ n impair », et refuser 6
 * parce qu'on attendait 2 serait un mensonge.
 */

import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';
import {
  STATEMENTS, IMPLICATIONS, EQUIVALENCES, COUNTEREXAMPLE_CHALLENGES, CONDITIONS,
  QUANTIFIER_STATEMENTS, PROOFS, FALLACIES, FALLACY_KINDS, sampleOf, findPreset,
  domainStatus, domainLabel,
} from './presets.js';
import { analyzeImplication, evaluate, searchVerdict, sameTable } from './logicMath.js';
import { isComplete, makeGapChallenge, refutesFallacy } from './proofMath.js';

/** Les familles de §38, dans son ordre. */
export const CHALLENGE_KINDS = Object.freeze([
  'trueOrFalse', 'counterexample', 'implicationVerdict', 'converse', 'contrapositive',
  'equivalence', 'necessarySufficient', 'quantifier', 'quantifierNegation',
  'orderProof', 'proofGap', 'fallacy',
]);

/**
 * §38 — quatre niveaux. Chacun ajoute aux précédents plutôt que de les
 * remplacer : un élève de niveau 3 doit encore croiser un contre-exemple.
 */
export const DIFFICULTY_KINDS = Object.freeze({
  1: ['trueOrFalse', 'counterexample'],
  2: ['trueOrFalse', 'counterexample', 'implicationVerdict', 'converse', 'quantifier'],
  3: ['counterexample', 'converse', 'contrapositive', 'equivalence', 'necessarySufficient', 'quantifierNegation', 'fallacy'],
  4: ['contrapositive', 'necessarySufficient', 'quantifierNegation', 'orderProof', 'proofGap', 'fallacy'],
});

const KEY = 'tools.logic.practice';
const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

/**
 * Fabrique un défi. La graine rend la suite REPRODUCTIBLE (même document
 * rouvert, même question) ; `kinds` restreint les familles.
 */
export function generateChallenge(seed, kinds = CHALLENGE_KINDS) {
  const rng = makeRng(Number.isFinite(seed) ? Math.floor(seed) : 1);
  const available = kinds.filter((kind) => CHALLENGE_KINDS.includes(kind));
  const kind = pick(rng, available.length > 0 ? available : CHALLENGE_KINDS);

  switch (kind) {
    case 'trueOrFalse': return trueOrFalse(rng);
    case 'counterexample': return counterexample(rng);
    case 'implicationVerdict': return implicationVerdict(rng);
    case 'converse': return converse(rng);
    case 'contrapositive': return contrapositive(rng);
    case 'equivalence': return equivalence(rng);
    case 'necessarySufficient': return necessarySufficient(rng);
    case 'quantifier': return quantifier(rng);
    case 'quantifierNegation': return quantifierNegation(rng);
    case 'orderProof': return orderProof(rng);
    case 'proofGap': return proofGap(rng);
    default: return fallacy(rng);
  }
}

/** §5 — صحيح / خطأ / يعتمد. */
function trueOrFalse(rng) {
  const statement = pick(rng, STATEMENTS);

  return {
    kind: 'trueOrFalse',
    answerType: 'choice',
    promptKey: `${KEY}.q.trueOrFalse`,
    statementId: statement.id,
    formula: statement.formula,
    textKey: statement.textKey ?? null,
    domainSymbol: statement.domain?.symbol ?? null,
    // « 1/n > 0 » n'est vrai que parce que n ∈ ℕ* : le domaine fait partie de l'énoncé (§6).
    domainLabel: domainLabel(statement),
    choices: ['true', 'false', 'depends'],
    expected: statement.verdict,
    hintKeys: [`${KEY}.h.tryValues`, `${KEY}.h.checkDomain`],
    explainKey: `${KEY}.e.trueOrFalse.${statement.verdict}`,
  };
}

/** §8-10 — trouver un contre-exemple : toute valeur qui réfute est acceptée. */
function counterexample(rng) {
  const challenge = pick(rng, COUNTEREXAMPLE_CHALLENGES);

  return {
    kind: 'counterexample',
    answerType: 'number',
    promptKey: `${KEY}.q.counterexample`,
    challengeId: challenge.id,
    textKey: challenge.textKey,
    domainSymbol: challenge.domain.symbol,
    domainLabel: domainLabel(challenge),
    expected: challenge.knownCounterexample,
    hintKeys: challenge.hintKeys ?? [`${KEY}.h.tryValues`, `${KEY}.h.oneIsEnough`],
    explainKey: `${KEY}.e.counterexample`,
  };
}

/** §13 — cette implication est-elle vraie ? (une des quatre est FAUSSE). */
function implicationVerdict(rng) {
  const preset = pick(rng, IMPLICATIONS);

  return {
    kind: 'implicationVerdict',
    answerType: 'choice',
    promptKey: `${KEY}.q.implicationVerdict`,
    implicationId: preset.id,
    pFormula: preset.p.formula,
    qFormula: preset.q.formula,
    domainLabel: domainLabel(preset),
    choices: ['true', 'false'],
    expected: preset.implicationHolds ? 'true' : 'false',
    hintKeys: [`${KEY}.h.everyPIsQ`, `${KEY}.h.lookForPTrueQFalse`],
    explainKey: preset.implicationHolds ? `${KEY}.e.implicationTrue` : `${KEY}.e.implicationFalse`,
    explainParams: { value: preset.implicationCounterexample ?? null },
  };
}

/** §15 — la réciproque. Elle n'est PAS automatique, et parfois elle est vraie. */
function converse(rng) {
  const preset = pick(rng, IMPLICATIONS);
  const holds = preset.converseCounterexample === undefined;

  return {
    kind: 'converse',
    answerType: 'choice',
    promptKey: `${KEY}.q.converse`,
    implicationId: preset.id,
    pFormula: preset.p.formula,
    qFormula: preset.q.formula,
    domainLabel: domainLabel(preset),
    choices: ['true', 'false'],
    expected: holds ? 'true' : 'false',
    hintKeys: [`${KEY}.h.swapPQ`, `${KEY}.h.lookForQTruePFalse`],
    explainKey: holds ? `${KEY}.e.converseTrue` : `${KEY}.e.converseFalse`,
    explainParams: { value: preset.converseCounterexample ?? null },
  };
}

/** §16 — la contraposée a TOUJOURS la même valeur que l'implication. */
function contrapositive(rng) {
  const preset = pick(rng, IMPLICATIONS);
  const asksContrapositive = rng() > 0.5;

  return {
    kind: 'contrapositive',
    answerType: 'choice',
    promptKey: asksContrapositive ? `${KEY}.q.contrapositiveSame` : `${KEY}.q.converseSame`,
    implicationId: preset.id,
    pFormula: preset.p.formula,
    qFormula: preset.q.formula,
    domainLabel: domainLabel(preset),
    form: asksContrapositive ? 'contrapositive' : 'converse',
    choices: ['same', 'different'],
    // La vérité vient de la TABLE, pas d'une constante écrite ici.
    expected: sameTable('direct', asksContrapositive ? 'contrapositive' : 'converse') ? 'same' : 'different',
    hintKeys: [`${KEY}.h.buildTable`, `${KEY}.h.compareRows`],
    explainKey: asksContrapositive ? `${KEY}.e.contrapositiveSame` : `${KEY}.e.converseDifferent`,
  };
}

/** §17 — l'équivalence demande les DEUX sens. */
function equivalence(rng) {
  const preset = pick(rng, EQUIVALENCES);

  return {
    kind: 'equivalence',
    answerType: 'choice',
    promptKey: `${KEY}.q.equivalence`,
    equivalenceId: preset.id,
    pFormula: preset.p.formula,
    qFormula: preset.q.formula,
    // Une équivalence se DESSINE ⇔ : l'écrire ⇒ poserait une autre question.
    connective: '⇔',
    domainLabel: domainLabel(preset),
    choices: ['true', 'false'],
    expected: preset.holds ? 'true' : 'false',
    hintKeys: [`${KEY}.h.bothDirections`, `${KEY}.h.checkBackward`],
    explainKey: preset.holds ? `${KEY}.e.equivalenceTrue` : `${KEY}.e.equivalenceFalse`,
    explainParams: { value: preset.backwardCounterexample ?? null },
  };
}

/** §18-20 — nécessaire / suffisant, dans les DEUX sens, dont un qui échoue. */
function necessarySufficient(rng) {
  const preset = pick(rng, CONDITIONS);
  // Quatre questions possibles ; deux ont « نعم » pour réponse, deux « لا ».
  const question = pick(rng, ['bNecessaryForA', 'aSufficientForB', 'bSufficientForA', 'aNecessaryForB']);
  const sample = sampleOf(preset.domain);
  const reading = analyzeImplication(preset.a.test, preset.b.test, sample);
  const expectedYes = question === 'bNecessaryForA' || question === 'aSufficientForB'
    ? reading.direct.holds
    : reading.converse.holds;

  return {
    kind: 'necessarySufficient',
    answerType: 'choice',
    promptKey: `${KEY}.q.${question}`,
    conditionId: preset.id,
    aFormula: preset.a.formula,
    bFormula: preset.b.formula,
    domainLabel: domainLabel(preset),
    question,
    choices: ['yes', 'no'],
    expected: expectedYes ? 'yes' : 'no',
    hintKeys: [`${KEY}.h.doesAImplyB`, `${KEY}.h.necessaryVsSufficient`],
    explainKey: `${KEY}.e.${question}.${expectedYes ? 'yes' : 'no'}`,
    explainParams: { value: reading.converse.counterexample ?? reading.direct.counterexample ?? null },
  };
}

/** §21-23 — ∀ ou ∃ : la valeur de vérité, décidée par le préréglage vérifié. */
function quantifier(rng) {
  const preset = pick(rng, QUANTIFIER_STATEMENTS);

  return {
    kind: 'quantifier',
    answerType: 'choice',
    promptKey: preset.kind === 'forall' ? `${KEY}.q.forallHolds` : `${KEY}.q.existsHolds`,
    quantifierId: preset.id,
    formula: preset.formula,
    choices: ['true', 'false'],
    expected: preset.truth ? 'true' : 'false',
    hintKeys: preset.kind === 'forall'
      ? [`${KEY}.h.tryValues`, `${KEY}.h.oneCounterexampleEnough`]
      : [`${KEY}.h.tryValues`, `${KEY}.h.oneWitnessEnough`],
    explainKey: `${KEY}.e.quantifier.${preset.kind}.${preset.truth ? 'true' : 'false'}`,
  };
}

/**
 * §25 — écrire la négation d'un énoncé quantifié : « كل » devient « يوجد ».
 *
 * Les deux leurres sont les deux ERREURS classiques sur CET énoncé — changer
 * le seul quantificateur, ou nier le seul prédicat — et non la négation d'un
 * autre préréglage : celle-ci pouvait être l'énoncé de départ lui-même, ou
 * seule à parler de ℕ et trahir la réponse.
 */
function quantifierNegation(rng) {
  const preset = pick(rng, QUANTIFIER_STATEMENTS);
  const wrong = negationDistractors(preset);

  return {
    kind: 'quantifierNegation',
    answerType: 'choice',
    promptKey: `${KEY}.q.quantifierNegation`,
    quantifierId: preset.id,
    formula: preset.formula,
    // Les choix sont des FORMULES (pas des clés i18n) : de la notation, affichée en LTR.
    choices: shuffle([preset.negationFormula, ...wrong.slice(0, 2)], rng),
    expected: preset.negationFormula,
    hintKeys: [`${KEY}.h.negateQuantifier`, `${KEY}.h.negateInside`],
    explainKey: preset.kind === 'forall' ? `${KEY}.e.negateForall` : `${KEY}.e.negateExists`,
  };
}

const SWAP_QUANTIFIER = Object.freeze({ forall: '∃', exists: '∀' });
const QUANTIFIER_SIGN = Object.freeze({ forall: '∀', exists: '∃' });

/** Les deux négations FAUSSES d'un énoncé quantifié, tirées de sa structure. */
export function negationDistractors(preset) {
  const set = preset.domain.symbol;
  const head = (sign) => `${sign}${preset.variable} ∈ ${set}, `;
  const candidates = [
    `${head(SWAP_QUANTIFIER[preset.kind])}${preset.inner}`,        // quantificateur seul
    `${head(QUANTIFIER_SIGN[preset.kind])}${preset.negatedInner}`, // prédicat seul
  ];

  return candidates.filter((c) => c !== preset.formula && c !== preset.negationFormula);
}

/** §35 — remettre une preuve dans l'ordre. */
function orderProof(rng) {
  const proof = pick(rng, PROOFS);

  return {
    kind: 'orderProof',
    answerType: 'order',
    promptKey: `${KEY}.q.orderProof`,
    proofId: proof.id,
    hintKeys: [`${KEY}.h.startFromGiven`, `${KEY}.h.whatFollows`],
    explainKey: `${KEY}.e.orderProof`,
  };
}

/** §34 — l'étape manquante. */
function proofGap(rng) {
  const proof = pick(rng, PROOFS);
  const seed = Math.floor(rng() * 1000);
  const gap = makeGapChallenge(proof, seed);

  return {
    kind: 'proofGap',
    answerType: 'choice',
    promptKey: `${KEY}.q.proofGap`,
    proofId: proof.id,
    gapSeed: seed,
    choices: gap?.candidates ?? [],
    expected: gap?.missingId ?? null,
    hintKeys: [`${KEY}.h.whatIsMissing`, `${KEY}.h.whatFollows`],
    explainKey: `${KEY}.e.proofGap`,
  };
}

/** §33 — nommer la faute, puis la réfuter. Deux temps, une seule question. */
function fallacy(rng) {
  const preset = pick(rng, FALLACIES);

  return {
    kind: 'fallacy',
    answerType: 'fallacy',
    promptKey: `${KEY}.q.fallacy`,
    fallacyId: preset.id,
    choices: FALLACY_KINDS,
    expected: preset.kind,
    expectedValue: preset.counterexample,
    domainSymbol: preset.domain.symbol,
    domainLabel: domainLabel(preset),
    hintKeys: [`${KEY}.h.doesItFollow`, `${KEY}.h.trySmallNumbers`],
    explainKey: `${KEY}.e.fallacy.${preset.kind}`,
    explainParams: { value: preset.counterexample },
  };
}

/* ── Lire et vérifier une réponse ──────────────────────────────────────── */

/**
 * Lit un nombre écrit par un élève : `4`, `−3`, `2,5`, `1/2`, chiffres
 * arabes-indiens. On accepte large À DESSEIN — la question porte sur la
 * logique, pas sur la syntaxe (même règle que trigonometry.parseAnswer).
 */
export function parseNumericAnswer(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : NaN;
  if (typeof text !== 'string') return NaN;
  const source = text.trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[−–—]/g, '-')
    .replace(/،/g, ',')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
  if (!source) return NaN;

  const fraction = source.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);

    return denominator === 0 ? NaN : Number(fraction[1]) / denominator;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(source)) return Number(source);

  return NaN;
}

/**
 * Le verdict d'une réponse. `correct: false` n'est jamais un blocage.
 *
 * @returns {{correct: boolean, readable: boolean, detail?: object}}
 */
export function checkAnswer(challenge, answer) {
  if (!challenge) return { correct: false, readable: false };

  switch (challenge.answerType) {
    case 'choice':
      return {
        correct: answer === challenge.expected,
        readable: typeof answer === 'string' && answer.length > 0,
      };

    case 'number': {
      const value = parseNumericAnswer(answer);
      if (!Number.isFinite(value)) return { correct: false, readable: false };
      // Trop grande pour être calculée exactement : on ne juge pas, on ne dit pas « خطأ ».
      if (domainStatus(value, numericDomain(challenge)) === 'tooLarge') {
        return { correct: false, readable: false, detail: { value, tooLarge: true } };
      }

      return { correct: checkNumeric(challenge, value), readable: true, detail: { value } };
    }

    case 'order': {
      if (!Array.isArray(answer) || answer.length === 0) return { correct: false, readable: false };
      const proof = findPreset(PROOFS, challenge.proofId);

      return { correct: isComplete(proof, answer), readable: true };
    }

    case 'fallacy': {
      // Deux moitiés : nommer la faute ET la réfuter. La réponse n'est juste
      // que si les deux le sont — nommer sans réfuter, c'est réciter (§33).
      const named = answer?.kind;
      const value = parseNumericAnswer(answer?.value);
      const readable = typeof named === 'string' && named.length > 0 && Number.isFinite(value);
      if (!readable) return { correct: false, readable: false };
      const preset = findPreset(FALLACIES, challenge.fallacyId);
      if (domainStatus(value, preset.domain) === 'tooLarge') {
        return { correct: false, readable: false, detail: { value, tooLarge: true } };
      }

      return {
        correct: named === challenge.expected && refutesFallacy(preset, value),
        readable: true,
        detail: { namedRight: named === challenge.expected, refuted: refutesFallacy(preset, value) },
      };
    }

    default:
      return { correct: false, readable: false };
  }
}

/** Le domaine contre lequel une réponse numérique se juge. */
function numericDomain(challenge) {
  if (challenge.kind === 'counterexample') return findPreset(COUNTEREXAMPLE_CHALLENGES, challenge.challengeId).domain;
  if (challenge.kind === 'fallacy') return findPreset(FALLACIES, challenge.fallacyId).domain;

  return null;
}

/**
 * Une réponse numérique. Pour un contre-exemple, on RÉÉVALUE le prédicat :
 * toute valeur de l'ENSEMBLE DÉCLARÉ qui le rend faux est juste, pas
 * seulement celle qu'on avait en tête (§10) — ni seulement celles que la
 * droite graduée montre : 31 réfute « tout premier > 2 est pair » même si
 * l'échantillon s'arrête à 30.
 */
function checkNumeric(challenge, value) {
  if (challenge.kind === 'counterexample') {
    const preset = findPreset(COUNTEREXAMPLE_CHALLENGES, challenge.challengeId);
    if (!inDomain(value, preset.domain)) return false;

    return evaluate(preset.predicate, value) === false;
  }
  if (challenge.kind === 'fallacy') {
    return refutesFallacy(findPreset(FALLACIES, challenge.fallacyId), value);
  }

  return value === challenge.expected;
}

/**
 * La valeur appartient-elle à l'ENSEMBLE déclaré (ℕ, ℕ*, ℤ, ℝ) et peut-on
 * la juger ? `min`/`max` ne bornent que l'échantillon affiché : ils ne
 * restreignent pas l'énoncé (voir `domainStatus`, presets.js).
 */
export function inDomain(value, domain) {
  return domainStatus(value, domain) === 'in';
}

/**
 * §37 — ce que la révélation doit MONTRER : l'aire du laboratoire à ouvrir
 * et sur quel préréglage, pour que l'explication se voie au lieu de se lire.
 */
export function revealTarget(challenge) {
  if (!challenge) return null;
  switch (challenge.kind) {
    case 'trueOrFalse': return { area: 'statements', id: challenge.statementId };
    case 'counterexample': return { area: 'counterexample', id: challenge.challengeId };
    case 'implicationVerdict':
    case 'converse':
    case 'contrapositive': return { area: 'implication', id: challenge.implicationId, form: challenge.form ?? 'direct' };
    case 'equivalence': return { area: 'equivalence', id: challenge.equivalenceId };
    case 'necessarySufficient': return { area: 'conditions', id: challenge.conditionId };
    case 'quantifier': return { area: 'quantifiers', id: challenge.quantifierId };
    case 'quantifierNegation': return { area: 'negation', id: challenge.quantifierId };
    case 'orderProof':
    case 'proofGap': return { area: 'proof', id: challenge.proofId };
    case 'fallacy': return { area: 'fallacy', id: challenge.fallacyId };
    default: return null;
  }
}

/** Les familles qu'un niveau tire (§38). */
export function kindsForLevel(level) {
  return DIFFICULTY_KINDS[level] ?? CHALLENGE_KINDS;
}

/**
 * La VÉRIFICATION d'une recherche menée dans le laboratoire, pour que
 * l'interface dise ce qu'elle a le droit de dire (§22).
 */
export function verdictOfSearch(kind, predicate, domain, excluded = []) {
  return searchVerdict(kind, predicate, sampleOf(domain), excluded);
}

function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}

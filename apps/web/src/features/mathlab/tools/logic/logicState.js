/**
 * L'ÉTAT du مختبر المنطق والبرهان — logique pure, sans React.
 *
 *     data = {
 *       area: 'statements' | 'connectors' | 'implication' | 'equivalence' |
 *             'counterexample' | 'conditions' | 'quantifiers' | 'negation' |
 *             'proof' | 'fallacy',
 *       statements:     { id, verdict, guess, probe },
 *       connectors:     { connector, p, q },
 *       implication:    { id, x, form, showSets },
 *       equivalence:    { id, x },
 *       counterexample: { id, tried[], found, candidate },
 *       conditions:     { id, x },
 *       quantifiers:    { id, tried[], witness, counterexample },
 *       negation:       { kind, quantifierId },
 *       proof:          { id, placed[], mode, gapSeed },
 *       induction:      { id, placed[], mode, gapSeed },   // son propre plateau
 *       stairs:         { sequenceId, rule, statuses[], cursor, mode },  // l'escalier
 *       fallacy:        { id, kind, tried[] },
 *       practice:       { open, level, solved, seen, hintsUsed },
 *     }
 *
 * ── Dix aires, un seul laboratoire ────────────────────────────────────────
 * Comme numberLab (MATH_LAB.md §5l) : les aires ne sont pas des routes, et
 * chacune garde SES réglages — l'élève qui règle un exemple dans « الشرطية »,
 * passe au contre-exemple et revient doit retrouver le sien.
 *
 * ── Ce qui n'est PAS stocké ──────────────────────────────────────────────
 * Rien de ce qui se CALCULE : ni table de vérité, ni régions de la droite,
 * ni partition d'ensembles, ni verdict d'une recherche, ni question
 * d'entraînement courante. Tout cela se refait des préréglages
 * (logicMath.js, presets.js) — en garder une copie serait garder un
 * mensonge en puissance, celui du jour où l'énoncé change et où la table
 * reste. Le document mesuré pèse ~600 octets ; la borne serveur est 8 Ko
 * (MathLabTools.php), vérifiée ci-dessous par logicState.test.js.
 */

import {
  STATEMENTS, IMPLICATIONS, EQUIVALENCES, COUNTEREXAMPLE_CHALLENGES, CONDITIONS,
  QUANTIFIER_STATEMENTS, PROOFS, INDUCTIONS, FALLACIES,
  INDUCTION_SEQUENCES, DEFAULT_SEQUENCE_ID,
  DEFAULT_STATEMENT_ID, DEFAULT_IMPLICATION_ID, DEFAULT_EQUIVALENCE_ID,
  DEFAULT_COUNTEREXAMPLE_ID, DEFAULT_CONDITION_ID, DEFAULT_QUANTIFIER_ID, DEFAULT_PROOF_ID,
  DEFAULT_INDUCTION_ID,
} from './presets.js';
import { CONNECTORS } from './logicMath.js';
import { INDUCTION_EXERCISES, DEFAULT_EXERCISE_ID, findExercise } from './inductionExercises.js';
import { RELATIONS } from './inductionModel.js';

/**
 * v2 — l'escalier des PROPOSITIONS (`recurrence`) s'ajoute à côté de
 * l'ancien escalier des règles explicites (`stairs`). L'ancien n'est pas
 * supprimé : un document v1 doit se rouvrir tel qu'il a été enregistré
 * (contrat du `MathLabTool`, MATH_LAB §3.1). `readLogicData` donne donc une
 * valeur par défaut à la nouvelle tranche sans toucher à l'ancienne.
 */
export const LOGIC_SCHEMA_VERSION = 2;

/** Les dix aires de §4, dans l'ordre où le laboratoire les propose. */
export const AREAS = Object.freeze([
  'statements', 'connectors', 'implication', 'equivalence', 'counterexample',
  'conditions', 'quantifiers', 'negation', 'proof', 'induction', 'fallacy',
]);

export const VERDICTS = Object.freeze(['true', 'false', 'depends']);
export const IMPLICATION_FORMS = Object.freeze(['direct', 'converse', 'contrapositive', 'inverse']);
export const PROOF_MODES = Object.freeze(['build', 'order', 'gap']);
export const NEGATION_KINDS = Object.freeze(['and', 'or', 'forall', 'exists']);
export const MAX_PRACTICE_LEVEL = 4;

/** Bornes : ce sont des limites de DESSIN et de document, dites franchement. */
export const MAX_TRIED = 40;

const isPlainObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const readEnum = (raw, allowed, fallback) => (allowed.includes(raw) ? raw : fallback);
const readBool = (raw, fallback) => (typeof raw === 'boolean' ? raw : fallback);
const readTrit = (raw, fallback) => (raw === true || raw === false ? raw : fallback);
const readId = (raw, list, fallback) => (list.some((item) => item.id === raw) ? raw : fallback);

/** Un champ de saisie relu d'un document : du texte borné, jamais autre chose. */
const readText = (raw, fallback, max = 120) => (typeof raw === 'string' ? raw.slice(0, max) : fallback);

function readNumber(raw, fallback, min = -1e6, max = 1e6) {
  const value = typeof raw === 'string' ? Number(raw.replace(',', '.')) : raw;
  if (!Number.isFinite(value)) return fallback;

  return Math.min(max, Math.max(min, value));
}

const readNumberOrNull = (raw) => (Number.isFinite(raw) ? readNumber(raw, null) : null);

function readNumberList(raw, fallback) {
  if (!Array.isArray(raw)) return fallback;

  return raw.filter(Number.isFinite).slice(0, MAX_TRIED);
}

const DEFAULTS = Object.freeze({
  statements: { id: DEFAULT_STATEMENT_ID, verdict: null, guess: null, probe: 0.5 },
  connectors: { connector: 'implies', p: true, q: false },
  implication: { id: DEFAULT_IMPLICATION_ID, x: 4, form: 'direct', showSets: true },
  equivalence: { id: DEFAULT_EQUIVALENCE_ID, x: 4 },
  counterexample: { id: DEFAULT_COUNTEREXAMPLE_ID, tried: [], found: null, candidate: 5 },
  conditions: { id: DEFAULT_CONDITION_ID, x: 8 },
  quantifiers: { id: DEFAULT_QUANTIFIER_ID, tried: [], witness: null, counterexample: null },
  negation: { kind: 'and', quantifierId: DEFAULT_QUANTIFIER_ID },
  proof: { id: DEFAULT_PROOF_ID, placed: [], mode: 'build', gapSeed: 1 },
  // La récurrence a SON plateau : un élève qui construit une preuve directe,
  // passe à la récurrence et revient doit retrouver la sienne intacte —
  // la même règle que pour les autres aires (§5n.2).
  induction: { id: DEFAULT_INDUCTION_ID, placed: [], mode: 'build', gapSeed: 1 },
  /**
   * §11, §28 — L'ESCALIER de l'élève : la suite travaillée, sa règle, et
   * l'état de chaque marche. On garde les VERDICTS (`statuses`), pas les
   * valeurs calculées : elles se refont de la règle et de la suite, et en
   * stocker une copie serait garder un mensonge en puissance — celui du jour
   * où la règle change et où les nombres restent (MATH_LAB §4).
   */
  stairs: { sequenceId: DEFAULT_SEQUENCE_ID, rule: '', statuses: [], cursor: 0, mode: 'climb' },
  /**
   * §1-§34 — L'ESCALIER DES PROPOSITIONS : un exercice (ses suites, sa
   * proposition), les verdicts de chaque marche, et l'ordre que l'élève a
   * posé pour l'hérédité.
   *
   * On garde la proposition ÉCRITE (`left`/`relation`/`right`), jamais ses
   * valeurs : elles se recalculent du modèle, et en stocker une copie serait
   * garder un mensonge en puissance le jour où la proposition change (§24).
   */
  recurrence: {
    exerciseId: DEFAULT_EXERCISE_ID,
    left: '', relation: '', right: '',   // vides = « celle de l'exercice » (§19)
    statuses: [], cursor: 0,
    phase: 'test',                       // 'test' (§2 mode A) | 'prove' (mode B)
    placed: [],                          // l'ordre des maillons d'hérédité
  },
  fallacy: { id: FALLACIES[0].id, kind: null, tried: [] },
  practice: { open: false, level: 1, solved: 0, seen: 0, hintsUsed: 0 },
});

/**
 * L'état d'un document NEUF.
 *
 * §54 : le laboratoire n'ouvre PAS sur un menu. Il ouvre sur l'aire
 * « المثال المضاد », c'est-à-dire sur une question posée — « هل تستطيع إثبات
 * أن هذه العبارة خاطئة؟ » — et une droite où chercher.
 */
export function createLogicData(seed = null) {
  const data = {
    area: 'counterexample',
    statements: { ...DEFAULTS.statements },
    connectors: { ...DEFAULTS.connectors },
    implication: { ...DEFAULTS.implication },
    equivalence: { ...DEFAULTS.equivalence },
    counterexample: { ...DEFAULTS.counterexample, tried: [] },
    conditions: { ...DEFAULTS.conditions },
    quantifiers: { ...DEFAULTS.quantifiers, tried: [] },
    negation: { ...DEFAULTS.negation },
    proof: { ...DEFAULTS.proof, placed: [] },
    induction: { ...DEFAULTS.induction, placed: [] },
    stairs: { ...DEFAULTS.stairs, statuses: [] },
    recurrence: { ...DEFAULTS.recurrence, statuses: [], placed: [] },
    fallacy: { ...DEFAULTS.fallacy, tried: [] },
    practice: { ...DEFAULTS.practice },
  };

  return applySeed(data, seed);
}

/**
 * L'amorce qu'une leçon transmet (openMathLab.js) : une aire, un préréglage.
 * Tout est facultatif et tout passe par les mêmes gardes — une leçon ne peut
 * pas fabriquer un document que l'instrument ne saurait rouvrir.
 */
export function applySeed(data, seed) {
  if (!isPlainObject(seed)) return data;
  const next = { ...data };
  if (AREAS.includes(seed.area)) next.area = seed.area;
  if (readId(seed.statementId, STATEMENTS, null)) next.statements = { ...next.statements, id: seed.statementId };
  if (readId(seed.implicationId, IMPLICATIONS, null)) next.implication = { ...next.implication, id: seed.implicationId };
  if (readId(seed.counterexampleId, COUNTEREXAMPLE_CHALLENGES, null)) {
    next.counterexample = { ...next.counterexample, id: seed.counterexampleId, tried: [], found: null };
  }
  if (readId(seed.proofId, PROOFS, null)) next.proof = { ...next.proof, id: seed.proofId, placed: [] };
  if (CONNECTORS.includes(seed.connector)) next.connectors = { ...next.connectors, connector: seed.connector };

  return next;
}

/**
 * RELIRE un document venu du serveur. Toute valeur absente, hors bornes ou
 * d'un autre type retombe sur son défaut : un document abîmé s'ouvre quand
 * même, sur quelque chose de sensé. Un identifiant de préréglage disparu
 * (préréglage retiré d'une version à l'autre) retombe sur le préréglage par
 * défaut plutôt que de rendre l'aire vide.
 */
export function normalizeLogicData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const base = createLogicData();
  const sub = (key) => (isPlainObject(source[key]) ? source[key] : {});

  const statements = sub('statements');
  const connectors = sub('connectors');
  const implication = sub('implication');
  const equivalence = sub('equivalence');
  const counterexample = sub('counterexample');
  const conditions = sub('conditions');
  const quantifiers = sub('quantifiers');
  const negation = sub('negation');
  const proof = sub('proof');
  const fallacy = sub('fallacy');
  const practice = sub('practice');

  const proofId = readId(proof.id, PROOFS, base.proof.id);
  const proofSteps = PROOFS.find((p) => p.id === proofId)?.steps ?? [];
  const validStepIds = new Set(proofSteps.map((step) => step.id));

  return {
    area: readEnum(source.area, AREAS, base.area),
    statements: {
      id: readId(statements.id, STATEMENTS, base.statements.id),
      verdict: readEnum(statements.verdict, VERDICTS, null),
      guess: readEnum(statements.guess, VERDICTS, null),
      probe: readNumber(statements.probe, base.statements.probe, -1e4, 1e4),
    },
    connectors: {
      connector: readEnum(connectors.connector, CONNECTORS, base.connectors.connector),
      p: readTrit(connectors.p, base.connectors.p),
      q: readTrit(connectors.q, base.connectors.q),
    },
    implication: {
      id: readId(implication.id, IMPLICATIONS, base.implication.id),
      x: readNumber(implication.x, base.implication.x, -1e4, 1e4),
      form: readEnum(implication.form, IMPLICATION_FORMS, base.implication.form),
      showSets: readBool(implication.showSets, base.implication.showSets),
    },
    equivalence: {
      id: readId(equivalence.id, EQUIVALENCES, base.equivalence.id),
      x: readNumber(equivalence.x, base.equivalence.x, -1e4, 1e4),
    },
    counterexample: {
      id: readId(counterexample.id, COUNTEREXAMPLE_CHALLENGES, base.counterexample.id),
      tried: readNumberList(counterexample.tried, base.counterexample.tried),
      found: readNumberOrNull(counterexample.found),
      candidate: readNumber(counterexample.candidate, base.counterexample.candidate, -1e4, 1e4),
    },
    conditions: {
      id: readId(conditions.id, CONDITIONS, base.conditions.id),
      x: readNumber(conditions.x, base.conditions.x, -1e4, 1e4),
    },
    quantifiers: {
      id: readId(quantifiers.id, QUANTIFIER_STATEMENTS, base.quantifiers.id),
      tried: readNumberList(quantifiers.tried, base.quantifiers.tried),
      witness: readNumberOrNull(quantifiers.witness),
      counterexample: readNumberOrNull(quantifiers.counterexample),
    },
    negation: {
      kind: readEnum(negation.kind, NEGATION_KINDS, base.negation.kind),
      quantifierId: readId(negation.quantifierId, QUANTIFIER_STATEMENTS, base.negation.quantifierId),
    },
    proof: {
      id: proofId,
      // Une étape inconnue (preuve modifiée depuis) est écartée, pas gardée :
      // sinon le constructeur afficherait une carte qui n'existe plus.
      placed: Array.isArray(proof.placed)
        ? proof.placed.filter((id) => typeof id === 'string' && validStepIds.has(id)).slice(0, proofSteps.length)
        : base.proof.placed,
      mode: readEnum(proof.mode, PROOF_MODES, base.proof.mode),
      gapSeed: readNumber(proof.gapSeed, base.proof.gapSeed, 0, 1e6),
    },
    induction: (() => {
      const induction = sub('induction');
      const id = readId(induction.id, INDUCTIONS, base.induction.id);
      const validIds = new Set((INDUCTIONS.find((p) => p.id === id)?.steps ?? []).map((step) => step.id));

      return {
        id,
        placed: Array.isArray(induction.placed)
          ? induction.placed.filter((step) => typeof step === 'string' && validIds.has(step)).slice(0, validIds.size)
          : base.induction.placed,
        mode: readEnum(induction.mode, PROOF_MODES, base.induction.mode),
        gapSeed: readNumber(induction.gapSeed, base.induction.gapSeed, 0, 1e6),
      };
    })(),
    stairs: (() => {
      const stairs = sub('stairs');
      const sequenceId = readId(stairs.sequenceId, INDUCTION_SEQUENCES, base.stairs.sequenceId);
      const sequence = INDUCTION_SEQUENCES.find((item) => item.id === sequenceId);
      const allowed = ['untested', 'correct', 'incorrect'];

      return {
        sequenceId,
        // La règle est du TEXTE, gardé tel quel : une règle invalide se
        // garde aussi, pour que l'élève retrouve ce qu'il avait écrit et le
        // corrige (même choix que le grapheur pour ses expressions).
        rule: typeof stairs.rule === 'string' ? stairs.rule.slice(0, 200) : base.stairs.rule,
        statuses: Array.isArray(stairs.statuses)
          ? stairs.statuses.filter((status) => allowed.includes(status)).slice(0, sequence?.count ?? 8)
          : base.stairs.statuses,
        cursor: Math.round(readNumber(stairs.cursor, base.stairs.cursor, 0, 20)),
        mode: readEnum(stairs.mode, ['climb', 'discover'], base.stairs.mode),
      };
    })(),
    recurrence: (() => {
      const recurrence = sub('recurrence');
      const exerciseId = readId(recurrence.exerciseId, INDUCTION_EXERCISES, base.recurrence.exerciseId);
      const exercise = findExercise(exerciseId);
      const allowed = ['untested', 'correct', 'incorrect'];
      const linkIds = new Set((exercise.chain ?? []).map((link) => link.id));

      return {
        exerciseId,
        // La proposition est du TEXTE, gardée telle quelle même invalide :
        // l'élève doit retrouver ce qu'il avait écrit pour le corriger.
        left: readText(recurrence.left, base.recurrence.left),
        relation: readEnum(recurrence.relation, ['', ...RELATIONS], base.recurrence.relation),
        right: readText(recurrence.right, base.recurrence.right),
        statuses: Array.isArray(recurrence.statuses)
          ? recurrence.statuses.filter((status) => allowed.includes(status)).slice(0, exercise.stepCount ?? 8)
          : base.recurrence.statuses,
        cursor: Math.round(readNumber(recurrence.cursor, base.recurrence.cursor, 0, 40)),
        phase: readEnum(recurrence.phase, ['test', 'prove'], base.recurrence.phase),
        placed: Array.isArray(recurrence.placed)
          ? recurrence.placed.filter((id) => typeof id === 'string' && linkIds.has(id)).slice(0, linkIds.size)
          : base.recurrence.placed,
      };
    })(),
    fallacy: {
      id: readId(fallacy.id, FALLACIES, base.fallacy.id),
      kind: typeof fallacy.kind === 'string' ? fallacy.kind : null,
      tried: readNumberList(fallacy.tried, base.fallacy.tried),
    },
    practice: {
      // `open` n'est PAS transitoire : l'élève qui rouvre son document
      // retrouve l'entraînement ouvert s'il l'avait laissé ainsi.
      open: readBool(practice.open, base.practice.open),
      level: Math.round(readNumber(practice.level, base.practice.level, 1, MAX_PRACTICE_LEVEL)),
      solved: Math.round(readNumber(practice.solved, base.practice.solved, 0, 1e6)),
      seen: Math.round(readNumber(practice.seen, base.practice.seen, 0, 1e6)),
      hintsUsed: Math.round(readNumber(practice.hintsUsed, base.practice.hintsUsed, 0, 1e6)),
    },
  };
}

/* ── Les transitions : toutes PURES, toutes testées ──────────────────── */

export const setArea = (data, area) => (AREAS.includes(area) ? { ...data, area } : data);

/** Changer de préréglage REMET à zéro ce qui appartenait à l'ancien (§53). */
export function setStatement(data, id) {
  if (!readId(id, STATEMENTS, null)) return data;

  return { ...data, statements: { ...data.statements, id, verdict: null, guess: null } };
}

export const setStatementGuess = (data, guess) => (VERDICTS.includes(guess)
  ? { ...data, statements: { ...data.statements, guess } }
  : data);

export const revealStatement = (data, verdict) => (VERDICTS.includes(verdict)
  ? { ...data, statements: { ...data.statements, verdict } }
  : data);

export const setProbe = (data, probe) => ({
  ...data, statements: { ...data.statements, probe: readNumber(probe, data.statements.probe, -1e4, 1e4) },
});

export const setConnector = (data, connector) => (CONNECTORS.includes(connector)
  ? { ...data, connectors: { ...data.connectors, connector } }
  : data);

export const setOperand = (data, which, value) => (which === 'p' || which === 'q'
  ? { ...data, connectors: { ...data.connectors, [which]: readTrit(value, data.connectors[which]) } }
  : data);

export const setImplication = (data, id) => (readId(id, IMPLICATIONS, null)
  ? { ...data, implication: { ...data.implication, id } }
  : data);

export const setImplicationForm = (data, form) => (IMPLICATION_FORMS.includes(form)
  ? { ...data, implication: { ...data.implication, form } }
  : data);

export const setImplicationX = (data, x) => ({
  ...data, implication: { ...data.implication, x: readNumber(x, data.implication.x, -1e4, 1e4) },
});

export const toggleSets = (data) => ({
  ...data, implication: { ...data.implication, showSets: !data.implication.showSets },
});

export const setEquivalence = (data, id) => (readId(id, EQUIVALENCES, null)
  ? { ...data, equivalence: { ...data.equivalence, id } }
  : data);

export function setCounterexampleChallenge(data, id) {
  if (!readId(id, COUNTEREXAMPLE_CHALLENGES, null)) return data;

  return { ...data, counterexample: { ...data.counterexample, id, tried: [], found: null } };
}

export const setCandidate = (data, candidate) => ({
  ...data,
  counterexample: { ...data.counterexample, candidate: readNumber(candidate, data.counterexample.candidate, -1e4, 1e4) },
});

/**
 * Essayer une valeur. `isCounterexample` est décidé par l'APPELANT à partir
 * du prédicat (logicMath.evaluate) — ce module ne refait pas la logique, il
 * enregistre l'essai. Une valeur déjà essayée ne s'ajoute pas deux fois.
 */
export function tryCandidate(data, value, isCounterexample) {
  if (!Number.isFinite(value)) return data;
  const current = data.counterexample;
  const tried = current.tried.includes(value) ? current.tried : [...current.tried, value].slice(-MAX_TRIED);

  return {
    ...data,
    counterexample: {
      ...current,
      tried,
      candidate: value,
      found: isCounterexample ? value : current.found,
    },
  };
}

export const setCondition = (data, id) => (readId(id, CONDITIONS, null)
  ? { ...data, conditions: { ...data.conditions, id } }
  : data);

export function setQuantifier(data, id) {
  if (!readId(id, QUANTIFIER_STATEMENTS, null)) return data;

  return { ...data, quantifiers: { ...data.quantifiers, id, tried: [], witness: null, counterexample: null } };
}

/** Un essai dans le laboratoire des quantificateurs : témoin OU contre-exemple. */
export function tryQuantifierValue(data, value, holds) {
  if (!Number.isFinite(value)) return data;
  const current = data.quantifiers;
  const tried = current.tried.includes(value) ? current.tried : [...current.tried, value].slice(-MAX_TRIED);

  return {
    ...data,
    quantifiers: {
      ...current,
      tried,
      witness: holds ? (current.witness ?? value) : current.witness,
      counterexample: holds ? current.counterexample : (current.counterexample ?? value),
    },
  };
}

export const setNegationKind = (data, kind) => (NEGATION_KINDS.includes(kind)
  ? { ...data, negation: { ...data.negation, kind } }
  : data);

export const setNegationQuantifier = (data, id) => (readId(id, QUANTIFIER_STATEMENTS, null)
  ? { ...data, negation: { ...data.negation, quantifierId: id } }
  : data);

export function setProof(data, id) {
  if (!readId(id, PROOFS, null)) return data;

  return { ...data, proof: { ...data.proof, id, placed: [] } };
}

export const setProofMode = (data, mode) => (PROOF_MODES.includes(mode)
  ? { ...data, proof: { ...data.proof, mode, placed: [] } }
  : data);

/** Poser une étape. La VALIDITÉ est décidée par proofMath ; ici on enregistre. */
export function placeStep(data, stepId) {
  if (typeof stepId !== 'string' || data.proof.placed.includes(stepId)) return data;

  return { ...data, proof: { ...data.proof, placed: [...data.proof.placed, stepId] } };
}

/** Retirer la dernière étape — §53 : on peut toujours défaire, rien ne se ferme. */
export const undoStep = (data) => ({
  ...data, proof: { ...data.proof, placed: data.proof.placed.slice(0, -1) },
});

export const resetProof = (data) => ({ ...data, proof: { ...data.proof, placed: [] } });

export const nextGap = (data) => ({
  ...data, proof: { ...data.proof, gapSeed: (data.proof.gapSeed + 1) % 1e6, placed: [] },
});

export function setFallacy(data, id) {
  if (!readId(id, FALLACIES, null)) return data;

  return { ...data, fallacy: { ...data.fallacy, id, kind: null, tried: [] } };
}

export const nameFallacy = (data, kind) => ({ ...data, fallacy: { ...data.fallacy, kind: typeof kind === 'string' ? kind : null } });

export function tryFallacyValue(data, value) {
  if (!Number.isFinite(value)) return data;
  const tried = data.fallacy.tried.includes(value) ? data.fallacy.tried : [...data.fallacy.tried, value].slice(-MAX_TRIED);

  return { ...data, fallacy: { ...data.fallacy, tried } };
}

export const togglePractice = (data) => ({ ...data, practice: { ...data.practice, open: !data.practice.open } });

export const setPracticeLevel = (data, level) => ({
  ...data,
  practice: { ...data.practice, level: Math.round(readNumber(level, data.practice.level, 1, MAX_PRACTICE_LEVEL)) },
});

/**
 * Enregistrer une tentative. `seen` compte les questions VUES (une par
 * question, pas une par essai) : c'est `next` qui l'incrémente, ici on ne
 * compte que les réussites et les indices. Pas de série, pas de médaille (§42).
 */
export const recordSolved = (data) => ({ ...data, practice: { ...data.practice, solved: data.practice.solved + 1 } });
export const recordSeen = (data) => ({ ...data, practice: { ...data.practice, seen: data.practice.seen + 1 } });
export const recordHint = (data) => ({ ...data, practice: { ...data.practice, hintsUsed: data.practice.hintsUsed + 1 } });

/** « مسح الكل » : tout revient à l'ouverture, les compteurs compris. */
/* ── §28 — la récurrence : son plateau, ses transitions ──────────────── */

export function setInduction(data, id) {
  if (!readId(id, INDUCTIONS, null)) return data;

  return { ...data, induction: { ...data.induction, id, placed: [] } };
}

export function placeInductionStep(data, stepId) {
  if (typeof stepId !== 'string' || data.induction.placed.includes(stepId)) return data;

  return { ...data, induction: { ...data.induction, placed: [...data.induction.placed, stepId] } };
}

export const undoInductionStep = (data) => ({
  ...data, induction: { ...data.induction, placed: data.induction.placed.slice(0, -1) },
});

export const resetInduction = (data) => ({ ...data, induction: { ...data.induction, placed: [] } });

/* ── §11-15, §28 — l'escalier : ses transitions ──────────────────────── */

/** Changer de suite REMET l'escalier à zéro : les verdicts ne la concernent plus. */
export function setStairsSequence(data, sequenceId) {
  if (!readId(sequenceId, INDUCTION_SEQUENCES, null)) return data;

  return { ...data, stairs: { ...data.stairs, sequenceId, rule: '', statuses: [], cursor: 0 } };
}

/**
 * §15 — écrire une règle DIFFÉRENTE efface les verdicts.
 *
 * Garder une marche verte obtenue avec `2n+1` alors que l'élève écrit
 * maintenant `2n` serait un mensonge visuel, et précisément sur le point que
 * l'écran enseigne. L'interface l'ANNONCE (elle ne le fait pas en silence) :
 * c'est `ruleChangedFrom` qui le lui permet.
 */
export function setStairsRule(data, rule) {
  const text = typeof rule === 'string' ? rule.slice(0, 200) : '';
  const changed = normalizeRule(text) !== normalizeRule(data.stairs.rule);

  return {
    ...data,
    stairs: {
      ...data.stairs,
      rule: text,
      statuses: changed ? [] : data.stairs.statuses,
      cursor: changed ? 0 : data.stairs.cursor,
    },
  };
}

/** Deux écritures de la même règle ne sont pas un changement (espaces, casse). */
const normalizeRule = (text) => String(text ?? '').replace(/\s+/g, '').toLowerCase();

/** Enregistrer le verdict d'une marche. Le calcul est fait par `inductionLab`. */
export function recordStairVerdict(data, index, status) {
  if (!Number.isInteger(index) || index < 0 || index > 20) return data;
  if (!['untested', 'correct', 'incorrect'].includes(status)) return data;
  const statuses = [...data.stairs.statuses];
  while (statuses.length <= index) statuses.push('untested');
  statuses[index] = status;

  return { ...data, stairs: { ...data.stairs, statuses } };
}

export const setStairsCursor = (data, cursor) => ({
  ...data,
  stairs: { ...data.stairs, cursor: Math.round(readNumber(cursor, data.stairs.cursor, 0, 20)) },
});

export const setStairsMode = (data, mode) => (['climb', 'discover'].includes(mode)
  ? { ...data, stairs: { ...data.stairs, mode } }
  : data);

export const resetStairs = (data) => ({
  ...data, stairs: { ...data.stairs, statuses: [], cursor: 0 },
});

/* ── §18-§34 — l'escalier des propositions : ses transitions ──────────── */

/**
 * Changer d'exercice remet TOUT à zéro : les verdicts appartenaient à
 * d'autres suites et à une autre proposition (§24).
 */
export function setRecurrenceExercise(data, exerciseId) {
  if (!readId(exerciseId, INDUCTION_EXERCISES, null)) return data;

  return {
    ...data,
    recurrence: {
      ...data.recurrence,
      exerciseId,
      left: '', relation: '', right: '',
      statuses: [], cursor: 0, placed: [], phase: 'test',
    },
  };
}

/**
 * §24 — LA RÈGLE LA PLUS IMPORTANTE DE CET ÉCRAN.
 *
 * Changer la proposition invalide toutes les marches. Garder une marche
 * verte obtenue avec `uₙ < 3` alors que l'élève écrit maintenant `uₙ < 4`
 * serait un mensonge visuel — et l'écran ANNONCE le reset au lieu de le
 * faire en silence (`propositionChanged`).
 */
export function setRecurrenceProposition(data, patch) {
  const current = data.recurrence;
  const next = {
    left: patch.left !== undefined ? String(patch.left).slice(0, 120) : current.left,
    relation: patch.relation !== undefined
      ? (RELATIONS.includes(patch.relation) ? patch.relation : current.relation)
      : current.relation,
    right: patch.right !== undefined ? String(patch.right).slice(0, 120) : current.right,
  };
  const changed = propositionChanged(current, next);

  return {
    ...data,
    recurrence: {
      ...current,
      ...next,
      statuses: changed ? [] : current.statuses,
      cursor: changed ? 0 : current.cursor,
    },
  };
}

/** Deux écritures de la même proposition ne sont pas un changement. */
export function propositionChanged(before, after) {
  const key = (p) => `${squash(p.left)}|${p.relation}|${squash(p.right)}`;

  return key(before) !== key(after);
}

const squash = (text) => String(text ?? '').replace(/\s+/g, '');

/** Enregistrer le verdict d'une marche. Le calcul est fait par `inductionModel`. */
export function recordRecurrenceVerdict(data, index, status) {
  if (!Number.isInteger(index) || index < 0 || index > 40) return data;
  if (!['untested', 'correct', 'incorrect'].includes(status)) return data;
  const statuses = [...data.recurrence.statuses];
  while (statuses.length <= index) statuses.push('untested');
  statuses[index] = status;

  return { ...data, recurrence: { ...data.recurrence, statuses } };
}

export const setRecurrenceCursor = (data, cursor) => ({
  ...data,
  recurrence: {
    ...data.recurrence,
    cursor: Math.round(readNumber(cursor, data.recurrence.cursor, 0, 40)),
  },
});

/** §2, §26 — passer de l'expérimentation numérique à la construction de la preuve. */
export const setRecurrencePhase = (data, phase) => (['test', 'prove'].includes(phase)
  ? { ...data, recurrence: { ...data.recurrence, phase } }
  : data);

/** Poser un maillon d'hérédité (§28). Un maillon déjà posé ne se double pas. */
export function placeRecurrenceLink(data, linkId) {
  const exercise = findExercise(data.recurrence.exerciseId);
  const valid = (exercise.chain ?? []).some((link) => link.id === linkId);
  if (!valid || data.recurrence.placed.includes(linkId)) return data;

  return { ...data, recurrence: { ...data.recurrence, placed: [...data.recurrence.placed, linkId] } };
}

export const resetRecurrenceProof = (data) => ({
  ...data, recurrence: { ...data.recurrence, placed: [] },
});

export const resetRecurrence = (data) => ({
  ...data, recurrence: { ...data.recurrence, statuses: [], cursor: 0 },
});

export const clearLogicData = () => createLogicData();

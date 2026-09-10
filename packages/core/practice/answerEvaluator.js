/**
 * L'évaluateur de réponses — la seule chose qui décide si une réponse est
 * juste, et sous quelle issue.
 *
 * Il ne rend pas un booléen. Une tentative d'élève porte plus d'information
 * que « juste / faux » : une réponse à moitié bonne (le coefficient directeur
 * trouvé, l'ordonnée à l'origine manquée) et une réponse illisible ne disent
 * pas la même chose du raisonnement, et ne doivent pas peser pareil sur la
 * maîtrise. D'où les six issues de la cible §11.
 *
 * `syntax_error` en particulier n'est PAS un `incorrect` : ne pas savoir
 * écrire un nombre n'est pas se tromper de nombre. Le moteur de maîtrise
 * l'ignore (elle ne bouge pas la confiance) plutôt que de la compter comme un
 * échec mathématique.
 *
 * Fonctions pures : aucun accès réseau, aucun état, aucun React. Le contenu
 * de la question entre, une évaluation sort.
 */
import { Rational, rationalEquals } from './rational.js';
import { parseAffineAnswer, affineEquals, affineToString } from './affineCanonical.js';
import { parseInterval, intervalEquals, intervalToString } from './intervalCompare.js';

export const OUTCOMES = Object.freeze({
  CORRECT: 'correct',
  EQUIVALENT_CORRECT: 'equivalent_correct',
  PARTIALLY_CORRECT: 'partially_correct',
  INCORRECT: 'incorrect',
  SYNTAX_ERROR: 'syntax_error',
  ABANDONED: 'abandoned',
});

/** Les issues qui comptent comme une réussite pour la maîtrise. */
export const isSuccessOutcome = (o) => o === OUTCOMES.CORRECT || o === OUTCOMES.EQUIVALENT_CORRECT;

/** Les issues qui ne portent aucune information mathématique. */
export const isInertOutcome = (o) => o === OUTCOMES.SYNTAX_ERROR || o === OUTCOMES.ABANDONED;

/** Types de réponse gérés. Le validateur de contenu compare cette liste au schéma. */
export const SUPPORTED_ANSWER_TYPES = Object.freeze([
  'choice', 'multiChoice', 'rational', 'affine', 'interval', 'point',
]);

const result = (outcome, { misconceptionId = null, normalized = '', feedbackKey = null } = {}) => ({
  outcome,
  misconceptionId,
  normalized,
  isCorrect: isSuccessOutcome(outcome),
  feedbackKey: feedbackKey ?? (isSuccessOutcome(outcome) ? 'correct' : outcome === 'partially_correct' ? 'partial' : 'incorrect'),
});

const syntaxError = (normalized = '') => result(OUTCOMES.SYNTAX_ERROR, { normalized });

/** Cherche la réponse fausse dans les signatures déclarées par la question. */
function matchSignature(question, matches) {
  for (const sig of question.misconceptionSignatures ?? []) {
    if (matches(sig.value)) return sig.id;
  }
  return null;
}

function evaluateChoice(answer, question) {
  const picked = answer?.choiceId;
  const choice = (question.choices ?? []).find((c) => c.id === picked);
  if (!choice) return result(OUTCOMES.INCORRECT, { normalized: String(picked ?? '') });
  return choice.isCorrect
    ? result(OUTCOMES.CORRECT, { normalized: choice.id })
    : result(OUTCOMES.INCORRECT, { misconceptionId: choice.misconceptionId ?? null, normalized: choice.id });
}

function evaluateMultiChoice(answer, question) {
  const picked = new Set(answer?.choiceIds ?? []);
  const expected = new Set((question.choices ?? []).filter((c) => c.isCorrect).map((c) => c.id));
  const normalized = [...picked].sort().join(',');
  if (picked.size === 0) return result(OUTCOMES.INCORRECT, { normalized });

  const hitAll = [...expected].every((id) => picked.has(id));
  const noExtra = [...picked].every((id) => expected.has(id));
  if (hitAll && noExtra) return result(OUTCOMES.CORRECT, { normalized });

  // Une sélection strictement incluse dans la bonne réponse est un raisonnement
  // partiel, pas une erreur : l'élève a vu juste, mais pas tout.
  if (noExtra && picked.size > 0) return result(OUTCOMES.PARTIALLY_CORRECT, { normalized });

  const wrong = [...picked].find((id) => !expected.has(id));
  const misconceptionId = (question.choices ?? []).find((c) => c.id === wrong)?.misconceptionId ?? null;
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized });
}

function evaluateRational(answer, question) {
  const given = Rational.parse(answer?.value);
  if (!given) return syntaxError(String(answer?.value ?? ''));

  const expected = Rational.parse(question.expectedAnswer);
  if (!expected) throw new Error(`expectedAnswer illisible pour ${question.id}`);

  const policy = question.evaluationPolicy ?? {};
  const tolerance = policy.tolerance ? Rational.parse(policy.tolerance) : null;

  if (rationalEquals(given, expected, tolerance)) {
    // Même valeur, écriture différente ("3/2" pour "1,5") : juste, et on peut
    // le dire à l'élève plutôt que de faire comme s'il avait recopié.
    const sameText = String(question.expectedAnswer).trim() === String(answer.value).trim();
    return result(sameText ? OUTCOMES.CORRECT : OUTCOMES.EQUIVALENT_CORRECT, { normalized: given.toString() });
  }

  const misconceptionId = matchSignature(question, (v) => {
    const sig = Rational.parse(v);
    return sig ? sig.equals(given) : false;
  });
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized: given.toString() });
}

function evaluateAffine(answer, question) {
  const given = parseAffineAnswer(answer);
  if (!given) return syntaxError(typeof answer?.latex === 'string' ? answer.latex : JSON.stringify(answer ?? null));

  const expected = parseAffineAnswer(question.expectedAnswer);
  if (!expected) throw new Error(`expectedAnswer illisible pour ${question.id}`);

  const { equal, matchedA, matchedB } = affineEquals(given, expected);
  const normalized = affineToString(given);
  if (equal) return result(OUTCOMES.CORRECT, { normalized });

  const misconceptionId = matchSignature(question, (v) => {
    const sig = parseAffineAnswer(v);
    return sig ? affineEquals(given, sig).equal : false;
  });

  // Un seul coefficient juste : le raisonnement a porté, la lecture a manqué.
  // C'est l'information la plus utile que produise tout l'évaluateur.
  if ((matchedA || matchedB) && !misconceptionId) {
    return result(OUTCOMES.PARTIALLY_CORRECT, { normalized, feedbackKey: 'partial' });
  }
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized });
}

function evaluateInterval(answer, question) {
  const given = parseInterval(answer);
  if (!given) return syntaxError(JSON.stringify(answer ?? null));

  const expected = parseInterval(question.expectedAnswer);
  if (!expected) throw new Error(`expectedAnswer illisible pour ${question.id}`);

  const normalized = intervalToString(given);
  if (intervalEquals(given, expected)) return result(OUTCOMES.CORRECT, { normalized });

  const misconceptionId = matchSignature(question, (v) => {
    const sig = parseInterval(v);
    return sig ? intervalEquals(given, sig) : false;
  });
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized });
}

function evaluatePoint(answer, question) {
  const x = Rational.parse(answer?.x);
  const y = Rational.parse(answer?.y);
  if (!x || !y) return syntaxError(`${answer?.x ?? ''};${answer?.y ?? ''}`);

  const ex = Rational.parse(question.expectedAnswer?.x);
  const ey = Rational.parse(question.expectedAnswer?.y);
  if (!ex || !ey) throw new Error(`expectedAnswer illisible pour ${question.id}`);

  const normalized = `(${x.toString()};${y.toString()})`;
  const matchedX = x.equals(ex);
  const matchedY = y.equals(ey);
  if (matchedX && matchedY) return result(OUTCOMES.CORRECT, { normalized });

  const misconceptionId = matchSignature(question, (v) => {
    const sx = Rational.parse(v?.x);
    const sy = Rational.parse(v?.y);
    return !!sx && !!sy && sx.equals(x) && sy.equals(y);
  });
  if ((matchedX || matchedY) && !misconceptionId) {
    return result(OUTCOMES.PARTIALLY_CORRECT, { normalized, feedbackKey: 'partial' });
  }
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized });
}

const EVALUATORS = {
  choice: evaluateChoice,
  multiChoice: evaluateMultiChoice,
  rational: evaluateRational,
  affine: evaluateAffine,
  interval: evaluateInterval,
  point: evaluatePoint,
};

/**
 * @param {object} answer   La réponse brute de l'élève, forme selon answerType.
 * @param {object} question La question du contenu, réponse attendue comprise.
 * @returns {{outcome: string, misconceptionId: ?string, normalized: string, isCorrect: boolean, feedbackKey: string}}
 * @throws {Error} sur un answerType inconnu — jamais un `incorrect` silencieux,
 *   qui ferait passer un bug de contenu pour une erreur d'élève.
 */
export function evaluateAnswer(answer, question) {
  if (answer === null || answer === undefined) return result(OUTCOMES.ABANDONED);
  const evaluator = EVALUATORS[question?.answerType];
  if (!evaluator) throw new Error(`answerType inconnu : ${JSON.stringify(question?.answerType)}`);
  return evaluator(answer, question);
}

/** Le message à montrer, choisi par l'issue. */
export function feedbackFor(question, evaluation, misconceptions = {}) {
  if (evaluation.misconceptionId && misconceptions[evaluation.misconceptionId]) {
    return misconceptions[evaluation.misconceptionId].explanation;
  }
  if (evaluation.outcome === OUTCOMES.SYNTAX_ERROR) {
    return "Je n'ai pas réussi à lire ta réponse. Vérifie le format attendu.";
  }
  const fb = question.feedback ?? {};
  return fb[evaluation.feedbackKey] ?? fb.incorrect ?? '';
}

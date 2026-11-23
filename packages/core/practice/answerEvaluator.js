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
import { toLatinDigits } from '../numberFormat.js';
import { Rational, rationalEquals, normalizeNumeric } from './rational.js';
import { parseAffineAnswer, affineEquals, affineToString } from './affineCanonical.js';
import { parseInterval, intervalEquals, intervalToString } from './intervalCompare.js';
import { isIrreducible } from '../arithmetic/divisibility.js';
import { parseFactorization, productOf, isPrime, canonicalFactorization, MAX_FACTORIZED } from './factorization.js';

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
  'choice', 'multiChoice', 'rational', 'affine', 'interval', 'point', 'integerSet', 'selfCheck', 'factorization',
]);

/**
 * Une question COMPTE-t-elle pour la maîtrise ? Non quand elle est
 * auto-évaluée (`selfCheck` : « بيّن أن »، « برّر » — l'élève rédige sur sa
 * feuille, lit le corrigé type et se note lui-même) ou quand le contenu la
 * déclare `counted: false` (une étape d'exercice de BEM qui relève d'une autre
 * leçon). Elle est jugée et affichée pareil ; seule la preuve de maîtrise
 * n'est pas écrite (PracticeEvidenceRecorder.php).
 */
export const countsForMastery = (question) => question?.answerType !== 'selfCheck' && question?.counted !== false;

/* ── Ensembles d'entiers naturels (« عيّن كل قواسم العدد 84 ») ──────────────
 *
 * La réponse d'un élève est une LISTE : « 1, 2, 3, 6 » ou « 1 ؛ 2 ؛ 3 ؛ 6 » ou
 * « ١، ٢، ٣، ٦ ». L'ordre et les doublons ne comptent pas — c'est un ensemble.
 * Les chiffres arabo-indiens (U+0660–U+0669) et les séparateurs arabes (،  ؛)
 * sont acceptés : l'interface DZ est en arabe, et refuser « ١، ٢ » serait
 * traiter une convention d'écriture comme une erreur mathématique.
 */
// Les écritures d'ensemble que l'élève a sous les yeux sont acceptées aussi :
// les accolades (les corrections de la leçon écrivent « \{8 ; 12 ; 24\} »),
// la conjonction « و » (le manuel écrit « 1 و 60 ») et un point final.
// Un point AU MILIEU reste une erreur : « 1.5 » n'est pas l'ensemble {1, 5}.
function normalizeIntegerSetInput(raw) {
  const s = toLatinDigits(raw)
    .replace(/\\[{}]/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/و/g, ' ')
    .replace(/[،؛;,\n]/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .trim();
  return s === '' ? [] : s.split(/\s+/);
}

/**
 * @param {string|number[]|null|undefined} raw
 * @returns {number[]|null} l'ensemble trié, ou null si un jeton n'est pas un naturel
 */
export function parseIntegerSet(raw) {
  if (raw === null || raw === undefined) return null;
  const tokens = Array.isArray(raw) ? raw.map(String) : normalizeIntegerSetInput(raw);
  if (tokens.length === 0) return null;
  const out = new Set();
  for (const t of tokens) {
    if (!/^\d+$/.test(t)) return null;
    out.add(Number(t));
  }
  return [...out].sort((x, y) => x - y);
}

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
    // `requiredForm: 'irreducible'` (leçon « اختزال كسر ») : la VALEUR est
    // juste mais la fraction écrite n'est pas réduite (« 21/12 » pour 7/4).
    // Ce n'est ni une erreur de calcul ni une réussite : la tâche demandait
    // précisément la forme irréductible. Issue partielle, message dédié.
    if (policy.requiredForm === 'irreducible') {
      const written = rawFractionParts(answer.value);
      if (written && !isIrreducible(written.n, written.d)) {
        // La SIGNATURE reste consultée : « 14/21 » et « 4/6 » ne sont pas la
        // même erreur au hasard, ce sont des réductions ARRÊTÉES EN CHEMIN,
        // et la leçon a un message pour cela. Sans cette recherche, une
        // misconception déclarée dans le contenu ne se déclenchait jamais :
        // l'élève lisait « pas encore irréductible » sans savoir pourquoi.
        const partialId = matchSignature(question, (v) => {
          const sig = rawFractionParts(v);
          return sig ? sig.n === written.n && sig.d === written.d : false;
        });
        return result(OUTCOMES.PARTIALLY_CORRECT, { normalized: given.toString(), feedbackKey: 'notIrreducible', misconceptionId: partialId });
      }
      // Une écriture DÉCIMALE (« 1,75 » pour 7/4) n'est pas une fraction du
      // tout : la tâche demandait « على شكل كسر غير قابل للاختزال ». La valeur
      // est juste, la forme ne l'est pas — même issue partielle. Un entier
      // reste accepté : c'est la forme irréductible d'un rationnel entier.
      if (!written && given.d !== 1) {
        return result(OUTCOMES.PARTIALLY_CORRECT, { normalized: given.toString(), feedbackKey: 'notIrreducible' });
      }
    }
    // Même valeur, écriture différente ("3/2" pour "1,5") : juste, et on peut
    // le dire à l'élève plutôt que de faire comme s'il avait recopié.
    // La VIRGULE et le POINT décimaux sont la MÊME écriture (propriétaire,
    // 2026-10-07 : « 1,5 » et « 1.5 » sont tous deux justes, sans remarque).
    const sameText = sameWriting(question.expectedAnswer, answer.value);
    return result(sameText ? OUTCOMES.CORRECT : OUTCOMES.EQUIVALENT_CORRECT, { normalized: given.toString() });
  }

  const misconceptionId = matchSignature(question, (v) => {
    const sig = Rational.parse(v);
    return sig ? sig.equals(given) : false;
  });
  return result(OUTCOMES.INCORRECT, { misconceptionId, normalized: given.toString() });
}

/**
 * Les composantes ÉCRITES d'une fraction « a/b » ou « \\frac{a}{b} », sans
 * réduction — c'est ce qu'il faut pour juger la forme, pas la valeur.
 * @returns {{n:number, d:number}|null} null si la saisie n'est pas une fraction
 */
function rawFractionParts(raw) {
  const s = normalizeNumeric(raw);
  const m = s.match(/^([+-]?\d+)\/([+-]?\d+)$/) || s.match(/^\\frac\{([+-]?\d+)\}\{([+-]?\d+)\}$/);
  if (!m) return null;
  const n = Math.abs(Number(m[1]));
  const d = Math.abs(Number(m[2]));
  return d === 0 ? null : { n, d };
}

function evaluateIntegerSet(answer, question) {
  const given = parseIntegerSet(answer?.value);
  if (!given) return syntaxError(String(answer?.value ?? ''));

  const expected = parseIntegerSet(question.expectedAnswer);
  if (!expected) throw new Error(`expectedAnswer illisible pour ${question.id}`);

  const normalized = given.join(';');
  const expectedSet = new Set(expected);
  const hitAll = expected.every((v) => given.includes(v));
  const noExtra = given.every((v) => expectedSet.has(v));
  if (hitAll && noExtra) return result(OUTCOMES.CORRECT, { normalized });

  const misconceptionId = matchSignature(question, (v) => {
    const sig = parseIntegerSet(v);
    return sig ? sig.join(';') === normalized : false;
  });
  if (misconceptionId) return result(OUTCOMES.INCORRECT, { misconceptionId, normalized });

  // Un sous-ensemble strict de la bonne réponse : l'élève a trouvé des
  // diviseurs, pas tous — la même lecture que pour multiChoice.
  if (noExtra) return result(OUTCOMES.PARTIALLY_CORRECT, { normalized, feedbackKey: 'partial' });
  return result(OUTCOMES.INCORRECT, { misconceptionId: null, normalized });
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

/* ── Décomposition en produit de facteurs premiers (3e) ──────────────────────
 *
 * La clé est canonique (`2^3*3^2*5`) ; l'élève écrit un produit dans n'importe quel ordre (factorization.js).
 * Deux modes, par `evaluationPolicy.requiredForm` :
 *   - absent : tout produit de nombres PREMIERS égal au nombre est juste — `2^3*3^2*5` (chaque premier une fois)
 *     est `correct`, `2*2*2*3*3*5` (un premier répété) est `equivalent_correct` ;
 *   - `'powers'` : chaque premier UNE fois avec son exposant — un premier répété est `partially_correct`
 *     (`feedbackKey: 'powersExpected'`), comme une fraction juste mais non réduite.
 * Les erreurs, toutes `incorrect`, se distinguent par `feedbackKey` :
 *   - `notPrime` : le produit vaut le nombre mais un facteur n'est pas premier (`4*15`, `1*2^3*…`, le nombre seul) ;
 *   - `zeroExponent` : le produit vaut le nombre mais un exposant vaut 0 ;
 *   - `wrongExponents` : exactement les bons premiers, mais le produit n'est pas le nombre ;
 *   - `wrongProduct` : tout autre produit qui n'est pas le nombre.
 * Une signature (`misconceptionSignatures`) correspond quand elle a la même écriture canonique que la réponse.
 */
function evaluateFactorization(answer, question) {
  const raw = answer?.value;
  const given = parseFactorization(raw);
  if (!given) return syntaxError(String(raw ?? ''));

  const expected = parseFactorization(question.expectedAnswer);
  const n = expected ? productOf(expected) : null;
  if (!expected || n === null || n < 2 || n > MAX_FACTORIZED || !expected.every((f) => f.e >= 1 && isPrime(f.p))) {
    throw new Error(`expectedAnswer illisible pour ${question.id}`);
  }

  const normalized = canonicalFactorization(given);
  const signature = () =>
    matchSignature(question, (v) => {
      const sig = parseFactorization(v);
      return sig ? canonicalFactorization(sig) === normalized : false;
    });
  const bases = new Set(given.map((f) => f.p));

  if (productOf(given) === n) {
    if (given.some((f) => f.e === 0)) return result(OUTCOMES.INCORRECT, { normalized, feedbackKey: 'zeroExponent', misconceptionId: signature() });
    if (!given.every((f) => isPrime(f.p))) return result(OUTCOMES.INCORRECT, { normalized, feedbackKey: 'notPrime', misconceptionId: signature() });
    if (bases.size === given.length) return result(OUTCOMES.CORRECT, { normalized });
    if (question.evaluationPolicy?.requiredForm === 'powers') {
      return result(OUTCOMES.PARTIALLY_CORRECT, { normalized, feedbackKey: 'powersExpected', misconceptionId: signature() });
    }
    return result(OUTCOMES.EQUIVALENT_CORRECT, { normalized });
  }

  const primes = new Set(expected.map((f) => f.p));
  const samePrimes = given.every((f) => f.e >= 1 && primes.has(f.p)) && bases.size === primes.size;
  return result(OUTCOMES.INCORRECT, { normalized, feedbackKey: samePrimes ? 'wrongExponents' : 'wrongProduct', misconceptionId: signature() });
}

/* ── Auto-évaluation (« بيّن أن »، « برّر ») ──────────────────────────────
 *
 * Une démonstration ne se corrige pas automatiquement. Deux temps (décision
 * du propriétaire, 2026-10-06) :
 *  1. l'élève ÉCRIT sa démonstration et valide : `{ text }` est enregistré et
 *     VERROUILLÉ — issue `abandoned` (inerte : aucune information
 *     mathématique tant qu'il ne s'est pas noté), `normalized: 'self:pending'` ;
 *  2. le corrigé type s'affiche, l'élève se note : `{ text, selfMark }` avec le
 *     MÊME texte → `correct` / `incorrect`.
 * Jamais compté pour la maîtrise (countsForMastery).
 */
function evaluateSelfCheck(answer) {
  const mark = answer?.selfMark;
  if (mark === 'correct') return result(OUTCOMES.CORRECT, { normalized: 'self:correct' });
  if (mark === 'incorrect') return result(OUTCOMES.INCORRECT, { normalized: 'self:incorrect' });
  if (mark === undefined || mark === null) {
    const text = typeof answer?.text === 'string' ? answer.text.trim() : '';
    if (text) return result(OUTCOMES.ABANDONED, { normalized: 'self:pending', feedbackKey: 'pending' });
  }
  return syntaxError(String(mark ?? ''));
}

const EVALUATORS = {
  choice: evaluateChoice,
  multiChoice: evaluateMultiChoice,
  rational: evaluateRational,
  affine: evaluateAffine,
  interval: evaluateInterval,
  point: evaluatePoint,
  integerSet: evaluateIntegerSet,
  selfCheck: evaluateSelfCheck,
  factorization: evaluateFactorization,
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

/** Deux écritures identiques au séparateur décimal près (« , » « . » « ٫ ») — jumeau PHP AnswerEvaluator::sameWriting. */
function sameWriting(a, b) {
  const norm = (v) => String(v ?? '').trim().replace(/[.٫]/g, ',');
  return norm(a) === norm(b);
}

/**
 * Le message à montrer, choisi par l'issue.
 *
 * Le noyau ne traduit pas : une réponse illisible prend le texte que l'appelant
 * passe (`messages.syntaxError`, clé i18n `practice.syntaxErrorFeedback`), sinon
 * le format attendu de la question — jamais une phrase en dur.
 */
export function feedbackFor(question, evaluation, misconceptions = {}, messages = {}) {
  if (evaluation.misconceptionId && misconceptions[evaluation.misconceptionId]) {
    return misconceptions[evaluation.misconceptionId].explanation;
  }
  if (evaluation.outcome === OUTCOMES.SYNTAX_ERROR) {
    return messages.syntaxError ?? question.answerFormat ?? '';
  }
  const fb = question.feedback ?? {};
  return fb[evaluation.feedbackKey] ?? fb.incorrect ?? '';
}

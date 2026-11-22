/**
 * L'HISTORIQUE DES QUESTIONS d'un exercice — ce que l'élève a déjà fait.
 *
 * Quand un exercice enchaîne plusieurs questions, la question 2 s'appuie
 * souvent sur le résultat de la question 1 (« جِد أكبر قيمة للعدد x » puis
 * « كم مرة استعملنا هذا الدنّ… ? »). L'ancien lecteur effaçait tout en passant
 * à la suite : l'élève perdait sa propre réponse au moment précis où il en
 * avait besoin.
 *
 * Ce module ne crée PAS un second état d'exercice. Une entrée est une
 * PHOTOGRAPHIE, prise au moment où l'élève quitte la question, de ce que le
 * lecteur tient déjà : la question (contenu), la réponse saisie, le verdict
 * affiché (celui du serveur), le message de retour, le nombre d'indices
 * demandés. Rien n'est envoyé nulle part : le serveur reste la source de
 * vérité de la séance, des tentatives et de la maîtrise.
 *
 * Tout est pur et sans i18n : le composant traduit, ce module décide.
 */

/**
 * La TONALITÉ d'une issue — une seule table pour le retour, l'historique et
 * la barre de progression, pour qu'une même issue ait partout la même
 * couleur ET la même icône (jamais la couleur seule).
 *
 * @param {string|null|undefined} outcome
 * @returns {'correct'|'partial'|'incorrect'|'neutral'}
 */
export function outcomeTone(outcome) {
  switch (outcome) {
    case 'correct':
    case 'equivalent_correct':
      return 'correct';
    case 'partially_correct':
      return 'partial';
    case 'incorrect':
      return 'incorrect';
    default:
      // syntax_error, abandoned, inconnu : ni réussite ni échec.
      return 'neutral';
  }
}

const trim = (v) => (v == null ? '' : String(v).trim());

/**
 * La réponse de l'élève, telle qu'on la lui RELIT.
 *
 * Deux genres, parce qu'ils ne se rendent pas pareil :
 *  - `math` : ce qu'il a TAPÉ (nombre, fraction, couple, intervalle,
 *    ensemble). Affiché tel quel, isolé LTR — c'est son écriture, on ne la
 *    corrige pas, et on ne la confie pas à KaTeX (une saisie libre n'est pas
 *    du LaTeX).
 *  - `rich` : ce qu'il a CHOISI (un QCM). Le contenu du choix, qui peut
 *    porter du `$…$`, passe par RichText comme partout ailleurs.
 *
 * @returns {{kind: 'math'|'rich', text: string}|null} null = rien de saisi
 */
export function formatAnswer(question, answer) {
  if (!question || answer == null) return null;

  switch (question.answerType) {
    case 'choice': {
      const choice = (question.choices ?? []).find((c) => c.id === answer.choiceId);
      return choice ? { kind: 'rich', text: choice.content } : null;
    }
    case 'multiChoice': {
      const ids = answer.choiceIds ?? [];
      const picked = (question.choices ?? []).filter((c) => ids.includes(c.id));
      return picked.length ? { kind: 'rich', text: picked.map((c) => c.content).join(' ، ') } : null;
    }
    case 'rational':
      // Saisie MathLive (feuille d'examen) : on relit la formule telle qu'écrite.
      if (typeof answer.latex === 'string' && answer.latex.trim()) return { kind: 'rich', text: `$${answer.latex}$` };
      // falls through
    case 'integerSet': {
      const text = trim(answer.value);
      return text ? { kind: 'math', text } : null;
    }
    case 'affine': {
      const a = trim(answer.a);
      const b = trim(answer.b);
      if (!a && !b) return null;
      return { kind: 'math', text: `a = ${a || '?'} ; b = ${b || '?'}` };
    }
    case 'point': {
      const x = trim(answer.x);
      const y = trim(answer.y);
      if (!x && !y) return null;
      return { kind: 'math', text: `(${x || '?'} ; ${y || '?'})` };
    }
    case 'selfCheck': {
      // « بيّن أن » : la démonstration écrite, et la note que l'élève s'est
      // donnée après le corrigé type (absente tant qu'il ne s'est pas noté).
      const text = trim(answer.text);
      if (!text) return null;
      const mark = answer.selfMark === 'correct' || answer.selfMark === 'incorrect' ? answer.selfMark : 'pending';
      return { kind: 'self', text, mark };
    }
    case 'interval': {
      // Mêmes conventions que IntervalInput : borne vide = infini, crochet
      // ouvert par défaut ; notation algérienne/française « ]a ; b] ».
      const lo = trim(answer.lo);
      const hi = trim(answer.hi);
      const loOpen = lo === '' || answer.loOpen !== false;
      const hiOpen = hi === '' || answer.hiOpen !== false;
      return {
        kind: 'math',
        text: `${loOpen ? ']' : '['}${lo || '−∞'} ; ${hi || '+∞'}${hiOpen ? '[' : ']'}`,
      };
    }
    default:
      return null;
  }
}

/**
 * La photographie d'une question validée, au moment de la quitter.
 *
 * @param {object} p
 * @param {object} p.question          la question du contenu
 * @param {number} p.index             sa position (0-based) dans l'exercice
 * @param {object|null} p.answer       la réponse brute du widget
 * @param {object|null} p.evaluation   le verdict AFFICHÉ (serveur si reçu)
 * @param {string} [p.feedbackMessage] le message de retour déjà calculé
 * @param {number} [p.hintsUsed]       indices demandés sur cette question
 * @param {number} [p.tries]           validations faites (1 = du premier coup)
 */
export function historyEntry({
  question, index, answer, evaluation, feedbackMessage = '', hintsUsed = 0, tries = 1,
  images = [], review = null, evaluatedBy = null,
}) {
  const outcome = evaluation?.outcome ?? 'abandoned';

  return Object.freeze({
    questionId: question.id,
    number: index + 1,
    statement: question.statement ?? '',
    // Une démonstration jugée par l'ENSEIGNANT (ou qui l'attend) n'a pas de
    // note de l'élève : pas de « لم تُقارن بعد » (ReviewStatus dit le reste).
    answer: teacherHandled(evaluatedBy, evaluation) ? withoutSelfMark(formatAnswer(question, answer)) : formatAnswer(question, answer),
    // « مراحل الحساب » écrites avec la réponse (feuille d'examen), relues telles quelles.
    work: typeof answer?.work === 'string' && answer.work.trim() ? answer.work : null,
    // Le temps mis (feuille d'examen, chrono de l'étape), en secondes.
    seconds: Number.isFinite(answer?.seconds) ? answer.seconds : null,
    normalized: evaluation?.normalized ?? '',
    outcome,
    tone: outcomeTone(outcome),
    isCorrect: Boolean(evaluation?.isCorrect),
    misconceptionId: evaluation?.misconceptionId ?? null,
    feedback: feedbackMessage || '',
    hintsUsed,
    // Corrigée après « أعِد المحاولة » : l'historique le dit, parce que le
    // serveur, lui, n'a compté que la PREMIÈRE réponse pour la maîtrise.
    retried: tries > 1,
    // Feuille d'examen (2026-10-06) : les photos de la copie, la correction de
    // l'enseignant (« تصحيح الأستاذ »), et qui a jugé (`server`, `self`, `teacher`).
    images: Array.isArray(images) ? images : [],
    review: review ?? null,
    evaluatedBy: evaluatedBy ?? null,
  });
}

const teacherHandled = (evaluatedBy, evaluation) => evaluatedBy === 'teacher' || evaluation?.normalized === 'review:pending';
const withoutSelfMark = (formatted) => (formatted?.kind === 'self' ? { ...formatted, mark: null } : formatted);

/**
 * Ajoute une entrée — ou REMPLACE celle de la même question (idempotent :
 * un double rendu, un double clic ne dupliquent rien). L'ordre reste celui
 * des numéros de question.
 */
export function recordQuestion(history, entry) {
  const rest = history.filter((e) => e.questionId !== entry.questionId);

  return [...rest, entry].sort((a, b) => a.number - b.number);
}

/**
 * Combien de réponses justes dans l'exercice, question courante comprise
 * (pour le bilan « أتممت هذا التمرين »).
 */
export function exerciseScore(history, currentEvaluation) {
  const past = history.filter((e) => e.isCorrect).length;
  const now = currentEvaluation?.isCorrect ? 1 : 0;

  return { correct: past + now, total: history.length + (currentEvaluation ? 1 : 0) };
}

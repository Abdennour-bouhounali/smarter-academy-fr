import * as practice from '@smarter-academy/core/practice/index.js';
import { getLessonById } from '@smarter-academy/core';
import { levelCounts } from './practiceCounts';

/**
 * « بنك التمارين » de l'ENSEIGNANT — logique pure, sans React.
 *
 * L'enseignant parcourt et essaie les exercices de pratique SANS AUCUN SUIVI :
 * le contenu est dans le bundle (practiceContent.js), la vérification se fait
 * dans le navigateur avec l'évaluateur partagé (packages/core/practice/
 * answerEvaluator.js, jumeau exact de celui du serveur), et rien n'est écrit
 * — ni séance, ni tentative, ni indice, ni maîtrise. Le serveur le garantit
 * de son côté : les écritures de la pratique sont derrière `learner`.
 */

const { evaluateAnswer } = practice;

/**
 * Le chemin de la pratique de l'enseignant — on y entre PAR LA LEÇON, comme
 * l'élève : le Hub de la leçon (niveaux), puis un exercice d'un niveau.
 */
export const teacherBankPath = (lessonCode, level, exerciseId) => {
  const hub = `/enseignant/pratique/${encodeURIComponent(lessonCode)}`;
  if (level == null || !exerciseId) return hub;
  return `${hub}/${level}/${encodeURIComponent(exerciseId)}`;
};

/**
 * L'aperçu du Hub, construit LOCALEMENT pour l'enseignant : la même forme que
 * `fetchPracticeOverview` (PracticeHub l'affiche à l'identique), tous les
 * niveaux ouverts, aucune progression — rien n'est suivi pour lui.
 */
export function teacherOverview(lessonCode) {
  const lesson = getLessonById(lessonCode);
  const levels = Object.entries(levelCounts(lessonCode))
    .map(([level, exerciseCount]) => ({ level: Number(level), unlocked: true, completedCount: 0, exerciseCount }))
    .sort((a, b) => a.level - b.level);

  return {
    lesson: { code: lessonCode, title: lesson?.title ?? lessonCode },
    levels,
    recommendedLevel: null,
    learningPoints: [],
    openSession: null,
  };
}

/**
 * Le verdict LOCAL — la même fonction que la prédiction de l'élève, sans
 * envoi au serveur. Une erreur de contenu (réponse attendue illisible) rend
 * un verdict « invalide » plutôt que de casser la page.
 */
export function checkLocally(answer, question) {
  try {
    return evaluateAnswer(answer, question);
  } catch {
    return { outcome: 'invalid_format', isCorrect: false, misconceptionId: null, normalized: '', feedbackKey: null };
  }
}

/**
 * L'indice n°index (0-based) dans la forme que rend le serveur à l'élève
 * (HintService::reveal) : HintPanel s'affiche donc à l'identique.
 */
export function localHint(question, index) {
  const hints = question?.hints ?? [];
  const hint = hints[index];
  if (!hint) return null;
  return { index: index + 1, type: hint.type ?? 'look', content: hint.content ?? '', remaining: hints.length - (index + 1) };
}

/**
 * La réponse attendue, en texte lisible — pour l'enseignant seulement.
 * Les choix renvoient leur CONTENU (pas leur lettre), joints par « ؛ ».
 *
 * @returns {string|null}
 */
export function expectedAnswerText(question) {
  if (!question) return null;
  const { answerType, expectedAnswer } = question;

  if (answerType === 'choice' || answerType === 'multiChoice') {
    const correct = (question.choices ?? []).filter((c) => c.isCorrect).map((c) => c.content);
    return correct.length ? correct.join(' ؛ ') : null;
  }
  if (expectedAnswer == null) return null;
  if (answerType === 'point' && typeof expectedAnswer === 'object') {
    return `(${expectedAnswer.x} ; ${expectedAnswer.y})`;
  }
  if (Array.isArray(expectedAnswer)) return expectedAnswer.join(' ، ');
  if (typeof expectedAnswer === 'object') return JSON.stringify(expectedAnswer);
  return String(expectedAnswer);
}

/**
 * La réponse d'un ÉLÈVE, lisible par l'enseignant. `answer` est la réponse
 * brute enregistrée (question_attempts.submitted_answer), `normalized` sa
 * forme normalisée par le serveur — le repli pour les formes composées
 * (affine, intervalle).
 */
export function formatStudentAnswer(question, answer, normalized = null) {
  if (answer && typeof answer === 'object') {
    const choices = question?.choices ?? [];
    const label = (id) => choices.find((c) => c.id === id)?.content ?? id;
    if (answer.choiceId != null) return label(answer.choiceId);
    if (Array.isArray(answer.choiceIds)) return answer.choiceIds.map(label).join(' ؛ ');
    if (answer.x != null || answer.y != null) return `(${answer.x ?? ''} ; ${answer.y ?? ''})`;
    // Saisie MathLive (feuille d'examen) : la formule telle que l'élève l'a écrite.
    if (typeof answer.latex === 'string' && answer.latex.trim()) return `$${answer.latex}$`;
    if (answer.value != null && typeof answer.value !== 'object') return String(answer.value);
    // « بيّن أن » : la démonstration écrite (le panneau la rend ligne par ligne).
    if (typeof answer.text === 'string' && answer.text.trim()) return answer.text;
  }
  if (typeof answer === 'string' && answer.trim()) return answer;
  // Une copie en PHOTO seulement (2026-10-06) n'a rien d'écrit : le
  // `normalized` est alors un code interne (« review:pending », « self:correct »).
  if (answer?.imageOnly || /^(self|review|teacher):/.test(normalized ?? '')) return '—';
  return normalized ?? '—';
}

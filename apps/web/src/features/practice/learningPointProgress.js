import { resolveMasteryState } from '../../lessons/common/components/LearningPointMastery';

/**
 * Ce que le module « الكفاءة » du lecteur affiche — pur, testé.
 *
 * Deux mesures DISTINCTES, jamais confondues (ARABIC_RTL_CONTRACT « Mastery
 * and completion never share words ») :
 *
 *  1. Les ÉTOILES = l'état de maîtrise Mastery V2 du point, tel que le
 *     serveur le calcule (`student_learning_point_progress`, renvoyé par
 *     l'aperçu de pratique). Quatre états, trois étoiles — un chemin :
 *        لم تُقيَّم بعد  ☆ ☆ ☆   (0)   pas encore de preuve
 *        يحتاج إلى تدعيم ★ ☆ ☆   (1)   évalué, difficulté réelle
 *        قيد التحسّن     ★ ★ ☆   (2)   la base est là
 *        متحكَّم فيها    ★ ★ ★   (3)
 *     Aucune étoile n'est inventée côté client : pas de pourcentage, pas de
 *     règle de jeu. Le libellé affiché est celui de `student:mastery.*`.
 *
 *  2. Les COMPTEURS = l'activité dans la banque (`practice` de l'aperçu,
 *     LearningPointPracticeProgress côté serveur) : exercices terminés / total
 *     et questions répondues / total, calculés sur les questions RÉELLES de
 *     chaque exercice.
 */
export const STAR_COUNT = 3;

const STAGE = { unassessed: 0, gap: 1, reinforce: 2, mastered: 3 };

/** L'étape du chemin (0..3) pour une ligne de l'aperçu. */
export function masteryStage(row) {
  return STAGE[resolveMasteryState(row)] ?? 0;
}

/**
 * Le point travaillé MAINTENANT : le point principal de la question courante
 * (un exercice peut en mêler plusieurs — 25 des 85 exercices 4AM). Repli :
 * le premier point principal de l'exercice.
 */
export function currentLearningPoint(question, exercise, learningPoints) {
  const primaryOf = (q) => q?.learningPoints?.find((lp) => lp.role === 'primary')?.code ?? null;
  const code = primaryOf(question) ?? exercise?.questions?.map(primaryOf).find(Boolean) ?? null;
  if (!code) return null;
  const row = (learningPoints ?? []).find((lp) => lp.code === code);

  return row ? { ...row } : { code, title: '', status: 'unassessed', practice: null };
}

/** Deux fractions bornées [0, 1] — jamais NaN, jamais > 1. */
export function practiceRatios(practice) {
  const ratio = (done, total) => (total > 0 ? Math.min(1, Math.max(0, done / total)) : 0);
  const p = practice ?? {};

  return {
    exercises: { done: p.exercisesCompleted ?? 0, total: p.exercises ?? 0, ratio: ratio(p.exercisesCompleted ?? 0, p.exercises ?? 0) },
    questions: { done: p.questionsAnswered ?? 0, total: p.questions ?? 0, ratio: ratio(p.questionsAnswered ?? 0, p.questions ?? 0) },
  };
}

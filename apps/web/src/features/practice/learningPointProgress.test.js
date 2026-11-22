import { describe, it, expect } from 'vitest';
import { masteryStage, currentLearningPoint, practiceRatios } from './learningPointProgress';

describe('masteryStage — les étoiles SONT l’état Mastery V2, rien d’autre', () => {
  it('quatre états, trois étoiles', () => {
    expect(masteryStage({ status: 'unassessed' })).toBe(0);
    expect(masteryStage({ status: 'gap' })).toBe(1);
    expect(masteryStage({ status: 'reinforce' })).toBe(2);
    expect(masteryStage({ status: 'mastered' })).toBe(3);
  });

  it('un statut inconnu ou absent n’allume rien', () => {
    expect(masteryStage(undefined)).toBe(0);
    expect(masteryStage({ status: 'whatever' })).toBe(0);
  });
});

describe('currentLearningPoint — le point principal de la question COURANTE', () => {
  const lps = [
    { code: 'P1', title: 'القسمة', status: 'gap', practice: { exercises: 3 } },
    { code: 'P2', title: 'PGCD', status: 'reinforce', practice: { exercises: 5 } },
  ];
  const exercise = {
    questions: [
      { id: 'q1', learningPoints: [{ code: 'P1', role: 'primary' }] },
      { id: 'q2', learningPoints: [{ code: 'P1', role: 'secondary' }, { code: 'P2', role: 'primary' }] },
    ],
  };

  it('suit la question, même dans un exercice qui mêle deux points', () => {
    expect(currentLearningPoint(exercise.questions[0], exercise, lps).code).toBe('P1');
    expect(currentLearningPoint(exercise.questions[1], exercise, lps).title).toBe('PGCD');
  });

  it('un point absent de l’aperçu reste affichable, sans état inventé', () => {
    const q = { learningPoints: [{ code: 'P9', role: 'primary' }] };
    expect(currentLearningPoint(q, { questions: [q] }, lps)).toEqual({ code: 'P9', title: '', status: 'unassessed', practice: null });
    expect(currentLearningPoint({}, { questions: [] }, lps)).toBeNull();
  });
});

describe('practiceRatios — exercices et questions, séparément', () => {
  it('scénario A : 3 exercices (4 + 6 + 3 = 13 questions), 1 terminé, 8 réponses', () => {
    expect(practiceRatios({ exercises: 3, exercisesCompleted: 1, questions: 13, questionsAnswered: 8 })).toEqual({
      exercises: { done: 1, total: 3, ratio: 1 / 3 },
      questions: { done: 8, total: 13, ratio: 8 / 13 },
    });
  });

  it('rien de fait, tout fait, pas de données : borné, jamais NaN', () => {
    expect(practiceRatios({ exercises: 5, exercisesCompleted: 0, questions: 15, questionsAnswered: 0 }).questions.ratio).toBe(0);
    expect(practiceRatios({ exercises: 5, exercisesCompleted: 5, questions: 15, questionsAnswered: 15 }).exercises.ratio).toBe(1);
    expect(practiceRatios(null).questions).toEqual({ done: 0, total: 0, ratio: 0 });
  });
});

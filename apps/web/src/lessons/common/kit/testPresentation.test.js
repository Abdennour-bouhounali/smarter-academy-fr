import { describe, it, expect } from 'vitest';
import {
  optionOrder,
  QUESTION_STATE, questionState, testQuestionStates, revealAll, revealOne,
  allRevealed, clampQuestion, resolveTestNavigation, revealedTally,
} from './testPresentation';

// Un test minimal : trois questions QCM, le correcteur du diagnostic.
const QUESTIONS = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
const CORRECT = { q1: 0, q2: 1, q3: 0 };
const isCorrect = (q, answer) => answer === CORRECT[q.id];

describe('questionState — réponse et résultat ne sont pas la même chose', () => {
  it('sans réponse et sans révélation : unanswered', () => {
    expect(questionState({ answered: false, revealed: false, correct: false })).toBe(QUESTION_STATE.UNANSWERED);
  });

  it('répondue mais non révélée : answered — et JAMAIS correct', () => {
    // Le cœur du brief §13 : répondre n'est pas réussir. Même si le
    // correcteur dirait « juste », tant que rien n'est révélé l'état est
    // « répondue » — sinon l'interface divulguerait la réponse.
    expect(questionState({ answered: true, revealed: false, correct: true })).toBe(QUESTION_STATE.ANSWERED);
    expect(questionState({ answered: true, revealed: false, correct: false })).toBe(QUESTION_STATE.ANSWERED);
  });

  it('révélée : correct ou incorrect', () => {
    expect(questionState({ answered: true, revealed: true, correct: true })).toBe(QUESTION_STATE.CORRECT);
    expect(questionState({ answered: true, revealed: true, correct: false })).toBe(QUESTION_STATE.INCORRECT);
  });

  it('révélée sans réponse : incorrecte, jamais « unanswered »', () => {
    // Au « كشف النتائج », une question laissée vide est fausse — c'est ce que
    // fait déjà la correction du test final (« بدون إجابة »).
    expect(questionState({ answered: false, revealed: true, correct: false })).toBe(QUESTION_STATE.INCORRECT);
  });
});

describe('testQuestionStates', () => {
  it('ne consulte pas le correcteur tant que rien n’est révélé', () => {
    // Garde-fou anti-fuite : un correcteur appelé sur une question silencieuse
    // pourrait teinter un bouton et révéler la réponse par accident.
    let calls = 0;
    const spy = (q, a) => { calls += 1; return isCorrect(q, a); };
    testQuestionStates(QUESTIONS, { answers: { q1: 0, q2: 0 }, revealed: {}, isCorrect: spy });
    expect(calls).toBe(0);
  });

  it('distingue les quatre états dans un même test', () => {
    const states = testQuestionStates(QUESTIONS, {
      answers: { q1: 0, q2: 0 },        // q1 juste, q2 fausse, q3 sans réponse
      revealed: { q1: true, q2: true }, // q3 non révélée
      isCorrect,
    });
    expect(states.map((s) => s.state)).toEqual([
      QUESTION_STATE.CORRECT,
      QUESTION_STATE.INCORRECT,
      QUESTION_STATE.UNANSWERED,
    ]);
    expect(states.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it('`revealed: true` révèle tout — la tentative rechargée', () => {
    const states = testQuestionStates(QUESTIONS, { answers: { q1: 0, q2: 0 }, revealed: true, isCorrect });
    expect(states.every((s) => s.revealed)).toBe(true);
    expect(states.map((s) => s.state)).toEqual([
      QUESTION_STATE.CORRECT, QUESTION_STATE.INCORRECT, QUESTION_STATE.INCORRECT,
    ]);
  });

  it('une réponse d’index 0 compte comme une réponse', () => {
    // `0` est une réponse LÉGITIME (la première option, et le piège habituel
    // de ce dépôt : `if (answer)` la perdrait). On teste `!= null`.
    const [q1] = testQuestionStates(QUESTIONS, { answers: { q1: 0 }, revealed: {}, isCorrect });
    expect(q1.answered).toBe(true);
    expect(q1.state).toBe(QUESTION_STATE.ANSWERED);
  });

  it('accepte une liste vide sans lever', () => {
    expect(testQuestionStates([], { isCorrect })).toEqual([]);
    expect(testQuestionStates(undefined, { isCorrect })).toEqual([]);
  });
});

describe('révélation — un seul correcteur pour une question et pour toutes', () => {
  it('« كشف النتائج » égale révéler chaque question une à une', () => {
    // La garantie du brief §9 : pas de second moteur de correction.
    const oneByOne = QUESTIONS.reduce((acc, q) => revealOne(acc, q.id), {});
    expect(revealAll(QUESTIONS)).toEqual(oneByOne);

    const viaAll = testQuestionStates(QUESTIONS, { answers: { q1: 0, q2: 0 }, revealed: revealAll(QUESTIONS), isCorrect });
    const viaEach = testQuestionStates(QUESTIONS, { answers: { q1: 0, q2: 0 }, revealed: oneByOne, isCorrect });
    expect(viaAll).toEqual(viaEach);
  });

  it('révéler une question ne révèle qu’elle (brief §6)', () => {
    const revealed = revealOne({}, 'q2');
    const states = testQuestionStates(QUESTIONS, { answers: { q1: 0, q2: 1, q3: 1 }, revealed, isCorrect });
    expect(states.map((s) => s.revealed)).toEqual([false, true, false]);
    // Les voisines restent silencieuses, même répondues.
    expect(states[0].state).toBe(QUESTION_STATE.ANSWERED);
    expect(states[2].state).toBe(QUESTION_STATE.ANSWERED);
  });

  it('révéler deux fois la même question est sans effet', () => {
    const once = revealOne({}, 'q1');
    expect(revealOne(once, 'q1')).toEqual(once);
  });

  it('allRevealed', () => {
    expect(allRevealed(QUESTIONS, {})).toBe(false);
    expect(allRevealed(QUESTIONS, { q1: true, q2: true })).toBe(false);
    expect(allRevealed(QUESTIONS, revealAll(QUESTIONS))).toBe(true);
    expect(allRevealed(QUESTIONS, true)).toBe(true);
    // Un test sans question n'est pas « entièrement révélé ».
    expect(allRevealed([], {})).toBe(false);
  });
});

describe('navigation', () => {
  it('clampQuestion borne l’index', () => {
    expect(clampQuestion(-3, 5)).toBe(0);
    expect(clampQuestion(9, 5)).toBe(4);
    expect(clampQuestion(2, 5)).toBe(2);
    expect(clampQuestion(1, 0)).toBe(0);
    expect(clampQuestion(NaN, 5)).toBe(0);
  });

  it('pas de bouton mort aux deux bouts (hors session leçon)', () => {
    const goTo = () => {};
    expect(resolveTestNavigation({ index: 0, count: 3, goTo }).onPrevious).toBeUndefined();
    expect(resolveTestNavigation({ index: 2, count: 3, goTo }).onNext).toBeUndefined();
    // Une seule question : aucun geste.
    const only = resolveTestNavigation({ index: 0, count: 1, goTo });
    expect(only.onPrevious).toBeUndefined();
    expect(only.onNext).toBeUndefined();
  });

  it('navigue d’une question à l’autre', () => {
    const seen = [];
    const nav = resolveTestNavigation({ index: 1, count: 3, goTo: (i) => seen.push(i) });
    nav.onPrevious();
    nav.onNext();
    expect(seen).toEqual([0, 2]);
  });

  it('en ARRIÈRE : la première question recule vers le module précédent', () => {
    // Reculer n'abandonne rien — le test est intact au retour — et un bout
    // mort au premier bout serait incohérent avec le reste de la présentation.
    const lessonPrevious = () => 'module précédent';
    const nav = resolveTestNavigation({ index: 0, count: 3, goTo: () => {}, lessonPrevious });
    expect(nav.onPrevious).toBe(lessonPrevious);
  });

  it('en AVANT : la dernière question mène au module suivant', () => {
    // Une leçon projetée se traverse d'un bout à l'autre du même geste. Ce qui
    // protège le test n'est pas un bouton manquant, mais la place de
    // « كشف النتائج » : DANS le contenu, sous la dernière question.
    const lessonNext = () => 'module suivant';
    const nav = resolveTestNavigation({ index: 2, count: 3, goTo: () => {}, lessonNext });
    expect(nav.onNext).toBe(lessonNext);
  });

  it('hors session leçon, aucun bout n’invente de geste', () => {
    const nav = resolveTestNavigation({ index: 2, count: 3, goTo: () => {} });
    expect(nav.onNext).toBeUndefined();
    expect(resolveTestNavigation({ index: 0, count: 3, goTo: () => {} }).onPrevious).toBeUndefined();
  });

  it('hors session leçon, la première question n’a pas de « السابق »', () => {
    const nav = resolveTestNavigation({ index: 0, count: 3, goTo: () => {} });
    expect(nav.onPrevious).toBeUndefined();
  });
});

describe('revealedTally', () => {
  it('ne compte que ce qui est révélé', () => {
    const states = testQuestionStates(QUESTIONS, {
      answers: { q1: 0, q2: 0, q3: 1 },
      revealed: { q1: true, q2: true },
      isCorrect,
    });
    expect(revealedTally(states)).toEqual({ revealed: 2, correct: 1, total: 3, answered: 3 });
  });

  it('un test silencieux n’annonce aucun résultat', () => {
    const states = testQuestionStates(QUESTIONS, { answers: { q1: 0 }, revealed: {}, isCorrect });
    expect(revealedTally(states)).toEqual({ revealed: 0, correct: 0, total: 3, answered: 1 });
  });
});

describe('optionOrder — ordre d’affichage stable, jamais la clé', () => {
  it('est une permutation de 0..n−1', () => {
    for (const n of [0, 1, 2, 3, 4, 6]) {
      const o = optionOrder('q-x', n);
      expect([...o].sort((x, y) => x - y)).toEqual(Array.from({ length: n }, (_, i) => i));
    }
  });
  it('est déterministe pour un même id', () => {
    expect(optionOrder('4am_qasim_E1', 4)).toEqual(optionOrder('4am_qasim_E1', 4));
  });
  it('déplace la première option hors de la tête pour une bonne part des questions', () => {
    const ids = Array.from({ length: 200 }, (_, i) => `ep-${i}`);
    const stillFirst = ids.filter((id) => optionOrder(id, 4)[0] === 0).length;
    // ~1/4 attendu ; large marge pour rester un test de propriété, pas de valeur.
    expect(stillFirst).toBeGreaterThan(20);
    expect(stillFirst).toBeLessThan(90);
  });
});

import { describe, it, expect } from 'vitest';
import {
  outcomeTone, formatAnswer, historyEntry, recordQuestion, exerciseScore,
} from './questionHistory';

// La vraie forme du contenu : « الدنّان » (سلسلة التفوق، الوضعية 7), trois
// questions dont la 2e et la 3e reposent sur le x de la 1re.
const q1 = { id: 'q1', statement: 'جِد أكبر قيمة للعدد x.', answerType: 'rational' };
const q2 = { id: 'q2', statement: 'كم مرة استعملنا هذا الدنّ لملء الدنّ الأول؟', answerType: 'rational' };
const qcm = {
  id: 'q1',
  answerType: 'choice',
  choices: [
    { id: 'A', content: 'لا، لأن PGCD(2175 ; 1044) = 87' },
    { id: 'B', content: 'نعم، لأن PGCD(2175 ; 1044) = 1' },
  ],
};

describe('outcomeTone — une issue, une tonalité partout', () => {
  it('range les six issues du contrat en quatre tonalités', () => {
    expect(outcomeTone('correct')).toBe('correct');
    expect(outcomeTone('equivalent_correct')).toBe('correct');
    expect(outcomeTone('partially_correct')).toBe('partial');
    expect(outcomeTone('incorrect')).toBe('incorrect');
    expect(outcomeTone('syntax_error')).toBe('neutral');
    expect(outcomeTone('abandoned')).toBe('neutral');
    expect(outcomeTone(undefined)).toBe('neutral');
  });
});

describe('formatAnswer — relire SA réponse, telle qu’il l’a écrite', () => {
  it('un nombre tapé reste tel quel (pas de KaTeX sur une saisie libre)', () => {
    expect(formatAnswer(q1, { value: ' 6 ' })).toEqual({ kind: 'math', text: '6' });
    expect(formatAnswer(q1, { value: '17/13' })).toEqual({ kind: 'math', text: '17/13' });
  });

  it('un QCM relit le CONTENU du choix, jamais sa lettre', () => {
    expect(formatAnswer(qcm, { choiceId: 'A' })).toEqual({ kind: 'rich', text: 'لا، لأن PGCD(2175 ; 1044) = 87' });
    expect(formatAnswer(qcm, { choiceId: 'Z' })).toBeNull();
  });

  it('un QCM multiple joint les choix par la virgule arabe', () => {
    const q = { ...qcm, answerType: 'multiChoice' };
    expect(formatAnswer(q, { choiceIds: ['A', 'B'] }).text).toContain(' ، ');
  });

  it('couple, fonction affine, intervalle : la notation du programme', () => {
    expect(formatAnswer({ answerType: 'point' }, { x: '2', y: '-1' }).text).toBe('(2 ; -1)');
    expect(formatAnswer({ answerType: 'affine' }, { a: '3', b: '' }).text).toBe('a = 3 ; b = ?');
    expect(formatAnswer({ answerType: 'interval' }, { lo: '3', loOpen: false, hi: '', hiOpen: false }).text).toBe('[3 ; +∞[');
  });

  it('rien de saisi → null (et jamais une chaîne vide affichée)', () => {
    expect(formatAnswer(q1, null)).toBeNull();
    expect(formatAnswer(q1, { value: '   ' })).toBeNull();
    expect(formatAnswer({ answerType: 'point' }, { x: '', y: '' })).toBeNull();
  });
});

describe('historyEntry — la photographie d’une question quittée', () => {
  it('garde question, réponse, verdict, retour, indices', () => {
    const e = historyEntry({
      question: q1,
      index: 0,
      answer: { value: '6' },
      evaluation: { outcome: 'correct', isCorrect: true, normalized: '6', misconceptionId: null },
      feedbackMessage: 'PGCD(24 ; 18) = 6.',
      hintsUsed: 2,
      tries: 1,
    });
    expect(e).toMatchObject({
      questionId: 'q1', number: 1, statement: q1.statement, answer: { kind: 'math', text: '6' },
      outcome: 'correct', tone: 'correct', isCorrect: true, feedback: 'PGCD(24 ; 18) = 6.', hintsUsed: 2, retried: false,
    });
    expect(Object.isFrozen(e)).toBe(true);
  });

  it('dit qu’une réponse a été corrigée après « أعِد المحاولة »', () => {
    const e = historyEntry({ question: q1, index: 0, answer: { value: '6' }, evaluation: { outcome: 'correct', isCorrect: true }, tries: 2 });
    expect(e.retried).toBe(true);
  });

  it('une réponse fausse reste une réponse fausse — l’historique ne l’embellit pas', () => {
    const e = historyEntry({ question: q1, index: 0, answer: { value: '5' }, evaluation: { outcome: 'incorrect', isCorrect: false, misconceptionId: 'm-gcd' } });
    expect(e).toMatchObject({ tone: 'incorrect', isCorrect: false, misconceptionId: 'm-gcd' });
  });
});

describe('recordQuestion — idempotent, dans l’ordre des questions', () => {
  it('n’ajoute pas deux fois la même question', () => {
    const a = historyEntry({ question: q1, index: 0, answer: { value: '5' }, evaluation: { outcome: 'incorrect' } });
    const b = historyEntry({ question: q1, index: 0, answer: { value: '6' }, evaluation: { outcome: 'correct', isCorrect: true } });
    const h = recordQuestion(recordQuestion([], a), b);
    expect(h).toHaveLength(1);
    expect(h[0].answer.text).toBe('6');
  });

  it('range par numéro de question', () => {
    const e2 = historyEntry({ question: q2, index: 1, answer: { value: '4' }, evaluation: { outcome: 'correct', isCorrect: true } });
    const e1 = historyEntry({ question: q1, index: 0, answer: { value: '6' }, evaluation: { outcome: 'correct', isCorrect: true } });
    expect(recordQuestion(recordQuestion([], e2), e1).map((e) => e.number)).toEqual([1, 2]);
  });
});

describe('exerciseScore — le bilan de fin d’exercice', () => {
  it('compte l’historique ET la question courante', () => {
    const h = [
      historyEntry({ question: q1, index: 0, answer: { value: '6' }, evaluation: { outcome: 'correct', isCorrect: true } }),
      historyEntry({ question: q2, index: 1, answer: { value: '5' }, evaluation: { outcome: 'incorrect', isCorrect: false } }),
    ];
    expect(exerciseScore(h, { outcome: 'correct', isCorrect: true })).toEqual({ correct: 2, total: 3 });
    expect(exerciseScore([], null)).toEqual({ correct: 0, total: 0 });
  });
});

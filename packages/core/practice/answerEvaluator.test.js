import { describe, it, expect } from 'vitest';
import { evaluateAnswer, feedbackFor, OUTCOMES, isSuccessOutcome, isInertOutcome } from './answerEvaluator.js';

const feedback = { correct: 'Oui.', incorrect: 'Non.', partial: 'Presque.' };

describe('QCM', () => {
  const q = {
    id: 'q1', answerType: 'choice', feedback,
    choices: [
      { id: 'A', content: 'x < 4', isCorrect: true },
      { id: 'B', content: 'x > 4', isCorrect: false, misconceptionId: 'MISC-AFF-SIGNE-COTE-INVERSE' },
      { id: 'C', content: 'x < -4', isCorrect: false },
    ],
  };

  it('reconnaît la bonne réponse', () => {
    expect(evaluateAnswer({ choiceId: 'A' }, q).outcome).toBe(OUTCOMES.CORRECT);
  });

  it('nomme la misconception portée par le distracteur choisi', () => {
    const r = evaluateAnswer({ choiceId: 'B' }, q);
    expect(r.outcome).toBe(OUTCOMES.INCORRECT);
    expect(r.misconceptionId).toBe('MISC-AFF-SIGNE-COTE-INVERSE');
  });

  it('reste faux sans misconception quand le distracteur n\'en porte pas', () => {
    expect(evaluateAnswer({ choiceId: 'C' }, q).misconceptionId).toBeNull();
  });

  it('ne plante pas sur un id de choix inconnu', () => {
    expect(evaluateAnswer({ choiceId: 'Z' }, q).outcome).toBe(OUTCOMES.INCORRECT);
  });
});

describe('QCM à réponses multiples', () => {
  const q = {
    id: 'q1', answerType: 'multiChoice', feedback,
    choices: [
      { id: 'A', content: 'a', isCorrect: true },
      { id: 'B', content: 'b', isCorrect: true },
      { id: 'C', content: 'c', isCorrect: false, misconceptionId: 'MISC-AFF-ZERO-EST-B' },
    ],
  };

  it('exige la sélection exacte', () => {
    expect(evaluateAnswer({ choiceIds: ['A', 'B'] }, q).outcome).toBe(OUTCOMES.CORRECT);
  });

  it('traite une sélection incomplète mais juste comme partielle', () => {
    // L'élève a vu juste, mais pas tout : ce n'est pas la même erreur qu'un contresens.
    expect(evaluateAnswer({ choiceIds: ['A'] }, q).outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
  });

  it('signale la misconception dès qu\'un mauvais choix est coché', () => {
    const r = evaluateAnswer({ choiceIds: ['A', 'C'] }, q);
    expect(r.outcome).toBe(OUTCOMES.INCORRECT);
    expect(r.misconceptionId).toBe('MISC-AFF-ZERO-EST-B');
  });
});

describe('réponse rationnelle', () => {
  const q = {
    id: 'q1', answerType: 'rational', answerFormat: '… par minute', feedback,
    expectedAnswer: '-2',
    misconceptionSignatures: [{ value: '-8', id: 'MISC-AFF-DIFF-SEULE' }],
  };

  it('accepte la réponse juste', () => {
    expect(evaluateAnswer({ value: '-2' }, q).outcome).toBe(OUTCOMES.CORRECT);
  });

  it('accepte le moins typographique que l\'interface affiche', () => {
    expect(evaluateAnswer({ value: '−2' }, q).isCorrect).toBe(true);
  });

  it('reconnaît une écriture équivalente comme juste, et le dit', () => {
    const r = evaluateAnswer({ value: '-4/2' }, q);
    expect(r.outcome).toBe(OUTCOMES.EQUIVALENT_CORRECT);
    expect(isSuccessOutcome(r.outcome)).toBe(true);
  });

  it('attrape « la différence seule » par sa signature', () => {
    expect(evaluateAnswer({ value: '-8' }, q).misconceptionId).toBe('MISC-AFF-DIFF-SEULE');
  });

  it('distingue une saisie illisible d\'une réponse fausse', () => {
    const r = evaluateAnswer({ value: 'deux' }, q);
    expect(r.outcome).toBe(OUTCOMES.SYNTAX_ERROR);
    expect(isInertOutcome(r.outcome)).toBe(true); // n'entamera pas la maîtrise
  });
});

describe('réponse affine', () => {
  const q = {
    id: 'q1', answerType: 'affine', answerFormat: 'ax + b', feedback,
    expectedAnswer: { a: '0,30', b: '4' },
    misconceptionSignatures: [{ value: { a: '4', b: '0,30' }, id: 'MISC-AFF-A-B-ECHANGES' }],
  };

  it('accepte le couple structuré', () => {
    expect(evaluateAnswer({ a: '0,30', b: '4' }, q).outcome).toBe(OUTCOMES.CORRECT);
  });

  it('accepte une écriture LaTeX équivalente', () => {
    expect(evaluateAnswer({ latex: '0,3x+4' }, q).isCorrect).toBe(true);
  });

  it('attrape a et b échangés', () => {
    expect(evaluateAnswer({ a: '4', b: '0,30' }, q).misconceptionId).toBe('MISC-AFF-A-B-ECHANGES');
  });

  it('rend « partiellement correct » quand un seul coefficient est bon', () => {
    // C'est le retour le plus utile de tout l'évaluateur : « ton coefficient
    // directeur est bon, regarde la valeur en x = 0 ».
    const r = evaluateAnswer({ a: '0,30', b: '9' }, q);
    expect(r.outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
    expect(r.feedbackKey).toBe('partial');
  });

  it('refuse une forme hors contrat plutôt que de l\'analyser de travers', () => {
    expect(evaluateAnswer({ latex: '2(x+3)' }, q).outcome).toBe(OUTCOMES.SYNTAX_ERROR);
    expect(evaluateAnswer({ latex: 'x^2+1' }, q).outcome).toBe(OUTCOMES.SYNTAX_ERROR);
  });
});

describe('réponse par intervalle', () => {
  const q = {
    id: 'q1', answerType: 'interval', answerFormat: ']… ; …[', feedback,
    expectedAnswer: { lo: null, loOpen: true, hi: '3', hiOpen: true },
    misconceptionSignatures: [
      { value: { lo: '3', loOpen: true, hi: null, hiOpen: true }, id: 'MISC-AFF-INEQ-SENS-NON-INVERSE' },
    ],
  };

  it('accepte la borne écrite autrement', () => {
    expect(evaluateAnswer({ lo: null, loOpen: true, hi: '6/2', hiOpen: true }, q).isCorrect).toBe(true);
  });

  it('attrape le sens non inversé', () => {
    const r = evaluateAnswer({ lo: '3', loOpen: true, hi: null, hiOpen: true }, q);
    expect(r.misconceptionId).toBe('MISC-AFF-INEQ-SENS-NON-INVERSE');
  });

  it('distingue crochet ouvert et fermé', () => {
    expect(evaluateAnswer({ lo: null, loOpen: true, hi: '3', hiOpen: false }, q).isCorrect).toBe(false);
  });

  it('refuse une notation malformée', () => {
    expect(evaluateAnswer({ lo: null, loOpen: false, hi: '3', hiOpen: true }, q).outcome).toBe(OUTCOMES.SYNTAX_ERROR);
  });
});

describe('contrat général', () => {
  it('une réponse absente est un abandon, pas une erreur', () => {
    const r = evaluateAnswer(null, { id: 'q', answerType: 'rational', expectedAnswer: '1', feedback });
    expect(r.outcome).toBe(OUTCOMES.ABANDONED);
    expect(isInertOutcome(r.outcome)).toBe(true);
  });

  it('LÈVE sur un answerType inconnu — un bug de contenu n\'est pas une erreur d\'élève', () => {
    expect(() => evaluateAnswer({ value: '1' }, { id: 'q', answerType: 'quantique' })).toThrow(/answerType inconnu/);
  });

  it('préfère l\'explication de la misconception au retour générique', () => {
    const q = {
      id: 'q', answerType: 'rational', expectedAnswer: '-2', feedback,
      misconceptionSignatures: [{ value: '-8', id: 'MISC-AFF-DIFF-SEULE' }],
    };
    const registry = { 'MISC-AFF-DIFF-SEULE': { explanation: 'Il reste à diviser.' } };
    expect(feedbackFor(q, evaluateAnswer({ value: '-8' }, q), registry)).toBe('Il reste à diviser.');
    expect(feedbackFor(q, evaluateAnswer({ value: '-5' }, q), registry)).toBe('Non.');
  });

  it('une réponse illisible prend le message de l\'appelant, sinon le format attendu — jamais une phrase en dur', () => {
    const q = { id: 'q', answerType: 'rational', expectedAnswer: '-2', feedback, answerFormat: 'اكتب عددًا.' };
    const r = evaluateAnswer({ value: 'abc' }, q);
    expect(r.outcome).toBe(OUTCOMES.SYNTAX_ERROR);
    expect(feedbackFor(q, r, {}, { syntaxError: 'لم أتمكّن من قراءة إجابتك.' })).toBe('لم أتمكّن من قراءة إجابتك.');
    expect(feedbackFor(q, r)).toBe('اكتب عددًا.');
    expect(feedbackFor({ ...q, answerFormat: undefined }, r)).toBe('');
  });
});

describe('integerSet — ensembles de diviseurs (4AM)', () => {
  const q = { id: 'q', answerType: 'integerSet', expectedAnswer: [1, 2, 3, 4, 6, 12], feedback,
    misconceptionSignatures: [{ value: [2, 3, 4, 6], id: 'MISC-QAWASIM-OUBLI-1-ET-N' }] };

  it('accepte l ordre libre, les doublons, les séparateurs et chiffres arabes', () => {
    expect(evaluateAnswer({ value: '12, 6, 4, 3, 2, 1, 1' }, q).outcome).toBe(OUTCOMES.CORRECT);
    expect(evaluateAnswer({ value: '١؛ ٢؛ ٣؛ ٤؛ ٦؛ ١٢' }, q).outcome).toBe(OUTCOMES.CORRECT);
    expect(evaluateAnswer({ value: '1 2 3 4 6 12' }, q).normalized).toBe('1;2;3;4;6;12');
  });
  it('un sous-ensemble strict est partiel', () => {
    const r = evaluateAnswer({ value: '1, 2, 3' }, q);
    expect(r.outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
    expect(r.feedbackKey).toBe('partial');
  });
  it('reconnaît la signature d une misconception (oubli de 1 et du nombre lui-même)', () => {
    const r = evaluateAnswer({ value: '2, 3, 4, 6' }, q);
    expect(r.outcome).toBe(OUTCOMES.INCORRECT);
    expect(r.misconceptionId).toBe('MISC-QAWASIM-OUBLI-1-ET-N');
  });
  it('un élément en trop est faux, un jeton illisible est une erreur de syntaxe', () => {
    expect(evaluateAnswer({ value: '1, 2, 3, 4, 5, 6, 12' }, q).outcome).toBe(OUTCOMES.INCORRECT);
    expect(evaluateAnswer({ value: '1, deux' }, q).outcome).toBe(OUTCOMES.SYNTAX_ERROR);
    expect(evaluateAnswer({ value: '' }, q).outcome).toBe(OUTCOMES.SYNTAX_ERROR);
  });
});

describe('rational + requiredForm irreducible — اختزال كسر', () => {
  const q = { id: 'q', answerType: 'rational', expectedAnswer: '7/4', feedback: { ...feedback, notIrreducible: 'اختزل أكثر.' },
    evaluationPolicy: { requiredForm: 'irreducible' } };

  it('7/4 est juste', () => {
    expect(evaluateAnswer({ value: '7/4' }, q).outcome).toBe(OUTCOMES.CORRECT);
  });
  it('21/12 a la bonne valeur mais n est pas réduite → partiel avec message dédié', () => {
    const r = evaluateAnswer({ value: '21/12' }, q);
    expect(r.outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
    expect(r.feedbackKey).toBe('notIrreducible');
    expect(feedbackFor(q, r)).toBe('اختزل أكثر.');
  });
  it('84/48 non réduite → partiel ; 1,75 en décimal → partiel (pas une fraction) ; 3/2 → faux', () => {
    expect(evaluateAnswer({ value: '84/48' }, q).outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
    // La consigne demande une FRACTION irréductible : un décimal a la bonne
    // valeur mais pas la forme exigée (audit d'intégrité, 2026-09-24).
    expect(evaluateAnswer({ value: '1,75' }, q).outcome).toBe(OUTCOMES.PARTIALLY_CORRECT);
    expect(evaluateAnswer({ value: '1,75' }, q).feedbackKey).toBe('notIrreducible');
    expect(evaluateAnswer({ value: '3/2' }, q).outcome).toBe(OUTCOMES.INCORRECT);
  });
  it('sans la politique, 21/12 reste une réponse équivalente juste', () => {
    const q2 = { ...q, evaluationPolicy: {} };
    expect(evaluateAnswer({ value: '21/12' }, q2).outcome).toBe(OUTCOMES.EQUIVALENT_CORRECT);
  });
});

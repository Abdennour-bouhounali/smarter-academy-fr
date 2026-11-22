import { describe, it, expect } from 'vitest';
import { answerChars, answerSize, clockState, formatClock, stepSeconds, examBadge, examPaper, examPart, examSession, isExamExercise, isExamLesson, EXAM_STYLE_LESSONS, solutionReady, stepMarks, stepState } from './examSheet';
import { formatAnswer } from '../questionHistory';
import { exerciseIdsFor, loadExercise } from '../practiceContent';
import { isPracticeActive } from '../practiceCapability';

describe('feuille d\'examen — logique pure', () => {
  it('ne présente en feuille que les exercices qui portent metadata.exam', () => {
    expect(isExamExercise({ metadata: { exam: { kind: 'official' } } })).toBe(true);
    expect(isExamExercise({ metadata: { title: 'x' } })).toBe(false);
    expect(isExamExercise(null)).toBe(false);
  });

  it('n\'écrit le numéro d\'étape et la sous-étape qu\'à leur première question', () => {
    // BEM 2024 : 01 = deux questions (10cm / 18cm), 02 seule ;
    // BEM 2022 : 01(ا), puis (ب) sur deux questions.
    expect(stepMarks([{ step: '01' }, { step: '01' }, { step: '02' }])).toEqual([
      { step: '01', sub: null }, { step: null, sub: null }, { step: '02', sub: null },
    ]);
    expect(stepMarks([{ step: '01', sub: 'ا' }, { step: '01', sub: 'ب' }, { step: '01', sub: 'ب' }])).toEqual([
      { step: '01', sub: 'ا' }, { step: null, sub: 'ب' }, { step: null, sub: null },
    ]);
  });

  it('découpe le badge pour isoler « BEM 2015 » du préfixe arabe', () => {
    expect(examBadge({ badge: 'BEM 2008', kind: 'official' })).toEqual({ prefix: '', label: 'BEM 2008', kind: 'official', ltr: true });
    expect(examBadge({ badge: 'على منوال BEM 2015', kind: 'modelled' })).toEqual({ prefix: 'على منوال', label: 'BEM 2015', kind: 'modelled', ltr: true });
    expect(examBadge({ badge: null, kind: 'adapted' })).toBeNull();
  });

  it('garde ARABE (aucun îlot LTR) le badge d’un examen de فصل 1AM–3AM', () => {
    expect(examBadge({ badge: 'على منوال اختبار الفصل الثاني', kind: 'modelled' }))
      .toEqual({ prefix: 'على منوال', label: 'اختبار الفصل الثاني', kind: 'modelled', ltr: false });
  });

  it('simule le BEM en 4AM et l’examen de فصل en 1AM–3AM, selon l’année de la leçon', () => {
    expect(examPaper('qasim-adad-tabii')).toEqual({ kind: 'bem', n: 4 });
    expect(examPaper('kitabat-adad-tabii')).toEqual({ kind: 'term', n: 1 });
    expect(examPaper('inconnue')).toEqual({ kind: 'bem', n: 4 });
  });

  it('range la وضعية الإدماجية dans le الجزء الثاني', () => {
    expect(examPart({ metadata: { source: { type: 'bem', part: 2 }, exam: {} } })).toBe(2);
    expect(examPart({ metadata: { exam: { heading: 'الوضعية الإدماجية' } } })).toBe(2);
    expect(examPart({ metadata: { exam: { heading: 'التمرين الأول' } } })).toBe(1);
  });

  it('donne l\'année de la session aux seuls exercices tirés d\'un sujet officiel', () => {
    expect(examSession({ metadata: { exam: { kind: 'official' }, source: { type: 'bem', year: 2008 } } })).toBe(2008);
    expect(examSession({ metadata: { exam: { kind: 'excerpt' }, source: { type: 'bem', year: 2021 } } })).toBe(2021);
    expect(examSession({ metadata: { exam: { kind: 'modelled', badge: 'على منوال BEM 2015' }, source: { type: 'platform_addition' } } })).toBeNull();
    expect(examSession({ metadata: { exam: { kind: 'adapted' }, source: { type: 'textbook' } } })).toBeNull();
  });

  it('donne à chaque réponse un champ à sa mesure', () => {
    expect(answerSize({ answerType: 'rational', expectedAnswer: '135' })).toBe('short');
    expect(answerSize({ answerType: 'rational', expectedAnswer: '7/9' })).toBe('medium');
    expect(answerSize({ answerType: 'rational', expectedAnswer: '21957' })).toBe('short');
    expect(answerSize({ answerType: 'rational', expectedAnswer: '145000' })).toBe('medium');
    expect(answerSize({ answerType: 'integerSet', expectedAnswer: [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60] })).toBe('long');
    expect(answerSize({ answerType: 'selfCheck' })).toBe('proof');
    expect(answerSize({ answerType: 'choice' })).toBe('choice');
  });

  it('règle la largeur par défaut (et minimale) sur la longueur de la bonne réponse', () => {
    expect(answerChars({ expectedAnswer: '135' })).toBe(5);
    expect(answerChars({ expectedAnswer: '7' })).toBe(4);
    // Le texte indicatif du champ vide tient en entier.
    expect(answerChars({ expectedAnswer: '7', answerFormat: 'عدد طبيعي' })).toBe(9);
    expect(answerChars({ expectedAnswer: '28800', answerFormat: 'عدد' })).toBe(7);
    expect(answerChars({ expectedAnswer: '22816/19251' })).toBe(13);
    expect(answerChars({ expectedAnswer: [1, 2, 3] })).toBe(11); // « 1 ؛ 2 ؛ 3 » + 2
  });

  it('donne à chaque étape son temps, et lit le chrono', () => {
    expect(stepSeconds({ timeSeconds: 210 }, {})).toBe(210);
    expect(stepSeconds({}, { metadata: { estimatedMinutes: 6 }, questions: [{}, {}] })).toBe(180);
    expect(formatClock(165)).toBe('02:45');
    expect(formatClock(-3)).toBe('00:00');
    expect(clockState(10, 180)).toBe('running');
    expect(clockState(150, 180)).toBe('warning');
    expect(clockState(181, 180)).toBe('over');
  });

  it('situe chaque étape par rapport à la question courante', () => {
    expect([0, 1, 2].map((i) => stepState(i, 1))).toEqual(['done', 'current', 'upcoming']);
  });
});

describe('« بيّن أن » — la démonstration relue dans l\'historique', () => {
  const q = { answerType: 'selfCheck' };
  it('relit le texte écrit et la note, « pending » tant qu\'il ne s\'est pas noté', () => {
    expect(formatAnswer(q, { text: ' PGCD(21 ; 14) = 7 ' })).toEqual({ kind: 'self', text: 'PGCD(21 ; 14) = 7', mark: 'pending' });
    expect(formatAnswer(q, { text: 'برهان', selfMark: 'correct' })).toEqual({ kind: 'self', text: 'برهان', mark: 'correct' });
    expect(formatAnswer(q, { text: '   ' })).toBeNull();
  });
});

describe('bascule d\'une leçon au format examen — content/practice/exam-style.json', () => {
  it('aucune leçon codée en dur : la liste est celle du manifeste', () => {
    expect(EXAM_STYLE_LESSONS.size).toBeGreaterThan(0);
    for (const code of EXAM_STYLE_LESSONS) expect(isExamLesson(code)).toBe(true);
    expect(isExamLesson('lecon-inconnue')).toBe(false);
    expect(isExamLesson(undefined)).toBe(false);
  });

  it('chaque leçon basculée est activée et sa banque est ENTIÈREMENT au format examen', async () => {
    for (const code of EXAM_STYLE_LESSONS) {
      expect(isPracticeActive(code)).toBe(true);
      for (const level of [1, 2, 3, 4, 5]) {
        const ids = exerciseIdsFor(code, level);
        expect(ids.length).toBeGreaterThan(0);
        for (const id of ids) {
          // eslint-disable-next-line no-await-in-loop
          expect(isExamExercise(await loadExercise(code, level, id))).toBe(true);
        }
      }
    }
  // Toutes les feuilles de toutes les leçons basculées sont chargées : plusieurs centaines
  // d'imports, au-delà des 5 s par défaut quand toute la suite tourne en parallèle.
  }, 180_000);
});

describe('corrigé d\'une étape coupée en plusieurs questions — solutionReady', () => {
  // 01 : le borne puis le sens (même étape) ; 02 (ا) puis (ب) ; 03 seule.
  const qs = [{ step: '01' }, { step: '01' }, { step: '02', sub: 'ا' }, { step: '02', sub: 'ب' }, { step: '03' }];

  it('reste fermé tant qu\'une question plus loin dans la même étape n\'a pas de réponse', () => {
    expect(solutionReady(qs, 0, 0)).toBe(false); // la borne répondue, le sens pas encore
    expect(solutionReady(qs, 0, 1)).toBe(true); // le sens répondu : les deux corrigés s'ouvrent
    expect(solutionReady(qs, 1, 1)).toBe(true);
  });

  it('les sous-étapes (ا)(ب) et les étapes différentes ne se retiennent pas', () => {
    expect(solutionReady(qs, 2, 2)).toBe(true);
    expect(solutionReady(qs, 4, 4)).toBe(true);
  });

  it('une question sans `step` (carte classique) n\'est jamais retenue ; un indice hors limites ne s\'ouvre pas', () => {
    expect(solutionReady([{}, {}], 0, 0)).toBe(true);
    expect(solutionReady(qs, 9, 9)).toBe(false);
  });
});

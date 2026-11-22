import { describe, it, expect, vi } from 'vitest';
import { answerChars, answerSize, clockState, formatClock, stepSeconds, examBadge, examPaper, examPart, examPoints, examSession, isExamExercise, isExamLesson, EXAM_STYLE_LESSONS, resultIsWords, solutionReady, stepLabel, stepMarks, stepState } from './examSheet';
import { formatAnswer } from '../questionHistory';
import { exerciseIdsFor, loadExercise } from '../practiceContent';

// The catalogue is empty until the French lessons: two neutral lessons give examPaper a grade to read.
vi.mock('@smarter-academy/core', async (importOriginal) => {
  const real = await importOriginal();
  const LESSONS = { 'lecon-3e': { gradeId: '3e' }, 'lecon-5e': { gradeId: '5e' } };
  return { ...real, getLessonById: (code) => LESSONS[code] ?? null };
});

describe('feuille d\'examen — logique pure', () => {
  it('ne présente en feuille que les exercices qui portent metadata.exam', () => {
    expect(isExamExercise({ metadata: { exam: { kind: 'official' } } })).toBe(true);
    expect(isExamExercise({ metadata: { title: 'x' } })).toBe(false);
    expect(isExamExercise(null)).toBe(false);
  });

  it('n\'écrit le numéro d\'étape et la sous-étape qu\'à leur première question', () => {
    // 01 = deux questions (10 cm / 18 cm), 02 seule ;
    // 01 a), puis b) sur deux questions.
    expect(stepMarks([{ step: '01' }, { step: '01' }, { step: '02' }])).toEqual([
      { step: '01', sub: null }, { step: null, sub: null }, { step: '02', sub: null },
    ]);
    expect(stepMarks([{ step: '01', sub: 'a' }, { step: '01', sub: 'b' }, { step: '01', sub: 'b' }])).toEqual([
      { step: '01', sub: 'a' }, { step: null, sub: 'b' }, { step: null, sub: null },
    ]);
  });

  it('affiche le numéro d’étape et le barème à la française', () => {
    expect(stepLabel('01')).toBe('1');
    expect(stepLabel('10')).toBe('10');
    expect(stepLabel(null)).toBe('');
    expect(examPoints('02,5')).toEqual({ label: '2,5', count: 2.5 });
    expect(examPoints('01')).toEqual({ label: '1', count: 1 });
    expect(examPoints('14')).toEqual({ label: '14', count: 14 });
  });

  it('écrit en texte un résultat en mots, en formule un résultat mathématique', () => {
    expect(resultIsWords('oui')).toBe(true);
    expect(resultIsWords('4 fois')).toBe(true);
    expect(resultIsWords('\\dfrac{3}{4}')).toBe(false);
    expect(resultIsWords('PGCD(945 ; 1215) = 135')).toBe(false);
    expect(resultIsWords('x = 4')).toBe(false);
  });

  it('lit l’année du badge et dit d’où vient l’exercice, sans afficher le texte du badge', () => {
    expect(examBadge({ badge: 'BEM 2008', kind: 'official' })).toEqual({ kind: 'official', model: 'official', year: 2008, label: 'BEM 2008' });
    expect(examBadge({ badge: 'DNB 2027', kind: 'excerpt' })).toEqual({ kind: 'excerpt', model: 'official', year: 2027, label: 'DNB 2027' });
    expect(examBadge({ badge: 'Sur le modèle du DNB 2027', kind: 'modelled' })).toEqual({ kind: 'modelled', model: 'modelled', year: 2027, label: 'Sur le modèle du DNB 2027' });
    expect(examBadge({ badge: null, kind: 'adapted' })).toBeNull();
  });

  it('un badge « sur le modèle » sans année est celui d’un contrôle d’un autre niveau', () => {
    expect(examBadge({ badge: 'Sur le modèle d’un contrôle', kind: 'modelled' })).toMatchObject({ model: 'term', year: null });
  });

  it('simule le brevet en 3e et un contrôle avant, et donne le niveau à afficher', () => {
    expect(examPaper('lecon-3e')).toEqual({ kind: 'bem', n: '3e' });
    expect(examPaper('lecon-5e')).toEqual({ kind: 'term', n: '5e' });
    expect(examPaper('inconnue')).toEqual({ kind: 'bem', n: '3e' });
  });

  it('range un exercice dans la partie 1 ou la partie 2 du sujet', () => {
    expect(examPart({ metadata: { source: { type: 'bem', part: 2 }, exam: {} } })).toBe(2);
    expect(examPart({ metadata: { exam: { heading: 'Partie 2 — Exercice 1' } } })).toBe(2);
    expect(examPart({ metadata: { exam: { heading: 'Exercice 1' } } })).toBe(1);
  });

  it('donne l\'année de la session aux seuls exercices tirés d\'un sujet officiel', () => {
    expect(examSession({ metadata: { exam: { kind: 'official' }, source: { type: 'bem', year: 2008 } } })).toBe(2008);
    expect(examSession({ metadata: { exam: { kind: 'excerpt' }, source: { type: 'bem', year: 2021 } } })).toBe(2021);
    expect(examSession({ metadata: { exam: { kind: 'modelled', badge: 'Sur le modèle du DNB 2027' }, source: { type: 'platform_addition' } } })).toBeNull();
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
    expect(answerChars({ expectedAnswer: '7', answerFormat: 'Nombre entier' })).toBe(13);
    expect(answerChars({ expectedAnswer: '28800', answerFormat: 'Nombre' })).toBe(7);
    expect(answerChars({ expectedAnswer: '22816/19251' })).toBe(13);
    expect(answerChars({ expectedAnswer: [1, 2, 3] })).toBe(11); // « 1 ; 2 ; 3 » + 2
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

describe('« Démontrer que » — la démonstration relue dans l\'historique', () => {
  const q = { answerType: 'selfCheck' };
  it('relit le texte écrit et la note, « pending » tant qu\'il ne s\'est pas noté', () => {
    expect(formatAnswer(q, { text: ' PGCD(21 ; 14) = 7 ' })).toEqual({ kind: 'self', text: 'PGCD(21 ; 14) = 7', mark: 'pending' });
    expect(formatAnswer(q, { text: 'Démonstration', selfMark: 'correct' })).toEqual({ kind: 'self', text: 'Démonstration', mark: 'correct' });
    expect(formatAnswer(q, { text: '   ' })).toBeNull();
  });
});

describe('bascule d\'une leçon au format examen — content/practice/exam-style.json', () => {
  it('aucune leçon codée en dur : la liste est celle du manifeste', () => {
    for (const code of EXAM_STYLE_LESSONS) expect(isExamLesson(code)).toBe(true);
    expect(isExamLesson('lecon-inconnue')).toBe(false);
    expect(isExamLesson(undefined)).toBe(false);
  });

  it('chaque leçon basculée est activée et sa banque est ENTIÈREMENT au format examen', async () => {
    for (const code of EXAM_STYLE_LESSONS) {
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
  // 01 : la borne puis le sens (même étape) ; 02 a) puis b) ; 03 seule.
  const qs = [{ step: '01' }, { step: '01' }, { step: '02', sub: 'a' }, { step: '02', sub: 'b' }, { step: '03' }];

  it('reste fermé tant qu\'une question plus loin dans la même étape n\'a pas de réponse', () => {
    expect(solutionReady(qs, 0, 0)).toBe(false); // la borne répondue, le sens pas encore
    expect(solutionReady(qs, 0, 1)).toBe(true); // le sens répondu : les deux corrigés s'ouvrent
    expect(solutionReady(qs, 1, 1)).toBe(true);
  });

  it('les sous-étapes a) b) et les étapes différentes ne se retiennent pas', () => {
    expect(solutionReady(qs, 2, 2)).toBe(true);
    expect(solutionReady(qs, 4, 4)).toBe(true);
  });

  it('une question sans `step` (carte classique) n\'est jamais retenue ; un indice hors limites ne s\'ouvre pas', () => {
    expect(solutionReady([{}, {}], 0, 0)).toBe(true);
    expect(solutionReady(qs, 9, 9)).toBe(false);
  });
});

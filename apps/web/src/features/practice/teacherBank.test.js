import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  teacherBankPath,
  teacherOverview,
  checkLocally,
  localHint,
  expectedAnswerText,
  formatStudentAnswer,
} from './teacherBank';
import { levelCounts } from './practiceContent';

// The exercise banks are EMPTY until the French banks are written: a neutral count of exercises stands in for one bank.
vi.mock('./practiceCounts', () => ({ levelCounts: (code) => (code === 'lecon-a' ? { 2: 1, 1: 2 } : {}) }));

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, '../../..', p), 'utf8');

describe('la pratique de l’enseignant — on y entre par la leçon', () => {
  it('le Hub de la leçon, puis un exercice d’un niveau', () => {
    expect(teacherBankPath('lecon-a')).toBe('/enseignant/pratique/lecon-a');
    expect(teacherBankPath('lecon-a', 2, 'ex-1')).toBe('/enseignant/pratique/lecon-a/2/ex-1');
  });

  it('ne pointe jamais vers l’espace élève suivi', () => {
    expect(teacherBankPath('x', 1, 'y')).not.toContain('/espace/');
  });
});

describe('teacherOverview — la MÊME forme que l’aperçu de l’élève, sans suivi', () => {
  const code = 'lecon-a';
  const overview = teacherOverview(code);

  it('porte les clés que PracticeHub lit', () => {
    expect(Object.keys(overview).sort()).toEqual([
      'learningPoints',
      'lesson',
      'levels',
      'openSession',
      'recommendedLevel',
    ]);
    expect(overview.lesson.code).toBe(code);
    expect(overview.lesson.title).toBeTruthy();
    expect(overview.openSession).toBeNull();
    expect(overview.recommendedLevel).toBeNull();
  });

  it('tous les niveaux du contenu, ouverts, dans l’ordre, aucune progression', () => {
    const counts = levelCounts(code);
    expect(overview.levels.map((l) => l.level)).toEqual(
      Object.keys(counts)
        .map(Number)
        .sort((a, b) => a - b),
    );
    for (const level of overview.levels) {
      expect(level.unlocked).toBe(true);
      expect(level.completedCount).toBe(0);
      expect(level.exerciseCount).toBe(counts[level.level]);
    }
  });
});

describe('formatStudentAnswer — la réponse d’un élève, lisible', () => {
  const choice = {
    choices: [
      { id: 'A', content: '1 ; 2 ; 7 ; 14' },
      { id: 'B', content: '14 seulement' },
    ],
  };

  it('un choix : son CONTENU, pas sa lettre', () => {
    expect(formatStudentAnswer(choice, { choiceId: 'B' })).toBe('14 seulement');
    expect(formatStudentAnswer(choice, { choiceIds: ['A', 'B'] })).toBe('1 ; 2 ; 7 ; 14 ; 14 seulement');
  });

  it('une valeur, un point', () => {
    expect(formatStudentAnswer({}, { value: '1,17' })).toBe('1,17');
    expect(formatStudentAnswer({}, { x: '12', y: '16' })).toBe('(12 ; 16)');
  });

  it('une forme composée retombe sur la forme normalisée du serveur', () => {
    expect(formatStudentAnswer({}, { a: { value: '2' }, b: { value: '3' } }, '2x+3')).toBe('2x+3');
    expect(formatStudentAnswer({}, null, null)).toBe('—');
  });
});

describe('vérification LOCALE — même évaluateur que l’élève', () => {
  const rational = { id: 'q', answerType: 'rational', expectedAnswer: '14' };

  it('une bonne réponse est juste, une mauvaise ne l’est pas', () => {
    expect(checkLocally({ value: '14' }, rational).isCorrect).toBe(true);
    expect(checkLocally({ value: '15' }, rational).isCorrect).toBe(false);
  });

  it('un contenu illisible ne casse pas la page', () => {
    const broken = { id: 'q', answerType: 'rational', expectedAnswer: '???' };
    const verdict = checkLocally({ value: '1' }, broken);
    expect(verdict.isCorrect).toBe(false);
  });
});

describe('les indices, sous la forme du serveur', () => {
  const question = { hints: [{ type: 'look', content: 'h1' }, { content: 'h2' }] };

  it('numérote, type par défaut « look », et compte le reste', () => {
    expect(localHint(question, 0)).toEqual({ index: 1, type: 'look', content: 'h1', remaining: 1 });
    expect(localHint(question, 1)).toEqual({ index: 2, type: 'look', content: 'h2', remaining: 0 });
  });

  it('au-delà du dernier : rien', () => {
    expect(localHint(question, 2)).toBeNull();
    expect(localHint({}, 0)).toBeNull();
  });
});

describe('expectedAnswerText — lisible par l’enseignant', () => {
  it('choix : le CONTENU des bonnes options, pas leur lettre', () => {
    const q = {
      answerType: 'multiChoice',
      choices: [
        { id: 'A', content: 'x', isCorrect: true },
        { id: 'B', content: 'y', isCorrect: false },
        { id: 'C', content: 'z', isCorrect: true },
      ],
    };
    expect(expectedAnswerText(q)).toBe('x ; z');
  });

  it('point, ensemble, nombre', () => {
    expect(expectedAnswerText({ answerType: 'point', expectedAnswer: { x: '12', y: '16' } })).toBe('(12 ; 16)');
    expect(expectedAnswerText({ answerType: 'integerSet', expectedAnswer: [15, 30] })).toBe('15 ; 30');
    expect(expectedAnswerText({ answerType: 'rational', expectedAnswer: '3/4' })).toBe('3/4');
  });

  it('décomposition : la clé canonique lue avec ses exposants', () => {
    expect(expectedAnswerText({ answerType: 'factorization', expectedAnswer: '2^3*3^2*5' })).toBe('2³ × 3² × 5');
  });

  it('rien à montrer : null', () => {
    expect(expectedAnswerText(null)).toBeNull();
    expect(expectedAnswerText({ answerType: 'rational' })).toBeNull();
    expect(expectedAnswerText({ answerType: 'choice', choices: [] })).toBeNull();
  });

});

describe('aucun suivi — garanties de structure', () => {
  const player = read('src/pages/teacher/practice/TeacherPracticePlayer.jsx');
  const panel = read('src/pages/teacher/practice/StudentResponsesPanel.jsx');
  const hub = read('src/pages/student/practice/PracticeHub.jsx');

  it('le lecteur n’appelle aucun service d’écriture de la pratique', () => {
    for (const source of [player, panel]) {
      expect(source).not.toContain('practiceService');
      expect(source).not.toMatch(
        /submitAnswer|openQuestion|requestHint|startPracticeSession|completeExercise|completeSession|createNote/,
      );
    }
  });

  it('le Hub de l’enseignant est LA page de l’élève, sans appel ni séance', () => {
    expect(hub).toContain('if (isTeacher) {');
    expect(hub).toContain('setOverview(teacherOverview(lessonCode))');
    // Choisir un niveau ouvre son premier exercice, sans startPracticeSession.
    const start = hub.slice(hub.indexOf('const start'), hub.indexOf('setBusyLevel(level);'));
    expect(start).toContain('navigate(teacherBankPath(lessonCode, level, first))');
    expect(start).not.toContain('startPracticeSession');
    expect(hub).toContain('showProgress={!isTeacher}');
  });

  it('le lecteur reprend la mise en page de l’élève', () => {
    const session = read('src/pages/student/practice/PracticeSession.jsx');
    for (const marker of [
      'data-practice-side',
      'data-exercise-header',
      'data-exercise-workspace',
      'data-current-question',
      '<SessionProgress',
      '<ClassroomPresentation',
    ]) {
      expect(session, marker).toContain(marker);
      expect(player, marker).toContain(marker);
    }
    expect(player).toMatch(/checkLocally\((answer|sent), question\)/);
    expect(player).toContain('<StudentResponsesPanel');
  });

  it('les routes : le Hub partagé et le lecteur, dans l’espace enseignant ; plus de banque séparée', () => {
    const app = read('src/App.jsx');
    // L'élève garde le Hub. L'enseignant passe par UNE porte (TeacherBankGate, 2026-11-18) : une leçon qui a son tableau
    // (« séance en classe ») a la banque de l'enseignant et montre un exercice sur le tableau de la classe ; toutes les autres
    // gardent le Hub partagé et le lecteur — la porte les monte tels quels.
    expect(app.split('path="pratique/:lessonCode" element={<PracticeHub />}').length - 1).toBe(1);
    expect(app).toContain('path="pratique/:lessonCode" element={<TeacherBankGate />}');
    expect(app).toContain('path="pratique/:lessonCode/:level/:exerciseId" element={<TeacherBankGate player />}');
    const gate = read('src/pages/teacher/practice/TeacherBankGate.jsx');
    // since 2026-11-20 the door is the same for a lesson that has its WORLD without its board yet (boardLessons.js › hasTeacherBank)
    expect(gate).toContain('hasTeacherBank(lessonCode)');
    expect(gate).toMatch(/player \? <TeacherPracticePlayer \/> : <PracticeHub \/>/);
    expect(gate).toContain('<TeacherExerciseBank lessonCode={lessonCode} />');
    expect(gate).toContain('exerciseBoardPath(lessonCode, level, exerciseId)');
    expect(app).not.toContain('TeacherPracticeBank');
    expect(app).not.toContain('TeacherPracticeLesson');
    expect(read('src/data/teacherNavigation.js')).not.toContain('/enseignant/pratique');
  });
});

describe('réponses de feuille d’examen relues par l’enseignant (2026-10-06)', () => {
  it('montre la formule MathLive, puis la démonstration écrite', async () => {
    const { formatStudentAnswer } = await import('./teacherBank');
    expect(
      formatStudentAnswer(
        { answerType: 'rational' },
        { value: '7/9', latex: '\\frac{7}{9}', work: '$1215=945\\times1+270$', seconds: 40 },
      ),
    ).toBe('$\\frac{7}{9}$');
    expect(formatStudentAnswer({ answerType: 'rational' }, { value: '135' })).toBe('135');
    expect(
      formatStudentAnswer(
        { answerType: 'selfCheck' },
        { text: 'car 21 − 14 = 7', selfMark: 'correct' },
        'self:correct',
      ),
    ).toBe('car 21 − 14 = 7');
  });
});

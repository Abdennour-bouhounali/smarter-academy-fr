import { describe, it, expect, vi } from 'vitest';
import {
  BOARD_LESSONS,
  hasClassBoard,
  classSessionPath,
  boardLessonOfPath,
  MOMENTS,
  hasTeacherBank,
  toolHasContent,
} from './boardLessons';
import { lessonPackFlags } from '../../lessons/registry';
import { classDoor, canPresentPath, CLASSROOM_START_STATE } from '../teacher/lessonMemo/memoRoutes';

vi.mock('../../lessons/lessonIndex.generated.json', async () => ({
  default: (await import('./test/lessonIndexFixture.js')).LESSON_INDEX,
}));

describe('séance en classe — the lessons that have their own board (and no « mode classe » any more)', () => {
  it('is exactly the list of the lessons whose pack has a board: a lesson joins the day its script is written', () => {
    expect(BOARD_LESSONS).toEqual(['lecon-cles', 'lecon-synthese']);
    for (const id of BOARD_LESSONS) expect(lessonPackFlags(id).board, id).toBe(true);
    expect(hasClassBoard('lecon-monde')).toBe(false); // a world, no script yet
    expect(hasClassBoard('lecon-simple')).toBe(false);
    expect(hasClassBoard(undefined)).toBe(false);
  });

  it('opens the class session, directly on one of the four moments when asked', () => {
    expect(MOMENTS).toEqual(['start', 'revise', 'lesson', 'end']);
    expect(classSessionPath('lecon-cles')).toBe('/enseignant/hissa/lecon-cles');
    expect(classSessionPath('lecon-cles', 'lesson')).toBe('/enseignant/hissa/lecon-cles?moment=lesson');
    expect(classSessionPath('lecon-cles', 'anything')).toBe('/enseignant/hissa/lecon-cles'); // an unknown moment is not passed on
  });

  it('turns every old door of such a lesson into « la séance en classe », and leaves the other lessons their « mode classe »', () => {
    const base = '/courses/college/3e/nombres_calculs';
    expect(classDoor('lecon-cles', `${base}/lecon-cles`)).toEqual({
      to: '/enseignant/hissa/lecon-cles',
      state: undefined,
      session: true,
    });
    expect(classDoor('lecon-simple', `${base}/lecon-simple`)).toEqual({
      to: `${base}/lecon-simple`,
      state: CLASSROOM_START_STATE,
      session: false,
    });
    expect(boardLessonOfPath(`${base}/lecon-cles/m1`)).toBe('lecon-cles');
    expect(boardLessonOfPath(`${base}/lecon-cles?view=classic`)).toBe('lecon-cles');
    expect(boardLessonOfPath(`${base}/lecon-simple/m1`)).toBe(null);
    expect(boardLessonOfPath(null)).toBe(null);
    expect(canPresentPath(`${base}/lecon-cles/m1`)).toBe(false);
    expect(canPresentPath(`${base}/lecon-simple/m1`)).toBe(true);
    expect(canPresentPath(undefined)).toBe(false);
  });
});

describe("the teacher's tools of a v2 lesson: only those that have content", () => {
  const TOOLS = ['lesson', 'session', 'memo', 'file', 'bank', 'track', 'card'];
  it("a unit's last lesson has its board and every tool but the knowledge card (it has no knowledge of its own)", () => {
    expect(hasClassBoard('lecon-synthese')).toBe(true);
    expect(hasTeacherBank('lecon-synthese')).toBe(true);
    expect(TOOLS.filter((t) => toolHasContent('lecon-synthese', t))).toEqual([
      'lesson',
      'session',
      'memo',
      'file',
      'bank',
      'track',
    ]);
  });
  it('a lesson of keys with its board keeps every tool; a world without its board has the lesson, the bank and the tracking', () => {
    expect(TOOLS.filter((t) => toolHasContent('lecon-cles', t))).toEqual(TOOLS);
    expect(TOOLS.filter((t) => toolHasContent('lecon-monde', t))).toEqual(['lesson', 'bank', 'track']);
    // a lesson that is not v2 keeps every tool, and has no teacher's bank
    expect(toolHasContent('lecon-simple', 'memo')).toBe(true);
    expect(hasTeacherBank('lecon-simple')).toBe(false);
  });
});

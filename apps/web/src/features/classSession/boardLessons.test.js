import { describe, it, expect } from 'vitest';
import { BOARD_LESSONS, hasClassBoard, classSessionPath, boardLessonOfPath, MOMENTS } from './boardLessons';
import { lessonPackFlags } from '../../lessons/registry';
import { classDoor, canPresentPath, CLASSROOM_START_STATE } from '../teacher/lessonMemo/memoRoutes';
import { hasLab } from '../../lessons/common/lessonlab/registry';
import { LESSON_CONFIG } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/lesson.config';

describe('حصّة القسم — the lessons that have their own board (and no « وضع القسم » any more)', () => {
  it('is exactly the list of the lessons whose pack has a board: a lesson joins the day its script is written', () => {
    expect(BOARD_LESSONS).toContain('qasim-adad-tabii');
    for (const id of BOARD_LESSONS) expect(lessonPackFlags(id).board, id).toBe(true);
    expect(hasClassBoard('qasim-adad-tabii')).toBe(true);
    expect(BOARD_LESSONS).toContain('qawasim-adad-tabii'); // lesson 2 joined with its script and memo (2026-11-18)
    expect(hasClassBoard('qawasim-adad-tabii')).toBe(true);
    expect(BOARD_LESSONS).toContain('khawass-qawasim'); // lesson 3 joined with its script and memo (2026-11-18)
    expect(hasClassBoard('khawass-qawasim')).toBe(true);
    expect(BOARD_LESSONS).toContain('qasim-mushtarak-akbar'); // lesson 4 joined with its script and memo (2026-11-19)
    expect(hasClassBoard('qasim-mushtarak-akbar')).toBe(true);
    expect(BOARD_LESSONS).toContain('tayin-pgcd'); // lesson 5 joined with its script and memo (2026-11-19)
    expect(hasClassBoard('tayin-pgcd')).toBe(true);
    expect(BOARD_LESSONS).toContain('bahth-pgcd'); // lesson 6 joined with its script and memo (2026-11-19)
    expect(hasClassBoard('bahth-pgcd')).toBe(true);
    expect(BOARD_LESSONS).toContain('awwaliyan-fima-baynahuma'); // lesson 7 joined with its script and memo (2026-11-20)
    expect(hasClassBoard('awwaliyan-fima-baynahuma')).toBe(true);
    expect(BOARD_LESSONS).toContain('ikhtizal-kasr'); // lesson 8 joined with its script and memo (2026-11-20)
    expect(hasClassBoard('ikhtizal-kasr')).toBe(true);
    expect(BOARD_LESSONS).toContain('jidhr-tarbii'); // unit 2, lesson 1 joined with its script and memo (2026-11-21)
    expect(hasClassBoard('jidhr-tarbii')).toBe(true);
    expect(BOARD_LESSONS).toContain('natiqa-ghayr-natiqa'); // unit 2, lesson 2 joined with its script and memo (2026-11-21)
    expect(hasClassBoard('natiqa-ghayr-natiqa')).toBe(true);
    expect(hasClassBoard('muadalat-x-murabba')).toBe(false); // a lesson still on the mission player: no board yet
    expect(hasClassBoard(undefined)).toBe(false);
    const config = LESSON_CONFIG;
    expect(config.id).toBe('qasim-adad-tabii');
    expect(config.classSession ?? config.gameWorld).toBeUndefined(); // the lesson says it in its pack, not in its config
    expect(hasLab(config.id)).toBe(true);
  });

  it('opens the class session, directly on one of the four moments when asked', () => {
    expect(MOMENTS).toEqual(['start', 'revise', 'lesson', 'end']);
    expect(classSessionPath('qasim-adad-tabii')).toBe('/enseignant/hissa/qasim-adad-tabii');
    expect(classSessionPath('qasim-adad-tabii', 'lesson')).toBe('/enseignant/hissa/qasim-adad-tabii?moment=lesson');
    expect(classSessionPath('qasim-adad-tabii', 'anything')).toBe('/enseignant/hissa/qasim-adad-tabii'); // an unknown moment is not passed on
  });

  it('turns every old door of such a lesson into « حصّة القسم », and leaves the other lessons their « وضع القسم »', () => {
    const base = '/courses/moyen/4am/ansab_al_aadad_wal_hisab';
    expect(classDoor('qasim-adad-tabii', `${base}/qasim-adad-tabii`)).toEqual({
      to: '/enseignant/hissa/qasim-adad-tabii',
      state: undefined,
      session: true,
    });
    expect(classDoor('qawasim-adad-tabii', `${base}/qawasim-adad-tabii`)).toEqual({
      to: '/enseignant/hissa/qawasim-adad-tabii',
      state: undefined,
      session: true,
    });
    expect(classDoor('khawass-qawasim', `${base}/khawass-qawasim`)).toEqual({
      to: '/enseignant/hissa/khawass-qawasim',
      state: undefined,
      session: true,
    });
    expect(classDoor('qasim-mushtarak-akbar', `${base}/qasim-mushtarak-akbar`)).toEqual({
      to: '/enseignant/hissa/qasim-mushtarak-akbar',
      state: undefined,
      session: true,
    });
    expect(classDoor('tayin-pgcd', `${base}/tayin-pgcd`)).toEqual({
      to: '/enseignant/hissa/tayin-pgcd',
      state: undefined,
      session: true,
    });
    expect(classDoor('bahth-pgcd', `${base}/bahth-pgcd`)).toEqual({
      to: '/enseignant/hissa/bahth-pgcd',
      state: undefined,
      session: true,
    });
    expect(classDoor('awwaliyan-fima-baynahuma', `${base}/awwaliyan-fima-baynahuma`)).toEqual({
      to: '/enseignant/hissa/awwaliyan-fima-baynahuma',
      state: undefined,
      session: true,
    });
    expect(classDoor('ikhtizal-kasr', `${base}/ikhtizal-kasr`)).toEqual({
      to: '/enseignant/hissa/ikhtizal-kasr',
      state: undefined,
      session: true,
    });
    expect(classDoor('jidhr-tarbii', `${base}/jidhr-tarbii`)).toEqual({
      to: '/enseignant/hissa/jidhr-tarbii',
      state: undefined,
      session: true,
    });
    expect(classDoor('natiqa-ghayr-natiqa', `${base}/natiqa-ghayr-natiqa`)).toEqual({
      to: '/enseignant/hissa/natiqa-ghayr-natiqa',
      state: undefined,
      session: true,
    });
    expect(classDoor('muadalat-x-murabba', `${base}/muadalat-x-murabba`)).toEqual({
      to: `${base}/muadalat-x-murabba`,
      state: CLASSROOM_START_STATE,
      session: false,
    });
    expect(boardLessonOfPath(`${base}/qasim-adad-tabii/2`)).toBe('qasim-adad-tabii');
    expect(boardLessonOfPath(`${base}/qasim-adad-tabii?view=classic`)).toBe('qasim-adad-tabii');
    expect(boardLessonOfPath(`${base}/qawasim-adad-tabii/2`)).toBe('qawasim-adad-tabii');
    expect(boardLessonOfPath(`${base}/khawass-qawasim/2`)).toBe('khawass-qawasim');
    expect(boardLessonOfPath(`${base}/qasim-mushtarak-akbar/2`)).toBe('qasim-mushtarak-akbar');
    expect(boardLessonOfPath(`${base}/tayin-pgcd/2`)).toBe('tayin-pgcd');
    expect(boardLessonOfPath(`${base}/bahth-pgcd/2`)).toBe('bahth-pgcd');
    expect(boardLessonOfPath(`${base}/awwaliyan-fima-baynahuma/2`)).toBe('awwaliyan-fima-baynahuma');
    expect(boardLessonOfPath(`${base}/ikhtizal-kasr/2`)).toBe('ikhtizal-kasr');
    expect(boardLessonOfPath(`${base}/jidhr-tarbii/2`)).toBe('jidhr-tarbii');
    expect(boardLessonOfPath(`${base}/natiqa-ghayr-natiqa/2`)).toBe('natiqa-ghayr-natiqa');
    expect(boardLessonOfPath(null)).toBe(null);
    expect(canPresentPath(`${base}/qasim-adad-tabii/2`)).toBe(false);
    expect(canPresentPath(`${base}/qawasim-adad-tabii/2`)).toBe(false);
    expect(canPresentPath(`${base}/khawass-qawasim/2`)).toBe(false);
    expect(canPresentPath(`${base}/qasim-mushtarak-akbar/2`)).toBe(false);
    expect(canPresentPath(`${base}/tayin-pgcd/2`)).toBe(false);
    expect(canPresentPath(`${base}/bahth-pgcd/2`)).toBe(false);
    expect(canPresentPath(`${base}/awwaliyan-fima-baynahuma/2`)).toBe(false);
    expect(canPresentPath(`${base}/ikhtizal-kasr/2`)).toBe(false);
    expect(canPresentPath(`${base}/jidhr-tarbii/2`)).toBe(false);
    expect(canPresentPath(`${base}/natiqa-ghayr-natiqa/2`)).toBe(false);
    expect(canPresentPath(undefined)).toBe(false);
  });
});

describe("the teacher's tools of a v2 lesson: only those that have content", () => {
  it("a unit's last lesson has its board and every tool but the knowledge card (it has no knowledge of its own)", async () => {
    const { hasTeacherBank, toolHasContent, hasClassBoard } = await import('./boardLessons');
    const id = 'wadiya-idmajiya-aadad';
    expect(hasClassBoard(id)).toBe(true);
    expect(hasTeacherBank(id)).toBe(true);
    expect(['lesson', 'session', 'memo', 'file', 'bank', 'track', 'card'].filter((t) => toolHasContent(id, t))).toEqual(
      ['lesson', 'session', 'memo', 'file', 'bank', 'track'],
    );
    // a lesson of keys with its board keeps every tool; so does a lesson that is not v2 (its old page has them all)
    expect(toolHasContent('ikhtizal-kasr', 'card')).toBe(true);
    expect(toolHasContent('muadala-ula', 'memo')).toBe(true);
    expect(hasTeacherBank('muadala-ula')).toBe(false);
  });
});

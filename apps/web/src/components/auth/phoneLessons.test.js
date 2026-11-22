import { describe, expect, it } from 'vitest';
import { PHONE_LESSONS, isPhoneLessonPath } from './phoneLessons';

const BASE = '/courses/moyen/4am/ansab_al_aadad_wal_hisab';
const HOME = `${BASE}/qasim-adad-tabii`;

/**
 * PHONES ARE PAUSED (owner, 2026-11-18): every pack says `phone: false`, so a phone opens NO lesson. When phones resume,
 * set `phone: true` in the pack of a lesson whose home was walked on a phone and restore the checks that were here: its
 * home opens (student and teacher's preview), and only the memo and the lesson
 * file of that lesson open for a teacher (never « séance en classe », the class tracking or « fiche de connaissances »).
 */
describe('the pages a phone may open — while phones are paused', () => {
  it('opens no lesson: no pack asks for a phone', () => {
    expect(PHONE_LESSONS).toEqual([]);
    for (const id of ['qasim-adad-tabii', 'qawasim-adad-tabii']) {
      expect(isPhoneLessonPath(`${BASE}/${id}`), id).toBe(false);
    }
  });

  it('opens no teacher tool of a lesson either', () => {
    const paths = [
      '/enseignant/cours/qasim-adad-tabii/memoire',
      '/enseignant/milaff/qasim-adad-tabii',
      '/enseignant/hissa/qasim-adad-tabii',
      '/enseignant/mutabaa/qasim-adad-tabii',
      '/enseignant/bitaqa/qasim-adad-tabii',
    ];
    for (const path of paths) expect(isPhoneLessonPath(path), path).toBe(false);
  });

  it('keeps a module address, every other lesson and every page that is not a lesson closed', () => {
    expect(isPhoneLessonPath(`${HOME}/itqan`)).toBe(false);
    expect(isPhoneLessonPath(`${BASE}/khawass-qawasim`)).toBe(false);
    expect(isPhoneLessonPath('/espace/pratique/qasim-adad-tabii')).toBe(false);
    expect(isPhoneLessonPath(undefined)).toBe(false);
  });
});

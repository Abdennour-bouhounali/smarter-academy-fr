import { describe, it, expect } from 'vitest';
import lesson from './locales/ar/lesson.json';
import manipulation from './locales/ar/lesson.manipulation.json';
import indexSource from './index.js?raw';

/**
 * Les textes des manipulations (≈ 600 Ko) ne sont PAS dans le lot d'entrée : `lesson.json` (namespace eager) ne
 * les contient plus, et i18n/index.js ne les importe pas. Ils arrivent avec la leçon, sous les MÊMES clés
 * `lesson:manipulation.*` (BUNDLE_BOUNDARIES.md §3, « lesson.manipulation »).
 */
describe('lesson.manipulation — on demand, same keys', () => {
  it('lesson.json carries no lab strings; they live in lesson.manipulation.json', () => {
    expect(lesson.manipulation).toBeUndefined();
    expect(Object.keys(manipulation).length).toBeGreaterThan(50);
    expect(manipulation.level?.beginner).toBeTruthy();
  });

  it('the eager i18n setup never imports them', () => {
    expect(indexSource).not.toMatch(/lesson\.manipulation\.json/);
  });

  it('once loaded, they are read under lesson:manipulation.*', async () => {
    const { default: i18n } = await import('./index.js');
    const { loadLessonManipulationStrings, areLessonManipulationStringsLoaded } = await import('./lessonManipulationStrings.js');
    await loadLessonManipulationStrings();
    expect(areLessonManipulationStringsLoaded()).toBe(true);
    expect(i18n.t('lesson:manipulation.level.beginner')).toBe(manipulation.level.beginner);
  });
});

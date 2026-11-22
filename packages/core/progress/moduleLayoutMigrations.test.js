import { describe, it, expect } from 'vitest';
import {
  MODULE_LAYOUT_MIGRATIONS, migrateLessonProgress, emptyLessonProgress, currentModuleLayoutVersion,
} from './moduleLayoutMigrations';

// A neutral table of its own: the delivered one is empty (every entry named a deleted lesson).
const TABLE = {
  'lecon-a': [{ version: 2, map: { 4: 7 } }],
  'lecon-b': [{ version: 2, map: { 4: 7, 7: 8 } }, { version: 3, map: { 2: 0 } }],
};

describe('migrateLessonProgress', () => {
  it('remaps the old test (4) to its new number (7) once, and stamps the version', () => {
    const out = migrateLessonProgress('lecon-a', { completedModules: ['0', '1', '2', '3', '4'], currentModule: 4 }, TABLE);
    expect(out.completedModules).toEqual(['0', '1', '2', '3', '7']);
    expect(out.currentModule).toBe(7);
    expect(out.layoutVersion).toBe(2);
  });

  it('never remaps data already in the current layout (a real « 4 » is problem 1)', () => {
    const data = { completedModules: ['4'], layoutVersion: 2 };
    expect(migrateLessonProgress('lecon-a', data, TABLE)).toBe(data);
  });

  it('applies a step as a simultaneous replacement, then only the steps after the stored version', () => {
    expect(migrateLessonProgress('lecon-b', { completedModules: ['4', '7', '2'] }, TABLE).completedModules).toEqual(['7', '8', '0']);
    expect(migrateLessonProgress('lecon-b', { completedModules: ['4', '2'], layoutVersion: 2 }, TABLE)).toEqual({
      completedModules: ['4', '0'], layoutVersion: 3,
    });
  });

  it('leaves lessons without a migration and empty storage untouched', () => {
    const data = { completedModules: ['4'] };
    expect(migrateLessonProgress('lecon-c', data, TABLE)).toBe(data);
    expect(migrateLessonProgress('lecon-a', null, TABLE)).toBe(null);
  });

  it('starts empty storage at the current layout', () => {
    expect(emptyLessonProgress('lecon-b', TABLE)).toEqual({
      completedModules: [], completedExercises: [], layoutVersion: currentModuleLayoutVersion('lecon-b', TABLE),
    });
    expect(currentModuleLayoutVersion('lecon-b', TABLE)).toBe(3);
    expect(emptyLessonProgress('lecon-c', TABLE)).toEqual({ completedModules: [], completedExercises: [] });
  });

  it('keeps the delivered table well formed: versions above 1 (absent = 1), strictly rising', () => {
    for (const [lessonId, steps] of Object.entries(MODULE_LAYOUT_MIGRATIONS)) {
      steps.forEach((step, i) => expect(step.version, lessonId).toBeGreaterThan(i === 0 ? 1 : steps[i - 1].version));
    }
  });
});

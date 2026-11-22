import { describe, it, expect } from 'vitest';
import { migrateLessonProgress, emptyLessonProgress, currentModuleLayoutVersion } from './moduleLayoutMigrations';

describe('migrateLessonProgress', () => {
  it('remaps the old test (4) to its new number (7) once, and stamps the version', () => {
    const out = migrateLessonProgress('qasim-adad-tabii', { completedModules: ['0', '1', '2', '3', '4'], currentModule: 4 });
    expect(out.completedModules).toEqual(['0', '1', '2', '3', '7']);
    expect(out.currentModule).toBe(7);
    expect(out.layoutVersion).toBe(2);
  });

  it('never remaps data already in the current layout (a real « 4 » is problem 1)', () => {
    const data = { completedModules: ['4'], layoutVersion: 2 };
    expect(migrateLessonProgress('qasim-adad-tabii', data)).toBe(data);
  });

  it('leaves lessons without a migration and empty storage untouched', () => {
    const data = { completedModules: ['4'] };
    expect(migrateLessonProgress('pgcd', data)).toBe(data);
    expect(migrateLessonProgress('qasim-adad-tabii', null)).toBe(null);
  });

  it('starts empty storage at the current layout', () => {
    expect(emptyLessonProgress('qasim-adad-tabii')).toEqual({ completedModules: [], completedExercises: [], layoutVersion: currentModuleLayoutVersion('qasim-adad-tabii') });
    expect(emptyLessonProgress('pgcd')).toEqual({ completedModules: [], completedExercises: [] });
  });
});
